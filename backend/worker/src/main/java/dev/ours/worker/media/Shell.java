package dev.ours.worker.media;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.TimeUnit;

/** Runs libvips and ffmpeg. Blocking on purpose; listeners run on virtual threads. */
final class Shell {

  static String run(Path workDir, Duration timeout, String... command) {
    try {
      var process =
          new ProcessBuilder(List.of(command))
              .directory(workDir.toFile())
              .redirectErrorStream(true)
              .start();
      var output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
      if (!process.waitFor(timeout.toSeconds(), TimeUnit.SECONDS)) {
        process.destroyForcibly();
        throw new IllegalStateException(command[0] + " timed out after " + timeout);
      }
      if (process.exitValue() != 0) {
        throw new IllegalStateException(
            command[0] + " exited " + process.exitValue() + ": " + truncate(output));
      }
      return output.trim();
    } catch (IOException e) {
      throw new IllegalStateException(command[0] + " could not start: " + e.getMessage(), e);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException(command[0] + " interrupted", e);
    }
  }

  private static String truncate(String s) {
    return s.length() > 500 ? s.substring(0, 500) : s;
  }

  private Shell() {}
}
