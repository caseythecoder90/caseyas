package dev.ours.common.changes;

import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.IndexOptions;
import com.mongodb.client.model.Indexes;
import dev.ours.common.flamingock.FlamingockConfig;
import io.flamingock.api.annotations.Apply;
import io.flamingock.api.annotations.Change;
import io.flamingock.api.annotations.Rollback;
import io.flamingock.api.annotations.TargetSystem;

/**
 * The {@code users} collection with its one invariant: a Keycloak subject maps to at most one
 * document.
 *
 * <p>Not transactional: index creation is DDL, and MongoDB runs standalone in milestone 1, without
 * the replica set transactions need.
 */
@TargetSystem(id = FlamingockConfig.MONGODB)
@Change(id = "create-users-collection", author = "casey", transactional = false)
public class _0001__CreateUsersCollection {

  static final String COLLECTION = "users";
  static final String INDEX = "keycloakId_unique";

  @Apply
  public void apply(MongoDatabase db) {
    boolean exists =
        db.listCollectionNames().into(new java.util.ArrayList<>()).contains(COLLECTION);
    if (!exists) {
      db.createCollection(COLLECTION);
    }
    db.getCollection(COLLECTION)
        .createIndex(Indexes.ascending("keycloakId"), new IndexOptions().unique(true).name(INDEX));
  }

  @Rollback
  public void rollback(MongoDatabase db) {
    db.getCollection(COLLECTION).dropIndex(INDEX);
  }
}
