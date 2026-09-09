package dev.ours.api.plans;

import dev.ours.common.plan.ItemDetails;
import dev.ours.common.plan.ItemKind;
import dev.ours.common.plan.ItemStatus;
import dev.ours.common.plan.PlanItemDocument;
import dev.ours.common.plan.PlanStatus;
import dev.ours.common.plan.PlanType;
import dev.ours.common.plan.Vote;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/** Request bodies for the plans API. Responses are the documents themselves. */
public final class PlanDtos {

  public record CreatePlanRequest(
      @NotBlank String name,
      @NotNull PlanType type,
      LocalDate dateStart,
      LocalDate dateEnd,
      String timezone,
      List<String> destinations,
      String localCurrency) {}

  public record UpdatePlanRequest(
      String name,
      PlanStatus status,
      LocalDate dateStart,
      LocalDate dateEnd,
      String timezone,
      List<String> destinations,
      String coverMediaId,
      BigDecimal rate,
      Boolean archived,
      String localCurrency) {}

  public record CreateItemRequest(
      @NotNull ItemKind kind,
      @NotBlank String title,
      ItemStatus status,
      Integer day,
      LocalDateTime start,
      LocalDateTime end,
      String timezone,
      PlanItemDocument.Location location,
      ItemDetails details,
      PlanItemDocument.Cost cost,
      String confirmation,
      List<PlanItemDocument.Link> links,
      List<String> attachmentIds,
      List<String> tags,
      String notes) {}

  /**
   * Partial update; null means leave alone. {@code clearDay}, {@code clearStart} and {@code
   * clearCost} exist because null cannot mean both "untouched" and "remove". Text fields clear when
   * sent blank ({@code notes: ""}).
   */
  public record UpdateItemRequest(
      ItemKind kind,
      String title,
      ItemStatus status,
      Integer day,
      Boolean clearDay,
      LocalDateTime start,
      LocalDateTime end,
      Boolean clearStart,
      String timezone,
      PlanItemDocument.Location location,
      ItemDetails details,
      PlanItemDocument.Cost cost,
      Boolean clearCost,
      String confirmation,
      List<PlanItemDocument.Link> links,
      List<String> attachmentIds,
      List<String> tags,
      String notes,
      Boolean clearEnd) {}

  public record ReorderEntry(@NotBlank String itemId, Integer day, double sortKey) {}

  public record ReorderRequest(@NotEmpty List<ReorderEntry> items) {}

  /** Null clears this user's vote. */
  public record VoteRequest(Vote vote) {}

  public record CommentRequest(@NotBlank String text) {}

  public record CreateChecklistRequest(
      @NotBlank String name, dev.ours.common.plan.PlanChecklistDocument.Kind kind) {}

  public record UpdateChecklistRequest(String name) {}

  public record CreateChecklistItemRequest(
      @NotBlank String text, String assignee, LocalDate dueDate) {}

  public record UpdateChecklistItemRequest(
      String text, Boolean done, String assignee, LocalDate dueDate) {}

  public record BudgetRow(ItemKind kind, BigDecimal amount, int pct) {}

  public record BudgetResponse(
      BigDecimal planned,
      BigDecimal committed,
      BigDecimal paid,
      BigDecimal plannedLocal,
      BigDecimal committedLocal,
      BigDecimal paidLocal,
      String home,
      String local,
      BigDecimal rate,
      List<BudgetRow> rows) {}

  private PlanDtos() {}
}
