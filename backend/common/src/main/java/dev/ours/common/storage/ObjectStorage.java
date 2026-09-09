package dev.ours.common.storage;

import java.net.URI;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Optional;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

/**
 * The one place that talks to the bucket. Presigning is a local HMAC, not a network call, so
 * batching hundreds of GET URLs per response is free (architecture section 8). Two endpoints: the
 * client uses the in-network one for data, the presigner signs against the public one so the
 * browser's direct PUT and GET work.
 */
@Component
public class ObjectStorage {

  @Configuration
  @EnableConfigurationProperties(StorageProperties.class)
  static class Config {}

  public static final Duration GET_TTL = Duration.ofMinutes(15);
  public static final Duration PUT_TTL = Duration.ofMinutes(30);

  private final StorageProperties props;
  private final S3Client client;
  private final S3Presigner presigner;

  public ObjectStorage(StorageProperties props) {
    this.props = props;
    var credentials =
        StaticCredentialsProvider.create(
            AwsBasicCredentials.create(props.accessKey(), props.secretKey()));
    this.client =
        S3Client.builder()
            .endpointOverride(URI.create(props.endpoint()))
            .region(Region.of(props.region()))
            .credentialsProvider(credentials)
            .forcePathStyle(props.pathStyle())
            .build();
    this.presigner =
        S3Presigner.builder()
            .endpointOverride(URI.create(props.publicEndpoint()))
            .region(Region.of(props.region()))
            .credentialsProvider(credentials)
            .serviceConfiguration(
                software.amazon.awssdk.services.s3.S3Configuration.builder()
                    .pathStyleAccessEnabled(props.pathStyle())
                    .build())
            .build();
  }

  /** URL the browser PUTs the original to. Content type is part of the signature. */
  public String presignPut(String key, String contentType) {
    var request =
        PutObjectRequest.builder().bucket(props.bucket()).key(key).contentType(contentType).build();
    return presigner
        .presignPutObject(
            PutObjectPresignRequest.builder()
                .signatureDuration(PUT_TTL)
                .putObjectRequest(request)
                .build())
        .url()
        .toString();
  }

  /** URL the browser GETs a variant from; expires after {@link #GET_TTL}. */
  public String presignGet(String key) {
    var request = GetObjectRequest.builder().bucket(props.bucket()).key(key).build();
    return presigner
        .presignGetObject(
            GetObjectPresignRequest.builder()
                .signatureDuration(GET_TTL)
                .getObjectRequest(request)
                .build())
        .url()
        .toString();
  }

  /** Size of the stored object, or empty if it was never uploaded. */
  public Optional<Long> size(String key) {
    try {
      return Optional.of(
          client
              .headObject(HeadObjectRequest.builder().bucket(props.bucket()).key(key).build())
              .contentLength());
    } catch (NoSuchKeyException e) {
      return Optional.empty();
    }
  }

  public void download(String key, Path target) {
    client.getObject(GetObjectRequest.builder().bucket(props.bucket()).key(key).build(), target);
  }

  public void upload(String key, Path file, String contentType) {
    client.putObject(
        PutObjectRequest.builder().bucket(props.bucket()).key(key).contentType(contentType).build(),
        file);
  }
}
