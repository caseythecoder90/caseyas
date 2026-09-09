# Milestone 1 runbook

Foundation and Keycloak: both namespaces, TLS on both hosts, Keycloak with the `ours` realm, the api signing in through it, MongoDB with Flamingock's first change applied, and the empty five-tab shell.

Two repositories are involved:

- **caseyas** (this one): code, images, CI.
- **k8s-cluster-hetzner**: the manifests under `kubernetes/apps/keycloak` and `kubernetes/apps/ours`, plus the two new namespaces and `ci-deployer` identities.

Everything below runs from WSL with the admin kubeconfig active, the same way the other apps were deployed. Secrets are created by hand and never committed, per the cluster repo's convention.

## Where things stand (2026-09-09)

Steps 1 through 6 and the apply in 7 and 8 are done. Keycloak had crash-looped for two days after the first apply because `keycloak-deployment.yaml` declared `KC_DB_URL=jdbc:postgresql://postgres:5432/$(POSTGRES_DB)` *before* `POSTGRES_DB` in the env list; Kubernetes only expands `$(VAR)` for variables that come earlier, so Keycloak was told to open a database literally named `$(POSTGRES_DB)`. The manifest now declares `POSTGRES_DB` first. After the fix the log showed `Realm 'ours' imported`, the certificate went `Ready`, and `https://auth.caseylovesyas.com/realms/ours/.well-known/openid-configuration` returns the right issuer with HSTS.

Verified from outside: `https://ours.caseylovesyas.com/` serves the shell, `/api/me` answers 401 unauthenticated, `/oauth2/authorization/keycloak` redirects to Keycloak with `code_challenge_method=S256`, and both hosts carry `Strict-Transport-Security`. Flamingock applied `create-users-collection` on first start.

Still to do, and only you can:

- Step 7's console work: port-forward, sign in as `bootstrap`, create the permanent admin with OTP, delete `bootstrap` and the `keycloak-bootstrap` secret, drop the two `KC_BOOTSTRAP_*` env entries.
- Step 8's first sign-ins on both phones.
- Step 9's two GitHub secrets (commands in `milestone-2-runbook.md`, "Where things stand"). Until then, deploys are `kubectl set image` by hand.

## 0. Before starting

- The GitHub repository is `caseythecoder90/caseyas`. Image names derive from it: `ghcr.io/caseythecoder90/caseyas-frontend`, `-api`, `-worker`, `-keycloak`. If the repository gets a different name, change the four image references in the manifests.
- Decide her username in Keycloak. Yours is `casey` in the commands below.
- Run the AVX check on the worker before the Mongo image is pulled:

```bash
ssh deploy@<worker-ip> 'grep -c avx /proc/cpuinfo'
```

## 1. Push the code and let CI build the images

```bash
cd ~/Projects/caseyas
git init -b main
git add -A
git commit -m "Milestone 1 foundation"
git remote add origin git@github.com:caseythecoder90/caseyas.git
git push -u origin main
```

The workflow runs `mvn -B verify` and `npm run build`, then pushes four images tagged with the short SHA and `latest`. The deploy job skips itself until the two `KUBE_CONFIG_*` secrets exist (step 8). GHCR packages are private by default, which is what we want; the cluster pulls them with a token.

## 2. Namespaces and CI identities

```bash
cd ~/Projects/k8s-cluster-hetzner
kubectl apply -k kubernetes/cluster/namespaces
kubectl apply -f kubernetes/cluster/ci-deployer/rbac.yaml
```

## 3. Pull secrets for GHCR

Same as `docs/05-app-migration.md` in the cluster repo: a GitHub token with `read:packages` in `GHCR_TOKEN`, one secret per namespace.

```bash
for ns in keycloak ours; do
  kubectl -n $ns create secret docker-registry ghcr-pull \
    --docker-server=ghcr.io \
    --docker-username=caseythecoder90 \
    --docker-password="$GHCR_TOKEN"
done
```

## 4. Keycloak secrets

Generate everything, keep the client secret in a shell variable because the api needs the same value in step 6.

```bash
CLIENT_SECRET=$(openssl rand -hex 32)

kubectl -n keycloak create secret generic keycloak-db \
  --from-literal=POSTGRES_DB=keycloak \
  --from-literal=POSTGRES_USER=keycloak \
  --from-literal=POSTGRES_PASSWORD="$(openssl rand -base64 24)"

# First boot only. Deleted in step 7 once a permanent admin exists.
kubectl -n keycloak create secret generic keycloak-bootstrap \
  --from-literal=KC_BOOTSTRAP_ADMIN_USERNAME=bootstrap \
  --from-literal=KC_BOOTSTRAP_ADMIN_PASSWORD="$(openssl rand -base64 24)"

# Placeholders for the realm import. Passwords are temporary; Keycloak forces a
# change at first sign-in.
kubectl -n keycloak create secret generic ours-realm \
  --from-literal=OURS_APP_URL=https://ours.caseylovesyas.com \
  --from-literal=OURS_WEB_CLIENT_SECRET="$CLIENT_SECRET" \
  --from-literal=OURS_USER1_USERNAME=casey \
  --from-literal=OURS_USER1_PASSWORD="$(openssl rand -base64 18)" \
  --from-literal=OURS_USER2_USERNAME=HER_USERNAME \
  --from-literal=OURS_USER2_PASSWORD="$(openssl rand -base64 18)"
```

To read a temporary password back when it is time to sign in:

```bash
kubectl -n keycloak get secret ours-realm -o jsonpath='{.data.OURS_USER1_PASSWORD}' | base64 -d; echo
kubectl -n keycloak get secret keycloak-bootstrap -o jsonpath='{.data.KC_BOOTSTRAP_ADMIN_PASSWORD}' | base64 -d; echo
```

## 5. DNS

Two A records at Vercel, both pointing at the worker's public IP, the same address the existing sites use:

| Record | Value |
|---|---|
| `ours.caseylovesyas.com` | worker public IP |
| `auth.caseylovesyas.com` | worker public IP |

cert-manager's HTTP-01 challenge needs these to resolve before the Ingresses are applied, so wait for `dig +short auth.caseylovesyas.com` to answer.

## 6. App secrets

```bash
MONGO_PASS=$(openssl rand -base64 24 | tr -d '/+=')   # URL-safe, it goes into a connection string

kubectl -n ours create secret generic mongodb \
  --from-literal=MONGO_INITDB_ROOT_USERNAME=root \
  --from-literal=MONGO_INITDB_ROOT_PASSWORD="$MONGO_PASS"

kubectl -n ours create secret generic ours-api \
  --from-literal=SPRING_MONGODB_URI="mongodb://root:${MONGO_PASS}@mongodb:27017/ours?authSource=admin" \
  --from-literal=OURS_WEB_CLIENT_SECRET="$CLIENT_SECRET"
```

## 7. Keycloak up

```bash
kubectl apply -k kubernetes/apps/keycloak/overlays/prod
kubectl -n keycloak get pods -w
kubectl -n keycloak logs deploy/keycloak | grep -iE 'import|realm|started'
kubectl -n keycloak get certificate
```

Expect a line about importing realm `ours` and, a minute later, the certificate `Ready`. Then `https://auth.caseylovesyas.com/realms/ours/.well-known/openid-configuration` should return JSON with `"issuer": "https://auth.caseylovesyas.com/realms/ours"`.

Admin console, by port-forward only:

```bash
kubectl -n keycloak port-forward deploy/keycloak 8080:8080
```

Open `http://localhost:8080/admin`, sign in as `bootstrap`, and work through the checklist in `keycloak/README.md`: permanent admin with OTP in `master`, delete `bootstrap`, then delete the secret and the two env references so it can never come back:

```bash
kubectl -n keycloak delete secret keycloak-bootstrap
```

The deployment marks both variables `optional: true`, so removing the secret is enough; the pod restarts without them on the next rollout. Delete the two `KC_BOOTSTRAP_*` entries from `keycloak-deployment.yaml` as well and commit.

If the console redirects to `https://auth.caseylovesyas.com/admin` instead of staying on localhost, `KC_HOSTNAME_ADMIN` did not behave as expected. Fallback: add `/admin` to the Keycloak Ingress with `nginx.ingress.kubernetes.io/whitelist-source-range` set to your current IP, use it, remove it.

## 8. The app up

```bash
kubectl apply -k kubernetes/apps/ours/overlays/prod
kubectl -n ours get pods -w
kubectl -n ours logs deploy/api | grep -iE 'flamingock|started|error'
kubectl -n ours get certificate
```

The api log should show Flamingock acquiring the lock, applying `_0001__CreateUsersCollection`, and releasing it. Then, in a browser:

1. `https://ours.caseylovesyas.com` redirects to `auth.caseylovesyas.com`.
2. Sign in as `casey` with the temporary password. Keycloak asks for a new password, then authenticator setup, then recovery codes.
3. You land back on the app shell. The Us tab shows your username; `https://ours.caseylovesyas.com/api/me` returns JSON.
4. Sign out from the Us tab; you should pass through Keycloak's end-session and land on the app signed out.
5. Repeat for her account on her phone, then add the app to the home screen.
6. In the account console, `https://auth.caseylovesyas.com/realms/ours/account`, add a passkey on each phone and sign out of the other device to prove back-channel logout ends the app session too.

Check the user documents landed:

```bash
kubectl -n ours exec deploy/mongodb -- mongosh -u root -p "$MONGO_PASS" --authenticationDatabase admin ours --quiet --eval 'db.users.find({}, {username:1, keycloakId:1}).toArray(); db.flamingockAuditLog.find({}, {changeId:1, state:1}).toArray()'
```

## 9. Hand CI its kubeconfigs

```bash
./scripts/gen-ci-kubeconfig.sh ours       # -> GitHub secret KUBE_CONFIG_OURS
./scripts/gen-ci-kubeconfig.sh keycloak   # -> GitHub secret KUBE_CONFIG_KEYCLOAK
```

Set both under the repository's `production` environment. The next push to `main` rolls out `frontend` and `api`; Keycloak only rolls when something under `keycloak/` changed.

## 10. Commit the cluster repo

```bash
cd ~/Projects/k8s-cluster-hetzner
git add kubernetes
git commit -m "Add keycloak and ours"
git push
```

## Rolling back

- `kubectl delete -k kubernetes/apps/ours/overlays/prod` removes the app and leaves the PVC; delete `pvc/mongodb-data` too for a clean slate.
- Keycloak's realm lives in its Postgres. `kubectl delete -k kubernetes/apps/keycloak/overlays/prod` plus `pvc/postgres-data` means the next start re-imports the realm from the file, which is the fastest way to recover from a botched first import.

## Verified locally on 2026-09-06

Against `docker compose up` with Keycloak 26.7.3, the packaged api jar, and the Vite dev server, in a browser:

- Realm import with every `${VAR}` placeholder substituted: client secret, both users with their required actions, redirect and back-channel URLs.
- The full first sign-in: Keycloak login, forced password change, authenticator enrollment, redirect back through `/login/oauth2/code/keycloak`, session cookie set `HttpOnly; SameSite=Strict`, app shell rendered, `/api/me` returning JSON, and the `users` document created with the Keycloak subject.
- Spring Security 7 sends `code_challenge_method=S256` for the confidential client without extra configuration, matching the realm's PKCE requirement.
- Flamingock ran `create-users-collection` at startup; `flamingockAuditLog` shows `STARTED` then `APPLIED`, and `users` has the `keycloakId_unique` index.
- `mvn -B verify` passes with the Testcontainers test on JDK 25; `npm run build` passes with strict TypeScript.

## Not verified on this machine

Written from documentation and the existing GrindTrack manifests, not from a run on the cluster:

- `KC_HOSTNAME_ADMIN=http://localhost:8080` keeping the admin console on the port-forward. The fallback is in step 7.
- ingress-nginx's default HSTS covering both hosts. `curl -sI https://ours.caseylovesyas.com | grep -i strict` after step 8.
- `KC_HOSTNAME_BACKCHANNEL_DYNAMIC` and the production `start --optimized` image, which only exist in the cluster manifests; local development uses `start-dev`.
