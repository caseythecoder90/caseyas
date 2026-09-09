package dev.ours.common.plan;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Everything inside a plan is an item, decision 17: an idea, a flight, a dinner. Status moves; the
 * document stays. Every view in the plan is a lens over this collection.
 */
@Document("plan_items")
public class PlanItemDocument {

  public record Location(String name, String address, Double lat, Double lng, String mapsUrl) {}

  public record Cost(BigDecimal amount, String currency, boolean paid) {}

  public record Link(String url, String title, String image, String site) {}

  public record Comment(String id, String authorId, String text, Instant at) {}

  @Id public String id;
  public String planId;
  public ItemKind kind;
  public String title;
  public ItemStatus status;

  /** 1-based trip day; null means the unscheduled tray. */
  public Integer day;

  /** Wall-clock at the destination; {@link #timezone} says where. */
  public LocalDateTime start;

  public LocalDateTime end;
  public String timezone;
  public Location location;
  public ItemDetails details;
  public Cost cost;
  public String confirmation;
  public List<Link> links = new ArrayList<>();
  public List<String> attachmentIds = new ArrayList<>();
  public List<String> tags = new ArrayList<>();

  /** userId to vote; absent key means not voted. */
  public Map<String, Vote> votes = new HashMap<>();

  public List<Comment> comments = new ArrayList<>();

  /** Order within a day (or the tray); fractional inserts between neighbours. */
  public double sortKey;

  public String createdBy;
  public String updatedBy;
  public Instant createdAt;
  public Instant updatedAt;
}
