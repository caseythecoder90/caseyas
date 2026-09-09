package dev.ours.worker.media;

import dev.ours.common.events.MediaProcessed;
import dev.ours.common.events.MediaUploaded;
import dev.ours.common.events.Topics;
import dev.ours.common.media.MediaDocument;
import dev.ours.common.media.MediaRepository;
import java.time.Clock;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Consumer group {@code media-worker}, architecture section 3. Idempotent: a redelivered event for
 * media that is already ready is skipped, and reprocessing after a crash just overwrites the
 * disposable variants.
 */
@Component
public class MediaProcessingListener {

  private static final Logger log = LoggerFactory.getLogger(MediaProcessingListener.class);

  private final MediaRepository media;
  private final MediaProcessor processor;
  private final KafkaTemplate<Object, Object> kafka;
  private final Clock clock;

  public MediaProcessingListener(
      MediaRepository media,
      MediaProcessor processor,
      KafkaTemplate<Object, Object> kafka,
      Clock clock) {
    this.media = media;
    this.processor = processor;
    this.kafka = kafka;
    this.clock = clock;
  }

  @KafkaListener(topics = Topics.MEDIA_UPLOADED)
  public void onMediaUploaded(MediaUploaded event) {
    var doc = media.findById(event.mediaId()).orElse(null);
    if (doc == null) {
      log.warn("media {} not found, skipping", event.mediaId());
      return;
    }
    if (doc.status == MediaDocument.Status.READY) {
      return;
    }

    doc.status = MediaDocument.Status.PROCESSING;
    doc.updatedAt = Instant.now(clock);
    media.save(doc);

    try {
      processor.process(doc);
      doc.status = MediaDocument.Status.READY;
      doc.error = null;
      log.info("media {} processed ({})", doc.id, doc.kind);
    } catch (Exception e) {
      doc.status = MediaDocument.Status.FAILED;
      doc.error = e.getMessage();
      log.error("media {} failed: {}", doc.id, e.getMessage());
    }
    doc.updatedAt = Instant.now(clock);
    media.save(doc);
    kafka.send(Topics.MEDIA_PROCESSED, doc.id, new MediaProcessed(doc.id, doc.status.toJson()));
  }
}
