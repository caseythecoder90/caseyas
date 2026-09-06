# Build context: the keycloak/ directory.  docker build -t ours-keycloak keycloak/
#
# Stage 1 runs `kc.sh build` so the runtime image starts with --optimized and
# skips the build step on every boot. Theme and extension JARs are copied into
# providers/ here in later milestones (Keycloakify theme in milestone 5, the
# Kafka event-listener SPI in milestone 7).
FROM quay.io/keycloak/keycloak:26.7.3 AS builder
ENV KC_DB=postgres \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true
WORKDIR /opt/keycloak
# COPY theme/dist_keycloak/*.jar providers/
# COPY extensions/target/*.jar providers/
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:26.7.3
COPY --from=builder /opt/keycloak/ /opt/keycloak/
# Imported on first boot only; placeholders are filled from the environment.
COPY realm/ours-realm.json /opt/keycloak/data/import/ours-realm.json
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized", "--import-realm"]
