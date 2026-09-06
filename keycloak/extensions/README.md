# Keycloak extensions

Milestone 7. A Maven module implementing `EventListenerProviderFactory` that publishes `LOGIN`, `LOGIN_ERROR`, and `UPDATE_CREDENTIAL` events to the `security.login` Kafka topic. The JAR is copied into `providers/` by `keycloak/Dockerfile`.
