# Plans: what was designed, what got built, and what to do next

Written 2026-09-07, after milestone 2's code landed. This is a working document for reviewing the feature and deciding what happens next.

## Update, 2026-09-09: what got closed

Most of "Step 3" below happened in one pass. The list, so the rest of this document reads as history rather than a to-do:

- **Item detail sheet exists** (`features/plans/ItemSheet.tsx`). Every item card opens it: itinerary days, the unscheduled tray, bookings, Today, the overview "next up" card, idea cards, and the desktop workspace. It shows the kind-specific fields, cost, tap-to-copy confirmation, links, attachments, notes and a comment thread, and offers Edit, Put on a day / Move, Take it off the schedule, Open in Maps and Delete. Gap categories 2 and 5 are closed.
- **One real form for all six kinds** (`ItemForm.tsx`), in create and edit mode, with cost (amount, home or local currency, paid), place, links with preview, attachments, notes and kind specifics. No mock defaults remain anywhere in the plans feature. Budget can show a number now.
- Items carry a free-text `notes` field on the server; `PATCH` accepts `clearEnd`; `PATCH /api/plans/{id}` accepts `localCurrency`; new plans get default checklists (trip: Before we go, Packing, Shopping; event: To do, Shopping, Guests).
- Event plans hide Flight and Stay from the kind picker. Plans can be edited and deleted from the More menu. The plans list has a real search filter.
- Today mode shows a real clock in the plan's timezone and a working Tomorrow.
- Deferred features are labelled in place (map tiles, locked note, confirmation parser: milestone 6). The locked-note teaser no longer shows invented passport numbers.
- `planViews.ts` has 67 Vitest unit tests (`npm test`, also in CI).
- The Calendar shows only real plan data (bars, booked items, the anniversary); its own events wait for milestone 5. Memories, Chat, Notes and the rest of Us are honest empty states by default; a "Design preview data" toggle under Us → Developer brings the design's placeholder screens back for reference.

Still open from the analysis below: reorder within a day (`POST …/reorder` is built but unused), offline caching of document bytes through the service worker, and the desktop drag versus mobile tap interaction model being two different things.

**The short version.** The backend is complete for milestone 2 — every endpoint the architecture declares exists and is tested. The frontend problem is not broken code; it is **missing screens**. Specifically: you cannot tap an item to view, edit or delete it, because **the design prototype never drew that screen**. Everything else you noticed follows from that hole or is correctly deferred to a later milestone.

Read this in four passes, in this order. Each one gives you the vocabulary for the next.

---

## Pass 1 — The intent: what the architecture says Plans is

Read `docs/architecture.md` section 7 (about 15 minutes). Four decisions carry the whole feature:

**Decision 16 — Plans are their own module.** Not a memory with extra fields, not a folder of calendar events. A plan is a living workspace for the months before a trip and a logistics record during it. A memory is what you write afterward. They link, they don't merge.

**Decision 17 — One `plan_items` collection with a `kind` discriminator.** This is the load-bearing idea. A restaurant she finds on Instagram starts as an `idea`, gets both your votes, gets dragged onto Day 4 (becoming `kind: food`, `status: decided`), gets a reservation confirmation (`booked`), and then appears in Bookings, on the calendar, and in Today mode. That is **one document changing status**, not four records to keep in sync.

**Decision 18 — The calendar derives from plans, never copies them.** A calendar query merges its own events with plan date ranges and booked items at read time. Nothing can drift.

**Decision 19 — Plans are readable offline.** Trips are where connectivity is worst. Confirmation codes on a train platform in Kyoto is the use case.

### The nine lenses

Decision 17 has a consequence worth internalising, because it explains the whole UI: **every view in a plan is a filter over the same two collections.**

| View | It is really |
|---|---|
| Overview | A dashboard over everything below |
| Itinerary | Items with a `day` |
| Ideas | Items with status `idea` or `shortlisted` |
| Bookings | Items with status `booked` |
| Checklists | `plan_checklists` |
| Budget | Items summed by kind and status |
| Documents | `media` reachable from this plan |
| Map | Items with `location.lat` |
| Today | Itinerary filtered to the current local date |

Nine screens, two collections. If a change makes you add a third collection or a parallel record, it is fighting the design.

### What the architecture explicitly defers

This matters for your sense that things are half-done. **Several are meant to be.**

| Deferred to | What |
|---|---|
| Milestone 3 | "Turn this trip into a memory" hand-off |
| Milestone 4 | Chat's "Save to plan"; live updates over the socket; push notifications |
| Milestone 5 | Reminders (including the 2-hours-before-a-flight ones); the calendar's own events |
| Milestone 6 | **Map view with real tiles**; **the locked note**; print and `.ics` exports; the paste-a-confirmation parser |
| Milestone 7 | Audit log; transactional outbox; NetworkPolicies |

So: the map showing a placeholder, the locked note being decorative, and "paste a confirmation" not parsing are **on plan**, not bugs.

---

## Pass 2 — The prototype: what the UI design actually drew

Read `design/spec/mobile-b-plans.md` (long, but skim the segment sections) and click through the canvas if you still have it open.

The prototype defines **34 screens and sheets** across the whole app. For Plans it draws: the list, the detail with all nine segments, Today mode, the New plan sheet, the More sheet, the kind picker, the flight form, the stay form, and the paste-confirmation review.

### The hole

**There is no "plan item detail" screen and no "edit item" screen.** I checked every screen marker in the prototype. There is a `MEMORY DETAIL`. There is a `PLAN DETAIL` (the plan itself). There is nothing for an individual flight, stay or activity.

The design lets you **create** an item through the kind picker and forms, and then never lets you look at it again. That is why:

- you cannot edit the flight on day 1
- you cannot delete the activity you added on day 11
- "Open in Maps" goes nowhere — it is drawn on cards, but no screen owns the action

This is a **design gap, not a coding oversight**. The fix starts with deciding what that screen is, not with writing code.

### Affordances the prototype itself never wired

The prototype is a static mockup; several things it draws were decorative even there. The spec flags them:

- `tap to copy` on confirmation codes
- `Open in Maps` on bookings and in Today mode
- `Directions` on a map pin
- `Use today's rate` in Budget
- The long-press `Put it on a day` on idea cards
- The checklist drag handle ("Drag the handle to reorder")
- `Tomorrow` in Today mode
- The search button on the Plans list and the three-dots menu on plan detail
- The 60-second auto re-lock the locked note's copy promises

When you look at the running app and something does nothing, it is often because **the prototype it was built from also did nothing**. The agents built what was drawn.

### Two contradictions in our own documents

Worth settling before more work:

1. **Map default.** The design spec's footnote says the map is "an opt-in switch in Us → Preferences (off by default)". Architecture decision 20 says OpenStreetMap tiles are **on by default**. Pick one.
2. **Seed data.** The architecture says Japan is 4–19 February 2027 across Tokyo, Hakuba, Kyoto. The design's placeholder data says April 8–22 across Tokyo, Kyoto, Osaka. **The code follows the architecture**, which is correct — the design data predates your correction. No action needed beyond knowing why they differ.

---

## Pass 3 — The backend: complete

`backend/`, about 2,150 lines plus 535 of tests. Read `PlanItemDocument.java`, `ItemDetails.java`, then `PlansService.java`.

**Every endpoint the architecture declares for milestone 2 exists.** All 19 plan endpoints, plus media and the link preview:

| Declared in architecture §7 | Implemented | Called by the frontend |
|---|---|---|
| `GET, POST /api/plans` | yes | yes |
| `GET, PATCH, DELETE /api/plans/{id}` | yes | GET and PATCH only |
| `GET, POST /api/plans/{id}/items` | yes | yes |
| `PATCH /api/plans/{id}/items/{itemId}` | yes | **only for scheduling** |
| `DELETE /api/plans/{id}/items/{itemId}` | yes | **never** |
| `POST /api/plans/{id}/items/reorder` | yes | **never** |
| `PUT .../vote` | yes | yes |
| `POST .../comments` | yes | desktop only |
| checklists (5 endpoints) | yes | add and tick only |
| `GET /api/plans/{id}/budget` | yes | yes |
| `GET /api/plans/{id}/bundle` | yes | yes |
| `POST /api/links/preview` | yes | yes |
| locked-note, print, ics, to-memory, parse-confirmation | **not built** | deferred to m3/m6, correctly |

Eight integration tests run against real MongoDB, Kafka and MinIO, covering the item lifecycle, the budget conversion, checklist attribution, the offline bundle, and the upload contract.

**Verdict: the backend is ahead of the frontend.** Three milestone-2 endpoints are built, tested, and simply never called.

---

## Pass 4 — The frontend: wired, but with holes

`frontend/src/data` (1,490 lines) is the seam; `frontend/src/features/plans` (4,530 lines) is the screens. **Zero frontend tests.**

Of 59 buttons across the plan screens, **only 6 are inert**: `Open in Maps` (four places), `Directions`, and the desktop `Share to chat` / `Edit` row. So the problem is not dead buttons — it is **absent UI**.

### The gaps, categorised

This taxonomy is the useful part. Your "some things kind of work and others don't" decomposes into five distinct things:

| # | Category | Items | What to do |
|---|---|---|---|
| 1 | **Deferred by plan** | Map tiles, locked note, print/ics, confirmation parser, reminders | Nothing. Label them in the UI so they stop reading as broken. |
| 2 | **Design gap** | No item detail / edit / delete screen | **Design it, then build it.** This is the big one. |
| 3 | **Milestone 2 scope, genuinely missing** | No cost input in any form (so Budget can only ever show $0); delete unused; reorder unused; offline caches JSON but not document bytes; event plans don't hide flights/stays from the kind picker | Build. Small once #2 exists. |
| 4 | **Inconsistent across surfaces** | Desktop drags, mobile taps, itinerary cards do neither but show a `grab` cursor; comments desktop-only | Pick one interaction model and apply it. |
| 5 | **Misleading affordances** | Add-idea leads with a Link field though only a title is required; `cursor: grab` on non-draggable cards | Copy and CSS fixes, minutes each. |

Two specifics worth calling out:

**Budget can never show a number.** The flight and stay forms render Cost as a static row with no input, because the prototype drew it that way. The backend computes planned, committed and paid correctly, converts currencies at your manual rate, and is tested — but nothing in the UI can set a cost. That is why your budget reads $0 with a booked flight.

**The event variant is incomplete.** Architecture section 7 says an event plan hides flights and stays from the kind picker and adds a `guests` checklist. The picker currently offers all six kinds regardless.

---

## What to do, in what order

### Step 0 — Settle the two contradictions (10 minutes)

Decide whether the map is opt-in or on by default. Note the seed-data discrepancy is already resolved in code. Write both into `docs/architecture.md` so the next milestone doesn't rediscover them.

### Step 1 — Review the pattern (about 2 hours)

Six files, roughly 1,100 lines, in this order. Each hands off to the next, so the sequence matters more than the volume.

| # | File | ~Lines | Hold this question |
|---|---|---|---|
| 1 | `common/plan/PlanItemDocument.java` + `ItemDetails.java` | 130 | Is one collection with a sealed `details` union the right call, or would you rather have separate types? |
| 2 | `api/plans/PlansService.java` | 420 | The partial-update convention: `clearDay`/`clearCost` flags exist because null can't mean both "untouched" and "remove". Do you like that, or would you rather PUT whole documents? |
| 3 | `data/api/plansApi.ts` | 250 | Transport only, mirroring server types by hand. Worth generating from OpenAPI instead? |
| 4 | `data/planViews.ts` | 430 | **The load-bearing decision.** See below. |
| 5 | `data/hooks.ts`, the `usePlan` function | 200 | Is one fat hook per feature right, or one hook per query? |
| 6 | `features/plans/SegChecklists.tsx` | 90 | The smallest complete screen: reads real data, writes two mutations, handles errors. Is this the screen pattern you want repeated? |

**The question that matters most is #4.** `planViews.ts` translates server documents into the display shapes the design's screens were built against. It exists because the screens came from a prototype, not from the database. It keeps screens simple but adds a layer to maintain, and it is where subtle bugs will hide. Milestones 3 through 6 will copy whatever you decide. The alternatives: have the API return view-shaped responses, or have screens read documents directly and format inline.

### Step 2 — Design the item detail sheet (the unblocker)

Before more code. It needs to answer: what do you see when you tap a flight on day 1? Probably: the kind-specific fields, cost, confirmation with tap-to-copy, attachments, notes, and actions for Edit, Open in Maps, Move to another day, and Delete.

Once that screen exists, five separate gaps close at once — edit, delete, maps, share, and the desktop `Edit` button all land in it.

You can draw it in Claude Design the way the rest came, or sketch it and I'll build it.

### Step 3 — The work, in this order

1. **Item detail sheet** — view, edit, delete, open in Maps. Closes gap categories 2 and most of 5.
2. **Cost input** in the flight, stay and simple-kind forms. Makes Budget real; it is otherwise finished and tested.
3. **Consistency pass** — one interaction model for scheduling across mobile and desktop; remove the lying `grab` cursor; comments on mobile.
4. **Small milestone-2 leftovers** — reorder within a day, event kind-picker filtering, offline document bytes through the service worker.
5. **Label the deferred features** — a quiet line on the map, locked note and paste sheets saying which milestone they arrive in. Costs minutes, removes most of the "is this broken?" feeling.
6. **First frontend tests** — `planViews.ts` is pure functions with no React or network. It is the single highest-value test target in the codebase and a good place to learn the tooling.

### Step 4 — Then milestone 3

With the pattern settled and Plans coherent, Memories follows the same shape and should go much faster.

---

## A note on reviewing

Don't read all 8,700 lines. Read the 1,100 in Step 1 properly — line by line, until you could rewrite them — and skim the rest. Screens are cheap to fix when they are wrong because you see it immediately; the seam between server and screen is where a mistake is invisible and expensive.

If you want to learn rather than just approve: pick `SegChecklists.tsx`, delete it, and rebuild it from `design/spec/mobile-b-plans.md` section 2.8 and the hook contract. Then diff. That is an hour and teaches more than reading all six files.
