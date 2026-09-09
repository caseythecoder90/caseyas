package dev.ours.api.links;

import java.io.IOException;
import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Locale;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * The one place the api fetches a user-supplied URL (architecture section 13). Guard rails: https
 * or http on default ports only, every resolved address checked against private, loopback,
 * link-local and unique-local ranges, redirects followed by hand (at most three) with the same
 * check each hop, body capped at 1 MB, five-second timeout, HTML only.
 */
@Service
public class LinkPreviewService {

  public record Preview(String url, String title, String image, String site) {}

  private static final int MAX_REDIRECTS = 3;
  private static final int MAX_BODY = 1024 * 1024;

  private static final Pattern TITLE = tag("title");
  private static final Pattern OG_TITLE = meta("og:title");
  private static final Pattern OG_IMAGE = meta("og:image");
  private static final Pattern OG_SITE = meta("og:site_name");

  private final HttpClient http =
      HttpClient.newBuilder()
          .followRedirects(HttpClient.Redirect.NEVER)
          .connectTimeout(Duration.ofSeconds(5))
          .build();

  public Preview preview(String rawUrl) {
    var uri = validated(rawUrl);
    try {
      for (int hop = 0; hop <= MAX_REDIRECTS; hop++) {
        var response =
            http.send(
                HttpRequest.newBuilder(uri)
                    .timeout(Duration.ofSeconds(5))
                    .header("Accept", "text/html")
                    .header("User-Agent", "Ours link preview")
                    .GET()
                    .build(),
                HttpResponse.BodyHandlers.ofByteArray());
        var status = response.statusCode();
        if (status >= 300 && status < 400) {
          var location =
              response
                  .headers()
                  .firstValue("location")
                  .orElseThrow(
                      () ->
                          new ResponseStatusException(
                              HttpStatus.BAD_GATEWAY, "redirect without a location"));
          uri = validated(uri.resolve(location).toString());
          continue;
        }
        if (status != 200) {
          throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "the page answered " + status);
        }
        var contentType = response.headers().firstValue("content-type").orElse("");
        if (!contentType.toLowerCase(Locale.ROOT).contains("text/html")) {
          return new Preview(uri.toString(), null, null, uri.getHost());
        }
        var body = response.body();
        var html = new String(body, 0, Math.min(body.length, MAX_BODY), StandardCharsets.UTF_8);
        return parse(uri, html);
      }
      throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "too many redirects");
    } catch (IOException e) {
      throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "could not reach the page");
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "interrupted");
    }
  }

  Preview parse(URI uri, String html) {
    var title = first(OG_TITLE, html);
    if (title == null) title = first(TITLE, html);
    var site = first(OG_SITE, html);
    return new Preview(
        uri.toString(),
        title,
        absolute(uri, first(OG_IMAGE, html)),
        site != null ? site : uri.getHost());
  }

  /** Scheme, port and every resolved address checked; called again on every redirect hop. */
  URI validated(String rawUrl) {
    URI uri;
    try {
      uri = URI.create(rawUrl.trim());
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "not a URL");
    }
    var scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);
    if (!scheme.equals("http") && !scheme.equals("https")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "only http and https");
    }
    if (uri.getPort() != -1 && uri.getPort() != 80 && uri.getPort() != 443) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "only default ports");
    }
    var host = uri.getHost();
    if (host == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "no host");
    }
    try {
      for (var address : InetAddress.getAllByName(host)) {
        if (blocked(address)) {
          throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "that address is off limits");
        }
      }
    } catch (UnknownHostException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "unknown host");
    }
    return uri;
  }

  static boolean blocked(InetAddress address) {
    if (address.isLoopbackAddress()
        || address.isAnyLocalAddress()
        || address.isLinkLocalAddress()
        || address.isSiteLocalAddress()
        || address.isMulticastAddress()) {
      return true;
    }
    var bytes = address.getAddress();
    // IPv6 unique-local fc00::/7
    if (bytes.length == 16 && (bytes[0] & 0xFE) == 0xFC) {
      return true;
    }
    // Carrier-grade NAT 100.64.0.0/10
    return bytes.length == 4 && (bytes[0] & 0xFF) == 100 && (bytes[1] & 0xC0) == 0x40;
  }

  private static Pattern tag(String name) {
    return Pattern.compile("<" + name + "[^>]*>\\s*([^<]{1,300})", Pattern.CASE_INSENSITIVE);
  }

  private static Pattern meta(String property) {
    return Pattern.compile(
        "<meta[^>]+(?:property|name)=[\"']"
            + Pattern.quote(property)
            + "[\"'][^>]+content=[\"']([^\"']{1,500})[\"']",
        Pattern.CASE_INSENSITIVE);
  }

  private static String first(Pattern pattern, String html) {
    var matcher = pattern.matcher(html);
    return matcher.find() ? matcher.group(1).trim() : null;
  }

  private static String absolute(URI base, String url) {
    if (url == null) return null;
    try {
      return base.resolve(url).toString();
    } catch (IllegalArgumentException e) {
      return null;
    }
  }
}
