# Ours – desktop layout spec

Source: `design/Ours - desktop.dc.html` (canvas "Ours · desktop 1440"). Shared plan data: `design/plans-data.js` (window.OURS_PLANS: PLANS, DAYS, UNSCHEDULED, IDEAS, BOOKINGS, LISTS, BUDGET, DOCS). Mobile screens are specified separately; this file covers only what changes at desktop widths and what exists only on desktop.

Prototype frame: 1440 x 960, `background:var(--bg)`, `color:var(--fg1)`, `font-family:var(--font-sans)`, `font-size:15px`, `line-height:1.5`, `border:1px solid var(--border)`, `border-radius:12px`, `overflow:hidden`. The whole app is one CSS grid: `grid-template-columns: 240px 1fr` (sidebar | main). In the real app the frame is the viewport (min-height 100dvh), not a 1440x960 box; screens that the prototype pins to `height:960px` (Chat, Calendar, Plan detail) should instead fill the viewport height.

Props / tweaks that carry into the app: `theme` (light | dark, sets `data-theme` on the root), `displayFont` (Newsreader | Cormorant Garamond | Lora | Instrument Serif via `data-font`), `herName` (default "Yasmim"; `herIni` = first letter). Every string that says "Yasmim" in the data is replaced with `her` at render time (`by`, list names, etc.).

---

## 0. Responsive breakpoint

- Mobile frame in the mobile prototype is 390–402px wide; desktop prototype is 1440px.
- Switch at Tailwind `md` (768px): `< md` renders the mobile screens (bottom tab bar, single column, sheets); `>= md` renders the desktop shell (persistent sidebar + main pane) described here.
- Between 768 and ~1100px use the same desktop shell; the fixed-width columns (240 sidebar, 340 chat panel, 380/320 itinerary rails, 400 composer tray) stay fixed and the `1fr` column absorbs the difference; grids that are `repeat(6,1fr)` / `repeat(4,1fr)` may drop to fewer columns via `lg:` variants, but the prototype only defines 1440 so treat that as the canonical layout.
- Desktop hides everything mobile-only: the bottom tab bar, the mobile top bars, the floating "+" button, the "Us" avatar header, and full-screen sheets (the sidebar "New" popover replaces the mobile "+" sheet).

---

## 1. App shell

### 1.1 Sidebar (240px, persistent on every screen)

Container: `border-right:1px solid var(--border)`, `padding:28px 20px`, `display:flex; flex-direction:column; gap:28px`, `background:var(--surface)`, full height of the frame.

Contents, top to bottom:

1. **Wordmark** – text `ours`, `font-family:var(--font-serif)`, `font-size:30px`, `line-height:1`, `padding:0 8px`.
2. **New button** (persistent, always visible) – `width:100%`, `height:44px`, `border-radius:8px`, no border, `background:var(--accent)`, `color:#faf9f6`, `font-weight:500`, `font-size:14px`, flex centered, `gap:8px`; 16px plus icon (stroke 1.5, round caps: `M5 12h14` + `M12 5v14`) then the label `New`. Clicking toggles `newOpen`.
   - **New menu** (when `newOpen`): absolutely positioned popover `top:50px; left:0; right:0; z-index:20`, `background:var(--bg)`, `border:1px solid var(--border)`, `border-radius:8px`, `box-shadow:var(--shadow-md)`, `padding:6px`, column of 4 rows. Each row is a 40px-high button, `padding:0 10px`, `border-radius:6px`, transparent bg, `color:var(--fg1)`, `font-size:14px`, left aligned, label on the left and a hint on the right (`font-size:12px; color:var(--fg3)`):
     | label | hint | goes to |
     |---|---|---|
     | Memory | photos + writing | composer |
     | Plan | trip or event | plan |
     | Idea | into a plan | plan |
     | Event | on the calendar | calendar |
   - Picking any row navigates and closes the menu (`newOpen:false`). Any sidebar nav click also closes it.
3. **Nav list** – column, `gap:2px`. Items (label, route key, badge): `Memories` (timeline, ""), `Plans` (plan, ""), `Calendar` (calendar, ""), `Chat` (chat, "2"), `Notes` (notes, "1"), `Us` (us, "").
   - Each item: button `height:40px`, `padding:0 10px`, `border-radius:6px`, no border except `border-left:1px solid {edge}`, `font-size:14px`, `font-weight:500`, flex `space-between`, label left, badge right (`font-family:var(--font-mono)`, `font-size:10px`, `color:var(--accent)`).
   - Active state: `background:var(--accent-soft)`, `color:var(--fg1)`, `edge:var(--accent)`. Inactive: transparent bg, `color:var(--fg2)`, edge transparent.
   - "Memories" counts as active while on `timeline`, `detail` or `composer`.
   - `Notes` and `Us` render the "isOther" placeholder on desktop (see section 8).
4. **Upcoming widget** – `border-top:1px solid var(--border)`, `padding-top:20px`, column `gap:12px`.
   - Eyebrow `Upcoming`: mono 10px, `letter-spacing:.14em`, uppercase, `color:var(--fg3)`, `padding:0 10px`.
   - Two rows, each `padding:0 10px`, flex `gap:10px`, `align-items:flex-start`: a 6px dot (`border-radius:999px`, `margin-top:7px`) then a title (14px) and a sub line (12px, `var(--fg3)`).
     - dot `var(--fg1)` · `Dinner at Nonna's` · `Fri 7:00 PM`
     - dot `var(--green)` · `Lake weekend` · `Sat · in 6 days`
   - **Next trip card** (click -> plan screen): `margin:4px 10px 0`, `padding:12px`, `border-radius:8px`, `border:1px solid var(--border)`, `background:var(--bg)`, cursor pointer. Eyebrow `Next trip` (mono 10px, `.14em`, uppercase, `color:var(--accent)`); below it a baseline row `gap:6px; margin-top:4px`: `214` in serif 32px `line-height:1` and `days to Japan` in 13px `var(--fg2)`.
5. **Couple footer** – `margin-top:auto`, flex `gap:10px`, `padding:0 8px`: two 28px round avatars (mock image helper, `filter:sepia(.2) saturate(.6)`, `border:2px solid var(--surface)`, second one `margin-left:-8px`) then `Casey & {her}` in 13px `var(--fg2)`.

### 1.2 Main pane

`overflow:auto; position:relative`; it is the scroll container. Each screen below lives inside it.

---

## 2. Memories timeline (`isTimeline`, default screen)

Mobile equivalent: the Memories tab (single column feed). Desktop differences: a page title row with inline filter chips and search, a wide "On this day" strip, and a sticky year gutter next to a 6-column masonry-ish grid.

Wrapper: `max-width:1120px; margin:0 auto; padding:40px 48px 64px`.

**Header row** – flex, `align-items:flex-end`, `space-between`, `gap:24px`:
- Title `Memories`, serif 56px, `line-height:1`.
- Right cluster (flex, `gap:8px`): six filter chips `All`, `Trips`, `Date nights`, `Everyday`, `Milestones`, `Videos` – `height:32px`, `padding:0 12px`, `border-radius:4px`, `font-size:13px`, `font-weight:500`, `white-space:nowrap`. Selected: `background:var(--fg1); color:var(--bg); border:1px solid var(--fg1)`; unselected: transparent, `color:var(--fg2)`, `border:1px solid var(--border)`. Then a search box: `height:32px; padding:0 12px; width:180px; border:1px solid var(--border); border-radius:4px; color:var(--fg3); font-size:13px`, 14px magnifier icon + placeholder text `Search`.
- Filter logic: All; Trips = type Trip; Date nights = type "Date night"; Everyday; Milestones = type Milestone; Videos = `count` contains "video". Months with zero items after filtering disappear.

**On this day strip** – `margin-top:28px`, `display:grid; grid-template-columns:120px 1fr auto; gap:20px; align-items:center; padding:14px; border-radius:8px; background:var(--surface); border:1px solid var(--border)`, clickable (opens detail id 5, "Rooftop movie"). Image 120x80, `border-radius:6px`, `object-fit:cover`, `filter:sepia(.08) saturate(.88)`. Text: eyebrow `On this day · 2025` (mono 11px, `.14em`, uppercase, accent), title `First real cold morning` (serif 26px, `line-height:1.1`, `margin-top:4px`), sub `Sep 6, 2025 · Home · 4 photos` (14px, `var(--fg2)`, `margin-top:4px`). Trailing arrow glyph `→` (`color:var(--fg3); font-size:20px; padding-right:8px`).

**Year + months grid** – `margin-top:40px`, `display:grid; grid-template-columns:120px 1fr; gap:32px`.
- Left gutter: `2026`, `position:sticky; top:40px; align-self:start`, serif 28px, `line-height:1`, `color:var(--fg3)`.
- Right: column `gap:40px`, one block per month in order September, August, July (label = `{Month} 2026`).
  - Month label: `position:sticky; top:0; z-index:2; padding:8px 0`, `background:color-mix(in oklab,var(--bg),transparent 12%)`, `backdrop-filter:blur(12px)`, mono 11px, `.14em`, uppercase, `var(--fg3)`, `border-bottom:1px solid var(--border)`.
  - Cards grid: `display:grid; grid-template-columns:repeat(6,1fr); gap:16px; margin-top:16px; grid-auto-rows:auto`.

**Memory card** – `grid-column:span {cols}`, `border-radius:8px; overflow:hidden; background:var(--surface); border:1px solid var(--border)`, flex in direction `{dir}`, `gap:14px`, clickable (opens detail with that id). Size variants from `size`:

| size | cols | dir | image w x h | body padding | title size |
|---|---|---|---|---|---|
| large | 6 | row | 60% x 380px | 28px 28px 28px 14px | 40px |
| medium | 3 | column | 100% x 220px | 14px 16px 18px | 26px |
| compact | 2 | column | 100% x 150px | 14px 16px 18px | 20px |

- Image wrapper `position:relative; flex:none`; image `object-fit:cover; filter:sepia(.08) saturate(.88)`; count badge bottom-right `10px` offset: mono 10px, `color:#faf9f6`, `background:rgba(18,17,16,.55)`, `padding:3px 6px`, `border-radius:4px`, text e.g. `38 photos · 2 videos`.
- Body: column `gap:6px; min-width:0`. Meta line `{date} · {type}` (mono 11px, `.08em`, `var(--fg3)`); title (serif, `line-height:1.08`); excerpt (14px, `var(--fg2)`, `line-height:1.5`); footer `margin-top:auto`, 12px `var(--fg3)`, flex `gap:10px`: 12px pin icon + `{loc}`, then `{by}`.

Seed data (MEM): 1 "Tuesday tacos, again" (Sep 1, Home, Everyday, her, compact, "3 photos"); 2 "The night the power went out" (Aug 29, Home, Everyday, Casey, medium, "9 photos · 1 video"); 3 "Three days in Asheville" (Aug 14–17, Asheville NC, Trip, Casey, large, "38 photos · 2 videos"); 4 "Two years" (Jul 12, Nonna's, Milestone, her, medium, "12 photos"); 5 "Rooftop movie" (Jul 3, Downtown, Date night, Casey, compact, "1 photo").

---

## 3. Memory detail (`isDetail`)

Mobile equivalent: full-screen detail with hero, single column, gallery inline. Desktop: hero band, then a two-column reading layout — 680px body measure on the left, sticky media panel on the right. Sidebar remains visible.

**Hero** – `height:440px; position:relative`; image full-bleed cover with sepia filter; overlay `linear-gradient(to bottom, rgba(0,0,0,.35), transparent 35%)`.
- Back button `position:absolute; top:24px; left:48px`: `height:36px; padding:0 12px 0 8px; border-radius:8px; background:rgba(18,17,16,.5); color:#faf9f6; font-size:13px`, 16px chevron-left + `Memories`. Goes to timeline.
- Actions `top:24px; right:48px`, `gap:8px`: `Edit` and `Add to album`, same pill style with `padding:0 14px`.

**Body grid** – `max-width:1120px; margin:0 auto; padding:40px 48px 80px; display:grid; grid-template-columns:680px 1fr; gap:64px`.

Left column (680px — the max measure for body text):
- Type eyebrow (mono 11px, `.14em`, uppercase, accent).
- Title serif 56px `line-height:1`, `margin-top:10px`.
- Meta row `margin-top:16px`, 14px `var(--fg2)`, `gap:14px`, `·` separators: `{date}` (mono 12px) · `{loc}` · `{by} · added 3 days ago`.
- Section rule "Casey's take": `margin-top:40px`, baseline flex `gap:12px`; label serif italic 26px; then a `flex:1` hairline `border-top:1px solid var(--border)`.
- Paragraph `take1a`: `margin:18px 0 0; font-size:17px; line-height:1.65`.
- Pull quote: `margin:24px 0; padding-left:20px; border-left:1px solid var(--accent)`, serif 28px, `line-height:1.25`.
- Paragraph `take1b`, same paragraph style, `margin:0`.
- Inline image: `width:100%; height:380px; object-fit:cover; border-radius:8px; margin-top:24px`; caption below mono 12px `var(--fg3)`, `margin-top:8px`.
- Second rule "{her}'s take" at `margin-top:48px`; paragraph `take2`.
- Reactions row `margin-top:36px`, `gap:8px`: four chips `loved it` (2), `made me laugh` (1), `miss this` (0), `again please` (0). Chip: `height:34px; padding:0 12px; border-radius:4px`, serif italic 14px, `color:var(--fg1)`, count in mono 11px `var(--fg3)` non-italic. Selected: `background:var(--accent-soft); border:1px solid var(--accent)`, count +1. Only one reaction selected at a time; clicking it again clears.
- Comments: `margin-top:28px; padding-top:24px; border-top:1px solid var(--border)`, column `gap:16px`. Comment row: 28px round initial badge (her: `background:var(--green-soft); color:var(--green)`; Casey `C`: `var(--accent-soft)`/`var(--accent)`; mono 10px) + text 15px + byline mono 11px `var(--fg3)` `margin-top:3px`. Seed: `You left out the part where you fell in the creek.` ({her} · Aug 18); `Artistic license.` (Casey · Aug 18). Input placeholder `Say something…`: `height:44px; border-radius:8px; border:1px solid var(--border); background:var(--surface); padding:0 14px; font-size:14px`.

Right column (media panel): `position:sticky; top:24px; align-self:start`, column `gap:8px`.
- Header row mono 11px `.14em` uppercase `var(--fg3)`, `padding-bottom:8px`: `Media` left, `{count}` right.
- Grid `grid-template-columns:1fr 1fr; gap:6px`; tiles `aspect-ratio:1; border-radius:6px; overflow:hidden`, first tile spans 2 columns and is a video with a `▶ 0:42` badge (mono 10px, `#faf9f6`, `rgba(18,17,16,.6)`, `padding:2px 6px`, `border-radius:4px`, bottom-right 8px). Seven tiles total.
- Hint below: 12px `var(--fg3)`, `Click any tile to open the lightbox`.

Detail copy for id 3 (Asheville) and a `default` set for the others is in the DC script (DETAIL); use it verbatim.

---

## 4. Composer (`isComposer`)

Mobile equivalent: full-screen composer with a media strip. Desktop: sticky top bar with privacy toggle + Publish, then a two-column editor: writing column (`1fr`, body text capped at 680px) and a 400px sticky media tray.

**Top bar** – `position:sticky; top:0; z-index:3; padding:20px 48px; border-bottom:1px solid var(--border); background:var(--bg)`, flex `space-between`.
- Left `gap:16px`: `← Back` button (`height:36px; padding:0 12px; border-radius:8px; border:1px solid var(--border); background:transparent; font-size:13px`, goes to timeline) and `Draft · Saved just now` (mono 12px `var(--fg3)`).
- Right `gap:20px`: privacy toggle row `Keep private to me until I publish` (14px `var(--fg2)`) with a 40x24 pill switch (`border-radius:999px`, bg `var(--accent)` when on else `var(--surface-2)`, 18px knob `#faf9f6` at `left:19px` on / `3px` off, 150ms transitions; default on). `Publish` button `height:36px; padding:0 16px; border-radius:8px; background:var(--accent); color:#faf9f6; font-size:14px; font-weight:500`.

**Editor grid** – `display:grid; grid-template-columns:1fr 400px; gap:48px; padding:40px 48px 80px; max-width:1200px; margin:0 auto`.

Left column (column `gap:20px`):
- Title input: value `A weekend at the lake`, placeholder `Give it a title`, `height:64px; border:none; border-bottom:1px solid var(--border); background:transparent; border-radius:0; padding:0; width:100%`, serif 48px, `color:var(--fg1)`.
- Chip row `gap:8px; flex-wrap:wrap`, chips `height:34px; padding:0 12px; border-radius:4px; font-size:13px`:
  - static: calendar icon + `Sep 4 – 6, 2026`; pin icon + `Lake Lure, NC` (both `border:1px solid var(--border)`, `color:var(--fg1)`).
  - type chips `Trip`, `Date night`, `Everyday`, `Milestone` (selected: `background:var(--accent-soft); border:1px solid var(--accent)`; default selected `Trip`).
  - `+ tag` dashed chip (`border:1px dashed var(--border)`, `color:var(--fg3)`).
- Toolbar: `display:flex; gap:2px; padding:6px; border-radius:8px; background:var(--surface); border:1px solid var(--border); width:fit-content; font-size:13px; color:var(--fg2)`. Items are 30px tall, `min-width:30px`, `padding:0 10px`, `border-radius:4px`: `H` (serif, 500), `B` (600), `I` (italic), `• list`, `1. list`, `“ quote` (serif italic), `+ photo`.
- Body: `font-size:17px; line-height:1.7; max-width:680px`, column `gap:18px`. Seed blocks in order: heading `Friday, late` (serif 28px, `line-height:1.2`); paragraph `We got there after dark, which was the plan, but the cabin key was not where the email said it would be. Twenty minutes with phone flashlights. It was under the **third** rock, not the second. Of course it was.`; blockquote `The lake was just a sound until morning.` (`padding-left:20px; border-left:1px solid var(--accent)`, serif 26px, `line-height:1.3`); inline image block (`border-radius:8px; overflow:hidden; border:1px solid var(--accent)`, image `height:300px`, caption input overlaid at the bottom `height:40px; background:rgba(18,17,16,.7); color:#faf9f6; font-size:13px; font-family:var(--font-mono); padding:0 14px`, value `First light from the dock. Cold.`); bullet list `Coffee from the gas station, somehow great` / `{her} swam. I supervised.` / `Zero photos of the trout because there was no trout` (`padding-left:22px`, `gap:6px`); placeholder line `Keep writing…` (`color:var(--fg3)`).

Right column (media tray): `position:sticky; top:100px; align-self:start`, column `gap:14px`.
- Header: `Media · 7` (mono 11px, `.14em`, uppercase, `var(--fg3)`) and `Drag to reorder` (12px `var(--fg3)`).
- Drop zone: `border:1px dashed var(--border); border-radius:8px; padding:24px; text-align:center; background:var(--surface); color:var(--fg2); font-size:14px` — `Drop photos or videos here` then `or click to browse` (12px `var(--fg3)`, `margin-top:4px`).
- Tile grid `repeat(3,1fr); gap:8px`; tiles `aspect-ratio:1; border-radius:6px; overflow:hidden; border:1px solid {border}; cursor:grab`. Seven tiles: tile 0 is the cover (`border:var(--accent)`, `Cover` badge top-left 6px: mono 9px, `.1em`, uppercase, `#faf9f6` on `var(--accent)`, `padding:3px 6px`, `border-radius:3px`, caption `First light from the dock. Cold.`); tile 2 has caption `Gas-station coffee, great`; tile 5 is uploading (`opacity:.6`, 3px progress track `rgba(18,17,16,.5)` with accent fill at `62%`, centered mono 11px `62%` label). Captions render as a bottom strip `padding:4px 6px; font-size:10px; color:#faf9f6; background:rgba(18,17,16,.6)`, single line ellipsis.
- Footnote 12px `var(--fg3)` `line-height:1.5`: `Hover a tile: set cover, caption, remove. Drag a tile into the text to insert it inline.`

---

## 5. Chat (`isChat`)

Mobile equivalent: full-screen thread with a header and keyboard-attached composer. Desktop: **two-pane** layout — thread (`1fr`) plus a 340px side panel with pinned messages and chat media. Fills the main pane height (prototype: `height:960px`; app: full viewport height, no page scroll).

Grid: `grid-template-columns:1fr 340px`.

**Thread pane** – column, `border-right:1px solid var(--border)`, `min-width:0`.
- Header `padding:20px 32px; border-bottom:1px solid var(--border)`, flex `space-between`: 40px round avatar (sepia .2 / saturate .6), name `{her}` serif 26px `line-height:1`, status `Active now` 12px `var(--green)` `margin-top:2px`. Right: search field `height:36px; padding:0 12px; width:240px; border:1px solid var(--border); border-radius:6px; color:var(--fg3); font-size:13px`, magnifier + `Search this conversation`.
- Message list `flex:1; overflow:auto; padding:24px 32px`, column `gap:12px`. Day separators centered mono 11px `.1em` uppercase `var(--fg3)` (`Yesterday`, then `Today` with `margin-top:12px`). One yesterday bubble on the left: `Gate code is 4471, garage is the birthday`.
- Message group: column, `align-self` flex-start (her) / flex-end (me), `max-width:60%`, `gap:4px`, `align-items` matching side. Meta line under each: mono 10px `var(--fg3)` `padding:0 4px` (`9:38 PM`, `Seen 9:42 PM`, `Delivered`).
- Bubble kinds (all `border-radius:12px`):
  - text: `padding:10px 14px; border:1px solid var(--border); font-size:15px; line-height:1.45`; bg `var(--surface)` for her, `var(--surface-2)` for me.
  - photo: 320x240 cover image, `Save to memories` button bottom-right 10px (`height:28px; padding:0 10px; border-radius:6px; background:rgba(18,17,16,.65); color:#faf9f6; font-size:12px`).
  - photos (4-up): `grid 1fr 1fr; gap:3px; width:320px`, each `aspect-ratio:4/3`.
  - voice: `width:300px; padding:10px 14px`, bordered bubble; 28px play circle (`background:var(--fg1); color:var(--bg)`), 30-bar waveform (`height:24px; gap:2px`, bar heights from WAVE, first 12 bars `var(--fg1)`, rest `var(--fg3)`), duration mono 11px `var(--fg2)` (`0:42`).
  - memory card: `width:320px; grid 120px 1fr; border:1px solid var(--border); background:var(--surface)`; image left, right `padding:12px 14px`: eyebrow `Memory` (mono 10px accent), title serif 20px, sub 12px `var(--fg3)`. Click opens that memory's detail.
  - plan item card: `width:320px; border:1px solid var(--border); border-left:2px solid var(--accent); background:var(--surface); padding:12px 14px`; eyebrow `Plan item · {kind}`, title serif 20px, sub 12px, then two 28px outline buttons `Open in plan` and `Put it on a day` (`border-radius:6px; font-size:12px`). Click goes to plan.
  - link: `width:320px`, url line `padding:10px 14px; color:var(--accent)`, then `border-top` preview row with a 40px `var(--surface-2)` square, title 14px 500, domain 12px `var(--fg3)`.
- Seed thread (in order): her text `Did you see the sky on your way home` 9:38 PM; me photo 9:40 PM; her 4 photos 9:40 PM; me voice 0:42 9:41 PM; her memory `Three days in Asheville` / `Aug 14–17 · 38 photos` 9:41 PM; her link `resy.com/nonnas` / `Nonna’s — Reserve a table` / `resy.com` 9:42 PM; me text `Booked for Friday. 7.` `Seen 9:42 PM`; her plan item activity `Fushimi Inari at sunrise` / `Japan, spring 2027 · unscheduled` 9:44 PM; then any sent messages.
- Typing indicator (after sending, 2.5s): left bubble, serif italic 14px `var(--fg3)`, `{her} is typing…`.
- Composer bar `padding:16px 32px 24px; border-top:1px solid var(--border)`, flex `gap:10px`: 40px camera icon button (`var(--fg2)`), input `flex:1; height:44px; border-radius:8px; border:1px solid var(--border); background:var(--surface); padding:0 14px; font-size:15px`, placeholder `Message {her}`; `Send` button `height:44px; padding:0 16px; border-radius:8px; font-size:14px; font-weight:500` — enabled look `background:var(--accent); color:#faf9f6` when the draft is non-empty, otherwise `background:var(--surface-2); color:var(--fg3)`. Enter sends; empty drafts are ignored.

**Side panel (340px)** – `padding:24px; background:var(--surface); overflow:auto`, column `gap:28px`.
- `Pinned · 2` eyebrow (mono 11px, `.14em`, uppercase, `var(--fg3)`, `margin-bottom:12px`). Two cards `padding:12px 14px; border-radius:8px; background:var(--bg); border:1px solid var(--border); font-size:14px; line-height:1.45`, byline mono 10px `var(--fg3)` `margin-top:6px`: `Gate code is 4471, garage is the birthday` ({her} · Aug 3); `Vet: Dr. Okafor, (828) 555-0142` (Casey · Jun 19).
- `Media in this chat` eyebrow with `All →` link (12px) on the right; grid `repeat(3,1fr); gap:4px` of 9 square thumbs (`border-radius:4px`).

---

## 6. Calendar (`isCalendar`)

Mobile equivalent: month grid with an agenda list beneath. Desktop: full-height page (`padding:40px 48px 48px`, column `gap:24px`, prototype `height:960px`) with a large month title, quick-add field, Month/Week segmented toggle, and either a 7-column month grid or a timed week view. A legend row sits at the bottom.

**Header** – flex `space-between`, `align-items:flex-end`.
- Left: eyebrow `2026` (mono 11px, `.14em`, uppercase, `var(--fg3)`) over `September` serif 56px `line-height:1`; then prev/next buttons `‹` `›` 32x32, `border-radius:6px; border:1px solid var(--border); background:transparent; color:var(--fg2)`, `padding-bottom:6px` alignment.
- Right (`gap:16px`): quick-add field `height:40px; padding:0 14px; width:320px; border-radius:8px; border:1px solid var(--border); background:var(--surface); color:var(--fg3); font-size:14px`, 16px plus icon + placeholder `Dinner at Nonna's Fri 7pm`. Segmented control `padding:2px; border-radius:6px; background:var(--surface-2); font-size:13px; gap:2px`, buttons `Month` / `Week` `height:32px; padding:0 14px; border-radius:4px`, active bg `var(--bg)`, inactive transparent. Default `month`.

**Month view** (`isMonth`):
- Weekday header `repeat(7,1fr)`, mono 10px, `.14em`, uppercase, `var(--fg3)`, `padding-bottom:8px; border-bottom:1px solid var(--border)`: Mon … Sun (Monday-first).
- Grid `flex:1; repeat(7,1fr); grid-auto-rows:1fr; border-left/top:1px solid var(--border)`; 35 cells (1 leading blank, 30 September days, 4 trailing October days in `var(--fg3)`). Cell: `border-right/bottom:1px solid var(--border); padding:8px`, column `gap:4px`, `min-height:0`. Day number in a 26px circle mono 12px; today (Sep 6) is `color:#faf9f6; background:var(--accent)`.
- Event chip: 12px, `padding:3px 6px; border-radius:4px`, 6px dot + title, single-line ellipsis; bg/dot by owner: Casey (`c`) accent-soft / accent; her (`h`) green-soft / green; both (`b`) `var(--surface-2)` / `var(--fg1)`.
- Events (EV): 2 Farmers market (b, 9:00, 1.5h); 7 Yoga (h, 7:00, 1h); 8 Dentist (c, 14:30, 1h); 9 Standup (c, 10:00, .5h); 10 Book club (h, 19:00, 2h); 11 Dinner at Nonna’s (b, 19:00, 2h); 12 Lake day (b, all day); 19 & 20 Casey’s parents visit (b, all day); 25 Pay the car (c, 9:00, .5h).

**Week view** (`isWeek`): week of Sep 7–13.
- Outer grid `56px repeat(7,1fr)`, `border-top:1px solid var(--border)`, `flex:1; min-height:0; overflow:hidden`. Column headers `padding:10px 8px; border-left:1px solid var(--border)`: dow mono 10px `.14em` uppercase `var(--fg3)` over the day number serif 24px.
- Body spans all columns, same 8-column grid, `position:relative; height:100%; overflow:hidden`. Hour rail: 13 rows from 7:00 AM to 7:00 PM, each `height:56px`, mono 10px `var(--fg3)`, right aligned, `border-top` hairline. Day columns: `border-left`, hour lines via `repeating-linear-gradient(to bottom, var(--border) 0 1px, transparent 1px 56px)`.
- Timed event block: absolute `left:4px; right:4px; top:(start-7)*56px; height:max(28px, len*56 - 4px)`, `border-radius:6px; background:{bg}; border-left:1px solid {dot}; padding:6px 8px; font-size:12px; line-height:1.3`; title 500 weight, time range mono 10px `var(--fg2)` (e.g. `7:00 PM – 9:00 PM`). All-day events are not drawn in week view.

**Legend** (bottom): mono 12px `var(--fg3)`, `gap:20px`; 8px dots: accent `Casey`, green `{her}`, `var(--fg1)` `Both`.

---

## 7. Plan detail (`isPlan`)

Mobile equivalent: a plan opens on an Overview with a segmented row and the itinerary is a single scrolling list with items expanding in place. Desktop: the sidebar "Plans" nav and the "Next trip" card both land directly on the Japan plan; the page is a full-height column (`height:960px` in the prototype): cover band (200px) -> tab strip -> tab body (`flex:1`, scrolls internally). Default tab is **Itinerary**.

**Cover band** – `height:200px; position:relative; flex:none`; cover image with sepia filter; overlay `linear-gradient(to bottom, rgba(0,0,0,.25), rgba(18,17,16,.75))`. Content pinned `left:40px; right:40px; bottom:20px`, `color:#faf9f6`, flex `space-between`, `align-items:flex-end`.
- Left: status pill `{plan.status}` (mono 10px `.12em` uppercase, `border:1px solid rgba(250,249,246,.5)`, `padding:3px 7px`, `border-radius:4px`) + `{plan.countdown}` (mono 12px); name `{plan.name}` serif 48px `line-height:1; margin-top:8px`; meta row 13px `#a8a49a` `gap:14px; margin-top:8px`: `{plan.dates}` (mono) and `Tokyo · Kyoto · Osaka`.
- Right: `Available offline · saved 2h ago` (12px `#a8a49a`), a 36x22 accent toggle (on), and a 36x36 `···` button (`border-radius:8px; background:rgba(250,249,246,.15); color:#faf9f6; margin-left:8px`).

**Tab strip** – `padding:0 40px; gap:4px; border-bottom:1px solid var(--border)`. Tabs (dSegs): `Overview`, `Itinerary`, `Ideas`, `Bookings`, `Checklists`, `Budget`, `Documents`, `Map`, `Locked note`. Button `height:44px; padding:0 14px; font-size:14px; font-weight:500; margin-bottom:-1px; border-bottom:2px solid {edge}`; active edge `var(--accent)` + `color:var(--fg1)`, inactive transparent + `var(--fg2)`.

### 7.1 Itinerary tab — three columns (default)

Grid: `grid-template-columns:380px 1fr 320px; flex:1; min-height:0`. Each column scrolls independently (`overflow:auto`).

**Column A — Days (380px)**: `border-right:1px solid var(--border); padding:20px 24px; background:var(--surface)`, column `gap:20px`.
- Unscheduled box at top: `border:1px dashed var(--border); border-radius:8px; padding:10px 12px`, column `gap:6px`; eyebrow `Unscheduled · {n}` (mono 10px `.14em` uppercase `var(--fg3)`); rows 13px with a kind tag (mono 9px `.1em` uppercase `var(--fg3)`, `border:1px solid var(--border)`, `padding:2px 5px`, `border-radius:3px`) and an ellipsized title. Data: activity `Fushimi Inari at sunrise`; food `Nishiki market breakfast`.
- Day block (one per DAYS entry), column `gap:8px`. Header baseline row `gap:8px`: `Day {n}` serif 26px `line-height:1`; `{dow} {date}` mono 11px `var(--fg2)`; spacer; `{city}` 12px `var(--fg3)` right-aligned.
- Item row: `grid-template-columns:60px 1fr; gap:10px; padding:10px 12px; border-radius:8px; border:1px solid {border}; background:{bg}`, clickable. Left cell: time mono 11px nowrap, kind mono 9px `.1em` uppercase `var(--fg3)` `margin-top:4px`. Right cell (`min-width:0`): title 14px 500 ellipsized, place 12px `var(--fg2)` `margin-top:2px`.
  - Selected item (`sel === '{dayIdx}-{itemIdx}'`, default `'0-0'`): `border:var(--accent); background:var(--accent-soft)`. Unselected: `border:var(--border); background:var(--bg)`.
- Empty day: `padding:10px 12px; border-radius:8px; border:1px dashed var(--border)`, serif italic 15px `var(--fg3)`, `Nothing yet. Drop an idea here.` (Day 3 in the data).
- Days data (plans-data.js DAYS): Day 1 Thu Apr 8 Tokyo — `12:55 PM` flight `JL 5 · JFK → HND` (Terminal 1, gate B22, $1,840, conf Q7XR4M, 2 docs, Casey); `5:10 PM +1` transport `Monorail to Hamamatsucho` (Haneda Airport, ¥500, 0 docs, her); `6:30 PM` stay `Check in · Hotel Niwa` (Chiyoda, Tokyo, $620, conf NW-88213, 1 doc, Casey); `8:00 PM` food `Ichiran ramen` (Shibuya, ¥2,400, 0 docs, her). Day 2 Fri Apr 9 Tokyo — `5:30 PM` ticket `teamLab Planets` (Toyosu, $56, conf TLP-40912, 1 doc, Casey). Day 3 Sat Apr 10 Tokyo — empty.

**Column B — Selected item detail (1fr)**: `padding:32px 40px`, column `gap:24px`.
- Header: eyebrow `{kind} · Day {dayN} · {date}` (mono 11px `.14em` uppercase `var(--fg3)`); title `{title}` serif 40px `line-height:1.05; margin-top:10px`; `{place}` 15px `var(--fg2)` `margin-top:8px`.
- Stat cards `repeat(3,1fr); gap:12px`, each `padding:14px 16px; border-radius:8px; border:1px solid var(--border); background:var(--surface)`: label mono 9px `.14em` uppercase `var(--fg3)`, value mono 18px `margin-top:6px`. `Time` = `{time}`; `Cost` = `{cost}`; `Confirmation` = `{conf}` or `—` when unbooked (value gets `letter-spacing:.12em`).
- Action row `gap:8px`, outline buttons `height:36px; padding:0 14px; border-radius:8px; border:1px solid var(--border); background:transparent; font-size:13px`: `Open in Maps`, `Share to chat`, `Edit`.
- Attachments: eyebrow `Attachments · {docs}` (`margin-bottom:10px`); row `gap:10px` of 72x96 thumbnails (`border-radius:4px; background:var(--surface); border:1px solid var(--border)`, bottom-centered mono 9px `PDF`), one per doc, then a dashed `+` tile (`border:1px dashed var(--border)`, `font-size:20px`, `var(--fg3)`).
- Notes: eyebrow `Notes` (`margin-bottom:10px`); body 15px `line-height:1.6` `var(--fg1)` `max-width:560px`; footer `Added by {by}` 12px `var(--fg3)` `margin-top:8px`. Per-item NOTES text, keyed by title (fallback `No notes yet.`):

  | item title | note |
  |---|---|
  | JL 5 · JFK → HND | Premium economy, the one splurge. Check in opens 24h before — set a reminder. Terminal 1, not 4. |
  | Ichiran ramen | The Shibuya one has a shorter line after 9. Order at the machine, tick the extra garlic box. |
  | Check in · Hotel Niwa | Ask for a high floor. Luggage forwarding to Kyoto from the front desk, ¥2,000 a bag. |
  | teamLab Planets | Wear shorts or roll your trousers — you walk through water. Tickets are timed, arrive 15 min early. |
  | Monorail to Hamamatsucho | Suica works. About 20 minutes. |

**Column C — Ideas tray (320px)**: `border-left:1px solid var(--border); padding:20px; background:var(--surface)`, column `gap:12px`.
- Header: `Ideas · drag onto a day` eyebrow (mono 11px `.14em` uppercase `var(--fg3)`) with `+ Add` link (12px) right.
- Idea card (draggable, `cursor:grab`, `data-tray`): `padding:8px; border-radius:8px; border:1px solid var(--border); background:var(--bg)`, flex `gap:10px`; 56px square image `border-radius:6px`; text column `gap:3px`: title 13px 500 `line-height:1.3`, `{city} · {by}` 11px `var(--fg3)`, bottom row `margin-top:auto` with two 18px vote badges (`C{vote}` accent-soft/accent, `{herIni}{vote}` green-soft/green, mono 8px; vote glyphs like `↑`, meh `~`, no `✕`) and the status word (mono 8px `.1em` uppercase; decided `var(--green)`, shortlisted `var(--accent)`, else `var(--fg3)`).
- Interaction: dragging a card onto a day in column A schedules it there (prototype only marks the cards draggable; implement drop -> append to that day's items, remove from tray).

### 7.2 Other tabs (desktop bodies)

All tab bodies are `flex:1; overflow:auto; padding:24px 40px` unless noted, with the sidebar and cover band unchanged.

- **Overview** – `padding:32px 40px`, grid `1fr 1fr 1fr; gap:20px; align-content:start`. Row 1: countdown spanning 2 columns (`214` serif 96px + `days until we land in Tokyo` 18px `var(--fg2)`) and the blurred **Locked note** teaser card (`blur(5px)` mono 12px lines, centered lock icon + `Locked note`, click -> Locked note tab). Row 2: `Next up · flight` card (`JL 5 · JFK → HND` serif 28px, `Thu Apr 8 · 12:55 PM · Terminal 1`, `Q7XR4M` mono 18px `.12em`); `Key bookings` card (Flights `2 booked`, Stays `2 of 3`, Transport `JR Pass · seats at station`; click -> Bookings); `Budget` card (paid `$3,860`, committed `$5,120`, planned `$9,400`, 6px bar with accent-soft 54% + accent 41%; click -> Budget). Row 3: three checklist rings spanning 2 columns (48px conic-gradient ring, `done/total`, list name; click -> Checklists) and `Newest ideas` card (`All 12 →`, first 3 ideas with 36px thumbs; click -> Ideas).
- **Ideas** – filter chips `All`, `Tokyo`, `Kyoto`, `Osaka`, `Shortlisted`, `Decided` (30px, radius 4, selected fg1/bg inverted) with a 320px dashed `Paste a link to add an idea…` field on the right; grid `repeat(4,1fr); gap:14px` of idea cards (130px image, title 14px 500, `{city} · added by {by}`, 22px vote badges, bordered status tag).
- **Bookings** – grid `1fr 1fr; gap:16px`; each group has an eyebrow (`b.group`) and a card `padding:18px 20px` (title 16px 500 + sub 12px; route layout with serif 38px airport/city codes and `→`; stay layout with address and two date cells; ticket layout `{dep} · {a}`; seats line; footer `Confirmation` mono 9px eyebrow + mono 20px `.14em` code, 28x36 doc thumbs, `Open in Maps` 32px outline button).
- **Checklists** – grid `repeat(3,1fr); gap:24px`; each list: name serif 24px + `done / total` mono 11px, 3px progress bar, rows (20px checkbox radius 4, accent fill when done, strikethrough `var(--fg3)` text, due mono 11px, 20px who badge C/her), `+ Add` footer. Toggling is local state.
- **Budget** – grid `1fr 380px; gap:32px`. Left: three total cards (`Planned`, `Committed`, `Paid`: serif 34px USD + mono 12px JPY) and category rows (`120px 1fr auto`, 4px accent bar, mono 13px value). Right: rate card `1 USD = 148.2 JPY`, `set by you on Sep 6 · use today's rate`.
- **Documents** – grid `repeat(6,1fr); gap:16px`; 3:4 placeholder pages with a page-count badge, name 13px ellipsized, `of` 11px.
- **Map** – grid `1fr 320px`, no padding. Left: placeholder Tokyo tiles (64px grid lines at .5 opacity, two rotated `var(--surface-2)` bands, caption `Tokyo · muted tiles · placeholder`) with 6 teardrop pins (`border-radius:999px 999px 999px 0`, 16px, 24px when selected; colors by kind: food accent, activity green, stay plum, ticket ochre, transport fg2). Right rail `border-left`, `padding:20px`: `Pins · Tokyo` eyebrow and a row per pin (title 14px, `{kind} · {place} · {when}` 11px); selected row bg `var(--surface)`. Pin click toggles selection.
- **Locked note** – `padding:40px; max-width:640px`. Card `padding:24px` with mono 14px `line-height:1.9` lines (`Casey · passport 5X8 221 904 · exp Mar 2031`, `{her} · passport 7K1 088 435 · exp Nov 2029`, `US Embassy Tokyo · +81 3-3224-5000`, `Travel insurance · Allianz · pol. 88-2140-77`) blurred `6px` with a centered `Click to reveal` overlay; click toggles blur to 0 and hides the overlay. Footnote 12px `var(--fg3)`: `Hidden from offline copies and exports. Re-locks after 60 seconds.`

---

## 8. Notes / Us placeholder (`isOther`)

Desktop layout not designed this round. Render a centered full-height column (`height:960px` in prototype; viewport height in app), `gap:12px`, `color:var(--fg3)`: title (`Notes` or `Us`) serif 40px `var(--fg1)`, then 14px `Desktop layout not in this round — see the mobile prototype.` At `>= md` this placeholder replaces the mobile screens for those two routes; below `md` the mobile screens render as designed.

---

## 9. Mobile vs desktop summary

| Screen | Mobile (< md) | Desktop (>= md) |
|---|---|---|
| Shell | bottom tab bar, per-screen top bar, floating "+" | 240px sidebar with New button, nav, Upcoming widget, couple footer; no tab bar |
| Memories | single column feed | 56px title + chips + search; On this day strip; sticky year gutter (120px) + 6-column card grid with span 6/3/2 sizes |
| Detail | one column, hero, inline gallery | 440px hero; 680px reading column + sticky 2-col media panel (`680px 1fr`, gap 64) |
| Composer | full-screen sheet, media strip | sticky bar with privacy toggle + Publish; `1fr 400px` editor + sticky media tray; body max 680px |
| Chat | single thread | `1fr 340px` two-pane: thread with 60% bubbles + pinned/media panel |
| Calendar | month grid + agenda | full-height month grid (7 cols, 1fr rows) or 56px-per-hour week view; quick-add + Month/Week toggle |
| Plans | plan list -> plan overview -> per-section screens | Plans nav opens the plan directly on Itinerary: `380px 1fr 320px` days / item detail / ideas tray; other sections as tabs under a 200px cover band |
| Notes, Us | designed | placeholder |

Hard sizing to keep: sidebar 240; chat panel 340; composer tray 400; detail body 680 / gap 64; itinerary rails 380 / 320; calendar hour row 56; week rail 56; page paddings `40px 48px` (memories, detail, composer, calendar) vs `0 40px` / `24px 40px` (plan tabs); content max-widths 1120 (memories, detail) and 1200 (composer).
