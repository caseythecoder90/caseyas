package dev.ours.api.me;

import dev.ours.common.user.UserDocument;
import dev.ours.common.user.UserService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;

/** Resolves the signed-in principal to the app-side user document, creating it if needed. */
@Component
public class CurrentUserService {

  private final UserService users;

  public CurrentUserService(UserService users) {
    this.users = users;
  }

  public UserDocument require(OidcUser principal) {
    return users.touch(
        principal.getSubject(), principal.getPreferredUsername(), principal.getFullName());
  }
}
