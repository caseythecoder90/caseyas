# frontend/src

The Ours SPA foundation. Everything here mirrors `design/spec/*.md`; the design canvases
are the visual truth, `renderVals()` in them is the interaction truth.

## Structure

```
src/
  main.tsx            React root, QueryClient, BrowserRouter; applies the stored theme before first paint
  App.tsx             ThemeProvider + ToastProvider + the /api/me gate + <Shell><AppRoutes/></Shell>
  routes.tsx          the route table (one feature entry file per route) + re-exports of paths.ts
  paths.ts            path builders (paths.memory(id), paths.plan(id, seg), ...), tabFor(pathname), seg param mapping
  session.tsx         useMe() (/api/me query), SessionProvider/useSession(), SignOutForm/SignOutButton (real POST /logout)
  theme.tsx           ThemeProvider/useTheme(): light | dark | system, localStorage 'ours.theme', data-theme on <html>
  people.ts           HER = 'Yasmim', ME_FALLBACK = 'Casey', initial()/initials()/initialFor(), AVATAR_SEED
  api.ts              unchanged: fetch wrapper, 401 -> redirect to Keycloak
  index.css           Tailwind v4 + self-hosted fonts + tokens + prototype classes + shell layout + motion
  shell/              Shell (frame), Sidebar (>= md), TabBar (< md), SessionExpired (identity screen 8)
  ui/                 primitives (see below) and tokens.ts (runtime color helpers)
  data/
    types.ts          every data shape (mock-data.md section 20 + shell additions)
    mockImage.ts      mockImage(seed, w, h) -> deterministic data: SVG (warm gradient + grain); never a network image
    dates.ts          pure date helpers, Japan/Lake/Anniversary constants, SIM_OPTIONS, countdown(), japanCountdown()
    store.ts          tiny useSyncExternalStore store for session state (reactions, favs, sent messages, notes, ticks, prefs, simDate, designPreview)
    hooks.ts          the typed accessors screens use (below)
    mock/             every dataset transcribed from mock-data.md with the real-project corrections
  features/
    memories/  TimelinePage, MemoryDetailPage, GalleryPage, ComposerPage
    plans/     PlansListPage, PlanDetailPage, TodayPage; ItemSheet (item detail: edit / move / delete / maps / comments),
               ItemForm (create + edit for every kind), AddItemSheets (kind picker, paste), PlanEditSheet (edit / delete plan), maps.ts
    calendar/  CalendarPage
    chat/      ChatPage, NotesPage
    us/        UsPage
    shared/    StubScreen, NotYetScreen, PreviewBanner, milestones (copy) + README; components two features share go here
```

Rule: **features own their directory; shared changes go through `ui/` or `data/`.** A screen
agent replaces the contents of its feature entry file(s) and adds files inside its feature
directory. It does not edit `App.tsx`, `routes.tsx`, `index.css`, `ui/`, or `data/` (ask the
foundation owner, or add a file under `features/shared/`).

## Responsive shell

`< md` (768px): `.ours-shell` is a 100dvh column, `<main class="ours-main">` scrolls
(`padding-top: env(safe-area-inset-top)`), the `.tabbar` sits absolute at the bottom (88px,
blurred paper). Screens reserve `padding-bottom: 110px` on their last block, and anything a
screen positions absolutely (the FAB at `right:20px; bottom:104px`) positions against
`.ours-shell`, exactly like the phone root in the prototype.

`>= md`: `.ours-shell` becomes `grid-template-columns: 240px 1fr`, the `.sidebar` shows,
the tab bar hides, `main` is the scroll container (`position: relative; overflow: auto`).
Full-height desktop screens (chat, calendar, plan) should set `flex: 1; min-height: 0` on
their root (main is a flex column) instead of a fixed height.

Routes (`routes.tsx`): `/`, `/memories/:id`, `/gallery`, `/compose` (`?from=<planId>`),
`/plans`, `/plans/:id` (`?seg=overview|itinerary|ideas|bookings|checklists|budget|documents|map|locked`,
map to `PlanSeg` with `segFromParam` / `paramFromSeg`), `/plans/:id/today`, `/calendar`,
`/chat`, `/notes` (on mobile the Chat tab's second segment), `/us`. `/session-expired`
renders the interstitial outside the shell. `tabFor(pathname)` says which tab is active.

Sidebar decisions worth knowing: Plans nav goes to `/plans`; the Next trip card goes to
`/plans/japan`; the New menu goes to `/compose`, `/plans?new=1`, `/plans/japan?seg=ideas`,
`/calendar?new=1` (pages may read those query params to open their sheets).

## Tokens and utilities (index.css)

CSS custom properties on `:root` (light), `[data-theme="dark"]`, and a
`prefers-color-scheme: dark` block guarded as `:root:not([data-theme="light"])`:
`--bg --surface --surface-2 --fg1 --fg2 --fg3 --border --accent --accent-soft --green
--green-soft --plum --ochre --plum-soft --ochre-soft --danger --n1..--n4 --font-serif
--font-sans --font-mono --shadow-md`, plus motion `--ease --dur-press(120ms)
--dur-sheet(200ms) --dur-screen(400ms)` and the literals `--paper (#faf9f6) --ink (#121110)
--scrim`. Use `var(--x)` in inline styles or the Tailwind utilities:

- colors: `bg-bg bg-surface bg-surface-2 text-fg1 text-fg2 text-fg3 border-border bg-accent
  bg-accent-soft text-green bg-green-soft text-plum text-ochre text-danger bg-n1..bg-n4
  text-paper bg-ink` (any color utility works with these names)
- fonts: `font-serif font-sans font-mono`; shadow: `shadow-md`
- breakpoint: `md:` = 768px

Fonts are self-hosted from `@fontsource-variable/*` (family names `'Newsreader Variable'`,
`'Inter Tight Variable'`, `'JetBrains Mono Variable'`). Only Newsreader ships as the display
serif; the design's alternates are not included and `data-font` is fixed to `newsreader`.

Prototype classes (in `@layer components`, so Tailwind utilities override them):
`.ours .sec .sw .btn .btn-primary .btn-secondary .btn-quiet .btn-destructive .btn-ink
.btn-over-photo .btn-dense .btn-dense-lg .btn-sheet .chip .chip-md .chip-selected
.chip-accent .chip-add .kind .kind-planning .kind-booked .kind-decided .kind-shortlisted
.kind-card .kind-header .card .note .eyebrow .eyebrow-sm .h .idp .fld .btn2 .lbl .photo
.avatar-photo .blur-paper .blur-paper-15 .hide-scrollbar .spin`. There is no `.scr` class in
any design file; mobile screens are inline-styled containers. Keyframes: `ours-spin
ours-fade-in ours-fade-out ours-rise-in ours-rise-out`. `prefers-reduced-motion` zeroes the
durations.

`ui/tokens.ts` has the runtime helpers from the design: `dotFor(owner) bgFor(owner)
kindColor(kind) stColor(status) statusColor(status) voteGlyph(v) tg(on) filterChip(selected)
accentChip(on) segBg(active) whoStyle(who) checkStyle(done) segTab(on) navRow(on)
tabColor(active)` and the literals `PAPER INK SCRIM PHOTO_FILTER AVATAR_FILTER
PHOTO_SCRIM_55/6/5 DANGER_LITERAL EASE`.

## Primitives (`import { ... } from '../../ui'`)

| Component | Props |
|---|---|
| `Button` | `variant?: 'primary' \| 'secondary' (default) \| 'quiet' \| 'destructive' \| 'ink' \| 'over-photo'`, `size?: 'default' (44px) \| 'dense' (36px) \| 'dense-lg' (40px) \| 'sheet' (48px)`, `full?`, `icon?`, `disabled`, all button attrs (`type` defaults to `"button"`) |
| `IconButton` | `label` (aria), `size?` (40), children = a 20px icon; transparent, fg2 |
| `Chip` | `selected?`, `tone?: 'filter' (ink fill) \| 'accent' (accent-soft fill)`, `add?` (dashed), `size?: 'sm' (30px) \| 'md' (32px, weight 500)`, `asSpan?`, button attrs |
| `Kind` | `status?` (planning/booked/shortlisted/decided/idea/dreaming/done/underway or any label), `color?` (sets color + border), `size?: 'default' \| 'card' \| 'header'`, children default to `status` |
| `Segmented<T>` | `options: {key, label}[]`, `value`, `onChange(key)`, `variant?: 'default' \| 'calendar'`, `full?` |
| `Sheet` | `open`, `onClose`, `variant?: 'bottom' \| 'tall' \| 'dialog'`, `gap?` (16 / 0 / 14), `title?` (serif 26), `meta?` (mono 11 fg3) or `closeLabel?` (accent link), `handle?`, `style?`; portal, scrim tap + Escape close, 200ms in/out. Helpers for `tall`: `SheetHeader({title, action, onAction})`, `SheetBody`, `SheetFooter`; menu rows: `SheetRow({label, meta, onClick})` |
| `Toast` / `ToastProvider` / `useToast()` | `Toast({message, action?: {label, onClick}})`; `useToast().show(message, action?, ms = 4000)` / `.hide()` renders above the tab bar |
| `Avatar` | `who?: 'me' \| 'her'`, `seed?`, `src?`, `size?` (32), `border?` (`'var(--bg)'`, `null` for none) |
| `AvatarPair` | `size?` (32), `overlap?` (-10), `border?` |
| `VoteChip` | `who: 'me' \| 'her'`, `vote?: 'like' \| 'meh' \| 'no'` (omit for the assignee chip), `size?: 24 \| 22 \| 20 \| 18` |
| `VotePair` | `c`, `h`, `size?`, `gap?` |
| `Eyebrow` | `as?`, `size?: 11 \| 10`, `color?` |
| `EmptyState` | `title?` ("Nothing here yet."), `sub?` ("Start with how you met."), `cta?: {label, onClick}` |
| `KindIcon` | `kind: flight \| stay \| transport \| train \| bus \| car \| activity \| food \| ticket \| idea \| note`, `size?` (18), lucide props. Also `KIND_ABBR`, `KIND_LABEL`, `KIND_ICON` |
| `Icon` | `name: image \| map \| calendar \| message-circle \| users \| plus \| camera \| lock \| check \| search \| chevron-left \| chevron-right \| x \| play \| trash \| grid \| map-pin \| heart \| send \| mic`, `size?` (22), `strokeWidth?` (1.5) |
| `Card` | `padding?`, `interactive?`, `as?`, div attrs |
| `Toggle` | `on`, `onChange(on)`, `size?: 'default' (40x24) \| 'compact' (36x22)`, `offColor?`, `shadowKnob?`, `disabled?`, aria-label |
| `Field` | `label`, `hint?`, input attrs (`mono?`), or `children` for a custom control. Also `Input({mono?})`, `Textarea`, `PickerRow({left, right, muted?, onClick?})` |
| `CodeBoxes` | `value`, `onChange(digits)`, `length?` (6), `error?`, `dark?` (sign-in literals), `height?` (48), `fontSize?` (20), `autoFocus?` |

`cx(...classes)` joins class names.

## Data hooks (`import { ... } from '../../data/hooks'`)

All return plain data plus setters; the implementation is the swap point for the api.

**`designPreview`** (honest by default): only Plans talks to the api yet. The Memories, Chat,
Notes and Us screens exist in full against mock data, but with the `designPreview` dev flag
off (the default; `useDesignPreview()`, localStorage `ours.designPreview`) they render honest
empty states instead: Memories shows the design's empty state and "Memories arrive with
milestone 3", `/memories/:id`, `/gallery` and `/compose` render `NotYetScreen`, Chat is an empty
thread with a disabled composer, Notes an empty fridge, and `useChat()` / `useNotes()` return
no messages, no notes and a badge of 0. Us keeps only what is real (session name, theme,
local preferences, the account-console link, plan counts). The switch lives in the Us screen's
Developer card ("Design preview data"); on, every affected screen renders the designed mock
content behind a `PreviewBanner` ("Design preview · placeholder data").

- `useToday()` -> `Date` (simulated date or the real clock); `useSim()` -> `'now' | 'during' | 'after'`; `useSimDate()` -> `[iso | null, set]`; `useDesignPreview()` -> `[boolean, set]`
- `usePlans()` -> `{ plans: PlanView[], groups: {label, key, items}[], sim, duringTrip, afterTrip, today }`. `PlanView` adds the sim-aware `status`/`countdown` ("in 151 days" / "Day 2 of 16" / "Home 2 days") and `openPath` (the Today screen while the Japan trip is underway)
- `usePlan(id)` -> `{ plan, isEvent, sim, duringTrip, afterTrip, tripDay, days, unscheduled, ideas, ideaFilters, filterIdeas, bookings, lists (ChecklistView with per-item `key`, `doneNow`, `pct`), toggleTick(key, currentlyDone), budget, docs, pins, hero (with the item `id`), heroIsFallback, itemNotes, moreItems, segs, moreKeys, todayHeader, todayItems (with `id` and `start`), loading, error, notFound, offline: { enabled, note, toggle }, serverPlan (the raw ServerPlan: timezone, currency, dates), serverItems, serverMedia, who(userId) -> Person, m: PlanMutations }`. `PlanMutations` = `createItem, updateItem(itemId, patch with clearDay/clearStart/clearCost), deleteItem, vote, comment, reorder, tick, addListItem, setRate, updatePlan(patch), deletePlan(), upload(files), linkPreview(url), refresh`. The bundle query key is `['plan-bundle', id]`. Item view models (`ItineraryItem`, `UnscheduledItem`, `Idea`, `Booking`, `TodayItem`, `MapPin`) carry the server `id`; `features/plans/ItemSheet` looks the `ServerItem` up from `serverItems` by that id
- `useMemories()` -> `{ memories, filters, filterMemories(list, filter), withShowMonth(list), layout, setLayout, showOnThisDay, setShowOnThisDay, onThisDay }`
- `useMemory(id, variant?)` -> `{ memory, detail, inlineDesktop, gallery, caps, comments, reacted, setReacted(label), reactions: {label, n, on}[], favs, toggleFav(i), hasPlan, planId, planName, ini }`
- `useGallery()` -> `{ months, monthsFor(filter) (tiles + countLabel, deletions applied), deleted, deleteTiles(ids), filters, customAlbums, autoAlbums }`
- `useChat(variant?)` -> `{ messages, send(text), sharePhoto(img), typing, sealedDone, chatUnread, notesUnread, badge, pinned, media, wave, wavePlayed, yesterday }` - all empty / 0 unless `designPreview` is on (then chatUnread 2, notesUnread 1 -> 0, badge 3 -> 2)
- `useNotes()` -> `{ notes, leaveNote({body, color, sched, seal?}), hasUnopened, sealedDone, openSealed(), colors, sealed }` - `notes` empty and `hasUnopened` false unless `designPreview` is on
- `useEvents()` -> `{ recurring (the anniversary as a yearly all-day row), today }`; everything else the calendar shows comes from the real plans through `features/calendar/planCalendar.ts` (bars, booked items, agenda rows, legend). The events collection itself is milestone 5.
- `usePreferences()` -> `{ prefs, toggleNotif(k), togglePlanNotif(k), toggleOptIn(k), notifRows, planNotifChips, optIns, stats, security, simDate, setSimDate(iso | null), simOptions }` - the Us screen renders a dev-only "Simulate date" select from `simOptions` (plus a "real date" choice mapping to `null`); `stats` and `security` are the design's mock rows and the Us screen only uses them while `designPreview` is on (otherwise it computes plan / trip / day counts from `usePlans()` and shows one account-console row)
- Theme: `useTheme()` from `../../theme` -> `{ theme, resolved, isDark, setTheme('light' | 'dark' | 'system') }` (the Us screen's Light / Late night buttons)
- Session: `useSession()` from `../../session` -> `{ me, meName }`; `SignOutButton` is the "Lock now" action

Static copy and pure helpers live in `data/mock/*` (re-exported from `data/mock/index.ts`):
`MEM DETAIL CAPS ON_THIS_DAY REACTIONS GAL CUSTOM_ALBUMS AUTO_ALBUMS MESSAGES WAVE NOTES
COMPOSER_* EVENTS EV PLAN_BARS AGENDA_EXTRA PLANS OVERVIEW MORE_ITEMS DAYS ITEM_NOTES
UNSCHEDULED EVENT_DAYS IDEAS BOOKINGS BOOKING_KINDS PASTE_FIELDS LISTS GUESTS BUDGET DOCS
PINS MAP_CITIES LOCKED_LINES TODAY_HEADER TODAY STATS SECURITY NOTIF_ROWS PLAN_NOTIF_CHIPS
OPT_INS DEFAULT_PREFS DEMO_CODE`. Images always come from `mockImage(seed, w, h)`.
