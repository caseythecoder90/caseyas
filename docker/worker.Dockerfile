# Build context: repository root.  docker build -f docker/worker.Dockerfile .
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /src
COPY backend/pom.xml ./
COPY backend/common/pom.xml common/
COPY backend/api/pom.xml api/
COPY backend/worker/pom.xml worker/
RUN mvn -q -B -pl worker -am dependency:go-offline
COPY backend/common/src common/src
COPY backend/worker/src worker/src
RUN mvn -q -B -pl worker -am -DskipTests package

FROM eclipse-temurin:25-jre
# libvips for photos, HEIC, and PDF first pages; ffmpeg for video posters and
# the 720p rendition. Both are invoked with ProcessBuilder from the worker.
RUN apt-get update \
 && apt-get install -y --no-install-recommends libvips-tools ffmpeg \
 && rm -rf /var/lib/apt/lists/*
RUN useradd --system --uid 10001 --create-home app
USER app
WORKDIR /app
COPY --from=build /src/worker/target/worker.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseCompactObjectHeaders", "-jar", "app.jar"]
