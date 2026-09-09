package dev.ours.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.ours.common.plan.PlanRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import tools.jackson.databind.json.JsonMapper;

/** The plans domain against real Mongo and Kafka, on top of the Flamingock-seeded Japan plan. */
class PlansApiTest extends AbstractIntegrationTest {

  @Autowired MockMvc mvc;
  @Autowired PlanRepository plans;
  @Autowired MongoTemplate mongo;
  final JsonMapper json = JsonMapper.builder().build();

  RequestPostProcessor casey() {
    return oidcLogin().idToken(t -> t.subject("kc-casey").claim("preferred_username", "casey"));
  }

  String japanId() {
    return plans.findAll().stream()
        .filter(p -> "Japan 2027".equals(p.name))
        .findFirst()
        .orElseThrow()
        .id;
  }

  @Test
  void theSeededJapanPlanIsThere() throws Exception {
    mvc.perform(get("/api/plans").with(casey()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[?(@.name == 'Japan 2027')].dateStart").value("2027-02-04"))
        .andExpect(jsonPath("$[?(@.name == 'Japan 2027')].destinations[1].name").value("Hakuba"));

    mvc.perform(get("/api/plans/" + japanId() + "/checklists").with(casey()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(3))
        .andExpect(jsonPath("$[0].name").value("Before we go"));

    // Calendar dates are stored as ISO strings, never zone-shifted BSON dates: a UTC
    // writer and an America/New_York reader must agree that the trip starts Feb 4.
    var raw = mongo.getCollection("plans").find().first();
    assertThat(raw.get("dateStart")).isEqualTo("2027-02-04");
  }

  @Test
  void anItemMovesThroughItsLife() throws Exception {
    var planId = japanId();

    // an idea arrives with a link
    var created =
        mvc.perform(
                post("/api/plans/" + planId + "/items")
                    .with(casey())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {"kind":"idea","title":"Onsen night after skiing",
                         "tags":["Hakuba"],
                         "links":[{"url":"https://example.com/onsen","title":"Onsen","image":null,"site":"example.com"}]}
                        """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("idea"))
            .andReturn();
    var itemId = json.readTree(created.getResponse().getContentAsString()).get("id").asString();

    // she likes it
    mvc.perform(
            put("/api/plans/" + planId + "/items/" + itemId + "/vote")
                .with(casey())
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"vote\":\"like\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.votes.*").value("like"));

    // it lands on day 9 as dinner, booked with a cost in yen
    mvc.perform(
            patch("/api/plans/" + planId + "/items/" + itemId)
                .with(casey())
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"kind":"food","status":"booked","day":9,
                     "cost":{"amount":14820,"currency":"JPY","paid":false},
                     "confirmation":"ONSEN-77"}
                    """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.day").value(9))
        .andExpect(jsonPath("$.kind").value("food"));

    // the budget sees it converted at the plan's manual rate (14820 / 148.2 = 100)
    mvc.perform(get("/api/plans/" + planId + "/budget").with(casey()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.rows[?(@.kind == 'food')].amount").value(100.0))
        .andExpect(jsonPath("$.committed").value(100.0));

    // a comment lands on it
    mvc.perform(
            post("/api/plans/" + planId + "/items/" + itemId + "/comments")
                .with(casey())
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"text\":\"book the private bath\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.comments[0].text").value("book the private bath"));

    // and it can be deleted
    mvc.perform(delete("/api/plans/" + planId + "/items/" + itemId).with(casey()).with(csrf()))
        .andExpect(status().isNoContent());
  }

  @Test
  void checklistItemsTickWithAttribution() throws Exception {
    var planId = japanId();
    var lists =
        json.readTree(
            mvc.perform(get("/api/plans/" + planId + "/checklists").with(casey()))
                .andReturn()
                .getResponse()
                .getContentAsString());
    var listId = lists.get(0).get("id").asString();

    var withItem =
        json.readTree(
            mvc.perform(
                    post("/api/plans/" + planId + "/checklists/" + listId + "/items")
                        .with(casey())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\":\"Buy JR Pass vouchers\",\"dueDate\":\"2027-01-10\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString());
    var itemId = withItem.get("items").get(0).get("id").asString();

    mvc.perform(
            patch("/api/plans/" + planId + "/checklists/" + listId + "/items/" + itemId)
                .with(casey())
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"done\":true}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items[0].done").value(true))
        .andExpect(jsonPath("$.items[0].doneBy").isNotEmpty());
  }

  @Test
  void aNewPlanCanBeCreatedAndReordered() throws Exception {
    var plan =
        json.readTree(
            mvc.perform(
                    post("/api/plans")
                        .with(casey())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {"name":"Lake weekend","type":"trip",
                             "dateStart":"2026-09-12","dateEnd":"2026-09-13",
                             "destinations":["Lake Lure"]}
                            """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("planning"))
                .andReturn()
                .getResponse()
                .getContentAsString());
    var planId = plan.get("id").asString();

    String first = createSimpleItem(planId, "Pack the kayak");
    String second = createSimpleItem(planId, "Book the cabin");

    mvc.perform(
            post("/api/plans/" + planId + "/items/reorder")
                .with(casey())
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"items":[{"itemId":"%s","day":1,"sortKey":0},
                              {"itemId":"%s","day":1,"sortKey":1}]}
                    """
                        .formatted(second, first)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].title").value("Book the cabin"))
        .andExpect(jsonPath("$[1].title").value("Pack the kayak"));

    // an item from another plan cannot be smuggled in
    mvc.perform(
            patch("/api/plans/" + japanId() + "/items/" + first)
                .with(casey())
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"nope\"}"))
        .andExpect(status().isNotFound());

    mvc.perform(delete("/api/plans/" + planId).with(casey()).with(csrf()))
        .andExpect(status().isNoContent());
    assertThat(plans.findById(planId)).isEmpty();
  }

  @Test
  void theBundleCarriesEverythingOfflineNeeds() throws Exception {
    mvc.perform(get("/api/plans/" + japanId() + "/bundle").with(casey()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.plan.name").value("Japan 2027"))
        .andExpect(jsonPath("$.checklists.length()").value(3))
        .andExpect(jsonPath("$.items").isArray())
        .andExpect(jsonPath("$.media").isArray());
  }

  private String createSimpleItem(String planId, String title) throws Exception {
    var body =
        mvc.perform(
                post("/api/plans/" + planId + "/items")
                    .with(casey())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"kind\":\"activity\",\"title\":\"" + title + "\",\"day\":1}"))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();
    return json.readTree(body).get("id").asString();
  }
}
