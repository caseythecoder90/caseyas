package dev.ours.common.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Object storage, decision 5: Cloudflare R2 in production, MinIO locally, both S3.
 *
 * @param endpoint where the api and worker reach the store from inside the network
 * @param publicEndpoint the host browsers reach; presigned URLs are signed against it
 * @param region "auto" for R2; ignored by MinIO
 * @param bucket the single bucket, architecture section 8
 * @param accessKey credential
 * @param secretKey credential
 * @param pathStyle true for MinIO and R2 (bucket in the path, not the hostname)
 */
@ConfigurationProperties("ours.storage")
public record StorageProperties(
    String endpoint,
    String publicEndpoint,
    String region,
    String bucket,
    String accessKey,
    String secretKey,
    boolean pathStyle) {}
