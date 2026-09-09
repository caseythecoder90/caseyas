package dev.ours.common.media;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MediaRepository extends MongoRepository<MediaDocument, String> {

  List<MediaDocument> findByPlanIdAndDeletedAtIsNullOrderByCreatedAtAsc(String planId);
}
