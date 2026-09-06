# Ours

A private, two-person app: memory journal, trip and event planner, one live chat, notes, and a shared calendar. Runs at `ours.caseylovesyas.com` with Keycloak at `auth.caseylovesyas.com`, on the Hetzner cluster described in the `k8s-cluster-hetzner` repo.

- [docs/architecture.md](docs/architecture.md): every decision, the data model, and the milestone plan.
- [docs/claude-design-prompt.md](docs/claude-design-prompt.md): the prompt behind the UI mockups.
- [docs/milestone-1-runbook.md](docs/milestone-1-runbook.md): deploying the foundation, step by step.

## Layout

```
design/        the Claude Design canvases, verbatim, and the specs written from them
frontend/      React 19 + TypeScript + Vite PWA, served by nginx in production
backend/       Maven multi-module, Java 25, Spring Boot 4.1
  common/      Mongo documents, repositories, Flamingock change classes, shared contracts
  api/         REST, WebSocket, OAuth2 client (Keycloak), scheduler, notifier
  worker/      Kafka consumers, libvips, ffmpeg (deployed from milestone 2)
keycloak/      Keycloak image: realm import, theme, extensions
docker/        Dockerfiles and the nginx config
```

## Local development

Prerequisites: JDK 25, Maven 3.9, Node 24, Docker Desktop.

```bash
docker compose up -d            # Keycloak on :8081 (admin/admin, dev only), Postgres, MongoDB on :27018
cd backend && mvn -q -DskipTests install && mvn -q spring-boot:run -pl api -Dspring-boot.run.profiles=local
cd frontend && npm install && npm run dev     # http://localhost:5173
```

The realm is imported from `keycloak/realm/ours-realm.json` on the first `docker compose up`. Local user credentials come from `docker-compose.yml` and are dev-only. Sign in once with each user, set the permanent password, and enroll an authenticator.

Two local quirks, both already handled in the config: MongoDB is published on host port 27018 because another container on this machine owns 27017, and the local profile connects to `127.0.0.1` rather than `localhost` because a WSL MongoDB is relayed on `::1:27017` and the Java driver tries IPv6 first. The `install` step is needed once so `spring-boot:run -pl api` can resolve the `common` module; `java -jar backend/api/target/api.jar --spring.profiles.active=local` after `mvn package` works too.

## Building images

CI builds `frontend`, `api`, `worker`, and `keycloak` images on every push to `main` and rolls them out. To build one by hand:

```bash
docker build -f docker/api.Dockerfile -t ours-api .
```
