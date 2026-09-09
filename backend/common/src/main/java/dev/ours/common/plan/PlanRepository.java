package dev.ours.common.plan;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PlanRepository extends MongoRepository<PlanDocument, String> {

  List<PlanDocument> findByArchivedAtIsNullOrderByDateStartAsc();

  boolean existsByName(String name);
}
