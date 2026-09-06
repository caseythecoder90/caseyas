# Ours - data and logic spec

Sources (read in full):

- `design/Ours - mobile prototype.dc.html`, lines 900-1117: the mobile `Component extends DCLogic` class. This is the primary interaction truth for the phone app.
- `design/Ours - desktop.dc.html`, lines 380-488: the desktop `Component extends DCLogic` class (timeline, detail, composer, chat, calendar month/week, plan workspace).
- `design/plans-data.js`: `window.OURS_PLANS = { PLANS, DAYS, UNSCHEDULED, IDEAS, BOOKINGS, LISTS, BUDGET, DOCS }`, shared by both canvases.

Companion file: `design/spec/mock-data.md` (every dataset transcribed, plus `src/data/types.ts`).

Conventions used below:

- `s` = state, `p` = design-time props, `her` = her name (always `Yasmim` in the real project), `herIni` = `her[0]` = `Y`.
- "sentinel" `'her'` in memory data and `'Yasmim'` in plan data both mean Yasmim. The design substitutes `p.herName` at render time; the app can simply store `'Yasmim'`.
- Colors written as `var(--x)` are the foundation tokens. A few raw hex values appear in the design on the sign-in screen (dark surface): `#faf9f6` (text on accent / dark), `#2e2b26` (dark border), `#e26a4a` (error border). Keep them as written.
- Mock images: the design uses `P(seed, w, h)`; the app uses its mock image helper with the same `(seed, w, h)` triple.

## 0. Corrections applied on top of the design (from the real project)

These override the design copy everywhere it appears (data, derived strings, static template copy):

| Design | Real project |
| --- | --- |
| Plan name `Japan, spring 2027` | `Japan 2027` |
| Dates `Apr 8 – 22, 2027` (15 days) | `Feb 4 – 19, 2027` (16 days, Thu Feb 4 to Fri Feb 19) |
| Destinations `Tokyo · Kyoto · Osaka` | `Tokyo · Hakuba · Kyoto` (visited in that order) |
| Osaka idea `Dotonbori at night` | Hakuba idea `Onsen night after skiing` |
| Osaka map city (1 pin: Dotonbori) | Hakuba map city (ski lodge stay, Nagano Station transport, Happo-one lifts, onsen idea) |
| No Hakuba bookings | Added: `Hakuba Alpine Lodge` stay (Days 6-9), `Hokuriku Shinkansen · Kagayaki 505` Tokyo -> Nagano, `Alpico bus · Nagano -> Hakuba` |
| Kyoto `Days 6–9`, Yoshikawa Inn `Apr 13 – 16` | Kyoto `Days 10–13`, Yoshikawa Inn `Sat Feb 13 – Tue Feb 16` |
| Countdown `in 214 days` / `214 days until we land in Tokyo` | `in 151 days` / `151 days until we land in Tokyo` (Sep 6, 2026 -> Feb 4, 2027) |
| `Day 2 of 15`, `15 day headings`, `… 13 more days below` | `Day 2 of 16`, `16 day headings`, `… 14 more days below` |
| After-trip stat `15` `days, 3 cities, 212 photos` | `16` `days, 3 cities, 212 photos` |
| simulateDate options `Apr 9, 2027 — in Tokyo`, `Apr 24, 2027 — just home` | `Feb 5, 2027 — in Tokyo`, `Feb 21, 2027 — just home` |
| JL 5 departs `Thu Apr 8 · 12:55 PM`, arrives `Fri Apr 9 · 4:15 PM` | `Thu Feb 4 · 12:55 PM`, `Fri Feb 5 · 4:15 PM` |
| JL 6 `Thu Apr 22 · landed 4:40 PM`, `Return JL 6 · Apr 22` | `Fri Feb 19 · landed 4:40 PM`, `Return JL 6 · Feb 19` |
| Chat plan item sub `… · put it on day 6?` | `… · put it on day 11?` (first full Kyoto day) |
| Checklist due dates `Mar 1` (JR Pass), `Mar 10` (Ghibli) | `Jan 4`, `Jan 10` (must precede the trip; Ghibli sales open on the 10th of the prior month) |
| Local currency | stays JPY (`¥`, rate `148.2`) |

Day-number to date map for the trip (weekday of Day 1 is unchanged from the design, so all `dow` values carry over): Day N = Feb (3 + N), 2027. Day 1 Thu Feb 4, Day 2 Fri Feb 5, Day 3 Sat Feb 6, Day 6 Tue Feb 9, Day 9 Fri Feb 12, Day 10 Sat Feb 13, Day 13 Tue Feb 16, Day 16 Fri Feb 19.

Everything else (people, amounts, times, copy, colors, counts in hint strings) stays exactly as designed. Note that hint strings such as `12 ideas · 4 booked · checklist 3/18`, `$3,860 paid`, `4 files`, `9 pins` are static copy in the design, not derived from the arrays; keep them verbatim.

## 1. Design-time props (become app settings)

| Prop | Options | Default | Where it lands in the app |
| --- | --- | --- | --- |
| `displayFont` | `Newsreader`, `Cormorant Garamond`, `Lora`, `Instrument Serif` | `Newsreader` | `fontKey` = `newsreader` / `cormorant` / `lora`, anything else -> `instrument`. Drives `--font-serif`. Fixed to Newsreader in the app unless a setting exists. |
| `theme` | `light`, `dark` | `light` | `theme = s.themeOverride ?? p.theme ?? 'light'`; `isDark = theme === 'dark'`. The Us screen has Light / Dark buttons that set `themeOverride`. |
| `simulateDate` (mobile only) | `Sep 6, 2026 — today`, `Feb 5, 2027 — in Tokyo`, `Feb 21, 2027 — just home` | `Sep 6, 2026 — today` | `sim` = `now` / `during` / `after` (section 5). In the app this is derived from the real clock vs the Japan plan dates; a dev toggle may expose it. |
| `timelineLayout` (mobile only) | `editorial`, `grid`, `journal` | `journal` (prop default; the code fallback is `editorial`) | `layoutEditorial` / `layoutGrid` / `layoutJournal` (section 4.3). |
| `showOnThisDay` (mobile only) | boolean | `true` | Shows the "On this day · 2025 / First real cold morning" card above the timeline. |
| `herName` | text | `Yasmim` | `her`, `herIni`. Fixed to `Yasmim`. |

"Today" in every canvas is **Sun Sep 6, 2026** (calendar highlights day 6; countdowns are computed from it).

## 2. Mobile state shape

`state` (all keys, with default and meaning). Keys are grouped by area; the object is flat in the design.

### 2.1 Shell and auth

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `screen` | `'signin' \| 'memories' \| 'detail' \| 'gallery' \| 'composer' \| 'plans' \| 'plan' \| 'today' \| 'calendar' \| 'chat' \| 'us'` | `'signin'` | Which top-level screen is mounted. |
| `step` | `1 \| 2` | `1` | Sign-in step: 1 = password / passkey page, 2 = 6-digit authenticator code. |
| `code` | string (0-6 digits) | `''` | Digits typed into the code boxes. |
| `codeErr` | boolean | `false` | Last submitted code was wrong; boxes turn `#e26a4a`, hint hidden. |
| `trust` | boolean | `true` | "Trust this device" toggle on step 2. |
| `locked` | boolean | `false` | The sign-in screen is shown because the user locked the app (shows the "locked" variant, not a fresh sign-in). |
| `themeOverride` | `'light' \| 'dark' \| undefined` | undefined (not in the initial object) | Set by the Us screen theme buttons; wins over the prop. |
| `sheet` | boolean | `false` | The "+" bottom sheet on Memories (New memory / etc.). |

### 2.2 Memories, detail, lightbox, gallery

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `detailId` | number (Memory id) | `3` | Memory shown on the detail screen. Fallback when not found: `MEM[2]` (Asheville). |
| `filter` | `'All' \| 'Trips' \| 'Date nights' \| 'Everyday' \| 'Milestones' \| 'Videos'` | `'All'` | Timeline filter chip. |
| `reacted` | `'' \| 'loved it' \| 'made me laugh' \| 'miss this' \| 'again please'` | `''` | Which reaction chip the user has pressed on the detail screen (single choice, toggles off). |
| `lb` | `number \| null` | `null` | Lightbox index into the detail gallery; `null` = closed. |
| `favs` | number[] | `[]` | Gallery indices favorited from the lightbox. |
| `galSeg` | `'photos' \| 'albums'` | `'photos'` | Gallery segmented control. |
| `galFilter` | `'All' \| 'Photos' \| 'Videos' \| 'Favorites' \| 'Casey' \| her` | `'All'` | Gallery filter chip. |
| `selecting` | boolean | `false` | Gallery multi-select mode. |
| `sel` | string[] (tile ids like `'sep3'`) | `[]` | Selected gallery tiles. |
| `del` | boolean | `false` | Delete confirmation dialog open. |
| `deleted` | string[] | `[]` | Tile ids removed from the gallery (soft-delete, session only). |

### 2.3 Composer (new memory)

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `cTitle` | string | `''` | Title input. |
| `cType` | `'Trip' \| 'Date night' \| 'Everyday' \| 'Milestone'` | `'Everyday'` | Type chip. |
| `fromPlan` | boolean | `false` | Composer was opened from the Japan plan ("Start a memory from this plan"): prefilled title, dates, places, day headings, and the photo picker filtered to the trip. |
| `priv` | boolean | `true` | "Keep it private until I publish" toggle. |

### 2.4 Chat and fridge notes

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `chatSeg` | `'msgs' \| 'notes'` | `'msgs'` | Chat screen segmented control (Messages / Notes). |
| `draft` | string | `''` | Message composer text. |
| `sent` | ChatMessage[] | `[]` | Messages sent this session (appended after the 8 base messages). |
| `typing` | boolean | `false` | Her typing indicator, shown 2.5 s after each send. |
| `sealedOpen` | boolean | `false` | The sealed note overlay is open. |
| `sealedDone` | boolean | `false` | The sealed note has been opened once; removes the "unopened" card and drops the chat badge from 3 to 2. |
| `noteSheet` | boolean | `false` | "Leave a note" bottom sheet open. |
| `noteDraft` | string | `''` | Note body. |
| `noteColor` | `'n1' \| 'n2' \| 'n3' \| 'n4'` | `'n1'` | Sticky-note color. |
| `sched` | boolean | `false` | Schedule the note (appears Oct 3, 7:00 AM). |
| `seal` | boolean | `false` | Seal the note (she must open it). |
| `addedNotes` | FridgeNote[] | `[]` | Notes left this session; rendered before the 5 base notes. |

### 2.5 Calendar

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `ev` | `number \| null` (day of month) | `null` | Event detail sheet for that day of September; `null` = closed. |

### 2.6 Plans

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `planId` | `'japan' \| 'lake' \| 'anniv' \| 'portugal' \| 'asheville'` | `'japan'` | Plan open on the plan screen. Fallback: `PLANS[0]`. |
| `planSeg` | `'overview' \| 'itinerary' \| 'ideas' \| 'bookings' \| 'lists' \| 'budget' \| 'docs' \| 'map' \| 'locked'` | `'overview'` | Plan segment. `lists`, `budget`, `docs`, `map`, `locked` live under "More". |
| `more` | boolean | `false` | "More" segment sheet open. |
| `planSheet` | boolean | `false` | "New plan" bottom sheet open. |
| `planType` | `'Trip' \| 'Event'` | `'Trip'` | Choice in the new-plan sheet. |
| `offline` | boolean | `true` | "Available offline" toggle on the plan overview. |
| `reveal` | boolean | `false` | Locked note revealed (blur 6px -> 0). |
| `ideaFilter` | `'All' \| 'Tokyo' \| 'Hakuba' \| 'Kyoto' \| 'Shortlisted' \| 'Decided'` | `'All'` | Ideas board filter. |
| `ticks` | `Record<'<listIdx>-<itemIdx>', boolean>` | `{}` | Checklist overrides keyed by list index and item index. |
| `form` | `null \| 'kinds' \| 'flight' \| 'stay' \| 'paste'` | `null` | Add-booking flow: kind picker, flight form, stay form, paste-a-confirmation form. |
| `offlineSim` | boolean | `true` | On the Today screen: simulate being offline (shows the cached banner) vs online. |
| `mapCity` | `'Tokyo' \| 'Hakuba' \| 'Kyoto'` | `'Tokyo'` | Map city chip. |
| `pin` | `number \| null` | `null` | Selected pin index within the current city. |

### 2.7 Preferences (Us screen)

| Key | Type | Default |
| --- | --- | --- |
| `notif` | `{ push: boolean; email: boolean; quiet: boolean }` | `{ push: true, email: false, quiet: true }` |
| `planNotif` | `{ votes: boolean; comments: boolean; decisions: boolean; bookings: boolean }` | all `true` |
| `optIn` | `{ map: boolean; paste: boolean }` | `{ map: false, paste: false }` |

## 3. State transitions (mobile)

`go(screen)` = `setState({ screen, sheet: false, ev: null, more: false, planSheet: false })`. Every tab-bar navigation closes all sheets.

### 3.1 Sign-in

| UI action | Binding | Transition |
| --- | --- | --- |
| Continue (step 1) | `toStep2` | `{ step: 2, code: '', codeErr: false }` |
| Back (step 2) | `toStep1` | `{ step: 1 }` |
| Trust toggle | `toggleTrust` | `trust = !trust` |
| Type in code field | `onCode(e)` | `v = value.replace(/\D/g,'').slice(0,6)`; `{ code: v, codeErr: false }`; then `submitCode(v)` |
| `submitCode(v)` | internal | if `v.length < 6` return; if `v === '123456'` -> `{ screen: 'memories', code: '', codeErr: false, locked: false, step: 1 }`; else `{ codeErr: true, code: '' }` |
| Passkey / "Use a passkey" / locked "Unlock" | `enter` | `{ screen: 'memories', step: 1, code: '', locked: false }` |
| Lock now (Us screen) | `lockNow` | `{ screen: 'signin', locked: true, step: 1 }` |

Derived: `isSignin`, `inApp = screen !== 'signin'`, `isStep1`, `isStep2`, `locked`, `codeBoxes[i] = { ch: code[i] || '', border: codeErr ? '#e26a4a' : i === code.length ? '#faf9f6' : '#2e2b26' }` (the active box is the one at the caret), `codeHint = !codeErr`, `trustBg = trust ? var(--accent) : #2e2b26`, `trustKnob = trust ? 19px : 3px`.

### 3.2 Memories timeline and detail

| UI action | Binding | Transition |
| --- | --- | --- |
| Filter chip | `filters[i].pick` | `{ filter }` |
| Memory card | `memories[i].open` | `{ screen: 'detail', detailId: m.id }` |
| On-this-day card | `openOnThisDay` | `{ screen: 'detail', detailId: 5 }` (Rooftop movie) |
| Gallery icon (header) | `goGallery` | `{ screen: 'gallery' }` |
| "+" | `openSheet` / `closeSheet` | `sheet = true / false` |
| Sheet: New memory | `openComposer` | `{ screen: 'composer', sheet: false, fromPlan: false, cTitle: '' }` |
| Back (detail, gallery, composer) | `back` | `go('memories')` |
| Reaction chip | `reactions[i].pick` | `reacted = reacted === label ? '' : label` |
| Detail gallery tile | `d.gallery[i].open` | `{ lb: i }` |
| Lightbox close | `closeLb` | `{ lb: null }` |
| Lightbox next | `nextLb` | `{ lb: (lbi + 1) % gallery.length }` |
| Lightbox favorite | `favLb` | toggle `lbi` in `favs` |
| Lightbox share | `shareLb` | `{ lb: null, screen: 'chat', sent: [...sent, { id: Date.now(), from: 'me', type: 'photo', img: lbg.src, time: 'Delivered' }] }` |
| Detail "Open plan" (only Asheville, `d.hasPlan`) | `goPlan` | `{ screen: 'plan', planId: 'japan', planSeg: 'overview' }` (design quirk: it opens the Japan plan; the app should open the plan whose id matches, `asheville`) |

### 3.3 Gallery

| UI action | Binding | Transition |
| --- | --- | --- |
| Photos / Albums segment | `galPhotos` / `galAlbums` | `galSeg` |
| Filter chip | `galFilters[i].pick` | `{ galFilter }` |
| Select / Done | `toggleSelect` | `{ selecting: !selecting, sel: [] }` |
| Tile tap | `tile.pick` | if selecting: toggle `t.id` in `sel`; else `{ screen: 'detail', detailId: 3, lb: 1 }` (opens the Asheville lightbox at index 1) |
| Trash | `askDelete` | if `sel.length` -> `{ del: true }` |
| Cancel | `closeDel` | `{ del: false }` |
| Delete | `doDelete` | `{ del: false, deleted: [...deleted, ...sel], sel: [], selecting: false }` |
| Auto album | `autoAlbums[i].open` | `{ screen: 'detail', detailId: m.id }` |

### 3.4 Composer

| UI action | Binding | Transition |
| --- | --- | --- |
| Title input | `onCTitle(e)` | `{ cTitle: value }` |
| Type chip | `cTypes[i].pick` | `{ cType }` |
| Private toggle | `togglePriv` | `priv = !priv` |
| Clear prefill banner | `clearPrefill` | `{ fromPlan: false, cTitle: '' }` |
| From plan overview: "Start a memory from this plan" | `openComposerFromPlan` | `{ screen: 'composer', fromPlan: true, cTitle: 'Two weeks in Japan', cType: 'Trip' }` |

### 3.5 Plans list, plan detail, today

| UI action | Binding | Transition |
| --- | --- | --- |
| Plan card | `pl.open` | `{ screen: sim === 'during' && pl.id === 'japan' ? 'today' : 'plan', planId: pl.id, planSeg: 'overview' }` |
| Back from plan / today header | `goPlans` | `go('plans')` |
| Today header "Plan" button, chat plan item | `goPlan` | `{ screen: 'plan', planId: 'japan', planSeg: 'overview' }` (chat `openPlan` sets `{ screen: 'plan', planSeg: 'itinerary' }` without changing `planId`) |
| Plans list "+" | `openPlanSheet` / `closePlanSheet` | `planSheet` |
| New plan sheet Trip / Event | `pickTrip` / `pickEvent` | `planType` |
| Segment tab | `segs[i].pick` | key `more` -> `{ more: true }`; else `{ planSeg: key }` |
| More sheet item | `moreItems[i].pick` | `{ planSeg: key, more: false }` |
| More sheet close | `closeMore` | `{ more: false }` |
| Overview shortcuts | `segToBookings`, `segToBudget`, `segToLists`, `segToIdeas`, `segToLocked` | `planSeg` |
| Offline toggle | `toggleOffline` | `offline = !offline` |
| Locked note reveal | `toggleReveal` | `reveal = !reveal` |
| Idea filter chip | `ideaFilters[i].pick` | `{ ideaFilter }` |
| Checklist row | `lists[li].items[ii].toggle` | `ticks[li + '-' + ii] = !done` |
| Bookings "+" | `openKinds` | `{ form: 'kinds' }` |
| Kind picker row | `kinds[i].pick` | `{ form }` where form is `'flight'` for Flight, `'stay'` for Stay, `null` (closes) for Transport / Activity / Food / Ticket |
| Kind picker "Paste a confirmation" | `openPaste` | `{ form: 'paste' }` |
| Paste form "Use these" | `openFlight` | `{ form: 'flight' }` (prefilled flight form) |
| Close / Cancel / Save on any form | `closeForms` | `{ form: null }` |
| Map city chip | `mapCities[i].pick` | `{ mapCity: c, pin: null }` |
| Map pin | `pins[i].pick` | `pin = pin === i ? null : i` |
| Overview "Today" card (during trip) | `openToday` | `{ screen: 'today' }` |
| Today offline/online banner | `toggleNet` | `offlineSim = !offlineSim` |

### 3.6 Chat and notes

| UI action | Binding | Transition |
| --- | --- | --- |
| Messages / Notes segment | `segMsgs` / `segNotes` | `chatSeg` |
| Draft input | `onDraft(e)` | `{ draft: value }` |
| Enter key | `onDraftKey(e)` | if `e.key === 'Enter'` -> `send()` |
| Send | `send` | if `!draft.trim()` return; `{ sent: [...sent, { id: Date.now(), from: 'me', type: 'text', text: draft, time: 'Delivered' }], draft: '', typing: true }`; after 2500 ms `{ typing: false }` |
| Memory bubble | `m.openMem` | `{ screen: 'detail', detailId: m.memId }` |
| Plan-item bubble | `m.openPlan` | `{ screen: 'plan', planSeg: 'itinerary' }` |
| Sealed note card | `openSealed` | `{ sealedOpen: true }` |
| Sealed overlay close / "Keep it" | `closeSealed` | `{ sealedOpen: false, sealedDone: true }` |
| "Leave a note" | `openNoteSheet` / `closeNoteSheet` | `noteSheet` |
| Note body | `onNoteDraft(e)` | `{ noteDraft: value }` |
| Color swatch | `noteColors[i].pick` | `{ noteColor: k }` |
| Schedule toggle | `toggleSched` | `sched = !sched` |
| Seal toggle | `toggleSeal` | `seal = !seal` |
| Primary button | `leaveNote` | if `!noteDraft.trim()` return; `{ noteSheet: false, noteDraft: '', addedNotes: [{ body: noteDraft, color: noteColor, from: 'Casey', time: sched ? 'Scheduled' : 'Just now', span: 1, scheduled: sched, when: 'Appears Oct 3, 7:00 AM' }, ...addedNotes] }` (note: `noteColor`, `sched`, `seal` are not reset) |

### 3.7 Calendar

| UI action | Binding | Transition |
| --- | --- | --- |
| Day cell with an event | `days[i].pick` | `{ ev: n }` |
| Day cell 12 or 13 (Lake weekend bar) | `days[i].pick` | `{ screen: 'plan', planSeg: 'overview' }` (design quirk: `planId` unchanged; the app should set `planId: 'lake'`) |
| Other day cells | no-op | |
| Agenda row (event) | `agenda[i].pick` | `{ ev: n }` |
| Agenda row (plan: Lake weekend, Japan 2027) | `agenda[i].pick` | `{ screen: 'plan', planSeg: 'overview' }` (app: set `planId` to `lake` / `japan`) |
| Agenda row Anniversary | no-op | |
| Event sheet close | `closeEv` | `{ ev: null }` |

### 3.8 Us screen

| UI action | Binding | Transition |
| --- | --- | --- |
| Light / Dark | `setLight` / `setDark` | `themeOverride` |
| Notification rows | `notifs[i].toggle` | `notif[k] = !notif[k]` |
| Per-plan notification chips | `planNotifs[i].toggle` | `planNotif[k] = !planNotif[k]` |
| Opt-in rows | `optIns[i].toggle` | `optIn[k] = !optIn[k]` |
| Lock now | `lockNow` | see 3.1 |

### 3.9 Tab bar

`goMemories`, `goPlans`, `goCalendar`, `goChat`, `goUs` -> `go(screen)`.
`tab.<name>` color = `var(--fg1)` when active else `var(--fg3)`, where active means:

- memories: screen in `memories`, `detail`, `gallery`, `composer`
- plans: screen in `plans`, `plan`, `today`
- calendar: `calendar`
- chat: `chat`
- us: `us`

`chatBadge = screen !== 'chat'` (show the badge on the tab); `chatBadgeN = sealedDone ? '2' : '3'`.

## 4. Derived values (mobile renderVals)

### 4.1 Common helpers

- `dotFor(owner)`: `c` -> `var(--accent)` (Casey), `h` -> `var(--green)` (her), else (`b`, both) -> `var(--fg1)`.
- `kindColor(kind)`: `food` accent, `activity` green, `stay` plum, `ticket` ochre, `transport` / `flight` / other `var(--fg2)`.
- `tg(on)` toggle style: `{ bg: on ? var(--accent) : var(--surface-2), knob: on ? '19px' : '3px' }` (the offline toggle uses `17px`).
- Selected-chip style (used by `filters`, `galFilters`, `ideaFilters`, `mapCities`): selected -> `bg var(--fg1)`, `color var(--bg)`, `border var(--fg1)`; unselected -> `bg transparent`, `color var(--fg2)`, `border var(--border)`.
- Accent-chip style (used by `cTypes`, `reactions`, new-plan Trip/Event): selected -> `bg var(--accent-soft)`, `border var(--accent)`; unselected -> `bg transparent`, `border var(--border)`.
- `stColor(status)`: `decided` green, `shortlisted` accent, else `var(--fg3)`.
- `vote(v)`: `like` -> `↑`, `meh` -> `~`, else (`no`) -> `✕`. Idea vote badges: `cv = 'C' + vote(c)`, `hv = herIni + vote(h)`.

### 4.2 Memories filter

```
memories = MEM.filter(m =>
  filter === 'All'
  || (filter === 'Trips' && m.type === 'Trip')
  || (filter === 'Date nights' && m.type === 'Date night')
  || (filter === 'Everyday' && m.type === 'Everyday')
  || (filter === 'Milestones' && m.type === 'Milestone')
  || (filter === 'Videos' && m.count.includes('video')))
```

Each item is decorated with: `by` (sentinel -> her), `isLarge / isMedium / isCompact` from `size`, `colSpan = large ? 2 : 1`, `rowSpan = compact ? 1 : 2`, `gridTitle = large ? '26px' : '18px'`, `hasMore = !!img2`, `open()`.

### 4.3 Memory layouts (`timelineLayout`)

- **editorial** (`layoutEditorial`): vertical stack. Month header rendered when `m.showMonth` (static flag in data; note that it is not recomputed after filtering, so e.g. `Trips` shows Asheville without an "August 2026" header). Three card variants:
  - large: full-bleed image with the `type` chip and `count` overlay, then title, `date · loc`, `ex`, `{by} added this`.
  - medium: two images side by side (`img`, `img2`), then a `date` / `count` row, title, `ex`.
  - compact: small thumbnail left, `date · type`, title, `ex`.
- **grid** (`layoutGrid`): CSS grid of 2 columns; card spans `colSpan` x `rowSpan`; overlay shows `date` and `title` at `gridTitle` size; large cards also show `count`.
- **journal** (`layoutJournal`, prop default): list rows with a date column (`day` big, `mon` small), title, `ex`, a thumbnail strip (`img`, and when `hasMore`: `img2` plus the `more` badge such as `+36`), then `type · loc · by`.

### 4.4 Detail and lightbox

- `dm = MEM.find(id === detailId) || MEM[2]`; `dd = DETAIL[dm.id] || DETAIL.default`.
- `d = { ...dm, ...dd, by, ini: by === her ? herIni : 'C', hasPlan: dm.id === 3, planName: 'Three days in Asheville', gallery }`.
- `gallery` (5 tiles): `[ { src: P(seedOf(dm.img) + 'a', 400, 400), span: 2, video: true, dur: '0:42' }, { src: P(id + 'g2') }, { src: P(id + 'g3') }, { src: P(id + 'g4') }, { src: P(id + 'g5') } ]` all 400x400, span 1 unless noted, each with `open() -> lb = i`. `seedOf(img)` is the seed segment of the image URL (e.g. `asheville`), so the first tile seed is `ashevillea`.
- Lightbox: `lbi = lb ?? 0`, `lbg = gallery[lbi]`; `lb.src = lbg.src` at 900x900; `pos = (lbi+1) + ' of ' + gallery.length`; `cap = CAPS[lbi]`; `meta = d.date.split('–')[0].trim() + ' · ' + d.by`; `favLabel = favs.includes(lbi) ? 'Favorited' : 'Favorite'`; `favBg = fav ? var(--accent-soft) : transparent`; `favBorder = fav ? var(--accent) : #2e2b26`. `lbOpen = lb !== null && screen === 'detail'`.
- Reactions: base counts `loved it 2`, `made me laugh 1`, `miss this 0`, `again please 0`; displayed `n = base + (reacted === label ? 1 : 0)`.

### 4.5 Gallery

- `GAL = [['September 2026', 9, 'sep'], ['August 2026', 15, 'aug'], ['July 2026', 12, 'jul']]`.
- For month `k` with `n` tiles, tile `i`: `id = k + i`, `src = P('g' + id, 300, 300)`, `video = i % 7 === 3`, `dur = '0:' + (12 + i*3)`, `fav = i % 5 === 1`, `byHer = i % 2 === 0`.
- Filter: exclude `deleted`; then `galFilter`: `All`; `Photos` (`!video`); `Videos`; `Favorites` (`fav`); `Casey` (`!byHer`); her name (`byHer`).
- Decoration: `sel = selecting && sel.includes(id)`, `unsel = selecting && !sel`, `op = unsel ? .7 : 1`.
- Month label `count = tiles.length + ' items'` (after filtering).
- `selN = sel.length`, `selLabel = selecting ? 'Done' : 'Select'`, `selBg = selecting ? var(--surface-2) : transparent`.
- `customAlbums` and `autoAlbums` (from MEM: `name = title`, `count`, `src = img`) - see mock-data.

### 4.6 Composer

- `cDates = fromPlan ? 'Feb 4 – 19, 2027' : 'Sep 6, 2026'`; `cLoc = fromPlan ? 'Tokyo · Hakuba · Kyoto' : 'Add a place'`; `cLocColor = fromPlan ? var(--fg1) : var(--fg3)`; `cMediaN = fromPlan ? '212' : '3'`; `savedLabel = 'saved just now'`.
- `cMedia`: seeds `jp1..jp6` (fromPlan) or `new1..new3`, 200x200; `cover = i === 0` (accent border), `uploading = !fromPlan && i === 2` (`op .6`), `hasCap = i === 1`, `cap = fromPlan ? 'Haneda, finally' : 'Kitchen, 11 PM'`.
- `cBlocks` (see mock-data): from-plan variant is heading / list / placeholder per day for days 1-2 then `… 14 more days below`; default variant is the power-outage draft (p, quote, image, `Keep writing…`). Each block gets `isH / isP / isList / isQ / isImg`.
- `privNote = priv ? her + ' won’t see this in the timeline or get a notification until you publish.' : her + ' can see the draft and add her take now.'`; `privBg / privKnob` via toggle style.

### 4.7 Chat

- `msgs = [...base(8), ...sent]`, each decorated: `isText / isPhoto / isPhotos / isVoice / isMemory / isLink / isPlanItem`; `self` and `items` = `flex-end` for `from === 'me'` else `flex-start`; `bg = me ? var(--surface-2) : var(--surface)`; `meta = time`.
- `WAVE`: 30 bars, `h = 6 + round(|sin(i*1.7)*14 + cos(i*0.8)*4|)` px, color `var(--fg1)` for `i < 12` else `var(--fg3)` (played portion).
- `hasDraft = !!draft`, `noDraft`, `sendBg = draft ? var(--accent) : transparent`, `sendFg = draft ? #faf9f6 : var(--fg2)`.

### 4.8 Fridge notes

`notes = [...addedNotes, ...5 base notes]`. `hasUnopened = !sealedDone`. Note sheet: `schedNote = sched ? 'Oct 3, 7:00 AM' : 'appears now'`; `leaveLabel = seal ? 'Seal it and leave it' : sched ? 'Schedule it' : 'Leave it on the fridge'`; `noteColors[k].border = noteColor === k ? var(--fg1) : var(--border)`.

### 4.9 Calendar (September 2026)

- `days = [blank].concat(1..30)`; the blank leading cell makes Sep 1 land on Tuesday (calendar starts Monday). Per day `n`: `e = EVENTS[n]`, `today = n === 6`, `pb = PLAN_BARS[n]`.
  - `pick`: event -> `ev = n`; plan bar -> open plan; else no-op.
  - `bg = e ? var(--surface) : transparent`; `color = today ? #faf9f6 : var(--fg1)`; `todayBg = today ? var(--accent) : transparent`.
  - `dot1 = e ? (owner === 'b' ? var(--accent) : dotFor(owner)) : transparent`; `dot2 = e && owner === 'b' ? var(--green) : transparent` (a "both" event shows two dots, accent + green).
  - Plan bar: `PLAN_BARS = { 12: { bg: var(--green), label: 'Lake weekend', l: '2px', r: '-2px', rad: '3px 0 0 3px' }, 13: { bg: var(--green), label: '', l: '-2px', r: '2px', rad: '0 3px 3px 0' } }`; `bar`, `barBg`, `barL`, `barR`, `barRad`, `barZ = label ? 2 : 1` (defaults `''`, `transparent`, `0`, `0`, `0`, `1`).
- `agenda`: days `[8, 10, 11, 19]` from EVENTS: `{ day: String(n), dow: when.slice(0,3), title, sub: when has '· ' ? timePart + (rule startsWith 'Every' ? ' · ' + rule : '') : when, dot: dotFor(owner), right: loc, rightColor: var(--fg3), pick -> ev = n }`, concatenated with three fixed rows:
  - `{ day: '12', dow: 'Sat', title: 'Lake weekend', sub: 'Sep 12 – 13 · Lake Lure · check-in 3 PM', dot: var(--green), right: 'in 6 days', rightColor: var(--fg3), plan: 'plan' }`
  - `{ day: '18', dow: 'Oct', title: 'Anniversary', sub: 'Oct 18 → every year', dot: var(--fg1), right: 'in 42 days', rightColor: var(--accent) }`
  - `{ day: '4', dow: 'Feb', title: 'Japan 2027', sub: 'JL 5 · JFK → HND · 12:55 PM', dot: var(--accent), right: 'in 151 days', rightColor: var(--accent), plan: 'plan' }`
  - sorted by key `dow === 'Oct' ? 1000 : dow === 'Feb' ? 2000 : +day`, i.e. 8, 10, 11, 12, 19, Oct 18, Feb 4.
- Event sheet: `evd = EVENTS[ev]`; `ev = { ...evd, dot: dotFor(owner), loc: loc || 'No location', past: !!past, future: !past }`; when closed `{ past: false, future: true }`. `evOpen = !!ev`.

### 4.10 Plans

- `sim` = see section 5.
- `decoPlan(pl)`: `small = !large`, `chips = dest.map(t => ({ t }))`, `open()`, and for `japan` only: `status = during ? 'underway' : after ? 'done' : pl.status`, `countdown = during ? 'Day 2 of 16' : after ? 'Home 2 days' : pl.countdown`.
- `planGroups = [['Up next','next'], ['Dreaming','dream'], ['Past','past']]` -> `{ label, items: PLANS.filter(group).map(decoPlan) }`.
- `plan = decoPlan(PLANS.find(id === planId) || PLANS[0])`; `isEvent = planId === 'anniv'`.
- Segments: Trip -> `Overview / Itinerary / Ideas / Bookings / More`; Event -> `Overview / Schedule / Guests / Bookings / More` (keys `overview / itinerary / lists / bookings / more`). `moreKeys` = `['lists','budget','docs','map','locked']` for trips, without `lists` for events. A segment is `on` when `planSeg === key` or (`key === 'more'` and `planSeg` in `moreKeys`); when a More key is active the More tab label becomes `{ lists: 'Checklists', budget: 'Budget', docs: 'Documents', map: 'Map', locked: 'Locked note' }[planSeg] + ' ▾'`. Style: `edge = on ? var(--accent) : transparent`, `color = on ? var(--fg1) : var(--fg2)`.
- `moreItems`: `Checklists 3 / 18`, `Budget $3,860 paid`, `Documents 4 files`, `Map 9 pins`, `Locked note ''`.
- Overview hero `ov`:
  - event (`anniv`): `{ num: '41', line: 'days until the weekend', kind: 'reservation', title: 'Dinner at Nonna’s · table for 8', sub: 'Sat Oct 17 · 6:30 PM · the back room', conf: 'NONNA-1017' }`
  - `sim === 'after'`: `{ num: '16', line: 'days, 3 cities, 212 photos', kind: 'last', title: 'JL 6 · HND → JFK', sub: 'Fri Feb 19 · landed 4:40 PM', conf: 'Q7XR4M' }`
  - otherwise: `{ num: '151', line: 'days until we land in Tokyo', kind: 'flight', title: 'JL 5 · JFK → HND', sub: 'Thu Feb 4 · 12:55 PM · Terminal 1', conf: 'Q7XR4M' }`
  - (design quirk: the `after` / `now` branches apply to every non-event plan; the app should show each plan's own hero and fall back to these for Japan.)
- `duringTrip = sim === 'during'`; `afterTrip = sim === 'after' && planId === 'japan'`.
- Itinerary: `itin = (isEvent ? EVENT_DAYS : DAYS).map(day => ({ ...day, empty: !items.length, items: items.map(it => ({ ...it, by, docsLabel: docs ? docs + ' file' + (docs > 1 ? 's' : '') : '' })) }))`. `unsched = isEvent ? [parkway item] : UNSCHEDULED`; `unschedN = unsched.length`.
- Ideas: `ideasAll = IDEAS.map(decorate)`; `ideas = ideasAll.filter(i => ideaFilter === 'All' || i.city === ideaFilter || i.status === ideaFilter.toLowerCase())`; `newestIdeas = ideasAll.slice(0, 3)`.
- Bookings: `isRoute = kind in (flight, train, bus)`, `isStay = kind === 'stay'`, `isTicket = kind === 'ticket'`, `thumbs = Array(docs)` (empty objects, one placeholder thumb per doc). (`bus` is an addition for the Hakuba transfer; the design only had `flight | train`.)
- Checklists: `lists = (isEvent ? GUESTS : LISTS).map((l, li) => ...)`; per item `k = li + '-' + ii`, `done = ticks[k] ?? it.done`; style `border/bg = done ? accent : border/transparent`, `color = done ? var(--fg3) : var(--fg1)`, `deco = done ? line-through : none`, `whoBg/whoFg = who === 'C' ? accent-soft/accent : green-soft/green`, `who = who === 'Y' ? herIni : 'C'`. List `done = l.done + (ticked items now done) - (items done in data)`; `pct = round(done / total * 100) + '%'`. `rings = lists.map(l => ({ name: name.replace('Yasmim', her), n: done + '/' + total, pct }))`.
- Budget: `budgetTotals = [Planned (planned, plannedJpy), Committed (committed, committedJpy), Paid (paid, paidJpy)]`; `budgetRows = rows.map(([k, v, pct]) => ({ k, v, pct: pct + '%' }))` - the bar width is the percentage of planned.
- Locked note: `lockBlur = reveal ? '0px' : '6px'`, `lockHidden = !reveal`.
- Offline toggle: `offBg = offline ? var(--accent) : var(--surface-2)`, `offKnob = offline ? '17px' : '3px'`, `offlineNote = offline ? 'saved 2h ago' : 'off'`.
- Map: `pins = PINS[mapCity].map(([kind, title, place, when, x, y], i) => ({ kind, title, place, when, x: x + '%', y: y + '%', color: kindColor(kind), size: pin === i ? '22px' : '16px', pick }))`; `pin = pins[pin] || {}`; `pinOpen = pin !== null && !!pins[pin]`; `segMap = planSeg === 'map'`.
- Add booking: `kindsOpen / flightOpen / stayOpen / pasteOpen = form === ...`; `kinds` = Flight FLT, Stay STY, Transport TRN, Activity ACT, Food EAT, Ticket TKT; `pasteFields` rows with `font = mono` for Confirmation / Flight no. / Seats, `color = tag === 'add' ? var(--fg3) : var(--fg1)`, `tagColor = tag === 'ok' ? var(--green) : var(--accent)`.

### 4.11 Today screen (during the trip)

`todayItems = TODAY.map(t => ({ ...t, hasConf: !!conf, noConf: !conf, op: past ? .45 : 1, dot: past ? var(--fg3) : next ? var(--accent) : var(--bg), dotBorder: past ? var(--fg3) : next ? var(--accent) : var(--fg3), timeColor: next ? var(--accent) : var(--fg2), size: next ? '26px' : '20px' }))`. The `next` item is the highlighted one (Shibuya Sky at 2:00 PM); `past` items are dimmed. Header copy: `Today · Day 2 of 16`, `Japan 2027`, `Tokyo · Fri Feb 5 · 9:14 AM local`, `Next: Shibuya Sky at 2:00 PM`. `offlineNow = offlineSim`, `onlineNow = !offlineSim`.

### 4.12 Us screen

- `stats`, `security` rows: see mock-data.
- `lightBtnBg = theme === 'light' ? var(--bg) : transparent`, `darkBtnBg` likewise.
- `notifs`: rows Push / Email / Quiet hours with toggle style; `planNotifs`: chips Votes / Comments / Decisions / Bookings (`on`, `color = on ? fg1 : fg3`, `border/bg = on ? accent : border/transparent`); `optIns`: Map view, Paste a confirmation with toggle style.

## 5. `simulateDate` branches

`sim = { 'Sep 6, 2026 — today': 'now', 'Feb 5, 2027 — in Tokyo': 'during', 'Feb 21, 2027 — just home': 'after' }[simulateDate] || 'now'`.

| Derived | now | during | after |
| --- | --- | --- | --- |
| Japan card `status` | `planning` | `underway` | `done` |
| Japan card `countdown` | `in 151 days` | `Day 2 of 16` | `Home 2 days` |
| Japan card tap | plan screen | **today** screen | plan screen |
| `ov` (non-event) | 151 / flight JL 5 | 151 / flight JL 5 (the overview still shows the flight; the Today card is shown above it because `duringTrip`) | 16 / last flight JL 6 |
| `duringTrip` | false | true | false |
| `afterTrip` (Japan only) | false | false | true -> the overview shows "Start a memory from this plan" (`openComposerFromPlan`) |

In the app, derive `sim` from the current date against the plan's dates: before start = `now`, between start and end inclusive = `during`, after end = `after`; `Day N of 16` = days since Feb 4 + 1; `Home N days` = days since Feb 19.

## 6. Navigation graph (mobile)

```
signin (step 1) --toStep2--> signin (step 2) --code 123456 / enter--> memories
signin (locked) --enter--> memories
us --lockNow--> signin (locked)

tab bar: memories | plans | calendar | chat | us   (go(): closes sheet, ev, more, planSheet)

memories --m.open / openOnThisDay--> detail --back--> memories
memories --goGallery--> gallery --back--> memories
memories --openSheet--> [sheet] --openComposer--> composer --back--> memories
detail --gallery tile--> [lightbox] --closeLb / nextLb / favLb
detail --shareLb--> chat (photo appended to sent)
detail (Asheville) --goPlan--> plan
gallery --tile (not selecting)--> detail (Asheville, lightbox index 1)
gallery --autoAlbums[i].open--> detail
gallery --askDelete--> [delete dialog] --doDelete / closeDel

plans --pl.open--> plan (or today when sim === during and pl.id === japan)
plans --openPlanSheet--> [new plan sheet] --pickTrip / pickEvent / closePlanSheet
plan --goPlans--> plans
plan segments: overview | itinerary | ideas | bookings | [more] -> lists | budget | docs | map | locked
plan overview --openToday--> today --goPlans--> plans ; today --goPlan--> plan
plan overview (afterTrip) --openComposerFromPlan--> composer (fromPlan)
plan bookings --openKinds--> [kinds] --k.pick--> [flight] | [stay] ; [kinds] --openPaste--> [paste] --openFlight--> [flight] ; closeForms

calendar --days[n].pick--> [event sheet] --closeEv
calendar --days 12/13 or plan agenda rows--> plan (overview)

chat --m.openMem--> detail ; chat --m.openPlan--> plan (itinerary)
chat/notes --openSealed--> [sealed overlay] --closeSealed (sealedDone)
chat/notes --openNoteSheet--> [note sheet] --leaveNote / closeNoteSheet
```

Overlays (`sheet`, `planSheet`, `more`, `noteSheet`, `del`, `form`, `ev`, `lb`, `sealedOpen`) are modal layers on top of the current screen, never screens themselves.

## 7. Desktop DCLogic

### 7.1 State

| Key | Default | Meaning |
| --- | --- | --- |
| `screen` | `'timeline'` | `timeline \| detail \| composer \| chat \| calendar \| plan \| notes \| us` (`notes` and `us` render a placeholder via `isOther / otherTitle`). |
| `detailId` | `3` | as mobile |
| `filter` | `'All'` | as mobile |
| `reacted` | `''` | as mobile |
| `draft`, `sent`, `typing` | `''`, `[]`, `false` | as mobile (sent messages have no `id`; the desktop assigns `id = index`) |
| `priv` | `true` | composer private toggle |
| `cType` | `'Trip'` | composer type |
| `cTitle` | `'A weekend at the lake'` | composer title (the desktop composer is the Lake weekend draft) |
| `calView` | `'month'` | `month \| week` |
| `newOpen` | `false` | the "New" dropdown in the top bar |
| `sel` | `'0-0'` | selected itinerary item key `dayIdx-itemIdx` (plan workspace right pane) |
| `planTab` | undefined -> `'Itinerary'` | plan workspace tab (labels, not keys): `Overview, Itinerary, Ideas, Bookings, Checklists, Budget, Documents, Map, Locked note` |
| `ideaFilter` | undefined -> `'All'` | as mobile |
| `ticks` | undefined -> `{}` | as mobile |
| `reveal` | undefined -> false | as mobile |
| `pin` | undefined -> null | as mobile (Tokyo pins only; `size 24px` when selected, `rowBg var(--surface)` on the selected list row) |

### 7.2 Transitions and derived

- `go(screen)` = `{ screen, newOpen: false }`. `nav` rows: Memories (`timeline`, active also for `detail` and `composer`), Plans (`plan`), Calendar, Chat (badge `2`), Notes (badge `1`), Us. Active style: `bg var(--accent-soft)`, `color var(--fg1)`, `edge var(--accent)`; inactive `transparent / var(--fg2) / transparent`.
- `toggleNew` flips `newOpen`; `newItems` = Memory (`photos + writing` -> composer), Plan (`trip or event` -> plan), Idea (`into a plan` -> plan), Event (`on the calendar` -> calendar).
- Timeline: same filter as mobile; `deco(m)`: `cols = large 6 / medium 3 / compact 2` (of a 6-column grid), `dir = large ? row : column`, `imgW = large ? 60% : 100%`, `imgH = large 380px / medium 220px / compact 150px`, `pad = large ? '28px 28px 28px 14px' : '14px 16px 18px'`, `titleSize = large 40px / medium 26px / compact 20px`. `months = ['September','August','July']` -> `{ label: month + ' 2026', items }` with empty months dropped.
- Detail: `hero = img at 1600x900`; gallery of 7 tiles (`id + 'g1'` 600x600 span 2 video 0:42, then `g2..g7` 400x400).
- Chat: same 8 base messages (different image sizes; plan item sub is `Japan 2027 · unscheduled`), `id = index`; `sendBg = draft ? accent : var(--surface-2)`, `sendFg = draft ? #faf9f6 : var(--fg3)`; `chatMedia` = 9 thumbs (`sunset, p1..p4, cm1..cm4` at 200x200).
- Calendar month: `days` = 1 blank + 30 days + 4 trailing days (Oct 1-4, `color var(--fg3)`); each day lists `EV.filter(day === n)` as `{ title, dot: dotFor(owner), bg: bgFor(owner) }` where `bgFor`: `c` accent-soft, `h` green-soft, else surface-2. Today = 6.
- Calendar week: `wk = [7..13]` (Mon Sep 7 - Sun Sep 13), `hours` = 13 labels from 7 AM to 7 PM (`fmt(h)`: `((hr+11)%12+1) + ':' + (h%1 ? '30' : '00') + (hr >= 12 ? ' PM' : ' AM')`), row height 56px; timed events get `top = (start - 7) * 56 px`, `h = max(28, len*56 - 4) px`, `time = fmt(start) + ' – ' + fmt(start + len)`; all-day events are excluded from the week columns.
- Composer: `types`, `tools` as mobile; `tray` = 7 lake photos (`lake1..lake7` 300x300), `cover = i === 0`, `uploading = i === 5` (`pct '62%'`, `op .6`), captions on i 0 (`First light from the dock. Cold.`) and 2 (`Gas-station coffee, great`).
- Plan workspace: `plan = PLANS[0]` (Japan). `itin` items get `k = di + '-' + ii`, `dayN`, `date`, `pick -> sel = k`, selected style `border accent / bg accent-soft` else `border / bg`. `sel` = the selected item, with `confLabel = conf || '—'`, `thumbs`, `note = NOTES[title] || 'No notes yet.'`. Ideas, bookings, lists, rings, budget, docs, pins as mobile (`pins` are the Tokyo set only). `newestIdeas = ideas.slice(0, 3)`.

## 8. App-side derivations to replace design quirks

- Countdowns (`in N days`, `N days until ...`, `Day N of 16`, `Home N days`, `in 42 days`) should be computed from the real date rather than stored; the stored strings are the Sep 6, 2026 snapshot.
- `showMonth` should be computed as "first memory of its month in the currently filtered list".
- Plan-opening actions from the calendar, chat and detail screens should carry the right `planId` (`lake`, `japan`, `asheville`).
- The `after`-trip hero and `duringTrip` today card apply to the Japan plan only.
