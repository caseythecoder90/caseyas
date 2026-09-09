package dev.ours.common.plan;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Kind-specific fields of a plan item, decision 17: one collection, a sealed interface for the
 * variants, pattern matching on the consumer side. {@code IDEA} and {@code NOTE} items carry no
 * details. Serialized with an explicit {@code type} discriminator so the JSON is stable however the
 * class moves; Mongo stores its own {@code _class} alongside.
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
  @JsonSubTypes.Type(value = ItemDetails.Flight.class, name = "flight"),
  @JsonSubTypes.Type(value = ItemDetails.Stay.class, name = "stay"),
  @JsonSubTypes.Type(value = ItemDetails.Transport.class, name = "transport"),
  @JsonSubTypes.Type(value = ItemDetails.Activity.class, name = "activity"),
  @JsonSubTypes.Type(value = ItemDetails.Food.class, name = "food"),
  @JsonSubTypes.Type(value = ItemDetails.Ticket.class, name = "ticket")
})
public sealed interface ItemDetails {

  record Flight(
      String airline,
      String flightNumber,
      String fromAirport,
      String toAirport,
      LocalDateTime depart,
      LocalDateTime arrive,
      String seats,
      String pnr)
      implements ItemDetails {}

  record Stay(LocalDate checkIn, LocalDate checkOut, String phone, String roomInfo)
      implements ItemDetails {}

  record Transport(
      String mode,
      String from,
      String to,
      LocalDateTime depart,
      LocalDateTime arrive,
      String passInfo)
      implements ItemDetails {}

  record Activity(Integer durationMinutes, Boolean bookingRequired, String openingHours)
      implements ItemDetails {}

  record Food(String cuisine, LocalDateTime reservationAt, Integer partySize)
      implements ItemDetails {}

  record Ticket(LocalDate validFrom, LocalDate validTo, Integer quantity) implements ItemDetails {}
}
