package dev.ours.common.plan;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Locale;

public enum PlanType {
  TRIP,
  EVENT;

  @JsonValue
  public String toJson() {
    return name().toLowerCase(Locale.ROOT);
  }

  @JsonCreator
  public static PlanType fromJson(String value) {
    return valueOf(value.toUpperCase(Locale.ROOT));
  }
}
