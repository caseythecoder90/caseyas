# Keycloak

The identity provider for Ours. Realm `ours`, one confidential client `ours-web`, two users. Deployed to the `keycloak` namespace as a platform service so other apps can get their own realm later.

## Files

| Path | Purpose |
|---|---|
| `Dockerfile` | `kc.sh build` for Postgres, then `start --optimized --import-realm` |
| `realm/ours-realm.json` | Realm, users, and client. Imported on first boot only. `${VAR}` placeholders are filled from the environment at import time, so no secret and no hostname lives in this file. |
| `theme/` | Keycloakify project, milestone 5 |
| `extensions/` | Kafka event-listener SPI, milestone 7 |

## Placeholders the realm file expects

| Variable | Meaning |
|---|---|
| `OURS_APP_URL` | The app's origin, e.g. `https://ours.caseylovesyas.com`. Drives the redirect URI, post-logout URIs, and back-channel logout URL. |
| `OURS_WEB_CLIENT_SECRET` | Client secret for `ours-web`. The same value goes to the api. |
| `OURS_USER1_USERNAME`, `OURS_USER1_PASSWORD` | First user and a temporary password; `Update Password` runs at first sign-in |
| `OURS_USER2_USERNAME`, `OURS_USER2_PASSWORD` | Second user, same |

## After the first boot: finish in the admin console

Realm import covers what is safe to write by hand. These are quicker to click than to guess the JSON for, and each is a one-time change. Reach the console with `kubectl -n keycloak port-forward deploy/keycloak 8080:8080` and open `http://localhost:8080/admin`.

1. **master realm**: create a permanent admin user with a strong password, sign in as it, enroll OTP on it, delete the bootstrap admin, then remove `KC_BOOTSTRAP_ADMIN_USERNAME` and `KC_BOOTSTRAP_ADMIN_PASSWORD` from the Keycloak deployment.
2. **ours realm, Authentication, Policies, OTP Policy**: confirm TOTP, SHA1, 6 digits, 30 seconds.
3. **ours realm, Authentication, Policies, WebAuthn Passwordless Policy**: confirm user verification `required` and discoverable credential `preferred` or `required`.
4. **ours realm, Authentication, Required actions**: confirm `Configure OTP`, `Recovery Authentication Codes`, and `Webauthn Register Passwordless` are enabled. Turn on the option that requires recovery codes right after OTP setup (added in 26.4).
5. **ours realm, Realm settings, Events**: confirm user events and admin events are saved with a 30-day expiration.
6. **ours realm, Clients, ours-web**: confirm the redirect URI, the post-logout redirect, and the back-channel logout URL all show the real app origin, meaning the placeholder substitution worked.

Then export the realm (Realm settings, Action, Partial export, with clients) and diff it against `realm/ours-realm.json`. Put the placeholders back before committing anything.

## Changing hostnames later

Hostnames live in three places: `KC_HOSTNAME` on the deployment, `OURS_APP_URL` in the `ours-realm` secret (used only at first import), and the `ours-web` client's URLs in the running realm, which are edited in the console since the realm is not re-imported. Nothing is rebuilt.
