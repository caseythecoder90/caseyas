package dev.ours.common.plan;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Locale;

/**
 * Set by hand; the UI suggests {@code UNDERWAY} and {@code DONE} from the dates (architecture
 * section 7, lifecycle).
 */
public enum PlanStatus {
  DREAMING,
  PLANNING,
  BOOKED,
  UNDERWAY,
  DONE;

  @JsonValue
  public String toJson() {
    return name().toLowerCase(Locale.ROOT);
  }

  @JsonCreator
  public static PlanStatus fromJson(String value) {
    return valueOf(value.toUpperCase(Locale.ROOT));
  }
}
