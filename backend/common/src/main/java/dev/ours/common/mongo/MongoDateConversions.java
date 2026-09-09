package dev.ours.common.mongo;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

/**
 * Calendar dates and wall-clock times are stored as ISO strings, not BSON dates.
 *
 * <p>Spring Data's default converts {@code LocalDate} through the JVM's time zone, so the api on
 * the cluster (UTC) and a laptop (America/New_York) disagree by a day about when the Japan trip
 * starts. A date without a time has no zone; the string "2027-02-04" means February 4 everywhere,
 * and ISO strings still sort chronologically for the indexes. {@code Instant} fields (createdAt and
 * friends) are real moments in time and stay BSON dates.
 */
@Configuration
public class MongoDateConversions {

  @WritingConverter
  enum LocalDateToString implements Converter<LocalDate, String> {
    INSTANCE;

    @Override
    public String convert(LocalDate source) {
      return source.toString();
    }
  }

  @ReadingConverter
  enum StringToLocalDate implements Converter<String, LocalDate> {
    INSTANCE;

    @Override
    public LocalDate convert(String source) {
      return LocalDate.parse(source);
    }
  }

  @WritingConverter
  enum LocalDateTimeToString implements Converter<LocalDateTime, String> {
    INSTANCE;

    @Override
    public String convert(LocalDateTime source) {
      return source.toString();
    }
  }

  @ReadingConverter
  enum StringToLocalDateTime implements Converter<String, LocalDateTime> {
    INSTANCE;

    @Override
    public LocalDateTime convert(String source) {
      return LocalDateTime.parse(source);
    }
  }

  @Bean
  MongoCustomConversions mongoCustomConversions() {
    return new MongoCustomConversions(
        List.of(
            LocalDateToString.INSTANCE,
            StringToLocalDate.INSTANCE,
            LocalDateTimeToString.INSTANCE,
            StringToLocalDateTime.INSTANCE));
  }
}
