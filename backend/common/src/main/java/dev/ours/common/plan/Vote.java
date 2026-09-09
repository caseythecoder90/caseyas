package dev.ours.common.plan;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Locale;

public enum Vote {
  LIKE,
  MEH,
  NO;

  @JsonValue
  public String toJson() {
    return name().toLowerCase(Locale.ROOT);
  }

  @JsonCreator
  public static Vote fromJson(String value) {
    return valueOf(value.toUpperCase(Locale.ROOT));
  }
}
