# Mobile spec B — Plans (list, plan detail, Today mode)

Source of truth: `design/Ours - mobile prototype.dc.html` lines 259–480 (templates) and the `renderVals()` block from line 961 on (logic), plus `design/plans-data.js` (shared placeholder data, exposed as `window.OURS_PLANS`).

Conventions used below:
- "P(seed, w, h)" is the mock image helper: the prototype uses `https://picsum.photos/seed/${seed}/${w}/${h}`; the app must produce the same seed/size through its own mock image helper, never an external URL.
- Every `style=` string is copied verbatim from the prototype. Colors and fonts are CSS custom properties from the foundation (`--bg --surface --surface-2 --fg1 --fg2 --fg3 --border --accent --accent-soft --green --green-soft --plum --ochre --font-serif --font-sans --font-mono --shadow-md`). The literal `#faf9f6` is "paper white" used for text on dark/accent surfaces; `rgba(18,17,16,.5)`/`.55` is a scrim on images.
- Copy with typographic characters (`·`, `–`, `→`, `▾`, `↑`, `✕`, `’`, `¥`) is intentional and must be kept exactly.
- `her` = the partner's name prop (`herName`, default `Yasmim`); `herIni` = `her[0]` (`Y`). Every data field whose value is the literal string `Yasmim` is replaced with `her` at render time (see each section).

---

## 0. Shell context these screens live in

- Phone root: `<div style="height:844px;display:flex;flex-direction:column;background:var(--bg);color:var(--fg1);font-family:var(--font-sans);font-size:15px;line-height:1.5;position:relative;overflow:hidden">` (390×844 frame).
- In-app scroll container (all three Plans screens render inside it): `<div style="flex:1;overflow:auto;padding-top:54px;display:flex;flex-direction:column">`. The 54px top padding is the status-bar area.
- Tab bar (absolute, bottom, 88px tall, z-index 6): `<div style="position:absolute;left:0;right:0;bottom:0;height:88px;padding:8px 8px 30px;display:grid;grid-template-columns:repeat(5,1fr);background:color-mix(in oklab,var(--bg),transparent 12%);backdrop-filter:blur(12px) saturate(1.2);border-top:1px solid var(--border);z-index:6">`. The "Plans" tab button: `<button onClick="{{ goPlans }}" style="border:none;background:transparent;display:flex;flex-direction:column;align-items:center;gap:4px;color:{{ tab.plans }};font-size:10px;cursor:pointer;padding-top:6px">` + 22px lucide "map" svg + text `Plans`. `tab.plans` is `var(--fg1)` when `screen` is `plans`, `plan` or `today`, else `var(--fg3)`.
- Because the scroll container is not positioned, anything `position:absolute` inside the screens (FAB, plan-detail header buttons) is positioned against the phone root.
- Screen routing: state `screen` in `'plans' | 'plan' | 'today'`. `goPlans` = `go('plans')`, and `go(screen)` also resets `sheet:false, ev:null, more:false, planSheet:false`.

### State keys used by Plans (with initial values)

| key | initial | meaning |
|---|---|---|
| `planSeg` | `'overview'` | active segment in Plan detail: `overview \| itinerary \| ideas \| bookings \| lists \| budget \| docs \| map \| locked` |
| `more` | `false` | "More" bottom sheet open |
| `planSheet` | `false` | "New plan" bottom sheet open (from the FAB) |
| `planType` | `'Trip'` | selection inside the New plan sheet (`'Trip' \| 'Event'`) |
| `offline` | `true` | "Available offline" toggle in plan detail header |
| `reveal` | `false` | Locked note revealed |
| `ideaFilter` | `'All'` | Ideas chip filter: `All \| Tokyo \| Kyoto \| Osaka \| Shortlisted \| Decided` |
| `ticks` | `{}` | checklist overrides keyed `"<listIndex>-<itemIndex>"` → boolean |
| `planId` | `'japan'` | which plan the detail screen shows (`japan \| lake \| anniv \| portugal \| asheville`) |
| `form` | `null` | add-item sheets: `null \| 'kinds' \| 'flight' \| 'stay' \| 'paste'` (sheets themselves are specified elsewhere; Plans only opens them) |
| `offlineSim` | `true` | Today mode simulated connectivity (true = offline banner) |
| `mapCity` | `'Tokyo'` | Map segment city chip |
| `pin` | `null` | selected pin index within the current city, or null |

### simulateDate tweak (`sim`)

Prop `simulateDate` (enum) → `sim`:

| prop value | `sim` |
|---|---|
| `Sep 6, 2026 — today` (default) | `'now'` |
| `Apr 9, 2027 — in Tokyo` | `'during'` |
| `Apr 24, 2027 — just home` | `'after'` |

Effects of `sim` (all only touch the `japan` plan):
1. `decoPlan` overrides for `japan`: `status` = `'underway'` (during) / `'done'` (after) / data value (now); `countdown` = `'Day 2 of 15'` (during) / `'Home 2 days'` (after) / data value (`'in 214 days'`).
2. `decoPlan(...).open()` for `japan` while `sim === 'during'` sets `screen:'today'` instead of `'plan'` (still sets `planId`, `planSeg:'overview'`). Every other plan (and japan in other sims) opens `screen:'plan'`.
3. `duringTrip = sim === 'during'` → pins the "Today" card at the top of the Plans list (section 1.2).
4. `afterTrip = sim === 'after' && planId === 'japan'` → shows the post-trip "You're home" banner at the top of Overview (section 2.4.1).
5. `ov` (Overview hero numbers) switches between the "now" set and the "after" set (section 2.4.2).

In the app expose this as a dev tweak (e.g. a settings/context value) with the same three states; default `'now'`.

---

## 1. PLANS LIST (`screen === 'plans'`, binding `isPlans`)

### 1.1 Header
```html
<div style="display:flex;align-items:flex-end;justify-content:space-between;padding:8px 20px 0">
  <div style="font-family:var(--font-serif);font-size:36px;line-height:1">Plans</div>
  <button style="width:40px;height:40px;border-radius:8px;border:none;background:transparent;color:var(--fg2);display:flex;align-items:center;justify-content:center;cursor:pointer">
    <!-- lucide search, 20px, stroke 1.5 --> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
  </button>
</div>
```
Search button has no handler.

### 1.2 Body: `<div style="display:flex;flex-direction:column;gap:24px;padding:20px 20px 110px">`

**Today card (only when `duringTrip`)** — first child, clickable → `openToday` = `setState({screen:'today'})`.
```html
<div onClick=openToday style="border-radius:8px;overflow:hidden;border:1px solid var(--accent);background:var(--surface);cursor:pointer;display:grid;grid-template-columns:1fr 120px">
  <div style="padding:16px;display:flex;flex-direction:column;gap:6px">
    <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)">Today · Day 2 of 15</div>
    <div style="font-family:var(--font-serif);font-size:26px;line-height:1.05">Japan, spring 2027</div>
    <div style="font-size:13px;color:var(--fg2)">Tokyo · Fri Apr 9 · 9:14 AM local</div>
    <div style="font-size:13px;margin-top:6px">Next: Shibuya Sky at 2:00 PM</div>
  </div>
  <img src=P('japan',300,300) style="width:100%;height:100%;object-fit:cover;display:block;filter:sepia(.08) saturate(.88)" alt="">
</div>
```
All four lines of copy are hard-coded.

**Groups** — `planGroups` = `[['Up next','next'],['Dreaming','dream'],['Past','past']]` mapped to `{ label, items: PLANS.filter(p => p.group === g).map(decoPlan) }`. Groups render even when empty (none are empty with the seed data). Each group:
```html
<div style="display:flex;flex-direction:column;gap:12px">
  <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3)">{{ g.label }}</div>
  ...items
</div>
```

`decoPlan(pl)` returns `{ ...pl, small: !pl.large, chips: pl.dest.map(t => ({ t })), open, status, countdown }` (status/countdown per the sim rules above).

**Large card** (when `pl.large`, only `japan`) — `onClick=pl.open`:
```html
<div style="border-radius:8px;overflow:hidden;background:var(--surface);border:1px solid var(--border);cursor:pointer">
  <div style="position:relative;height:200px">
    <img src="{{ pl.cover }}" style="width:100%;height:100%;object-fit:cover;display:block;filter:sepia(.08) saturate(.88)" alt="">
    <div style="position:absolute;top:12px;left:12px;font-family:var(--font-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#faf9f6;background:rgba(18,17,16,.55);padding:4px 8px;border-radius:4px">{{ pl.status }}</div>
    <div style="position:absolute;bottom:12px;right:12px;font-family:var(--font-serif);font-size:20px;color:#faf9f6;background:rgba(18,17,16,.55);padding:4px 10px;border-radius:4px">{{ pl.countdown }}</div>
  </div>
  <div style="padding:16px 16px 18px;display:flex;flex-direction:column;gap:8px">
    <div style="font-family:var(--font-serif);font-size:28px;line-height:1.05">{{ pl.name }}</div>
    <div style="font-family:var(--font-mono);font-size:12px;color:var(--fg2)">{{ pl.dates }}</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <!-- per chip --> <span style="height:26px;padding:0 10px;border-radius:4px;border:1px solid var(--border);display:inline-flex;align-items:center;font-size:12px;color:var(--fg2)">{{ c.t }}</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
      <span style="font-size:12px;color:var(--fg3)">{{ pl.hints }}</span>
      <span style="display:flex">
        <img src=P('caseyav',48,48) style="width:22px;height:22px;border-radius:999px;object-fit:cover;filter:sepia(.2) saturate(.6);border:2px solid var(--surface)" alt="">
        <img src=P('herav',48,48) style="width:22px;height:22px;border-radius:999px;object-fit:cover;filter:sepia(.2) saturate(.6);margin-left:-6px;border:2px solid var(--surface)" alt="">
      </span>
    </div>
  </div>
</div>
```

**Small row** (when `pl.small`) — `onClick=pl.open`:
```html
<div style="display:flex;gap:14px;align-items:center;cursor:pointer;padding:6px 0">
  <img src="{{ pl.cover }}" style="width:64px;height:64px;border-radius:8px;object-fit:cover;flex:none;filter:sepia(.08) saturate(.88)" alt="">
  <div style="flex:1;min-width:0">
    <div style="display:flex;align-items:center;gap:8px">
      <span style="width:6px;height:6px;border-radius:999px;background:{{ pl.color }}"></span>
      <span style="font-family:var(--font-mono);font-size:11px;color:var(--fg3)">{{ pl.dates }}</span>
    </div>
    <div style="font-family:var(--font-serif);font-size:21px;line-height:1.1;margin-top:3px">{{ pl.name }}</div>
    <div style="font-size:12px;color:var(--fg3);margin-top:3px">{{ pl.hints }}</div>
  </div>
  <div style="text-align:right;flex:none">
    <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--fg2);border:1px solid var(--border);padding:3px 6px;border-radius:4px">{{ pl.status }}</div>
    <div style="font-size:12px;color:var(--fg3);margin-top:6px">{{ pl.countdown }}</div>
  </div>
</div>
```
`pl.countdown` may be `''` (portugal, asheville) — the div still renders, empty.

### 1.3 FAB
```html
<button onClick=openPlanSheet style="position:absolute;right:20px;bottom:104px;width:52px;height:52px;border-radius:12px;border:none;background:var(--accent);color:#faf9f6;box-shadow:var(--shadow-md);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:5">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
</button>
```
`openPlanSheet` → `planSheet:true`. The sheet (lines 820–834) shows "New plan", Trip/Event pickers (`pickTrip`/`pickEvent` set `planType`; selected card gets `border:var(--accent);background:var(--accent-soft)`, otherwise `var(--border)`/`transparent`), title input placeholder `What are we calling it?`, dashed chips `Dates, if you know them` / `Where` / `Cover photo`, button `Start planning →` (= `closePlanSheet`), footnote `Nothing else is required. Add the rest as you go.`. Trip card copy: `Trip` / `Days away. Itinerary, bookings, packing.`; Event card: `Event` / `One day. Schedule, guests, shopping.`

---

## 2. PLAN DETAIL (`screen === 'plan'`, binding `isPlan`)

`plan = decoPlan(PLANS.find(p => p.id === planId) || PLANS[0])`. `isEvent = planId === 'anniv'` (the only Event-type plan).

### 2.1 Floating header (over the cover)
```html
<div style="position:absolute;top:0;left:0;right:0;height:54px;z-index:3;display:flex;align-items:flex-end;padding:0 12px 6px;justify-content:space-between">
  <button onClick=goPlans style="width:36px;height:36px;border-radius:8px;border:none;background:rgba(18,17,16,.5);color:#faf9f6;display:flex;align-items:center;justify-content:center;cursor:pointer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"></path></svg></button>
  <button style="...same button styles..."><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg></button>
</div>
```
The "more" (three dots) button has no handler. Positioned against the phone root, so it sits in the status-bar band over the cover image.

### 2.2 Cover + title block
Wrapper: `<div style="margin-top:-54px;padding-bottom:110px">` (pulls the cover up under the status bar).
```html
<div style="height:220px;position:relative">
  <img src="{{ plan.cover }}" style="width:100%;height:100%;object-fit:cover;display:block;filter:sepia(.08) saturate(.88)" alt="">
  <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.35),transparent 40%)"></div>
</div>
<div style="padding:18px 20px 0;display:flex;flex-direction:column;gap:10px">
  <div style="display:flex;align-items:center;gap:10px">
    <span style="font-family:var(--font-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg1);border:1px solid var(--border);padding:3px 7px;border-radius:4px">{{ plan.status }}</span>
    <span style="font-family:var(--font-mono);font-size:12px;color:var(--accent)">{{ plan.countdown }}</span>
  </div>
  <div style="font-family:var(--font-serif);font-size:36px;line-height:1">{{ plan.name }}</div>
  <div style="display:flex;justify-content:space-between;align-items:center">
    <div style="font-family:var(--font-mono);font-size:12px;color:var(--fg2)">{{ plan.dates }}</div>
    <span style="display:flex"> (two 22px avatars as in 1.2 but border:2px solid var(--bg)) </span>
  </div>
  <div style="display:flex;gap:6px;flex-wrap:wrap"> chips from plan.chips, same chip style as 1.2 </div>
  <div onClick=toggleOffline style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-radius:8px;background:var(--surface);border:1px solid var(--border);cursor:pointer">
    <div style="font-size:13px">Available offline<span style="color:var(--fg3)"> · {{ offlineNote }}</span></div>
    <span style="width:36px;height:22px;border-radius:999px;background:{{ offBg }};position:relative;flex:none"><span style="position:absolute;top:3px;left:{{ offKnob }};width:16px;height:16px;border-radius:999px;background:#faf9f6;transition:left 150ms"></span></span>
  </div>
</div>
```
Offline toggle bindings: `offBg = offline ? 'var(--accent)' : 'var(--surface-2)'`, `offKnob = offline ? '17px' : '3px'`, `offlineNote = offline ? 'saved 2h ago' : 'off'`, `toggleOffline` flips `offline`.

### 2.3 Segment bar
```html
<div style="display:flex;gap:4px;padding:18px 20px 0;overflow-x:auto;border-bottom:1px solid var(--border)">
  <!-- per seg --> <button onClick=sg.pick style="flex:none;height:38px;padding:0 12px;border:none;border-bottom:2px solid {{ sg.edge }};background:transparent;color:{{ sg.color }};font-size:14px;font-weight:500;cursor:pointer;white-space:nowrap;margin-bottom:-1px">{{ sg.label }}</button>
</div>
```
`segDefs`:
- Trip: `[['Overview','overview'],['Itinerary','itinerary'],['Ideas','ideas'],['Bookings','bookings'],['More','more']]`
- Event: `[['Overview','overview'],['Schedule','itinerary'],['Guests','lists'],['Bookings','bookings'],['More','more']]`

`moreKeys`: Trip `['lists','budget','docs','map','locked']`; Event `['budget','docs','map','locked']`.

Per seg: `on = planSeg === key || (key === 'more' && moreKeys.includes(planSeg))`; `edge = on ? 'var(--accent)' : 'transparent'`; `color = on ? 'var(--fg1)' : 'var(--fg2)'`; `label` = for the `more` key while a moreKeys segment is active, `({lists:'Checklists',budget:'Budget',docs:'Documents',map:'Map',locked:'Locked note'})[planSeg] + ' ▾'`, else the def label. `pick`: `more` → `setState({more:true})`; others → `setState({planSeg:key})`.

**More sheet** (`moreOpen`, template lines 710–716): scrim `<div onClick=closeMore style="position:absolute;inset:0;background:rgba(0,0,0,.6);z-index:20">` + `<div style="position:absolute;left:0;right:0;bottom:0;z-index:21;background:var(--bg);border-radius:12px 12px 0 0;padding:12px 20px 40px;display:flex;flex-direction:column;gap:4px;border-top:1px solid var(--border)">` with handle `<div style="width:36px;height:4px;border-radius:999px;background:var(--border);margin:0 auto 12px">` and one button per `moreItems`: `<button onClick=mi.pick style="height:52px;border:none;border-top:1px solid var(--border);background:transparent;color:var(--fg1);font-size:16px;text-align:left;cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:0"><span>{{ mi.label }}</span><span style="font-family:var(--font-mono);font-size:11px;color:var(--fg3)">{{ mi.meta }}</span></button>`.
`moreItems` is a fixed list regardless of plan type: `[['Checklists','lists','3 / 18'],['Budget','budget','$3,860 paid'],['Documents','docs','4 files'],['Map','map','9 pins'],['Locked note','locked','']]`; `pick` → `setState({planSeg:key, more:false})`.

### 2.4 Overview (`segOverview`, `planSeg === 'overview'`)
Container: `<div style="padding:20px;display:flex;flex-direction:column;gap:20px">`

#### 2.4.1 Post-trip banner (only `afterTrip`)
```html
<div style="border-radius:8px;border:1px solid var(--accent);background:var(--accent-soft);padding:16px;display:flex;flex-direction:column;gap:10px">
  <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)">You're home</div>
  <div style="font-family:var(--font-serif);font-size:26px;line-height:1.1">Turn this trip into a memory</div>
  <div style="font-size:13px;color:var(--fg2);line-height:1.5">It'll start you off with a heading per day (15), the day's items as a list, and the 212 photos taken Apr 8 – 22 ready to pick from.</div>
  <div style="display:flex;gap:4px">
    <img src=P('jp1',120,120) style="width:44px;height:44px;border-radius:4px;object-fit:cover;filter:sepia(.08) saturate(.88)" alt=""> (same for jp2, jp3)
    <span style="width:44px;height:44px;border-radius:4px;background:var(--surface-2);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:11px;color:var(--fg2)">+209</span>
  </div>
  <button onClick=openComposerFromPlan style="height:44px;border-radius:8px;border:none;background:var(--accent);color:#faf9f6;font-weight:500;font-size:14px;cursor:pointer">Start the memory →</button>
</div>
```
`openComposerFromPlan` → `setState({screen:'composer', fromPlan:true, cTitle:'Two weeks in Japan', cType:'Trip'})` (composer is specified elsewhere).

#### 2.4.2 Big number + Next up card
```html
<div style="display:flex;align-items:baseline;gap:12px"><span style="font-family:var(--font-serif);font-size:64px;line-height:1">{{ ov.num }}</span><span style="font-size:15px;color:var(--fg2)">{{ ov.line }}</span></div>
<div style="border-radius:8px;border:1px solid var(--border);background:var(--surface);padding:14px 16px;display:flex;flex-direction:column;gap:6px">
  <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3)">Next up · {{ ov.kind }}</div>
  <div style="font-family:var(--font-serif);font-size:24px;line-height:1.1">{{ ov.title }}</div>
  <div style="font-size:13px;color:var(--fg2)">{{ ov.sub }}</div>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px"><span style="font-family:var(--font-mono);font-size:16px;letter-spacing:.12em">{{ ov.conf }}</span><span style="font-size:12px;color:var(--fg3)">tap to copy</span></div>
</div>
```
`ov` values:
| case | num | line | kind | title | sub | conf |
|---|---|---|---|---|---|---|
| `isEvent` | `41` | `days until the weekend` | `reservation` | `Dinner at Nonna’s · table for 8` | `Sat Oct 17 · 6:30 PM · the back room` | `NONNA-1017` |
| `sim === 'after'` | `15` | `days, 3 cities, 212 photos` | `last` | `JL 6 · HND → JFK` | `Thu Apr 22 · landed 4:40 PM` | `Q7XR4M` |
| otherwise | `214` | `days until we land in Tokyo` | `flight` | `JL 5 · JFK → HND` | `Thu Apr 8 · 12:55 PM · Terminal 1` | `Q7XR4M` |

Note the prototype uses the same non-event `ov` for lake/portugal/asheville; "tap to copy" has no handler in the prototype (copying the confirmation to the clipboard is the intended behaviour).

#### 2.4.3 Flights / Stays tiles (both `onClick=segToBookings` → `planSeg:'bookings'`)
```html
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
  <div style="padding:12px 14px;border-radius:8px;border:1px solid var(--border);cursor:pointer"><div style="font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3)">Flights</div><div style="font-size:15px;margin-top:4px">2 booked</div></div>
  <div ...same...><div ...>Stays</div><div style="font-size:15px;margin-top:4px">2 of 3 booked</div></div>
</div>
```

#### 2.4.4 Budget strip (`onClick=segToBudget` → `planSeg:'budget'`)
```html
<div style="cursor:pointer">
  <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--fg2)"><span>Budget</span><span style="font-family:var(--font-mono);font-size:12px">$3,860 paid · $5,120 committed · $9,400 planned</span></div>
  <div style="height:6px;border-radius:3px;background:var(--surface-2);margin-top:8px;position:relative;overflow:hidden">
    <div style="position:absolute;left:0;top:0;bottom:0;width:54%;background:var(--accent-soft)"></div>   <!-- committed / planned -->
    <div style="position:absolute;left:0;top:0;bottom:0;width:41%;background:var(--accent)"></div>        <!-- paid / planned -->
  </div>
</div>
```
Hard-coded, but derived from BUDGET (5120/9400 = 54%, 3860/9400 = 41%).

#### 2.4.5 Checklist rings (`rings`, each `onClick=segToLists` → `planSeg:'lists'`)
```html
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
  <div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px 8px;border-radius:8px;border:1px solid var(--border);cursor:pointer;text-align:center">
    <span style="width:44px;height:44px;border-radius:999px;background:conic-gradient(var(--accent) {{ r.pct }}, var(--surface-2) 0);display:flex;align-items:center;justify-content:center">
      <span style="width:34px;height:34px;border-radius:999px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:10px">{{ r.n }}</span>
    </span>
    <span style="font-size:11px;color:var(--fg2);line-height:1.3">{{ r.name }}</span>
  </div>
</div>
```
`rings = lists.map(l => ({ name: l.name.replace('Yasmim', her), n: l.done + '/' + l.total, pct: Math.round(l.done / l.total * 100) + '%' }))` — derived from the live `lists` (section 2.8) so ticking updates the rings. For an Event the rings are the two GUESTS lists (Guests, Shopping).

#### 2.4.6 Newest ideas
```html
<div>
  <div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3)">Newest ideas</span><a onClick=segToIdeas style="font-size:12px;cursor:pointer">All 12 →</a></div>
  <div style="display:flex;flex-direction:column;margin-top:8px">
    <!-- per idea in newestIdeas = ideasAll.slice(0,3) (unfiltered) -->
    <div style="display:flex;gap:12px;align-items:center;padding:10px 0;border-top:1px solid var(--border)">
      <img src="{{ i.img }}" style="width:44px;height:44px;border-radius:6px;object-fit:cover;filter:sepia(.08) saturate(.88)" alt="">
      <div style="flex:1;min-width:0"><div style="font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ i.title }}</div><div style="font-size:12px;color:var(--fg3)">{{ i.city }} · added by {{ i.by }}</div></div>
    </div>
  </div>
</div>
```
`<a>` inherits the global `a{color:#c84b31}` i.e. accent. `segToIdeas` → `planSeg:'ideas'` (for an Event there is no Ideas tab, but the link still switches to that segment).

#### 2.4.7 Locked note teaser (`onClick=segToLocked` → `planSeg:'locked'`)
```html
<div style="position:relative;border-radius:8px;border:1px solid var(--border);background:var(--surface);padding:14px 16px;overflow:hidden;cursor:pointer">
  <div style="filter:blur(5px);font-family:var(--font-mono);font-size:12px;color:var(--fg2);line-height:1.6;user-select:none">Passport C · 5X8 221 904 · exp 2031<br>Passport Y · 7K1 088 435 · exp 2029<br>Embassy +81 3-3224-5000</div>
  <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;color:var(--fg1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>Locked note · tap to reveal</div>
</div>
```

### 2.5 Itinerary / Schedule (`segItinerary`, `planSeg === 'itinerary'`)
Container `<div style="padding:20px 20px 0;display:flex;flex-direction:column;gap:20px">`.

Data: `itin = (isEvent ? EVENT_DAYS : DAYS).map(dy => ({ ...dy, empty: !dy.items.length, items: dy.items.map(it => ({ ...it, by: it.by === 'Yasmim' ? her : it.by, docsLabel: it.docs ? it.docs + ' file' + (it.docs > 1 ? 's' : '') : '' })) }))`.
`unsched = (isEvent ? [{ kind:'activity', title:'Drive up the parkway if it’s clear', place:'Sunday', by:'Casey' }] : UNSCHEDULED).map(by-substitution)`; `unschedN = unsched.length`.

**Unscheduled tray**
```html
<div style="border-radius:8px;border:1px dashed var(--border);padding:12px 14px;display:flex;flex-direction:column;gap:8px">
  <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3)">Unscheduled · {{ unschedN }} · drag onto a day</div>
  <!-- per u --> <div style="display:flex;gap:10px;align-items:center;font-size:14px"><span style="font-family:var(--font-mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--fg3);border:1px solid var(--border);padding:2px 5px;border-radius:3px">{{ u.kind }}</span><span style="flex:1">{{ u.title }}</span><span style="font-size:12px;color:var(--fg3)">{{ u.place }}</span></div>
</div>
```

**Day block** (per `dy`) `<div style="display:flex;flex-direction:column;gap:10px">`:
```html
<div style="display:flex;align-items:baseline;gap:10px;position:sticky;top:0;background:var(--bg);padding:6px 0;z-index:2">
  <span style="font-family:var(--font-serif);font-size:30px;line-height:1">Day {{ dy.n }}</span>
  <span style="font-family:var(--font-mono);font-size:12px;color:var(--fg2)">{{ dy.dow }} {{ dy.date }}</span>
  <span style="flex:1"></span>
  <span style="font-size:12px;color:var(--fg3)">{{ dy.city }}</span>
</div>
<!-- per item -->
<div style="display:grid;grid-template-columns:64px 1fr;gap:12px;padding:12px 14px;border-radius:8px;border:1px solid var(--border);background:var(--surface);cursor:grab">
  <div><div style="font-family:var(--font-mono);font-size:12px;line-height:1.2">{{ it.time }}</div><div style="font-family:var(--font-mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--fg3);margin-top:6px">{{ it.kind }}</div></div>
  <div style="min-width:0;display:flex;flex-direction:column;gap:3px">
    <div style="font-size:15px;font-weight:500;display:flex;align-items:center;gap:8px">{{ it.title }}<!-- if it.booked --><span style="font-family:var(--font-mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--green);border:1px solid var(--green);padding:1px 5px;border-radius:3px">booked</span></div>
    <div style="font-size:13px;color:var(--fg2)">{{ it.place }}</div>
    <div style="display:flex;gap:10px;font-size:12px;color:var(--fg3);font-family:var(--font-mono)"><span>{{ it.cost }}</span><span>{{ it.docsLabel }}</span><span style="margin-left:auto">{{ it.by }}</span></div>
  </div>
</div>
<!-- if dy.empty -->
<div style="padding:14px;font-size:14px;color:var(--fg3);font-family:var(--font-serif);font-style:italic;font-size:17px">Nothing yet. A free day is allowed.</div>   <!-- the later font-size:17px wins -->
<button onClick=openKinds style="height:36px;border-radius:8px;border:1px dashed var(--border);background:transparent;color:var(--fg2);font-size:13px;cursor:pointer">+ Add to day {{ dy.n }}</button>
```
`openKinds` → `form:'kinds'` (kind-picker sheet, heading hard-coded `Add to day 1`; its buttons set `form` to `'flight'`, `'stay'` or `null`; "Paste a confirmation instead" → `form:'paste'`; all forms close via `closeForms` → `form:null`). Sticky day headers stick inside the scroll container. Drag/drop is copy-only in the prototype (`cursor:grab`, "drag onto a day").

### 2.6 Ideas (`segIdeas`, Trip only)
Container `<div style="padding:16px 20px 0;display:flex;flex-direction:column;gap:14px">`.

Filters `ideaFilters` = `['All','Tokyo','Kyoto','Osaka','Shortlisted','Decided']` → `{ label, pick: () => setState({ideaFilter:f}), bg: sel ? 'var(--fg1)' : 'transparent', color: sel ? 'var(--bg)' : 'var(--fg2)', border: sel ? 'var(--fg1)' : 'var(--border)' }`.
```html
<div style="display:flex;gap:6px;overflow-x:auto"><button onClick=f.pick style="flex:none;height:30px;padding:0 12px;border-radius:4px;border:1px solid {{ f.border }};background:{{ f.bg }};color:{{ f.color }};font-size:13px;cursor:pointer;white-space:nowrap">{{ f.label }}</button>...</div>
```
Data: `vote(v) = like→'↑', meh→'~', else '✕'`; `stColor(st) = decided→'var(--green)', shortlisted→'var(--accent)', else 'var(--fg3)'`.
`ideasAll = IDEAS.map(i => ({ ...i, by: her-substitution, cv: 'C' + vote(i.c), hv: herIni + vote(i.h), stColor: stColor(i.status) }))`.
`ideas = ideasAll.filter(i => ideaFilter === 'All' || i.city === ideaFilter || i.status === ideaFilter.toLowerCase())`.

Grid `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">`, card:
```html
<div style="border-radius:8px;overflow:hidden;border:1px solid var(--border);background:var(--surface);display:flex;flex-direction:column">
  <img src="{{ i.img }}" style="width:100%;height:100px;object-fit:cover;display:block;filter:sepia(.08) saturate(.88)" alt="">
  <div style="padding:10px 12px 12px;display:flex;flex-direction:column;gap:6px;flex:1">
    <div style="font-size:14px;line-height:1.3;font-weight:500">{{ i.title }}</div>
    <div style="font-size:11px;color:var(--fg3)">{{ i.city }} · {{ i.by }}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto">
      <span style="display:flex;gap:4px">
        <span style="width:22px;height:22px;border-radius:999px;background:var(--accent-soft);color:var(--accent);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:9px" title="Casey">{{ i.cv }}</span>
        <span style="width:22px;height:22px;border-radius:999px;background:var(--green-soft);color:var(--green);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:9px">{{ i.hv }}</span>
      </span>
      <span style="font-family:var(--font-mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:{{ i.stColor }};border:1px solid {{ i.stColor }};padding:2px 5px;border-radius:3px">{{ i.status }}</span>
    </div>
  </div>
</div>
```
Footer: `<div style="font-size:12px;color:var(--fg3);line-height:1.5">Votes: C = Casey, Y = {{ her }} · ↑ like, ~ meh, ✕ no. Long-press a card for "Put it on a day".</div>` (straight double quotes as written; "Y" is literal, not `herIni`).

### 2.7 Bookings (`segBookings`)
Container `<div style="padding:20px 20px 0;display:flex;flex-direction:column;gap:20px">`. Data: `bookings = BOOKINGS.map(b => ({ ...b, isRoute: b.kind === 'flight' || b.kind === 'train', isStay: b.kind === 'stay', isTicket: b.kind === 'ticket', thumbs: Array.from({length:b.docs}, () => ({})) }))` — same list for every plan, including the event.

Per booking:
```html
<div style="display:flex;flex-direction:column;gap:8px">
  <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3)">{{ b.group }}</div>
  <div style="border-radius:8px;border:1px solid var(--border);background:var(--surface);padding:16px;display:flex;flex-direction:column;gap:12px">
    <div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-size:16px;font-weight:500">{{ b.title }}</span><span style="font-size:12px;color:var(--fg3)">{{ b.sub }}</span></div>
    <!-- isRoute -->
    <div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px">
      <div><div style="font-family:var(--font-serif);font-size:34px;line-height:1">{{ b.a }}</div><div style="font-size:12px;color:var(--fg2);margin-top:4px">{{ b.dep }}</div></div>
      <span style="color:var(--fg3)">→</span>
      <div style="text-align:right"><div style="font-family:var(--font-serif);font-size:34px;line-height:1">{{ b.b }}</div><div style="font-size:12px;color:var(--fg2);margin-top:4px">{{ b.arr }}</div></div>
    </div>
    <!-- isStay -->
    <div style="font-size:13px;color:var(--fg2)">{{ b.addr }}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px"><div>{{ b.dep }}</div><div>{{ b.arr }}</div></div>
    <!-- isTicket -->
    <div style="font-size:13px;color:var(--fg2)">{{ b.dep }} · {{ b.a }}</div>
    <!-- always -->
    <div style="font-size:13px;color:var(--fg2)">{{ b.seats }}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid var(--border)">
      <div><div style="font-family:var(--font-mono);font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3)">Confirmation</div><div style="font-family:var(--font-mono);font-size:20px;letter-spacing:.14em;margin-top:2px">{{ b.conf }}</div></div>
      <div style="display:flex;gap:6px;align-items:center">
        <!-- per thumb --> <span style="width:28px;height:36px;border-radius:3px;background:var(--surface-2);border:1px solid var(--border);display:inline-flex;align-items:flex-end;justify-content:center;font-family:var(--font-mono);font-size:8px;color:var(--fg3);padding-bottom:2px">PDF</span>
        <button style="height:32px;padding:0 10px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--fg1);font-size:12px;cursor:pointer;white-space:nowrap">Open in Maps</button>
      </div>
    </div>
  </div>
</div>
```
"Open in Maps" has no handler.

### 2.8 Checklists / Guests (`segLists`, `planSeg === 'lists'`)
Container `<div style="padding:20px 20px 0;display:flex;flex-direction:column;gap:24px">`.
Data: `lists = (isEvent ? GUESTS : LISTS).map((l, li) => { items = l.items.map((it, ii) => { k = li+'-'+ii; done = ticks[k] ?? it.done; return { ...it, done, toggle: () => setState({ticks: {...ticks, [k]: !done}}), border: done?'var(--accent)':'var(--border)', bg: done?'var(--accent)':'transparent', color: done?'var(--fg3)':'var(--fg1)', deco: done?'line-through':'none', whoBg: it.who==='C'?'var(--accent-soft)':'var(--green-soft)', whoFg: it.who==='C'?'var(--accent)':'var(--green)', who: it.who==='Y'?herIni:'C' } }); extra = items.filter(done).length - l.items.filter(done).length; done = l.done + extra; return { ...l, items, done, pct: Math.round(done/l.total*100)+'%' } })`.
Note `l.done`/`l.total` count the whole list (e.g. 3/7) while `items` is only a sample; ticking adjusts `done` by the delta. `ticks` is keyed by index so it is shared between Trip lists and Event guests (prototype quirk; key by plan+list in the app if convenient).

Per list:
```html
<div style="display:flex;flex-direction:column;gap:6px">
  <div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-family:var(--font-serif);font-size:22px">{{ l.name }}</span><span style="font-family:var(--font-mono);font-size:11px;color:var(--fg3);white-space:nowrap;flex:none">{{ l.done }} / {{ l.total }}</span></div>
  <div style="height:3px;border-radius:2px;background:var(--surface-2);overflow:hidden"><div style="height:100%;width:{{ l.pct }};background:var(--accent)"></div></div>
  <!-- per item -->
  <div onClick=li.toggle style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);cursor:pointer">
    <span style="width:20px;height:20px;border-radius:4px;border:1px solid {{ li.border }};background:{{ li.bg }};display:inline-flex;align-items:center;justify-content:center;color:#faf9f6;flex:none"><!-- if done --><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg></span>
    <span style="flex:1;font-size:14px;color:{{ li.color }};text-decoration:{{ li.deco }}">{{ li.t }}</span>
    <span style="font-family:var(--font-mono);font-size:11px;color:var(--fg3)">{{ li.due }}</span>
    <span style="width:20px;height:20px;border-radius:999px;background:{{ li.whoBg }};color:{{ li.whoFg }};display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:9px">{{ li.who }}</span>
  </div>
</div>
```
Footer: `<div style="font-size:12px;color:var(--fg3)">Drag the handle to reorder. Ticking shows who ticked and when.</div>`. The list name `Packing (Yasmim)` is shown as-is here (only the Overview rings substitute `her`). For guests, `due` carries the RSVP word (`yes` / `asked`).

### 2.9 Budget (`segBudget`)
Container `<div style="padding:20px 20px 0;display:flex;flex-direction:column;gap:24px">`.
`budgetTotals = [{l:'Planned', usd:B.planned, jpy:B.plannedJpy}, {l:'Committed', usd:B.committed, jpy:B.committedJpy}, {l:'Paid', usd:B.paid, jpy:B.paidJpy}]`; `budgetRows = B.rows.map(([k,v,pct]) => ({k, v, pct: pct+'%'}))`.
```html
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
  <div style="padding:12px;border-radius:8px;border:1px solid var(--border);background:var(--surface)"><div style="font-family:var(--font-mono);font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3)">{{ t.l }}</div><div style="font-family:var(--font-serif);font-size:24px;line-height:1.1;margin-top:6px">{{ t.usd }}</div><div style="font-family:var(--font-mono);font-size:11px;color:var(--fg3);margin-top:2px">{{ t.jpy }}</div></div>
</div>
<div style="display:flex;flex-direction:column">
  <div style="display:grid;grid-template-columns:90px 1fr auto;gap:12px;align-items:center;padding:10px 0;border-top:1px solid var(--border);font-size:14px"><span>{{ r.k }}</span><div style="height:4px;border-radius:2px;background:var(--surface-2);overflow:hidden"><div style="height:100%;width:{{ r.pct }};background:var(--accent)"></div></div><span style="font-family:var(--font-mono);font-size:12px">{{ r.v }}</span></div>
</div>
<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:8px;border:1px solid var(--border)">
  <div><div style="font-size:14px">1 USD = <input value="148.2" style="width:64px;border:none;border-bottom:1px solid var(--border);background:transparent;font-family:var(--font-mono);font-size:14px;color:var(--fg1);padding:2px 0;border-radius:0"> JPY</div><div style="font-size:12px;color:var(--fg3);margin-top:2px">set by you on Sep 6</div></div>
  <a style="font-size:13px">Use today's rate</a>
</div>
```
Rate input value is `B.rate` (`148.2`), uncontrolled in the prototype; "Use today's rate" has no handler. The event plan shows the same Japan budget (no event budget data exists).

### 2.10 Documents (`segDocs`)
`docs = DOCS` verbatim. Container `<div style="padding:20px 20px 0;display:grid;grid-template-columns:1fr 1fr;gap:12px">`, per doc:
```html
<div style="display:flex;flex-direction:column;gap:8px">
  <div style="position:relative;aspect-ratio:3/4;border-radius:6px;background:var(--surface);border:1px solid var(--border);padding:14px;display:flex;flex-direction:column;gap:6px">
    <span style="height:6px;width:70%;background:var(--surface-2);border-radius:2px"></span>
    <span style="height:4px;width:90%;background:var(--surface-2);border-radius:2px"></span>
    <span style="height:4px;width:80%;background:var(--surface-2);border-radius:2px"></span>
    <span style="height:4px;width:60%;background:var(--surface-2);border-radius:2px"></span>
    <span style="position:absolute;right:8px;bottom:8px;font-family:var(--font-mono);font-size:10px;color:var(--fg2);background:var(--bg);border:1px solid var(--border);padding:2px 6px;border-radius:3px">{{ dc.pages }}</span>
  </div>
  <div style="font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ dc.name }}</div>
  <div style="font-size:11px;color:var(--fg3);margin-top:-6px">{{ dc.of }}</div>
</div>
```
`dc.pages` renders as the bare number (`2`, `1`, `1`, `3`).

### 2.11 Map (`segMap`)
Container `<div style="padding:16px 20px 0;display:flex;flex-direction:column;gap:12px">`.
`mapCities = ['Tokyo','Kyoto','Osaka'].map(c => ({ label:c, pick: () => setState({mapCity:c, pin:null}), bg/color/border selected-chip pattern as in Ideas }))`.
`kindColor(k) = { food:'var(--accent)', activity:'var(--green)', stay:'var(--plum)', ticket:'var(--ochre)', transport:'var(--fg2)', flight:'var(--fg2)' }[k] || 'var(--fg2)'`.
`PINS` (per city, tuples `[kind, title, place, when, x%, y%]`):
- Tokyo: `['stay','Hotel Niwa','Chiyoda','Day 1',46,38]`, `['food','Ichiran ramen','Shibuya','Day 1',24,62]`, `['ticket','teamLab Planets','Toyosu','Day 2',72,74]`, `['activity','Meiji Jingu','Shibuya','Day 2',20,44]`, `['ticket','Shibuya Sky','Scramble Square','Day 2',28,58]`, `['transport','Haneda Airport','Ota','Day 1',66,88]`
- Kyoto: `['stay','Yoshikawa Inn','Nakagyo','Days 6–9',48,50]`, `['activity','Fushimi Inari','Fushimi','unscheduled',60,82]`, `['food','Nishiki market','Nakagyo','unscheduled',44,46]`
- Osaka: `['food','Dotonbori','Namba','idea',50,60]`

`pins = PINS[mapCity].map(([kind,title,place,when,x,y], i) => ({ kind, title, place, when, x: x+'%', y: y+'%', color: kindColor(kind), size: pin === i ? '22px' : '16px', pick: () => setState({pin: pin === i ? null : i}) }))`; `pin = pins[state.pin] || {}`; `pinOpen = state.pin !== null && !!pins[state.pin]`.
```html
<div style="display:flex;gap:6px;overflow-x:auto"><button onClick=c.pick style="flex:none;height:30px;padding:0 12px;border-radius:4px;border:1px solid {{ c.border }};background:{{ c.bg }};color:{{ c.color }};font-size:13px;cursor:pointer">{{ c.label }}</button></div>
<div style="position:relative;height:380px;border-radius:8px;overflow:hidden;background:var(--surface);border:1px solid var(--border)">
  <div style="position:absolute;inset:0;background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:48px 48px;opacity:.5"></div>
  <div style="position:absolute;left:0;right:0;top:44%;height:26px;background:var(--surface-2);transform:rotate(-8deg);opacity:.9"></div>
  <div style="position:absolute;top:0;bottom:0;left:62%;width:18px;background:var(--surface-2);transform:rotate(12deg)"></div>
  <div style="position:absolute;left:12px;bottom:10px;font-family:var(--font-mono);font-size:10px;color:var(--fg3)">{{ mapCity }} · muted tiles · placeholder</div>
  <!-- per pin -->
  <button onClick=pn.pick style="position:absolute;left:{{ pn.x }};top:{{ pn.y }};transform:translate(-50%,-100%);width:{{ pn.size }};height:{{ pn.size }};border-radius:999px 999px 999px 0;background:{{ pn.color }};border:2px solid var(--bg);cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.2);transition:width 150ms,height 150ms"></button>
  <!-- if pinOpen -->
  <div style="position:absolute;left:12px;right:12px;bottom:32px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:12px 14px;display:flex;gap:12px;align-items:center;box-shadow:var(--shadow-md)">
    <div style="flex:1;min-width:0">
      <div style="display:flex;gap:8px;align-items:center"><span style="width:8px;height:8px;border-radius:999px;background:{{ pin.color }}"></span><span style="font-family:var(--font-mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--fg3)">{{ pin.kind }} · {{ pin.when }}</span></div>
      <div style="font-family:var(--font-serif);font-size:19px;line-height:1.1;margin-top:3px">{{ pin.title }}</div>
      <div style="font-size:12px;color:var(--fg2)">{{ pin.place }}</div>
    </div>
    <button style="height:32px;padding:0 10px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--fg1);font-size:12px;cursor:pointer;white-space:nowrap">Directions</button>
  </div>
</div>
<div style="display:flex;gap:12px;flex-wrap:wrap;font-size:11px;color:var(--fg3);font-family:var(--font-mono)">
  <!-- legend: dot 7px + word; dots: accent food, green activity, plum stay, ochre ticket, fg2 transport -->
  <span style="display:flex;align-items:center;gap:5px"><span style="width:7px;height:7px;border-radius:999px;background:var(--accent)"></span>food</span> ... activity / stay / ticket / transport
</div>
<div style="font-size:12px;color:var(--fg3)">Map view is an opt-in switch in Us → Preferences (off by default). Tap a pin for its card.</div>
```

### 2.12 Locked note (`segLocked`)
`lockBlur = reveal ? '0px' : '6px'`, `lockHidden = !reveal`, `toggleReveal` flips `reveal`.
```html
<div style="padding:20px;display:flex;flex-direction:column;gap:14px">
  <div onClick=toggleReveal style="position:relative;border-radius:8px;border:1px solid var(--border);background:var(--surface);padding:18px;cursor:pointer;overflow:hidden">
    <div style="filter:blur({{ lockBlur }});font-family:var(--font-mono);font-size:13px;color:var(--fg1);line-height:1.8;transition:filter 200ms;user-select:none">Casey · passport 5X8 221 904 · exp Mar 2031<br>{{ her }} · passport 7K1 088 435 · exp Nov 2029<br>US Embassy Tokyo · +81 3-3224-5000<br>Travel insurance · Allianz · pol. 88-2140-77<br>Yasmim's mom · +1 (704) 555-0188</div>
    <!-- if lockHidden -->
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>Tap to reveal</div>
  </div>
  <div style="font-size:12px;color:var(--fg3);line-height:1.5">Hidden from offline copies and exports. Re-locks after 60 seconds.</div>
</div>
```
Only the second line substitutes `her`; the last line is the literal `Yasmim's mom`. The prototype has no 60s timer (tap toggles); the copy promises one, so a 60s auto re-lock is acceptable in the app.

### 2.13 Event-variant summary (`planId === 'anniv'`)
- Segments: `Overview · Schedule · Guests · Bookings · More`; More sheet lists the same five entries (Checklists still routes to `lists`, which shows Guests for the event).
- Schedule = itinerary template bound to `EVENT_DAYS` (one day, `Day 1 · Sat Oct 17 · Brevard, NC`) with the event unscheduled item.
- Guests = checklist template bound to `GUESTS` (`Guests 6 / 8`, `Shopping 1 / 4`); rings on Overview show those two.
- Overview `ov` = the event set (41 / days until the weekend / reservation / Dinner at Nonna’s · table for 8 / NONNA-1017). All other Overview modules (Flights/Stays tiles, Budget strip, Newest ideas, locked note teaser) render unchanged with Japan data.
- No Ideas tab; Bookings, Budget, Documents, Map, Locked note show the Japan data.
- Countdown in header: `in 41 days`; status `booked`; chips `Home`, `Nonna’s`.

---

## 3. TODAY MODE (`screen === 'today'`, binding `isToday`)

Entered via the Today card on Plans (sim during) or by opening the japan plan while `sim === 'during'`. Back button → `goPlans`. `Full plan` → `goPlan` = `setState({screen:'plan', planId:'japan', planSeg:'overview'})`.

```html
<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 12px 0 12px">
  <button onClick=goPlans style="width:36px;height:36px;border-radius:8px;border:none;background:transparent;color:var(--fg2);display:flex;align-items:center;justify-content:center;cursor:pointer"><!-- chevron-left 18px --></button>
  <span style="font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3)">Today · Day 2 of 15</span>
  <button onClick=goPlan style="height:32px;padding:0 10px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--fg2);font-size:12px;cursor:pointer">Full plan</button>
</div>
<div style="padding:8px 20px 0">
  <div style="font-family:var(--font-serif);font-size:40px;line-height:1">Tokyo</div>
  <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:4px"><span style="font-size:14px;color:var(--fg2)">Fri Apr 9</span><span style="font-family:var(--font-mono);font-size:22px">9:14 <span style="font-size:12px;color:var(--fg3)">AM JST · 8:14 PM at home</span></span></div>
</div>
```
Local time is shown large (`9:14`) with the zone and the home-time equivalent small; all values are hard-coded in the prototype.

**Connectivity banner** — `offlineNow = offlineSim`, `onlineNow = !offlineSim`, `toggleNet` flips `offlineSim` (initially true = offline):
```html
<!-- offline -->
<div onClick=toggleNet style="margin:14px 20px 0;padding:8px 12px;border-radius:6px;background:var(--surface);border:1px solid var(--border);font-size:12px;color:var(--fg2);display:flex;justify-content:space-between;cursor:pointer"><span>No connection · showing the copy saved 2h ago</span><span style="color:var(--fg3)">tap to simulate</span></div>
<!-- online -->
<div onClick=toggleNet style="margin:14px 20px 0;padding:8px 12px;border-radius:6px;font-size:12px;color:var(--fg3);display:flex;justify-content:space-between;cursor:pointer"><span>Synced just now</span><span>tap to simulate offline</span></div>
```

**Timeline** — `<div style="padding:16px 20px 110px;display:flex;flex-direction:column">`.
`TODAY` (fixed):
| time | kind | title | place | conf | flags |
|---|---|---|---|---|---|
| `8:30 AM` | food | `Coffee at Onibus` | `Nakameguro` | — | past |
| `11:00 AM` | activity | `Meiji Jingu` | `Shibuya · walk from Harajuku` | — | past |
| `2:00 PM` | ticket | `Shibuya Sky` | `Scramble Square, 14F entrance` | `SS-77120` | next |
| `5:30 PM` | ticket | `teamLab Planets` | `Toyosu · 20 min on the Yurakucho line` | `TLP-40912` | |
| `8:00 PM` | food | `Yakitori under the tracks` | `Yurakucho` | — | |

`todayItems = TODAY.map(t => ({ ...t, hasConf: !!t.conf, noConf: !t.conf, op: t.past ? .45 : 1, dot: t.past ? 'var(--fg3)' : t.next ? 'var(--accent)' : 'var(--bg)', dotBorder: t.past ? 'var(--fg3)' : t.next ? 'var(--accent)' : 'var(--fg3)', timeColor: t.next ? 'var(--accent)' : 'var(--fg2)', size: t.next ? '26px' : '20px' }))`.

Per item:
```html
<div style="display:grid;grid-template-columns:20px 1fr;gap:14px">
  <div style="display:flex;flex-direction:column;align-items:center"><span style="width:10px;height:10px;border-radius:999px;background:{{ t.dot }};border:1px solid {{ t.dotBorder }};margin-top:6px;flex:none"></span><span style="flex:1;width:1px;background:var(--border)"></span></div>
  <div style="padding:0 0 18px;display:flex;flex-direction:column;gap:6px;opacity:{{ t.op }}">
    <div style="display:flex;align-items:baseline;gap:10px"><span style="font-family:var(--font-mono);font-size:12px;color:{{ t.timeColor }}">{{ t.time }}</span><span style="font-family:var(--font-mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--fg3)">{{ t.kind }}</span><!-- if t.next --><span style="font-family:var(--font-mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-left:auto">next · in 4h 46m</span></div>
    <div style="font-family:var(--font-serif);font-size:{{ t.size }};line-height:1.1">{{ t.title }}</div>
    <div style="font-size:13px;color:var(--fg2)">{{ t.place }}</div>
    <!-- if hasConf -->
    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-radius:8px;background:var(--surface);border:1px solid var(--border);margin-top:4px"><div><div style="font-family:var(--font-mono);font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3)">Confirmation</div><div style="font-family:var(--font-mono);font-size:22px;letter-spacing:.16em;margin-top:2px">{{ t.conf }}</div></div><button style="height:36px;padding:0 12px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--fg1);font-size:12px;cursor:pointer;white-space:nowrap">Open in Maps</button></div>
    <!-- if noConf -->
    <button style="align-self:flex-start;height:32px;padding:0 10px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--fg1);font-size:12px;cursor:pointer">Open in Maps</button>
  </div>
</div>
```
Behaviour summary: past items dimmed to 45% with grey filled dots; the next item gets an accent dot, accent time, 26px title and the `next · in 4h 46m` tag; confirmation codes are 22px mono with wide tracking so they can be read at a counter; "Open in Maps" has no handler.

**Tomorrow button** (last child of the timeline column):
```html
<button style="height:48px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--fg1);font-size:15px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:space-between;padding:0 16px"><span>Tomorrow · Sat Apr 10</span><span style="color:var(--fg3);font-size:13px">Nothing planned yet →</span></button>
```
No handler in the prototype (Day 3 in DAYS is empty, matching the copy).

---

## 4. `design/plans-data.js` — every collection and field

Loaded before the DC script; sets `window.OURS_PLANS = { PLANS, DAYS, UNSCHEDULED, IDEAS, BOOKINGS, LISTS, BUDGET, DOCS }`. Image helper `P(seed, w, h)`.

### PLANS (5)
Fields: `id` (string key), `name`, `type` (`'Trip' | 'Event'`), `dates` (display string), `dest` (string[] → chips), `status` (`planning | booked | dreaming | done`), `countdown` (display string, may be `''`), `hints` (display string), `color` (CSS var string for the small-row dot), `cover` (image URL), `group` (`next | dream | past`), `large?` (boolean, only japan).

| id | name | type | dates | dest | status | countdown | hints | color | cover | group | large |
|---|---|---|---|---|---|---|---|---|---|---|---|
| japan | `Japan, spring 2027` | Trip | `Apr 8 – 22, 2027` | Tokyo, Kyoto, Osaka | planning | `in 214 days` | `12 ideas · 4 booked · checklist 3/18` | `var(--accent)` | P(japan,1200,800) | next | true |
| lake | `Lake weekend` | Trip | `Sep 12 – 13, 2026` | Lake Lure | booked | `in 6 days` | `3 ideas · 1 booked · checklist 5/9` | `var(--green)` | P(lake1,600,400) | next | |
| anniv | `Anniversary weekend` | Event | `Oct 17 – 18, 2026` | Home, Nonna’s | booked | `in 41 days` | `2 ideas · 2 booked · guests 6/8` | `var(--plum)` | P(anniv,600,400) | next | |
| portugal | `Portugal, someday` | Trip | `No dates yet` | Lisbon, Porto | dreaming | `` | `7 ideas` | `var(--ochre)` | P(lisbon,600,400) | dream | |
| asheville | `Three days in Asheville` | Trip | `Aug 14 – 17, 2026` | Asheville | done | `` | `Memory published` | `var(--fg3)` | P(asheville,600,400) | past | |

### DAYS (3) — Japan itinerary
Day: `n` (number), `dow`, `date`, `city`, `items[]`. Item: `kind` (`flight | transport | stay | food | ticket | activity`), `time` (string, e.g. `5:10 PM +1`), `title`, `place`, `cost` (display, `$` or `¥`), `booked` (boolean), `conf?` (string, present only when booked), `docs` (number of attached files), `by` (`'Casey' | 'Yasmim'`).

- Day 1 · Thu · Apr 8 · Tokyo: `flight 12:55 PM · JL 5 · JFK → HND · Terminal 1, gate B22 · $1,840 · booked · Q7XR4M · docs 2 · Casey`; `transport 5:10 PM +1 · Monorail to Hamamatsucho · Haneda Airport · ¥500 · not booked · docs 0 · Yasmim`; `stay 6:30 PM · Check in · Hotel Niwa · Chiyoda, Tokyo · $620 · booked · NW-88213 · docs 1 · Casey`; `food 8:00 PM · Ichiran ramen · Shibuya · ¥2,400 · not booked · docs 0 · Yasmim`.
- Day 2 · Fri · Apr 9 · Tokyo: `ticket 5:30 PM · teamLab Planets · Toyosu · $56 · booked · TLP-40912 · docs 1 · Casey`.
- Day 3 · Sat · Apr 10 · Tokyo: no items (renders the "Nothing yet" line).

### UNSCHEDULED (2)
`{ kind, title, place, by }`: `activity · Fushimi Inari at sunrise · Kyoto · Yasmim`; `food · Nishiki market breakfast · Kyoto · Casey`.

### IDEAS (6)
`{ title, city, by, status ('idea' | 'shortlisted' | 'decided'), img, c, h }` where `c`/`h` are Casey's / her vote: `'like' | 'meh' | 'no'`.
1. `Fushimi Inari at sunrise` · Kyoto · Yasmim · shortlisted · P(inari,400,300) · like/like
2. `Ichiran ramen` · Tokyo · Yasmim · decided · P(ramen,400,300) · like/like
3. `Ghibli Museum tickets go on sale on the 10th` · Tokyo · Casey · idea · P(ghibli,400,300) · like/meh
4. `Dotonbori at night` · Osaka · Casey · idea · P(dotonbori,400,300) · meh/like
5. `Nishiki market` · Kyoto · Casey · shortlisted · P(nishiki,400,300) · like/like
6. `Owl café` · Tokyo · Yasmim · idea · P(owl,400,300) · no/meh

### BOOKINGS (4)
`{ group, kind ('flight' | 'stay' | 'train' | 'ticket'), title, a, b, dep, arr, seats, conf, docs, sub, addr? }`.
1. Flights · flight · `Japan Airlines · JL 5` · a `JFK` · b `HND` · dep `Thu Apr 8 · 12:55 PM` · arr `Fri Apr 9 · 4:15 PM` · seats `34A · 34B` · conf `Q7XR4M` · docs 2 · sub `Return JL 6 · Apr 22`
2. Stays · stay · `Yoshikawa Inn` · addr `135 Tominokoji, Nakagyo, Kyoto` · dep `Check in Tue Apr 13 · 3 PM` · arr `Check out Fri Apr 16 · 11 AM` · seats `+81 75-221-5544` · conf `YK-2027-0413` · docs 1 · sub `Ryokan · kaiseki dinner included`
3. Transport · train · `Shinkansen Nozomi 23` · a `Tokyo` · b `Kyoto` · dep `Tue Apr 13 · 9:00 AM` · arr `Tue Apr 13 · 11:15 AM` · seats `Car 7 · 12D, 12E · JR Pass` · conf `—` · docs 0 · sub `Reserve seats at the station`
4. Tickets · ticket · `teamLab Planets` · a `Toyosu` · b `` · dep `Fri Apr 9 · 5:30 PM` · arr `` · seats `2 adults` · conf `TLP-40912` · docs 1 · sub ``

### LISTS (3)
List: `{ name, done, total, items[] }`; item: `{ t, who ('C' | 'Y'), done, due }`.
- `Before we go` 3/7: `Renew Casey’s passport` C done `Oct 1`; `Buy JR Pass vouchers` Y open `Mar 1`; `Ghibli tickets (on sale the 10th)` C open `Mar 10`; `Tell the bank` Y done ``.
- `Packing (Casey)` 0/6: `Onsen-friendly sandals` C; `Camera + 2 batteries` C.
- `Packing (Yasmim)` 0/5: `Walking shoes, the real ones` Y.

### BUDGET
`{ planned:'$9,400', committed:'$5,120', paid:'$3,860', plannedJpy:'¥1,393,000', committedJpy:'¥758,800', paidJpy:'¥572,000', rate:'148.2', rows: [[k, v, pct]] }` with rows `Flights $3,680 39`, `Stays $2,900 31`, `Transport $720 8`, `Food $1,400 15`, `Tickets $700 7`.

### DOCS (4)
`{ name, of, pages }`: `JL5-eticket.pdf` · `JL 5 · JFK → HND` · 2; `yoshikawa-confirmation.pdf` · `Yoshikawa Inn` · 1; `teamlab-qr.png` · `teamLab Planets` · 1; `hotel-niwa.pdf` · `Hotel Niwa` · 3.

### Inline (script-only) collections
- `EVENT_DAYS` (Anniversary schedule): one day `{ n:1, dow:'Sat', date:'Oct 17', city:'Brevard, NC' }` with items `stay 3:00 PM · Check in · The Inn at Brevard · Brevard, NC · $340 · booked · IB-5521 · docs 1 · Casey`; `food 6:30 PM · Dinner at Nonna’s · The back room · 8 people · $480 · booked · NONNA-1017 · docs 0 · Yasmim`; `activity 9:00 PM · Rooftop, same as year one · Downtown · cost '' · not booked · docs 0 · Casey`.
- `GUESTS`: `Guests` 6/8 — `Rosa & Miguel` Y done `yes`; `Casey’s parents` C done `yes`; `Dev` C open `asked`; `Priya` Y open `asked`. `Shopping` 1/4 — `Flowers for the table` Y open `Oct 16`; `The good candles` C done ``.
- `PINS`, `TODAY`: see 2.11 and 3.
- `PLAN_BARS` (Calendar, not Plans UI): `{ 12: { bg:'var(--green)', label:'Lake weekend', l:'2px', r:'-2px', rad:'3px 0 0 3px' }, 13: { bg:'var(--green)', label:'', l:'-2px', r:'2px', rad:'0 3px 3px 0' } }` draws a green two-day bar across Sep 12–13 in the calendar grid; tapping either day (and the agenda rows for Lake weekend / Japan) does `setState({screen:'plan', planSeg:'overview'})` without changing `planId` (prototype quirk — the app should navigate to the corresponding plan id: `lake` for Sep 12–13, `japan` for the Apr 8 row).

---

## 5. Cross-screen entry points into Plans
- Chat plan-item message (`openPlan`) → `screen:'plan', planSeg:'itinerary'` (planId unchanged).
- Calendar plan bars / agenda rows → `screen:'plan', planSeg:'overview'` (see PLAN_BARS note).
- Post-trip banner → composer prefilled from the plan (`fromPlan:true`, title `Two weeks in Japan`, type `Trip`).
- Tab bar "Plans" → `go('plans')` always lands on the list, closing any sheet.
