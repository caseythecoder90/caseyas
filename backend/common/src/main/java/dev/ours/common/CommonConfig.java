package dev.ours.common;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
// Repository scanning follows the @SpringBootApplication package (api or worker), not
// scanBasePackages, so the shared repositories are enabled here explicitly.
@EnableMongoRepositories(basePackageClasses = CommonConfig.class)
public class CommonConfig {

  /** Injected everywhere time is read, so tests can pin it. */
  @Bean
  Clock clock() {
    return Clock.systemUTC();
  }
}
