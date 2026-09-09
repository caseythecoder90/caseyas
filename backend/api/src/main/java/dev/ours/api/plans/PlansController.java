package dev.ours.api.plans;

import dev.ours.api.me.CurrentUserService;
import dev.ours.api.media.MediaService;
import dev.ours.api.plans.PlanDtos.BudgetResponse;
import dev.ours.api.plans.PlanDtos.CommentRequest;
import dev.ours.api.plans.PlanDtos.CreateChecklistItemRequest;
import dev.ours.api.plans.PlanDtos.CreateChecklistRequest;
import dev.ours.api.plans.PlanDtos.CreateItemRequest;
import dev.ours.api.plans.PlanDtos.CreatePlanRequest;
import dev.ours.api.plans.PlanDtos.ReorderRequest;
import dev.ours.api.plans.PlanDtos.UpdateChecklistItemRequest;
import dev.ours.api.plans.PlanDtos.UpdateChecklistRequest;
import dev.ours.api.plans.PlanDtos.UpdateItemRequest;
import dev.ours.api.plans.PlanDtos.UpdatePlanRequest;
import dev.ours.api.plans.PlanDtos.VoteRequest;
import dev.ours.common.plan.PlanChecklistDocument;
import dev.ours.common.plan.PlanDocument;
import dev.ours.common.plan.PlanItemDocument;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** The plans API surface from architecture section 7. */
@RestController
@RequestMapping("/api/plans")
public class PlansController {

  /** Everything the offline bundle needs in one response (architecture section 7). */
  public record Bundle(
      PlanDocument plan,
      List<PlanItemDocument> items,
      List<PlanChecklistDocument> checklists,
      List<MediaService.MediaResponse> media) {}

  private final PlansService plans;
  private final MediaService media;
  private final CurrentUserService currentUser;

  public PlansController(PlansService plans, MediaService media, CurrentUserService currentUser) {
    this.plans = plans;
    this.media = media;
    this.currentUser = currentUser;
  }

  // ── plans ─────────────────────────────────────────────────────────────────

  @GetMapping
  public List<PlanDocument> list() {
    return plans.list();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public PlanDocument create(
      @Valid @RequestBody CreatePlanRequest req, @AuthenticationPrincipal OidcUser principal) {
    return plans.create(req, currentUser.require(principal).getId());
  }

  @GetMapping("/{id}")
  public PlanDocument get(@PathVariable String id) {
    return plans.get(id);
  }

  @PatchMapping("/{id}")
  public PlanDocument update(@PathVariable String id, @RequestBody UpdatePlanRequest req) {
    return plans.update(id, req);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable String id) {
    plans.delete(id);
  }

  @GetMapping("/{id}/budget")
  public BudgetResponse budget(@PathVariable String id) {
    return plans.budget(id);
  }

  @GetMapping("/{id}/bundle")
  public Bundle bundle(@PathVariable String id) {
    return new Bundle(
        plans.get(id), plans.listItems(id), plans.listChecklists(id), media.listForPlan(id));
  }

  // ── items ─────────────────────────────────────────────────────────────────

  @GetMapping("/{id}/items")
  public List<PlanItemDocument> listItems(@PathVariable String id) {
    return plans.listItems(id);
  }

  @PostMapping("/{id}/items")
  @ResponseStatus(HttpStatus.CREATED)
  public PlanItemDocument createItem(
      @PathVariable String id,
      @Valid @RequestBody CreateItemRequest req,
      @AuthenticationPrincipal OidcUser principal) {
    return plans.createItem(id, req, currentUser.require(principal).getId());
  }

  @PatchMapping("/{id}/items/{itemId}")
  public PlanItemDocument updateItem(
      @PathVariable String id,
      @PathVariable String itemId,
      @RequestBody UpdateItemRequest req,
      @AuthenticationPrincipal OidcUser principal) {
    return plans.updateItem(id, itemId, req, currentUser.require(principal).getId());
  }

  @DeleteMapping("/{id}/items/{itemId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteItem(
      @PathVariable String id,
      @PathVariable String itemId,
      @AuthenticationPrincipal OidcUser principal) {
    plans.deleteItem(id, itemId, currentUser.require(principal).getId());
  }

  @PostMapping("/{id}/items/reorder")
  public List<PlanItemDocument> reorder(
      @PathVariable String id,
      @Valid @RequestBody ReorderRequest req,
      @AuthenticationPrincipal OidcUser principal) {
    return plans.reorder(id, req, currentUser.require(principal).getId());
  }

  @PutMapping("/{id}/items/{itemId}/vote")
  public PlanItemDocument vote(
      @PathVariable String id,
      @PathVariable String itemId,
      @RequestBody VoteRequest req,
      @AuthenticationPrincipal OidcUser principal) {
    return plans.vote(id, itemId, req.vote(), currentUser.require(principal).getId());
  }

  @PostMapping("/{id}/items/{itemId}/comments")
  public PlanItemDocument comment(
      @PathVariable String id,
      @PathVariable String itemId,
      @Valid @RequestBody CommentRequest req,
      @AuthenticationPrincipal OidcUser principal) {
    return plans.comment(id, itemId, req.text(), currentUser.require(principal).getId());
  }

  // ── checklists ────────────────────────────────────────────────────────────

  @GetMapping("/{id}/checklists")
  public List<PlanChecklistDocument> listChecklists(@PathVariable String id) {
    return plans.listChecklists(id);
  }

  @PostMapping("/{id}/checklists")
  @ResponseStatus(HttpStatus.CREATED)
  public PlanChecklistDocument createChecklist(
      @PathVariable String id, @Valid @RequestBody CreateChecklistRequest req) {
    return plans.createChecklist(id, req.name(), req.kind());
  }

  @PatchMapping("/{id}/checklists/{listId}")
  public PlanChecklistDocument renameChecklist(
      @PathVariable String id,
      @PathVariable String listId,
      @RequestBody UpdateChecklistRequest req) {
    return plans.renameChecklist(id, listId, req.name());
  }

  @PostMapping("/{id}/checklists/{listId}/items")
  public PlanChecklistDocument addChecklistItem(
      @PathVariable String id,
      @PathVariable String listId,
      @Valid @RequestBody CreateChecklistItemRequest req) {
    return plans.addChecklistItem(id, listId, req.text(), req.assignee(), req.dueDate());
  }

  @PatchMapping("/{id}/checklists/{listId}/items/{itemId}")
  public PlanChecklistDocument updateChecklistItem(
      @PathVariable String id,
      @PathVariable String listId,
      @PathVariable String itemId,
      @RequestBody UpdateChecklistItemRequest req,
      @AuthenticationPrincipal OidcUser principal) {
    return plans.updateChecklistItem(
        id, listId, itemId, req, currentUser.require(principal).getId());
  }

  @DeleteMapping("/{id}/checklists/{listId}/items/{itemId}")
  public PlanChecklistDocument removeChecklistItem(
      @PathVariable String id, @PathVariable String listId, @PathVariable String itemId) {
    return plans.removeChecklistItem(id, listId, itemId);
  }
}
