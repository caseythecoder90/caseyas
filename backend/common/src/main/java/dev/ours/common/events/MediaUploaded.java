package dev.ours.common.events;

/** Published by the api after the browser's direct upload is verified; consumed by the worker. */
public record MediaUploaded(String mediaId, String ownerId, String kind, String key) {}
