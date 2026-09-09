package dev.ours.common.changes;

import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.IndexOptions;
import com.mongodb.client.model.Indexes;
import dev.ours.common.flamingock.FlamingockConfig;
import io.flamingock.api.annotations.Apply;
import io.flamingock.api.annotations.Change;
import io.flamingock.api.annotations.Rollback;
import io.flamingock.api.annotations.TargetSystem;

/** Media metadata with the indexes from architecture section 4, plus the plan scope. */
@TargetSystem(id = FlamingockConfig.MONGODB)
@Change(id = "create-media-collection", author = "casey", transactional = false)
public class _0004__CreateMediaCollection {

  @Apply
  public void apply(MongoDatabase db) {
    var media = db.getCollection("media");
    media.createIndex(Indexes.ascending("memoryId"), new IndexOptions().name("memory"));
    media.createIndex(Indexes.ascending("planId"), new IndexOptions().name("plan"));
    media.createIndex(Indexes.descending("takenAt"), new IndexOptions().name("takenAt_desc"));
    media.createIndex(Indexes.ascending("status"), new IndexOptions().name("status"));
  }

  @Rollback
  public void rollback(MongoDatabase db) {
    var media = db.getCollection("media");
    media.dropIndex("memory");
    media.dropIndex("plan");
    media.dropIndex("takenAt_desc");
    media.dropIndex("status");
  }
}
