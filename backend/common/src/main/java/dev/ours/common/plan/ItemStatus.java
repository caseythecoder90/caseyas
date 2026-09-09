package dev.ours.common.plan;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Locale;

/** One document changing status, decision 17: idea to shortlisted to decided to booked to done. */
public enum ItemStatus {
  IDEA,
  SHORTLISTED,
  DECIDED,
  BOOKED,
  DONE,
  CANCELLED;

  @JsonValue
  public String toJson() {
    return name().toLowerCase(Locale.ROOT);
  }

  @JsonCreator
  public static ItemStatus fromJson(String value) {
    return valueOf(value.toUpperCase(Locale.ROOT));
  }
}
