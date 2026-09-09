package dev.ours.common.events;

/**
 * Published by the worker when variants exist (or processing failed). Consumed by the api's
 * realtime group from milestone 4; until then the client polls the media endpoint.
 */
public record MediaProcessed(String mediaId, String status) {}
