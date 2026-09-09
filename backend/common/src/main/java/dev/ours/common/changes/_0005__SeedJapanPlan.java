package dev.ours.common.changes;

import dev.ours.common.flamingock.FlamingockConfig;
import dev.ours.common.plan.PlanChecklistDocument;
import dev.ours.common.plan.PlanChecklistRepository;
import dev.ours.common.plan.PlanDocument;
import dev.ours.common.plan.PlanRepository;
import dev.ours.common.plan.PlanStatus;
import dev.ours.common.plan.PlanType;
import io.flamingock.api.annotations.Apply;
import io.flamingock.api.annotations.Change;
import io.flamingock.api.annotations.Rollback;
import io.flamingock.api.annotations.TargetSystem;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * Decision 21: the first plan is seeded, not typed. Japan, 4 to 19 February 2027, Tokyo, Hakuba,
 * Kyoto, USD home and JPY local, with the default checklists. The real Expedia flight and lodging
 * confirmations get entered by hand through the app.
 *
 * <p>Goes through the repositories so the stored representation always matches what the application
 * reads back.
 */
@TargetSystem(id = FlamingockConfig.MONGODB)
@Change(id = "seed-japan-plan", author = "casey", transactional = false)
public class _0005__SeedJapanPlan {

  static final String PLAN_NAME = "Japan 2027";

  @Apply
  public void apply(PlanRepository plans, PlanChecklistRepository checklists) {
    if (plans.existsByName(PLAN_NAME)) {
      return;
    }
    var now = Instant.now();

    var plan = new PlanDocument();
    plan.name = PLAN_NAME;
    plan.type = PlanType.TRIP;
    plan.status = PlanStatus.PLANNING;
    plan.dateStart = LocalDate.of(2027, 2, 4);
    plan.dateEnd = LocalDate.of(2027, 2, 19);
    plan.timezone = "Asia/Tokyo";
    plan.destinations =
        List.of(
            new PlanDocument.Destination("Tokyo", "JP", null, null),
            new PlanDocument.Destination("Hakuba", "JP", null, null),
            new PlanDocument.Destination("Kyoto", "JP", null, null));
    plan.currency = new PlanDocument.Currency("USD", "JPY", new BigDecimal("148.2"), now);
    plan.createdAt = now;
    plan.updatedAt = now;
    plans.save(plan);

    var names = List.of("Before we go", "Packing (Casey)", "Packing (Yasmim)");
    var kinds =
        List.of(
            PlanChecklistDocument.Kind.TODO,
            PlanChecklistDocument.Kind.PACKING,
            PlanChecklistDocument.Kind.PACKING);
    for (int i = 0; i < names.size(); i++) {
      var list = new PlanChecklistDocument();
      list.planId = plan.id;
      list.name = names.get(i);
      list.kind = kinds.get(i);
      list.sortKey = i;
      checklists.save(list);
    }
  }

  @Rollback
  public void rollback(PlanRepository plans, PlanChecklistRepository checklists) {
    plans.findAll().stream()
        .filter(p -> PLAN_NAME.equals(p.name))
        .forEach(
            p -> {
              checklists.deleteByPlanId(p.id);
              plans.deleteById(p.id);
            });
  }
}
