package dev.ours.api.config;

import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The few values the SPA needs that only the server knows. Hostnames stay configuration on the
 * server side; the SPA never guesses them from {@code window.location}.
 */
@RestController
public class ConfigController {

  public record ConfigResponse(String accountUrl, String issuer) {}

  private static final String AUTH_SUFFIX = "/protocol/openid-connect/auth";

  private final ClientRegistrationRepository clients;

  public ConfigController(ClientRegistrationRepository clients) {
    this.clients = clients;
  }

  /** Keycloak's account console for this realm: password, authenticator, passkeys, devices. */
  @GetMapping("/api/config")
  public ConfigResponse config() {
    var realm = realmBase(clients.findByRegistrationId("keycloak"));
    return new ConfigResponse(realm + "/account", realm);
  }

  /**
   * The realm's base URL. Comes from the issuer when discovery was used, otherwise from the
   * authorization endpoint, which Keycloak always serves under the realm.
   */
  static String realmBase(ClientRegistration registration) {
    var details = registration.getProviderDetails();
    var issuer = details.getIssuerUri();
    if (issuer != null && !issuer.isBlank()) {
      return trimSlash(issuer);
    }
    var auth = details.getAuthorizationUri();
    return auth.endsWith(AUTH_SUFFIX)
        ? auth.substring(0, auth.length() - AUTH_SUFFIX.length())
        : trimSlash(auth);
  }

  private static String trimSlash(String url) {
    return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
  }
}
