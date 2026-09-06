package dev.ours.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** The user-facing service: OAuth2 client for Keycloak, REST, and later WebSocket and scheduler. */
@SpringBootApplication(scanBasePackages = "dev.ours")
public class ApiApplication {

  public static void main(String[] args) {
    SpringApplication.run(ApiApplication.class, args);
  }
}
