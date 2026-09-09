package dev.ours.api.events;

import dev.ours.common.events.MediaUploaded;
import dev.ours.common.events.PlanItemChanged;
import dev.ours.common.events.Topics;
import java.time.Clock;
import java.time.Instant;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Write-then-publish, architecture section 10: the document is saved first, the event follows. The
 * transactional outbox is a milestone 7 exercise.
 */
@Component
public class EventsPublisher {

  private final KafkaTemplate<Object, Object> kafka;
  private final Clock clock;

  public EventsPublisher(KafkaTemplate<Object, Object> kafka, Clock clock) {
    this.kafka = kafka;
    this.clock = clock;
  }

  public void mediaUploaded(String mediaId, String ownerId, String kind, String key) {
    kafka.send(Topics.MEDIA_UPLOADED, mediaId, new MediaUploaded(mediaId, ownerId, kind, key));
  }

  public void planItemChanged(String planId, String itemId, String change, String actorId) {
    kafka.send(
        Topics.PLAN_ITEM_CHANGED,
        planId,
        new PlanItemChanged(planId, itemId, change, actorId, Instant.now(clock)));
  }
}
