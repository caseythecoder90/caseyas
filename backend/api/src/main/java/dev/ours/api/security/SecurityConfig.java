package dev.ours.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Backend-for-frontend security.
 *
 * <p>The SPA never sees a token. Spring Security is the OAuth2 client against the Keycloak realm,
 * keeps the tokens in the servlet session, and hands the browser one HttpOnly, Secure,
 * SameSite=Strict session cookie. CSRF protection is on, with the token in a readable cookie the
 * SPA echoes back as a header. Signing out ends the Keycloak session too, and Keycloak's
 * back-channel logout ends this session when a device is signed out from the account console.
 *
 * <p>Spring Security 7 has no implicit behaviour, so everything below is stated.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http, ClientRegistrationRepository clients)
      throws Exception {
    var apiPaths = PathPatternRequestMatcher.withDefaults().matcher("/api/**");

    // Plain (non-XOR) handler: the token only ever travels in a cookie and a header, never inside
    // an HTML body, so BREACH masking buys nothing and the SPA can send the cookie value as-is.
    var csrfHandler = new CsrfTokenRequestAttributeHandler();

    var oidcLogout = new OidcClientInitiatedLogoutSuccessHandler(clients);
    oidcLogout.setPostLogoutRedirectUri("{baseUrl}/");

    http.authorizeHttpRequests(
            auth ->
                auth.requestMatchers("/actuator/health", "/actuator/health/**")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .oauth2Login(login -> login.defaultSuccessUrl("/", true))
        .oidcLogout(oidc -> oidc.backChannel(Customizer.withDefaults()))
        .logout(logout -> logout.logoutSuccessHandler(oidcLogout))
        .csrf(
            csrf ->
                csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                    .csrfTokenRequestHandler(csrfHandler))
        .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)
        // The SPA calls /api/** with fetch. An unauthenticated fetch must get a 401 it can act on,
        // not a 302 to Keycloak it cannot follow. Browser navigations still get the redirect.
        .exceptionHandling(
            ex ->
                ex.defaultAuthenticationEntryPointFor(
                    new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED), apiPaths));

    return http.build();
  }

  /**
   * Spring defers loading the CSRF token until something reads it. Reading it on every request
   * makes the repository write the XSRF-TOKEN cookie, which is how the SPA gets it.
   */
  static final class CsrfCookieFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(
        HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {
      var token = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
      if (token != null) {
        token.getToken();
      }
      chain.doFilter(request, response);
    }
  }
}
