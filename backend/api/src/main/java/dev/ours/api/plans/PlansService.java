package dev.ours.api.plans;

import dev.ours.api.events.EventsPublisher;
import dev.ours.api.plans.PlanDtos.BudgetResponse;
import dev.ours.api.plans.PlanDtos.BudgetRow;
import dev.ours.api.plans.PlanDtos.CreateItemRequest;
import dev.ours.api.plans.PlanDtos.CreatePlanRequest;
import dev.ours.api.plans.PlanDtos.ReorderRequest;
import dev.ours.api.plans.PlanDtos.UpdateItemRequest;
import dev.ours.api.plans.PlanDtos.UpdatePlanRequest;
import dev.ours.common.plan.ItemKind;
import dev.ours.common.plan.ItemStatus;
import dev.ours.common.plan.PlanChecklistDocument;
import dev.ours.common.plan.PlanChecklistRepository;
import dev.ours.common.plan.PlanDocument;
import dev.ours.common.plan.PlanItemDocument;
import dev.ours.common.plan.PlanItemRepository;
import dev.ours.common.plan.PlanRepository;
import dev.ours.common.plan.PlanStatus;
import dev.ours.common.plan.PlanType;
import dev.ours.common.plan.Vote;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.bson.types.ObjectId;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PlansService {

  private final PlanRepository plans;
  private final PlanItemRepository items;
  private final PlanChecklistRepository checklists;
  private final EventsPublisher events;
  private final Clock clock;

  public PlansService(
      PlanRepository plans,
      PlanItemRepository items,
      PlanChecklistRepository checklists,
      EventsPublisher events,
      Clock clock) {
    this.plans = plans;
    this.items = items;
    this.checklists = checklists;
    this.events = events;
    this.clock = clock;
  }

  // ── plans ─────────────────────────────────────────────────────────────────

  public List<PlanDocument> list() {
    return plans.findByArchivedAtIsNullOrderByDateStartAsc();
  }

  public PlanDocument get(String id) {
    return plans
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "no such plan"));
  }

  public PlanDocument create(CreatePlanRequest req, String userId) {
    var now = Instant.now(clock);
    var plan = new PlanDocument();
    plan.name = req.name().trim();
    plan.type = req.type();
    plan.dateStart = req.dateStart();
    plan.dateEnd = req.dateEnd();
    plan.status = req.dateStart() != null ? PlanStatus.PLANNING : PlanStatus.DREAMING;
    plan.timezone = req.timezone();
    if (req.destinations() != null) {
      plan.destinations =
          req.destinations().stream()
              .filter(d -> d != null && !d.isBlank())
              .map(d -> new PlanDocument.Destination(d.trim(), null, null, null))
              .toList();
    }
    var local = req.localCurrency() == null ? "USD" : req.localCurrency().trim().toUpperCase();
    plan.currency = new PlanDocument.Currency("USD", local, null, null);
    plan.createdBy = userId;
    plan.createdAt = now;
    plan.updatedAt = now;
    var saved = plans.save(plan);
    seedDefaultChecklists(saved);
    return saved;
  }

  /**
   * Every plan starts with the lists the design assumes (architecture section 7): a trip gets
   * before-we-go, packing and shopping; an event gets a to-do list, shopping and guests.
   */
  private void seedDefaultChecklists(PlanDocument plan) {
    record Default(String name, PlanChecklistDocument.Kind kind) {}
    var defaults =
        plan.type == PlanType.EVENT
            ? List.of(
                new Default("To do", PlanChecklistDocument.Kind.TODO),
                new Default("Shopping", PlanChecklistDocument.Kind.SHOPPING),
                new Default("Guests", PlanChecklistDocument.Kind.GUESTS))
            : List.of(
                new Default("Before we go", PlanChecklistDocument.Kind.TODO),
                new Default("Packing", PlanChecklistDocument.Kind.PACKING),
                new Default("Shopping", PlanChecklistDocument.Kind.SHOPPING));
    for (int i = 0; i < defaults.size(); i++) {
      var list = new PlanChecklistDocument();
      list.planId = plan.id;
      list.name = defaults.get(i).name();
      list.kind = defaults.get(i).kind();
      list.sortKey = i;
      checklists.save(list);
    }
  }

  public PlanDocument update(String id, UpdatePlanRequest req) {
    var plan = get(id);
    if (req.name() != null) plan.name = req.name().trim();
    if (req.status() != null) plan.status = req.status();
    if (req.dateStart() != null) plan.dateStart = req.dateStart();
    if (req.dateEnd() != null) plan.dateEnd = req.dateEnd();
    if (req.timezone() != null) plan.timezone = req.timezone();
    if (req.coverMediaId() != null) plan.coverMediaId = req.coverMediaId();
    if (req.destinations() != null) {
      plan.destinations =
          req.destinations().stream()
              .map(d -> new PlanDocument.Destination(d.trim(), null, null, null))
              .toList();
    }
    if (req.rate() != null) {
      var c = plan.currency;
      plan.currency =
          new PlanDocument.Currency(
              c == null ? "USD" : c.home(),
              c == null ? "USD" : c.local(),
              req.rate(),
              Instant.now(clock));
    }
    if (req.archived() != null) {
      plan.archivedAt = req.archived() ? Instant.now(clock) : null;
    }
    plan.updatedAt = Instant.now(clock);
    return plans.save(plan);
  }

  public void delete(String id) {
    get(id);
    items.deleteByPlanId(id);
    checklists.deleteByPlanId(id);
    plans.deleteById(id);
  }

  // ── items ─────────────────────────────────────────────────────────────────

  public List<PlanItemDocument> listItems(String planId) {
    get(planId);
    return items.findByPlanIdOrderByDayAscSortKeyAsc(planId);
  }

  public PlanItemDocument createItem(String planId, CreateItemRequest req, String userId) {
    var plan = get(planId);
    var now = Instant.now(clock);
    var item = new PlanItemDocument();
    item.planId = planId;
    item.kind = req.kind();
    item.title = req.title().trim();
    item.status =
        req.status() != null
            ? req.status()
            : (req.kind() == ItemKind.IDEA ? ItemStatus.IDEA : ItemStatus.DECIDED);
    item.day = req.day();
    item.start = req.start();
    item.end = req.end();
    item.timezone = req.timezone() != null ? req.timezone() : plan.timezone;
    item.location = req.location();
    item.details = req.details();
    item.cost = req.cost();
    item.confirmation = trimmed(req.confirmation());
    item.notes = blankToNull(req.notes());
    if (req.links() != null) item.links = new ArrayList<>(req.links());
    if (req.attachmentIds() != null) item.attachmentIds = new ArrayList<>(req.attachmentIds());
    if (req.tags() != null) item.tags = new ArrayList<>(req.tags());
    item.sortKey = nextSortKey(planId, req.day());
    item.createdBy = userId;
    item.updatedBy = userId;
    item.createdAt = now;
    item.updatedAt = now;
    var saved = items.save(item);
    events.planItemChanged(planId, saved.id, "created", userId);
    return saved;
  }

  public PlanItemDocument updateItem(
      String planId, String itemId, UpdateItemRequest req, String userId) {
    var item = requireItem(planId, itemId);
    var statusBefore = item.status;
    if (req.kind() != null) item.kind = req.kind();
    if (req.title() != null) item.title = req.title().trim();
    if (req.status() != null) item.status = req.status();
    if (Boolean.TRUE.equals(req.clearDay())) item.day = null;
    else if (req.day() != null) item.day = req.day();
    if (Boolean.TRUE.equals(req.clearStart())) {
      item.start = null;
      item.end = null;
    } else {
      if (req.start() != null) item.start = req.start();
      if (req.end() != null) item.end = req.end();
    }
    if (req.timezone() != null) item.timezone = req.timezone();
    if (req.location() != null) item.location = req.location();
    if (req.details() != null) item.details = req.details();
    if (Boolean.TRUE.equals(req.clearCost())) item.cost = null;
    else if (req.cost() != null) item.cost = req.cost();
    if (req.confirmation() != null) item.confirmation = trimmed(req.confirmation());
    if (req.notes() != null) item.notes = blankToNull(req.notes());
    if (req.links() != null) item.links = new ArrayList<>(req.links());
    if (req.attachmentIds() != null) item.attachmentIds = new ArrayList<>(req.attachmentIds());
    if (req.tags() != null) item.tags = new ArrayList<>(req.tags());
    item.updatedBy = userId;
    item.updatedAt = Instant.now(clock);
    var saved = items.save(item);
    events.planItemChanged(
        planId, itemId, saved.status != statusBefore ? "status" : "updated", userId);
    return saved;
  }

  public void deleteItem(String planId, String itemId, String userId) {
    requireItem(planId, itemId);
    items.deleteById(itemId);
    events.planItemChanged(planId, itemId, "deleted", userId);
  }

  public List<PlanItemDocument> reorder(String planId, ReorderRequest req, String userId) {
    get(planId);
    var now = Instant.now(clock);
    for (var entry : req.items()) {
      var item = requireItem(planId, entry.itemId());
      item.day = entry.day();
      item.sortKey = entry.sortKey();
      item.updatedBy = userId;
      item.updatedAt = now;
      items.save(item);
    }
    events.planItemChanged(planId, null, "reorder", userId);
    return listItems(planId);
  }

  public PlanItemDocument vote(String planId, String itemId, Vote vote, String userId) {
    var item = requireItem(planId, itemId);
    if (vote == null) item.votes.remove(userId);
    else item.votes.put(userId, vote);
    item.updatedAt = Instant.now(clock);
    var saved = items.save(item);
    events.planItemChanged(planId, itemId, "vote", userId);
    return saved;
  }

  public PlanItemDocument comment(String planId, String itemId, String text, String userId) {
    var item = requireItem(planId, itemId);
    item.comments.add(
        new PlanItemDocument.Comment(
            new ObjectId().toHexString(), userId, text.trim(), Instant.now(clock)));
    item.updatedAt = Instant.now(clock);
    var saved = items.save(item);
    events.planItemChanged(planId, itemId, "comment", userId);
    return saved;
  }

  // ── checklists ────────────────────────────────────────────────────────────

  public List<PlanChecklistDocument> listChecklists(String planId) {
    get(planId);
    return checklists.findByPlanIdOrderBySortKeyAsc(planId);
  }

  public PlanChecklistDocument createChecklist(
      String planId, String name, PlanChecklistDocument.Kind kind) {
    get(planId);
    var list = new PlanChecklistDocument();
    list.planId = planId;
    list.name = name.trim();
    list.kind = kind != null ? kind : PlanChecklistDocument.Kind.TODO;
    list.sortKey =
        checklists.findByPlanIdOrderBySortKeyAsc(planId).stream()
                .mapToDouble(c -> c.sortKey)
                .max()
                .orElse(-1)
            + 1;
    return checklists.save(list);
  }

  public PlanChecklistDocument renameChecklist(String planId, String listId, String name) {
    var list = requireChecklist(planId, listId);
    if (name != null) list.name = name.trim();
    return checklists.save(list);
  }

  public PlanChecklistDocument addChecklistItem(
      String planId, String listId, String text, String assignee, LocalDate dueDate) {
    var list = requireChecklist(planId, listId);
    var item = new PlanChecklistDocument.Item();
    item.id = new ObjectId().toHexString();
    item.text = text.trim();
    item.assignee = assignee;
    item.dueDate = dueDate;
    list.items.add(item);
    return checklists.save(list);
  }

  public PlanChecklistDocument updateChecklistItem(
      String planId,
      String listId,
      String itemId,
      PlanDtos.UpdateChecklistItemRequest req,
      String userId) {
    var list = requireChecklist(planId, listId);
    var item =
        list.items.stream()
            .filter(i -> itemId.equals(i.id))
            .findFirst()
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "no such checklist item"));
    if (req.text() != null) item.text = req.text().trim();
    if (req.assignee() != null) item.assignee = req.assignee();
    if (req.dueDate() != null) item.dueDate = req.dueDate();
    if (req.done() != null) {
      item.done = req.done();
      item.doneBy = req.done() ? userId : null;
      item.doneAt = req.done() ? Instant.now(clock) : null;
    }
    return checklists.save(list);
  }

  public PlanChecklistDocument removeChecklistItem(String planId, String listId, String itemId) {
    var list = requireChecklist(planId, listId);
    list.items.removeIf(i -> itemId.equals(i.id));
    return checklists.save(list);
  }

  // ── budget ────────────────────────────────────────────────────────────────

  /**
   * Planned is every item with a cost, committed is status booked, paid is the paid flag, in the
   * home currency with the local conversion using the plan's manually entered rate (architecture
   * section 7).
   */
  public BudgetResponse budget(String planId) {
    var plan = get(planId);
    var currency = plan.currency;
    var home = currency == null ? "USD" : currency.home();
    var local = currency == null ? null : currency.local();
    var rate = currency == null ? null : currency.rate();

    var planned = BigDecimal.ZERO;
    var committed = BigDecimal.ZERO;
    var paid = BigDecimal.ZERO;
    Map<ItemKind, BigDecimal> byKind = new EnumMap<>(ItemKind.class);

    for (var item : items.findByPlanIdOrderByDayAscSortKeyAsc(planId)) {
      if (item.cost == null || item.cost.amount() == null) continue;
      if (item.status == ItemStatus.CANCELLED) continue;
      var amount = toHome(item.cost.amount(), item.cost.currency(), home, local, rate);
      planned = planned.add(amount);
      byKind.merge(item.kind, amount, BigDecimal::add);
      if (item.status == ItemStatus.BOOKED || item.status == ItemStatus.DONE) {
        committed = committed.add(amount);
      }
      if (item.cost.paid()) paid = paid.add(amount);
    }

    var total = planned;
    List<BudgetRow> rows =
        byKind.entrySet().stream()
            .sorted(Map.Entry.<ItemKind, BigDecimal>comparingByValue().reversed())
            .map(
                e ->
                    new BudgetRow(
                        e.getKey(),
                        scale(e.getValue()),
                        total.signum() == 0
                            ? 0
                            : e.getValue()
                                .multiply(BigDecimal.valueOf(100))
                                .divide(total, 0, RoundingMode.HALF_UP)
                                .intValue()))
            .toList();

    return new BudgetResponse(
        scale(planned),
        scale(committed),
        scale(paid),
        toLocal(planned, rate),
        toLocal(committed, rate),
        toLocal(paid, rate),
        home,
        local,
        rate,
        rows);
  }

  private static BigDecimal toHome(
      BigDecimal amount, String amountCurrency, String home, String local, BigDecimal rate) {
    if (amountCurrency != null
        && local != null
        && rate != null
        && rate.signum() > 0
        && amountCurrency.equalsIgnoreCase(local)
        && !amountCurrency.equalsIgnoreCase(home)) {
      return amount.divide(rate, 2, RoundingMode.HALF_UP);
    }
    return amount;
  }

  private static BigDecimal toLocal(BigDecimal home, BigDecimal rate) {
    return rate == null ? null : home.multiply(rate).setScale(0, RoundingMode.HALF_UP);
  }

  private static BigDecimal scale(BigDecimal v) {
    return v.setScale(2, RoundingMode.HALF_UP);
  }

  // ── helpers ───────────────────────────────────────────────────────────────

  private double nextSortKey(String planId, Integer day) {
    return items.findByPlanIdOrderByDayAscSortKeyAsc(planId).stream()
            .filter(i -> java.util.Objects.equals(i.day, day))
            .mapToDouble(i -> i.sortKey)
            .max()
            .orElse(-1)
        + 1;
  }

  private PlanItemDocument requireItem(String planId, String itemId) {
    var item =
        items
            .findById(itemId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "no such item"));
    if (!planId.equals(item.planId)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "item is not in this plan");
    }
    return item;
  }

  private PlanChecklistDocument requireChecklist(String planId, String listId) {
    var list =
        checklists
            .findById(listId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "no such checklist"));
    if (!planId.equals(list.planId)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "checklist is not in this plan");
    }
    return list;
  }

  private static String trimmed(String s) {
    return s == null ? null : s.trim();
  }

  /** Blank text means "no value": a cleared textarea should not persist as "". */
  private static String blankToNull(String s) {
    return s == null || s.isBlank() ? null : s.trim();
  }
}
