package dev.ours.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.ours.api.testsupport.TestEventSink;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import tools.jackson.databind.json.JsonMapper;

/**
 * The upload contract end to end: presign, direct PUT to the store, complete, and the event the
 * worker will consume. Variant processing itself is the worker's test.
 */
class MediaApiTest extends AbstractIntegrationTest {

  @Autowired MockMvc mvc;
  @Autowired TestEventSink events;
  final JsonMapper json = JsonMapper.builder().build();

  RequestPostProcessor casey() {
    return oidcLogin().idToken(t -> t.subject("kc-casey").claim("preferred_username", "casey"));
  }

  @Test
  void uploadPresignPutCompletePublish() throws Exception {
    var bytes = "not really a jpeg but the store does not care".getBytes();

    var slotBody =
        mvc.perform(
                post("/api/media/uploads")
                    .with(casey())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {"name":"JL5-eticket.jpg","size":%d,"mime":"image/jpeg"}
                        """
                            .formatted(bytes.length)))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();
    var slot = json.readTree(slotBody);
    var mediaId = slot.get("mediaId").asString();
    assertThat(slot.get("uploadUrl").asString()).contains(slot.get("key").asString());

    // the browser's direct PUT, straight at the store
    var put =
        HttpClient.newHttpClient()
            .send(
                HttpRequest.newBuilder(URI.create(slot.get("uploadUrl").asString()))
                    .header("Content-Type", "image/jpeg")
                    .PUT(HttpRequest.BodyPublishers.ofByteArray(bytes))
                    .build(),
                HttpResponse.BodyHandlers.ofString());
    assertThat(put.statusCode()).isEqualTo(200);

    mvc.perform(post("/api/media/" + mediaId + "/complete").with(casey()).with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("uploaded"))
        .andExpect(jsonPath("$.size").value(bytes.length));

    var event = events.nextMediaUploaded(15);
    assertThat(event).isNotNull();
    assertThat(event.mediaId()).isEqualTo(mediaId);
    assertThat(event.kind()).isEqualTo("photo");

    mvc.perform(get("/api/media/" + mediaId).with(casey()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.urls.original").isNotEmpty());
  }

  @Test
  void completeWithoutAnUploadIsAConflict() throws Exception {
    var slot =
        json.readTree(
            mvc.perform(
                    post("/api/media/uploads")
                        .with(casey())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            "{\"name\":\"ghost.pdf\",\"size\":123,\"mime\":\"application/pdf\"}"))
                .andReturn()
                .getResponse()
                .getContentAsString());
    mvc.perform(
            post("/api/media/" + slot.get("mediaId").asString() + "/complete")
                .with(casey())
                .with(csrf()))
        .andExpect(status().isConflict());
  }

  @Test
  void oversizedAndUnknownTypesAreRejected() throws Exception {
    mvc.perform(
            post("/api/media/uploads")
                .with(casey())
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"huge.pdf\",\"size\":26214401,\"mime\":\"application/pdf\"}"))
        .andExpect(status().isBadRequest());
    mvc.perform(
            post("/api/media/uploads")
                .with(casey())
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    "{\"name\":\"run.exe\",\"size\":10,\"mime\":\"application/x-msdownload\"}"))
        .andExpect(status().isBadRequest());
  }
}
