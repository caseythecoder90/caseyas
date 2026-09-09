package dev.ours.api;

import java.net.URI;
import org.junit.jupiter.api.BeforeAll;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MinIOContainer;
import org.testcontainers.kafka.KafkaContainer;
import org.testcontainers.mongodb.MongoDBContainer;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.BucketAlreadyOwnedByYouException;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;

/**
 * One shared context against real Mongo, Kafka, and MinIO. The containers are static, so every test
 * class that extends this reuses them and the Spring context.
 */
@SpringBootTest
@AutoConfigureMockMvc
public abstract class AbstractIntegrationTest {

  static final String BUCKET = "ours-test";

  // Singletons started once for the whole JVM, never stopped (Ryuk reaps them at
  // exit). The Testcontainers JUnit extension would stop them after each test
  // class while Spring's cached context kept the old mapped ports.
  @ServiceConnection static final MongoDBContainer MONGO = new MongoDBContainer("mongo:8");

  // No @ServiceConnection on Kafka: Boot 4.1's connection-details factory does not
  // know Testcontainers 2.x's KafkaContainer, so the bootstrap servers are wired below.
  static final KafkaContainer KAFKA = new KafkaContainer("apache/kafka:3.9.1");

  static final MinIOContainer MINIO = new MinIOContainer("minio/minio:latest");

  static {
    MONGO.start();
    KAFKA.start();
    MINIO.start();
  }

  @DynamicPropertySource
  static void storage(DynamicPropertyRegistry registry) {
    registry.add("spring.kafka.bootstrap-servers", KAFKA::getBootstrapServers);
    registry.add("ours.storage.endpoint", MINIO::getS3URL);
    registry.add("ours.storage.public-endpoint", MINIO::getS3URL);
    registry.add("ours.storage.region", () -> "auto");
    registry.add("ours.storage.bucket", () -> BUCKET);
    registry.add("ours.storage.access-key", MINIO::getUserName);
    registry.add("ours.storage.secret-key", MINIO::getPassword);
    registry.add("ours.storage.path-style", () -> "true");
  }

  @BeforeAll
  static void createBucket() {
    try (var s3 =
        S3Client.builder()
            .endpointOverride(URI.create(MINIO.getS3URL()))
            .region(Region.of("auto"))
            .credentialsProvider(
                StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(MINIO.getUserName(), MINIO.getPassword())))
            .forcePathStyle(true)
            .build()) {
      s3.createBucket(CreateBucketRequest.builder().bucket(BUCKET).build());
    } catch (BucketAlreadyOwnedByYouException e) {
      // a previous test class made it
    }
  }
}
