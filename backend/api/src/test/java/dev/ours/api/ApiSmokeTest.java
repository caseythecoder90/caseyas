package dev.ours.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.mongodb.MongoDBContainer;

/** The context starts, Flamingock runs against a real Mongo, and the security posture holds. */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class ApiSmokeTest {

  @Container @ServiceConnection
  static final MongoDBContainer mongo = new MongoDBContainer("mongo:8");

  @Autowired MockMvc mvc;

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
}
