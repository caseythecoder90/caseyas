package dev.ours.common.flamingock;

import com.mongodb.client.MongoClient;
import io.flamingock.api.annotations.EnableFlamingock;
import io.flamingock.api.annotations.Stage;
import io.flamingock.store.mongodb.sync.MongoDBSyncAuditStore;
import io.flamingock.targetsystem.mongodb.sync.MongoDBSyncTargetSystem;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;

/**
 * Schema changes as code, decision 22 in docs/architecture.md.
 *
 * <p>Every index, collection, and data migration is a class under {@code dev.ours.common.changes},
 * named {@code _NNNN__Description}, applied at startup by whichever of api or worker starts first.
 * Flamingock keeps the audit history in {@code flamingockAuditLog} and a distributed lock in {@code
 * flamingockLock}, both in the app database. Spring Data's index creation is off, so this is the
 * only thing that shapes the schema.
 */
@Configuration
@EnableFlamingock(stages = {@Stage(location = "dev.ours.common.changes")})
public class FlamingockConfig {

  /** Name the change classes refer to in {@code @TargetSystem}. */
  public static final String MONGODB = "mongodb";

  @Bean
  MongoDBSyncTargetSystem mongoTargetSystem(
      MongoClient mongoClient, MongoDatabaseFactory dbFactory) {
    return new MongoDBSyncTargetSystem(
        MONGODB, mongoClient, dbFactory.getMongoDatabase().getName());
  }

  @Bean
  MongoDBSyncAuditStore auditStore(MongoDBSyncTargetSystem mongoTargetSystem) {
    return MongoDBSyncAuditStore.from(mongoTargetSystem);
  }
}
