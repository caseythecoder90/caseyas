package dev.ours.common.changes;

import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.IndexOptions;
import com.mongodb.client.model.Indexes;
import dev.ours.common.flamingock.FlamingockConfig;
import io.flamingock.api.annotations.Apply;
import io.flamingock.api.annotations.Change;
import io.flamingock.api.annotations.Rollback;
import io.flamingock.api.annotations.TargetSystem;

/** Plans, items, and checklists with the indexes from architecture section 4. */
@TargetSystem(id = FlamingockConfig.MONGODB)
@Change(id = "create-plan-collections", author = "casey", transactional = false)
public class _0003__CreatePlanCollections {

  @Apply
  public void apply(MongoDatabase db) {
    db.getCollection("plans")
        .createIndex(
            Indexes.ascending("status", "dateStart"), new IndexOptions().name("status_dateStart"));

    var items = db.getCollection("plan_items");
    items.createIndex(
        Indexes.ascending("planId", "day", "sortKey"), new IndexOptions().name("plan_day_sort"));
    items.createIndex(
        Indexes.ascending("planId", "status"), new IndexOptions().name("plan_status"));
    items.createIndex(Indexes.ascending("planId", "start"), new IndexOptions().name("plan_start"));

    db.getCollection("plan_checklists")
        .createIndex(Indexes.ascending("planId"), new IndexOptions().name("plan"));
  }

  @Rollback
  public void rollback(MongoDatabase db) {
    db.getCollection("plans").dropIndex("status_dateStart");
    db.getCollection("plan_items").dropIndex("plan_day_sort");
    db.getCollection("plan_items").dropIndex("plan_status");
    db.getCollection("plan_items").dropIndex("plan_start");
    db.getCollection("plan_checklists").dropIndex("plan");
  }
}
