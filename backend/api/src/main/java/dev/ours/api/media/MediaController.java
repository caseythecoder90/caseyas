package dev.ours.api.media;

import dev.ours.api.me.CurrentUserService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/media")
@Validated
public class MediaController {

  public record CreateUploadRequest(
      @NotBlank String name, @Positive long size, @NotBlank String mime, String planId) {}

  private final MediaService media;
  private final CurrentUserService currentUser;

  public MediaController(MediaService media, CurrentUserService currentUser) {
    this.media = media;
    this.currentUser = currentUser;
  }

  @PostMapping("/uploads")
  @ResponseStatus(HttpStatus.CREATED)
  public MediaService.UploadSlot createUpload(
      @RequestBody CreateUploadRequest req, @AuthenticationPrincipal OidcUser principal) {
    return media.createUpload(
        req.name(), req.size(), req.mime(), req.planId(), currentUser.require(principal).getId());
  }

  @PostMapping("/{id}/complete")
  public MediaService.MediaResponse complete(@PathVariable String id) {
    return media.complete(id);
  }

  @GetMapping("/{id}")
  public MediaService.MediaResponse get(@PathVariable String id) {
    return media.get(id);
  }

  @GetMapping
  public List<MediaService.MediaResponse> list(@RequestParam String planId) {
    return media.listForPlan(planId);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable String id) {
    media.delete(id);
  }
}
