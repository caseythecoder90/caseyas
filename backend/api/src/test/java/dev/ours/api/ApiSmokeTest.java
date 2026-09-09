package dev.ours.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.ours.common.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

/** The context starts, Flamingock runs against a real Mongo, and the security posture holds. */
class ApiSmokeTest extends AbstractIntegrationTest {

  @Autowired MockMvc mvc;
  @Autowired UserRepository users;

  @Test
  void healthIsOpen() throws Exception {
    mvc.perform(get("/actuator/health")).andExpect(status().isOk());
  }

  @Test
  void apiRequiresSignIn() throws Exception {
    // a 401, not a 302: the SPA's fetch must be able to act on it
    mvc.perform(get("/api/me")).andExpect(status().isUnauthorized());
  }

  @Test
  void browserNavigationIsRedirectedToKeycloak() throws Exception {
    mvc.perform(get("/somewhere").accept("text/html")).andExpect(status().is3xxRedirection());
  }

  @Test
  void firstSignInCreatesTheUserDocument() throws Exception {
    var login =
        oidcLogin()
            .idToken(
                t ->
                    t.subject("kc-sub-casey")
                        .claim("preferred_username", "casey")
                        .claim("name", "Casey Quinn"));

    mvc.perform(get("/api/me").with(login))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.username").value("casey"))
        .andExpect(jsonPath("$.displayName").value("Casey Quinn"));

    var stored = users.findByKeycloakId("kc-sub-casey");
    assertThat(stored).isPresent();
    assertThat(stored.get().getUsername()).isEqualTo("casey");

    // a second call updates, never duplicates
    mvc.perform(get("/api/me").with(login)).andExpect(status().isOk());
    assertThat(users.findAll().stream().filter(u -> "kc-sub-casey".equals(u.getKeycloakId())))
        .hasSize(1);

    mvc.perform(get("/api/users").with(login))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].username", hasItem("casey")));
  }

  @Test
  void aRecreatedRealmRelinksTheUserByUsername() throws Exception {
    var before =
        oidcLogin().idToken(t -> t.subject("old-subject").claim("preferred_username", "relink-me"));
    mvc.perform(get("/api/me").with(before)).andExpect(status().isOk());
    var originalId = users.findByUsername("relink-me").orElseThrow().getId();

    var after =
        oidcLogin().idToken(t -> t.subject("new-subject").claim("preferred_username", "relink-me"));
    mvc.perform(get("/api/me").with(after))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(originalId));

    assertThat(users.findByKeycloakId("old-subject")).isEmpty();
    assertThat(users.findByKeycloakId("new-subject").orElseThrow().getId()).isEqualTo(originalId);
    assertThat(users.findAll().stream().filter(u -> "relink-me".equals(u.getUsername())))
        .hasSize(1);
  }

  @Test
  void configPointsAtTheRealmAccountConsole() throws Exception {
    mvc.perform(get("/api/config").with(oidcLogin()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.accountUrl").value("http://keycloak.test/realms/ours/account"));
  }
}
