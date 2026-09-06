package dev.ours.worker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Background processing: Kafka consumers, libvips, ffmpeg. Deployed from milestone 2. It shares the
 * Flamingock change classes with the api, so either service can start first.
 */
@SpringBootApplication(scanBasePackages = "dev.ours")
public class WorkerApplication {

  public static void main(String[] args) {
    SpringApplication.run(WorkerApplication.class, args);
  }
}
