package dev.ours.common.user;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * One of the two people. Credentials live in Keycloak; this is the app-side profile keyed by the
 * Keycloak subject. Indexes are created by Flamingock, not by annotations.
 */
@Document("users")
public class UserDocument {

  @Id private String id;
  private String keycloakId;
  private String username;
  private String displayName;
  private Instant createdAt;
  private Instant lastSeenAt;

  public UserDocument() {}

  public UserDocument(String keycloakId, String username, String displayName, Instant now) {
    this.keycloakId = keycloakId;
    this.username = username;
    this.displayName = displayName;
    this.createdAt = now;
    this.lastSeenAt = now;
  }

  public String getId() {
    return id;
  }

  public String getKeycloakId() {
    return keycloakId;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getDisplayName() {
    return displayName;
  }

  public void setDisplayName(String displayName) {
    this.displayName = displayName;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getLastSeenAt() {
    return lastSeenAt;
  }

  public void setLastSeenAt(Instant lastSeenAt) {
    this.lastSeenAt = lastSeenAt;
  }
}
