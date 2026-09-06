# Build context: repository root.  docker build -f docker/api.Dockerfile .
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /src
COPY backend/pom.xml ./
COPY backend/common/pom.xml common/
COPY backend/api/pom.xml api/
COPY backend/worker/pom.xml worker/
RUN mvn -q -B -pl api -am dependency:go-offline
COPY backend/common/src common/src
COPY backend/api/src api/src
RUN mvn -q -B -pl api -am -DskipTests package

FROM eclipse-temurin:25-jre
RUN useradd --system --uid 10001 --create-home app
USER app
WORKDIR /app
COPY --from=build /src/api/target/api.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseCompactObjectHeaders", "-jar", "app.jar"]
