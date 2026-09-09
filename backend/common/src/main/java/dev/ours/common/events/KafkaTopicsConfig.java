package dev.ours.common.events;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

/**
 * Topics are created by whichever service starts first. Single node, so one partition and one
 * replica; retention 7 days per architecture section 3.
 */
@Configuration
public class KafkaTopicsConfig {

  private static NewTopic topic(String name) {
    return TopicBuilder.name(name)
        .partitions(1)
        .replicas(1)
        .config("retention.ms", String.valueOf(7L * 24 * 60 * 60 * 1000))
        .build();
  }

  @Bean
  NewTopic mediaUploadedTopic() {
    return topic(Topics.MEDIA_UPLOADED);
  }

  @Bean
  NewTopic mediaProcessedTopic() {
    return topic(Topics.MEDIA_PROCESSED);
  }

  @Bean
  NewTopic planItemChangedTopic() {
    return topic(Topics.PLAN_ITEM_CHANGED);
  }
}
