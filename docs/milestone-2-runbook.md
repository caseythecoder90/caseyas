# Milestone 2 runbook

Plans for real: the plans, items, checklists, budget and media domain; Kafka and the worker making photo and PDF thumbnails; presigned uploads straight from the browser to object storage; the seeded Japan plan; nightly backups. Assumes milestone 1's runbook has been completed (namespaces, Keycloak, the app deployed and signing in).

## What changed since milestone 1

| Area | Change |
|---|---|
| Backend | `plans`, `plan_items`, `plan_checklists`, `media` collections with Flamingock changes 0003–0005 (0005 seeds "Japan 2027", Feb 4–19 2027, Tokyo · Hakuba · Kyoto, USD/JPY, the three default checklists); the full plans API (section 7 of the architecture doc); presigned media uploads; the SSRF-guarded link preview; Kafka producers |
| Worker | Now deployed: consumes `media.uploaded`, makes 400px/1600px WebP variants and PDF first-page thumbs with libvips, publishes `media.processed` |
| Frontend | The Plans tab reads and writes the real api through TanStack Query; other tabs stay on mock data until their milestones |
| Cluster | New in `kubernetes/apps/ours/base`: `kafka.yaml`, `worker-deployment.yaml`, `backup-cronjob.yaml`; `keycloak/base` gains `backup-cronjob.yaml`; the api and frontend deployments read the new `ours-storage` secret |
| Storage of dates | Calendar dates and wall-clock times are ISO **strings** in Mongo, never BSON dates: a UTC pod and an Eastern-time laptop must agree the trip starts Feb 4 (found live; regression-tested) |
| CI | Rolls out `worker` alongside `frontend` and `api` |

## 1. Create the R2 bucket

In the Cloudflare dashboard (R2 needs a payment method on file even inside the free tier):

1. R2 → Create bucket → name `ours`, location automatic.
2. R2 → Manage API tokens → Create API token: permissions **Object Read & Write**, scoped to the `ours` bucket only. Save the Access Key ID and Secret Access Key.
3. Note the S3 endpoint: `https://<account-id>.r2.cloudflarestorage.com`.
4. Bucket → Settings → CORS policy:

```json
[
  {
    "AllowedOrigins": ["https://ours.caseylovesyas.com"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["content-type"],
    "MaxAgeSeconds": 3600
  }
]
```

5. Bucket → Settings → Object lifecycle rules: delete objects under prefix `backup/` after 30 days; delete objects under prefix `trash/` after 30 days.

## 2. The storage secret

One secret feeds the api, the worker, the backup jobs, and the frontend's CSP:

```bash
ACCOUNT=<account-id>
kubectl -n ours create secret generic ours-storage \
  --from-literal=OURS_STORAGE_ENDPOINT="https://${ACCOUNT}.r2.cloudflarestorage.com" \
  --from-literal=OURS_STORAGE_PUBLIC_ENDPOINT="https://${ACCOUNT}.r2.cloudflarestorage.com" \
  --from-literal=OURS_STORAGE_REGION=auto \
  --from-literal=OURS_STORAGE_BUCKET=ours \
  --from-literal=OURS_STORAGE_PATH_STYLE=true \
  --from-literal=OURS_STORAGE_ACCESS_KEY="<access key id>" \
  --from-literal=OURS_STORAGE_SECRET_KEY="<secret access key>" \
  --from-literal=MEDIA_HOST="${ACCOUNT}.r2.cloudflarestorage.com"
```

The keycloak namespace's backup job reads the same values, so mirror it there:

```bash
kubectl -n keycloak create secret generic ours-storage \
  --from-literal=OURS_STORAGE_ENDPOINT="https://${ACCOUNT}.r2.cloudflarestorage.com" \
  --from-literal=OURS_STORAGE_BUCKET=ours \
  --from-literal=OURS_STORAGE_ACCESS_KEY="<access key id>" \
  --from-literal=OURS_STORAGE_SECRET_KEY="<secret access key>"
```

## 3. Apply and roll

```bash
cd ~/Projects/k8s-cluster-hetzner
kubectl apply -k kubernetes/apps/ours/overlays/prod
kubectl apply -k kubernetes/apps/keycloak/overlays/prod
kubectl -n ours get pods -w
```

Expect `kafka` and `worker` pods to join. Then push `main` in the app repo; CI builds the four images and rolls out frontend, api, and worker. The api log shows Flamingock applying changes 0003–0005 once:

```bash
kubectl -n ours logs deploy/api | grep -E 'Flamingock|Change applied'
kubectl -n ours logs deploy/worker | grep 'partitions assigned'
```

## 4. Verify the feature end to end

1. Open the app → Plans. "Japan 2027 · Feb 4 – 19, 2027 · Tokyo · Hakuba · Kyoto" is there from the seed, with the three checklists.
2. Add an idea with a link; the preview fetch fills the title and image.
3. Enter the real Expedia flight through the flight form; it appears under Bookings with the confirmation code, and on the Calendar's February 2027 as a timed entry under the Japan bar.
4. Upload the booking PDF in Documents; within a few seconds the tile gets a first-page thumbnail (the worker log shows `media … processed`).
5. Tick a checklist item on your phone and watch it arrive on the other browser after a refresh (live sockets come with milestone 4).
6. Toggle "Available offline", turn on airplane mode, reopen the plan: it renders from the saved copy with the "saved …" note.

## 5. Verify the backups

Don't wait for 07:10 UTC:

```bash
kubectl -n ours create job --from=cronjob/mongo-backup mongo-backup-manual
kubectl -n ours logs job/mongo-backup-manual -c upload -f
kubectl -n keycloak create job --from=cronjob/keycloak-backup keycloak-backup-manual
```

Then confirm the objects exist under `backup/mongo/` and `backup/keycloak/` in the R2 dashboard. The restore drill is milestone 7, but the copies exist from today.

## Local development additions

`docker compose up -d` now also starts Kafka (host port 29092), MinIO standing in for R2 (S3 on 9000, console on 9001, bucket `ours` auto-created), and the worker container. Rebuild the worker after changing its code:

```bash
docker compose build worker && docker compose up -d worker
```

The api's `local` profile points at all of it; MinIO credentials are `ours-dev` / `ours-dev-secret`, dev-only.

## Milestone 2 gotchas found while building

- **Spring Boot 4 splits auto-configuration per technology**: plain `spring-kafka` gives no `KafkaTemplate`; the `spring-boot-starter-kafka` starter does. The Boot-managed `KafkaTemplate` bean is `<Object, Object>`.
- **Testcontainers 2.x + Boot 4.1**: `@ServiceConnection` doesn't recognise the new `KafkaContainer`; wire `spring.kafka.bootstrap-servers` with `@DynamicPropertySource`. Static containers must be started manually once per JVM (never via `@Testcontainers`), or the extension stops them between test classes while Spring's cached context keeps the dead ports.
- **`LocalDate` through Spring Data Mongo is zone-shifted** by whichever JVM wrote it. `MongoDateConversions` in `common` stores `LocalDate`/`LocalDateTime` as ISO strings; a test asserts the raw BSON type so it can't regress.
- **MinIO vs R2**: identical code paths; only the endpoint, keys, and `MEDIA_HOST` differ, all via the `ours-storage` secret.
