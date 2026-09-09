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
 * Usernames are the stable identity across a Keycloak realm re-creation, so they are unique too.
 * Lets {@code UserService} re-link a document to a new subject instead of duplicating it.
 */
@TargetSystem(id = FlamingockConfig.MONGODB)
@Change(id = "users-username-unique-index", author = "casey", transactional = false)
public class _0002__UsersUsernameUniqueIndex {

  static final String INDEX = "username_unique";

  @Apply
  public void apply(MongoDatabase db) {
    db.getCollection("users")
        .createIndex(Indexes.ascending("username"), new IndexOptions().unique(true).name(INDEX));
  }

  @Rollback
  public void rollback(MongoDatabase db) {
    db.getCollection("users").dropIndex(INDEX);
  }
}
