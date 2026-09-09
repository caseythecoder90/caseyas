package dev.ours.api.links;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.net.InetAddress;
import java.net.URI;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

/** The SSRF guard and the parser, without any network. */
class LinkPreviewServiceTest {

  final LinkPreviewService service = new LinkPreviewService();

  @Test
  void privateAndLocalRangesAreBlocked() throws Exception {
    for (var blocked :
        new String[] {
          "127.0.0.1",
          "10.1.2.3",
          "172.16.0.9",
          "192.168.1.1",
          "169.254.169.254",
          "100.64.0.1",
          "0.0.0.0",
          "fc00::1",
          "::1"
        }) {
      assertThat(LinkPreviewService.blocked(InetAddress.getByName(blocked))).as(blocked).isTrue();
    }
    assertThat(LinkPreviewService.blocked(InetAddress.getByName("93.184.216.34"))).isFalse();
  }

  @Test
  void schemesPortsAndLocalHostsAreRejected() {
    assertThatThrownBy(() -> service.validated("ftp://example.com/x"))
        .isInstanceOf(ResponseStatusException.class);
    assertThatThrownBy(() -> service.validated("https://example.com:8443/x"))
        .isInstanceOf(ResponseStatusException.class);
    assertThatThrownBy(() -> service.validated("http://127.0.0.1/admin"))
        .isInstanceOf(ResponseStatusException.class);
    assertThatThrownBy(() -> service.validated("http://localhost:9000/bucket"))
        .isInstanceOf(ResponseStatusException.class);
  }

  @Test
  void openGraphBeatsTheTitleTagAndImagesGoAbsolute() {
    var html =
        """
        <html><head><title>Fallback title</title>
        <meta property="og:title" content="Ichiran Shibuya" />
        <meta property="og:site_name" content="Tabelog" />
        <meta property="og:image" content="/images/ramen.jpg" />
        </head><body></body></html>
        """;
    var preview = service.parse(URI.create("https://tabelog.example/shops/1"), html);
    assertThat(preview.title()).isEqualTo("Ichiran Shibuya");
    assertThat(preview.site()).isEqualTo("Tabelog");
    assertThat(preview.image()).isEqualTo("https://tabelog.example/images/ramen.jpg");

    var bare = service.parse(URI.create("https://x.example/"), "<title>Just a title</title>");
    assertThat(bare.title()).isEqualTo("Just a title");
    assertThat(bare.site()).isEqualTo("x.example");
  }
}
