package dev.ours.common.plan;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PlanChecklistRepository extends MongoRepository<PlanChecklistDocument, String> {

  List<PlanChecklistDocument> findByPlanIdOrderBySortKeyAsc(String planId);

  long deleteByPlanId(String planId);
}
