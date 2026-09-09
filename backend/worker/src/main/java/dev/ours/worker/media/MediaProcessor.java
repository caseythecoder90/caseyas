package dev.ours.worker.media;

import dev.ours.common.media.MediaDocument;
import dev.ours.common.storage.ObjectStorage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Makes the disposable variants, architecture section 8: photos get a 400px thumb and a 1600px
 * large in WebP (libvips, which also reads HEIC), PDFs get a first-page thumb and a page count
 * (libvips through poppler). Video transcoding is milestone 5; a video is marked ready and plays
 * from the original. Originals are never modified.
 */
@Component
public class MediaProcessor {

  private static final Logger log = LoggerFactory.getLogger(MediaProcessor.class);
  private static final Duration TOOL_TIMEOUT = Duration.ofMinutes(2);
  private static final DateTimeFormatter EXIF_DATE =
      DateTimeFormatter.ofPattern("yyyy:MM:dd HH:mm:ss");

  private final ObjectStorage storage;

  public MediaProcessor(ObjectStorage storage) {
    this.storage = storage;
  }

  /** Mutates the document (keys, dimensions, takenAt, pageCount); the caller saves it. */
  public void process(MediaDocument doc) throws IOException {
    var workDir = Files.createTempDirectory("ours-media-");
    try {
      var original = workDir.resolve("original" + extensionOf(doc.keys.original)).toAbsolutePath();
      storage.download(doc.keys.original, original);

      switch (doc.kind) {
        case PHOTO -> photo(doc, workDir, original);
        case DOCUMENT -> pdf(doc, workDir, original);
        case VIDEO -> log.info("video {} left for milestone 5, playing the original", doc.id);
      }
    } finally {
      cleanup(workDir);
    }
  }

  private void photo(MediaDocument doc, Path workDir, Path original) {
    variant(doc, workDir, original, 400, "thumb");
    variant(doc, workDir, original, 1600, "large");
    doc.width = intHeader(workDir, original, "width");
    doc.height = intHeader(workDir, original, "height");
    takenAt(doc, workDir, original);
  }

  private void pdf(MediaDocument doc, Path workDir, Path original) {
    variant(doc, workDir, original, 400, "thumb");
    doc.pageCount = intHeader(workDir, original, "n-pages");
  }

  private void variant(MediaDocument doc, Path workDir, Path original, int size, String name) {
    var file = workDir.resolve(name + ".webp");
    Shell.run(
        workDir,
        TOOL_TIMEOUT,
        "vipsthumbnail",
        original.toString(),
        "--size",
        size + "x" + size,
        "-o",
        file.toAbsolutePath() + "[Q=82]");
    var key = name + "/" + doc.id + ".webp";
    storage.upload(key, file, "image/webp");
    if (name.equals("thumb")) doc.keys.thumb = key;
    else doc.keys.large = key;
  }

  private Integer intHeader(Path workDir, Path file, String field) {
    try {
      return Integer.parseInt(
          Shell.run(workDir, TOOL_TIMEOUT, "vipsheader", "-f", field, file.toString()));
    } catch (RuntimeException e) {
      return null;
    }
  }

  private void takenAt(MediaDocument doc, Path workDir, Path original) {
    try {
      var raw =
          Shell.run(
              workDir, TOOL_TIMEOUT, "vipsheader", "-f", "exif-ifd0-DateTime", original.toString());
      // vips prints the value followed by type metadata in parentheses
      var value = raw.split("\\(")[0].trim();
      doc.takenAt = LocalDateTime.parse(value, EXIF_DATE).toInstant(ZoneOffset.UTC);
    } catch (RuntimeException e) {
      // no EXIF or unparseable: not an error
    }
  }

  private static String extensionOf(String key) {
    var dot = key.lastIndexOf('.');
    return dot >= 0 ? key.substring(dot) : "";
  }

  private static void cleanup(Path dir) {
    try (Stream<Path> files = Files.walk(dir)) {
      files
          .sorted(Comparator.reverseOrder())
          .forEach(
              p -> {
                try {
                  Files.deleteIfExists(p);
                } catch (IOException ignored) {
                  // temp files; the OS gets them eventually
                }
              });
    } catch (IOException ignored) {
      // same
    }
  }
}
