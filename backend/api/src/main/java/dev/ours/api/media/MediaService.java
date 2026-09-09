package dev.ours.api.media;

import dev.ours.api.events.EventsPublisher;
import dev.ours.common.media.MediaDocument;
import dev.ours.common.media.MediaRepository;
import dev.ours.common.storage.ObjectStorage;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.bson.types.ObjectId;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Uploads bypass the api, architecture section 8: this service only issues signatures and records
 * metadata. The browser PUTs the original straight to the bucket, then calls complete; the worker
 * makes the variants.
 */
@Service
public class MediaService {

  /** What the client renders: metadata plus fresh presigned GET URLs for whatever keys exist. */
  public record Urls(String original, String thumb, String large) {}

  public record MediaResponse(
      String id,
      String kind,
      String mime,
      long size,
      String originalName,
      String status,
      Integer width,
      Integer height,
      Integer pageCount,
      Instant takenAt,
      String caption,
      String planId,
      Urls urls,
      Instant createdAt) {}

  public record UploadSlot(String mediaId, String key, String uploadUrl) {}

  private static final long MAX_DOCUMENT_BYTES = 25L * 1024 * 1024;
  private static final long MAX_UPLOAD_BYTES = 100L * 1024 * 1024;

  private static final Map<String, String> EXTENSIONS =
      Map.ofEntries(
          Map.entry("image/jpeg", "jpg"),
          Map.entry("image/png", "png"),
          Map.entry("image/webp", "webp"),
          Map.entry("image/heic", "heic"),
          Map.entry("image/heif", "heif"),
          Map.entry("image/gif", "gif"),
          Map.entry("application/pdf", "pdf"),
          Map.entry("video/mp4", "mp4"),
          Map.entry("video/quicktime", "mov"));

  private final MediaRepository media;
  private final ObjectStorage storage;
  private final EventsPublisher events;
  private final Clock clock;

  public MediaService(
      MediaRepository media, ObjectStorage storage, EventsPublisher events, Clock clock) {
    this.media = media;
    this.storage = storage;
    this.events = events;
    this.clock = clock;
  }

  public UploadSlot createUpload(
      String name, long size, String mime, String planId, String ownerId) {
    var kind = kindOf(mime);
    if (kind == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "unsupported type: " + mime);
    }
    if (kind == MediaDocument.Kind.DOCUMENT && size > MAX_DOCUMENT_BYTES) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "documents are capped at 25 MB");
    }
    if (size > MAX_UPLOAD_BYTES) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "files over 100 MB need resumable uploads (milestone 5)");
    }

    var doc = new MediaDocument();
    doc.id = new ObjectId().toHexString();
    doc.ownerId = ownerId;
    doc.planId = planId;
    doc.kind = kind;
    doc.mime = mime;
    doc.size = size;
    doc.originalName = name;
    doc.keys.original = "orig/" + doc.id + "." + extensionOf(mime, name);
    doc.status = MediaDocument.Status.PENDING;
    doc.createdAt = Instant.now(clock);
    doc.updatedAt = doc.createdAt;
    media.save(doc);

    return new UploadSlot(doc.id, doc.keys.original, storage.presignPut(doc.keys.original, mime));
  }

  /** Verifies the object actually landed, then hands the work to the worker over Kafka. */
  public MediaResponse complete(String id) {
    var doc = require(id);
    var stored =
        storage
            .size(doc.keys.original)
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.CONFLICT, "the file never arrived in storage"));
    doc.size = stored;
    doc.status = MediaDocument.Status.UPLOADED;
    doc.updatedAt = Instant.now(clock);
    media.save(doc);
    events.mediaUploaded(doc.id, doc.ownerId, doc.kind.toJson(), doc.keys.original);
    return toResponse(doc);
  }

  public MediaResponse get(String id) {
    return toResponse(require(id));
  }

  public List<MediaResponse> listForPlan(String planId) {
    return media.findByPlanIdAndDeletedAtIsNullOrderByCreatedAtAsc(planId).stream()
        .map(this::toResponse)
        .toList();
  }

  /** Soft delete, architecture section 8; a purge job comes with milestone 6. */
  public void delete(String id) {
    var doc = require(id);
    doc.deletedAt = Instant.now(clock);
    doc.updatedAt = doc.deletedAt;
    media.save(doc);
  }

  public MediaResponse toResponse(MediaDocument doc) {
    var urls =
        new Urls(
            doc.keys.original == null ? null : storage.presignGet(doc.keys.original),
            doc.keys.thumb == null ? null : storage.presignGet(doc.keys.thumb),
            doc.keys.large == null ? null : storage.presignGet(doc.keys.large));
    return new MediaResponse(
        doc.id,
        doc.kind.toJson(),
        doc.mime,
        doc.size,
        doc.originalName,
        doc.status.toJson(),
        doc.width,
        doc.height,
        doc.pageCount,
        doc.takenAt,
        doc.caption,
        doc.planId,
        urls,
        doc.createdAt);
  }

  private MediaDocument require(String id) {
    return media
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "no such media"));
  }

  private static MediaDocument.Kind kindOf(String mime) {
    if (mime == null) return null;
    var lower = mime.toLowerCase(Locale.ROOT);
    if (lower.startsWith("image/")) return MediaDocument.Kind.PHOTO;
    if (lower.startsWith("video/")) return MediaDocument.Kind.VIDEO;
    if (lower.equals("application/pdf")) return MediaDocument.Kind.DOCUMENT;
    return null;
  }

  private static String extensionOf(String mime, String name) {
    var known = EXTENSIONS.get(mime.toLowerCase(Locale.ROOT));
    if (known != null) return known;
    var dot = name == null ? -1 : name.lastIndexOf('.');
    return dot > 0 && dot < name.length() - 1
        ? name.substring(dot + 1).toLowerCase(Locale.ROOT)
        : "bin";
  }
}
