package dev.ours.common.media;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.time.Instant;
import java.util.Locale;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * One uploaded file. The bytes live in object storage under {@link Keys}; this document is the
 * metadata and processing state. Originals are never regenerated; variants are disposable
 * (architecture section 8).
 */
@Document("media")
public class MediaDocument {

  public enum Kind {
    PHOTO,
    VIDEO,
    DOCUMENT;

    @JsonValue
    public String toJson() {
      return name().toLowerCase(Locale.ROOT);
    }

    @JsonCreator
    public static Kind fromJson(String value) {
      return valueOf(value.toUpperCase(Locale.ROOT));
    }
  }

  public enum Status {
    PENDING,
    UPLOADED,
    PROCESSING,
    READY,
    FAILED;

    @JsonValue
    public String toJson() {
      return name().toLowerCase(Locale.ROOT);
    }

    @JsonCreator
    public static Status fromJson(String value) {
      return valueOf(value.toUpperCase(Locale.ROOT));
    }
  }

  public static class Keys {
    public String original;
    public String thumb;
    public String large;
    public String poster;
    public String mp4;
  }

  public record Gps(double lat, double lng) {}

  @Id public String id;
  public String ownerId;
  public String memoryId;

  /** Set when the file was uploaded into a plan (documents, item attachments). */
  public String planId;

  public Kind kind;
  public String mime;
  public long size;
  public String originalName;
  public Keys keys = new Keys();
  public Integer width;
  public Integer height;
  public Double duration;
  public Integer pageCount;
  public Instant takenAt;
  public Gps gps;
  public String caption;
  public boolean favorite;
  public Status status;
  public String error;
  public Instant deletedAt;
  public Instant createdAt;
  public Instant updatedAt;
}
