package dev.ours.api.links;

import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LinkPreviewController {

  public record PreviewRequest(@NotBlank String url) {}

  private final LinkPreviewService links;

  public LinkPreviewController(LinkPreviewService links) {
    this.links = links;
  }

  @PostMapping("/api/links/preview")
  public LinkPreviewService.Preview preview(@RequestBody PreviewRequest req) {
    return links.preview(req.url());
  }
}
