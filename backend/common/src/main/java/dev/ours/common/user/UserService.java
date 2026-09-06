package dev.ours.common.user;

import java.time.Clock;
import java.time.Instant;
import org.springframework.stereotype.Service;

@Service
public class UserService {

  private final UserRepository users;
  private final Clock clock;

  public UserService(UserRepository users, Clock clock) {
    this.users = users;
    this.clock = clock;
  }

  /**
   * Called on every authenticated {@code /api/me}. Creates the document on the first sign-in and
   * keeps the username and display name in step with Keycloak afterwards.
   */
  public UserDocument touch(String keycloakId, String username, String fullName) {
    var now = Instant.now(clock);
    var displayName = (fullName == null || fullName.isBlank()) ? username : fullName;

    var user =
        users
            .findByKeycloakId(keycloakId)
            .orElseGet(() -> new UserDocument(keycloakId, username, displayName, now));
    user.setUsername(username);
    user.setDisplayName(displayName);
    user.setLastSeenAt(now);
    return users.save(user);
  }
}
