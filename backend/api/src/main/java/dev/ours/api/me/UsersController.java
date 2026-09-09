package dev.ours.api.me;

import dev.ours.api.me.MeController.MeResponse;
import dev.ours.common.user.UserRepository;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Both of us. There are only ever two documents, so this is the whole collection. */
@RestController
public class UsersController {

  private final UserRepository users;

  public UsersController(UserRepository users) {
    this.users = users;
  }

  @GetMapping("/api/users")
  public List<MeResponse> users() {
    return users.findAll(Sort.by("createdAt")).stream().map(MeResponse::from).toList();
  }
}
