package dev.ours.api.testsupport;

import dev.ours.common.events.MediaUploaded;
import dev.ours.common.events.Topics;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Lives in test sources only; picked up by the normal component scan during tests. Proves the
 * producer-side JSON round-trips through a real broker into the shared event records.
 */
@Component
public class TestEventSink {

  private final BlockingQueue<MediaUploaded> mediaUploaded = new LinkedBlockingQueue<>();

  @KafkaListener(topics = Topics.MEDIA_UPLOADED, groupId = "test-sink")
  void on(MediaUploaded event) {
    mediaUploaded.add(event);
  }

  public MediaUploaded nextMediaUploaded(long seconds) throws InterruptedException {
    return mediaUploaded.poll(seconds, TimeUnit.SECONDS);
  }
}
