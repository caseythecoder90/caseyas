package dev.ours.common.plan;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * One trip or event, decision 16: a living workspace before and during, linked to a memory after.
 * Public fields on purpose: these documents are data holders shared by api and worker, and both
 * Jackson and Spring Data map fields directly.
 */
@Document("plans")
public class PlanDocument {

  public record Destination(String name, String countryCode, Double lat, Double lng) {}

  /** Manually entered rate, decision in section 7: typed once is accurate enough for a holiday. */
  public record Currency(String home, String local, BigDecimal rate, Instant rateSetAt) {}

  public record NotifyOn(boolean votes, boolean comments, boolean decided, boolean booked) {}

  @Id public String id;
  public String name;
  public PlanType type;
  public PlanStatus status;
  public LocalDate dateStart;
  public LocalDate dateEnd;
  public String timezone;
  public List<Destination> destinations = new ArrayList<>();
  public String coverMediaId;
  public Currency currency;
  public NotifyOn notifyOn = new NotifyOn(true, true, true, true);
  public String linkedMemoryId;
  public String createdBy;
  public Instant createdAt;
  public Instant updatedAt;
  public Instant archivedAt;
}
