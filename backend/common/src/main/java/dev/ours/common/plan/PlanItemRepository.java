package dev.ours.common.plan;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PlanItemRepository extends MongoRepository<PlanItemDocument, String> {

  List<PlanItemDocument> findByPlanIdOrderByDayAscSortKeyAsc(String planId);

  List<PlanItemDocument> findByPlanIdAndStatus(String planId, ItemStatus status);

  long deleteByPlanId(String planId);
}
