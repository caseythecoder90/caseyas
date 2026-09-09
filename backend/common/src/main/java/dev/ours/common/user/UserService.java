package dev.ours.common.user;

import java.time.Clock;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class UserService {

  private static final Logger log = LoggerFactory.getLogger(UserService.class);

  private final UserRepository users;
  private final Clock clock;

  public UserService(UserRepository users, Clock clock) {
    this.users = users;
    this.clock = clock;
  }

  /**
   * Called on every authenticated {@code /api/me}. Creates the document on the first sign-in and
   * keeps the username and display name in step with Keycloak afterwards.
   *
   * <p>The Keycloak subject is the identity. If it is unknown but the username already has a
   * document, the document is re-linked to the new subject instead of duplicated: with two fixed
   * accounts the only way a username gets a new subject is the realm being recreated, and the
   * memories and plans hanging off the old document must survive that.
   */
  public UserDocument touch(String keycloakId, String username, String fullName) {
    var now = Instant.now(clock);
    var displayName = (fullName == null || fullName.isBlank()) ? username : fullName;

    var user =
        users
            .findByKeycloakId(keycloakId)
            .or(() -> users.findByUsername(username).map(existing -> relink(existing, keycloakId)))
            .orElseGet(() -> new UserDocument(keycloakId, username, displayName, now));
    user.setUsername(username);
    user.setDisplayName(displayName);
    user.setLastSeenAt(now);
    return users.save(user);
  }

  private static UserDocument relink(UserDocument existing, String keycloakId) {
    log.warn(
        "Re-linking user '{}' from subject {} to {}",
        existing.getUsername(),
        existing.getKeycloakId(),
        keycloakId);
    existing.setKeycloakId(keycloakId);
    return existing;
  }
}
