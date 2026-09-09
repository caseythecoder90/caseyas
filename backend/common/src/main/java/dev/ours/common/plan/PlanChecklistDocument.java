package dev.ours.common.plan;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/** A named list inside a plan: before-we-go, one packing list each, shopping, event guests. */
@Document("plan_checklists")
public class PlanChecklistDocument {

  public enum Kind {
    TODO,
    PACKING,
    SHOPPING,
    GUESTS;

    @JsonValue
    public String toJson() {
      return name().toLowerCase(Locale.ROOT);
    }

    @JsonCreator
    public static Kind fromJson(String value) {
      return valueOf(value.toUpperCase(Locale.ROOT));
    }
  }

  public static class Item {
    public String id;
    public String text;
    public boolean done;

    /** userId of who it's assigned to; null means both. */
    public String assignee;

    public LocalDate dueDate;
    public String doneBy;
    public Instant doneAt;
  }

  @Id public String id;
  public String planId;
  public String name;
  public Kind kind;
  public List<Item> items = new ArrayList<>();
  public double sortKey;
}
