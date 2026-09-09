package dev.ours.common.events;

/** Topic names, architecture section 10. One record type per topic, fields only ever added. */
public final class Topics {

  public static final String MEDIA_UPLOADED = "media.uploaded";
  public static final String MEDIA_PROCESSED = "media.processed";
  public static final String PLAN_ITEM_CHANGED = "plan.item.changed";

  private Topics() {}
}
