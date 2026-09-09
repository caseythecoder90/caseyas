package dev.ours.common.events;

import java.time.Instant;

/**
 * Every write to a plan item, architecture section 7. No consumer until milestone 4 wires the
 * realtime group and notifier; published from day one so the history is on the topic.
 */
public record PlanItemChanged(
    String planId, String itemId, String change, String actorId, Instant at) {}
