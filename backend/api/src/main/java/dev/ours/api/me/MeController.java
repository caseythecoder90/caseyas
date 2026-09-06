package dev.ours.api.me;

import dev.ours.common.user.UserDocument;
import dev.ours.common.user.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Who am I. The first authenticated call after sign-in also creates the user's document. */
@RestController
public class MeController {

  public record MeResponse(String id, String username, String displayName) {
    static MeResponse from(UserDocument user) {
      return new MeResponse(user.getId(), user.getUsername(), user.getDisplayName());
    }
  }

  private final UserService users;

  public MeController(UserService users) {
    this.users = users;
  }

  @GetMapping("/api/me")
  public MeResponse me(@AuthenticationPrincipal OidcUser principal) {
    var user =
        users.touch(
            principal.getSubject(), principal.getPreferredUsername(), principal.getFullName());
    return MeResponse.from(user);
  }
}
