# Mobile spec A: Sign in, App shell, Memories, Gallery, Composer

Source of truth: `C:\Users\casey\Projects\caseyas\design\Ours - mobile prototype.dc.html`
- Template: lines 1-260 (style block, SIGN IN, APP SHELL, MEMORIES, GALLERY, COMPOSER) plus the TAB BAR (687-694), NEW MEMORY SHEET (696-707) and DELETE CONFIRM (737-745) overlays that these screens open.
- Logic: `data-dc-script` from line 900 (`MEM`, `DETAIL`, `CAPS`, `GAL`, `Component.state`, `go()`, `renderVals()`).

Conventions used below:
- "Style" lines are the exact inline `style` attribute of the element. Values wrapped in `{{ }}` are bindings resolved from `renderVals()`.
- Copy is quoted verbatim; typographic characters (curly quotes, en dashes, middle dots, arrows) are part of the copy and must be reproduced exactly.
- Every image in the prototype is `https://picsum.photos/seed/<seed>/<w>/<h>` via `P(seed, w, h)`. In the SPA use the mock image helper with the same seed/size; never the external URL.
- Icons are inline Lucide-style SVGs (`fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"`). Their paths are reproduced where they matter.

---

## 0. Foundation (the `<style>` block, lines 13-29)

Page-level (prototype only): `body{margin:0;background:#e9e5dc;font-family:'Inter Tight',system-ui,sans-serif;color:#121110}`. Links: `a{color:#c84b31;text-decoration:none}` and `a:hover{text-decoration:underline;text-underline-offset:3px}`. `input,button{font:inherit}`. `*{box-sizing:border-box}`.

Tokens on `.ours` (light):

| token | light | dark (`.ours[data-theme="dark"]`) |
|---|---|---|
| --bg | #faf9f6 | #121110 |
| --surface | #f0ede5 | #1a1917 |
| --surface-2 | #e8e4d9 | #23211e |
| --fg1 | #121110 | #faf9f6 |
| --fg2 | #5a574f | #a8a49a |
| --fg3 | #8a857a | #6e6a61 |
| --border | #d4d0c5 | #2e2b26 |
| --accent | #c84b31 | #d4593a |
| --accent-soft | rgba(200,75,49,.12) | rgba(212,89,58,.16) |
| --green | #78866a | #8a9a78 |
| --green-soft | rgba(120,134,106,.16) | rgba(138,154,120,.18) |
| --n1 | #f6ecd6 | #2b2519 |
| --n2 | #e6ebdc | #222619 |
| --n3 | #f1ddd2 | #2c201b |
| --n4 | #e4e2ea | #232229 |
| --plum | #7a5c7a | #a889a8 |
| --ochre | #b58b3a | #cfa65a |
| --plum-soft | rgba(122,92,122,.16) | (same) |
| --ochre-soft | rgba(181,139,58,.16) | (same) |
| --font-serif | 'Instrument Serif',Georgia,serif | (same) |
| --font-sans | 'Inter Tight',system-ui,sans-serif | (same) |
| --font-mono | 'JetBrains Mono',ui-monospace,monospace | (same) |
| --shadow-md | 0 8px 24px rgba(40,30,20,.12) | 0 8px 24px rgba(0,0,0,.4) |

Font swaps: `.ours[data-font="newsreader"]{--font-serif:'Newsreader',Georgia,serif}`, `[data-font="cormorant"]` -> `'Cormorant Garamond',Georgia,serif`, `[data-font="lora"]` -> `'Lora',Georgia,serif`. The prop default `displayFont` is `Newsreader`, so `fontKey` defaults to `newsreader` (map: Newsreader->newsreader, Cormorant Garamond->cormorant, Lora->lora, anything else->instrument).

Global rules inside `.ours`: `::-webkit-scrollbar{display:none}`; `input::placeholder{color:var(--fg3)}`; `input:focus{outline:2px solid var(--accent);outline-offset:2px}`; `button:active{transform:translateY(1px)}`.

Device root (line 34-36): `<div class="ours" data-theme="{{ theme }}" data-font="{{ fontKey }}" style="flex:none">` wrapping a 390x844 iOS frame, inside which the app root is
`<div style="height:844px;display:flex;flex-direction:column;background:var(--bg);color:var(--fg1);font-family:var(--font-sans);font-size:15px;line-height:1.5;position:relative;overflow:hidden">`.
Everything below (sign in, shell, tab bar, sheets) is a child of this root. `theme = s.themeOverride ?? p.theme ?? 'light'`; `isDark = theme === 'dark'`.

Props (design tweaks) relevant here: `timelineLayout` enum `'editorial' | 'grid' | 'journal'` (default in the props panel: `journal`; the code fallback when unset is `'editorial'`); `showOnThisDay` boolean default `true`; `herName` text default `Yasmim` (`her`), `herIni = her[0]`.

---

## 1. SIGN IN (lines 38-92)

**Status: Keycloak page, not the SPA.** Sign in is rendered by the Keycloak login theme (see `Ours - identity pages.dc.html`). The SPA must NOT implement the username/password form, the TOTP grid, the passkey button or the recovery-code link. The only SPA-side piece is the "signing you back in" interstitial (the `locked` re-auth state): when the session expires after 30 minutes away, the SPA shows a brief full-screen interstitial and redirects to Keycloak; Keycloak then renders the lock banner. Mark: **not implemented in the SPA except the 'signing you back in' interstitial.**

Brief description for parity (what Keycloak renders):
- Condition `isSignin = s.screen === 'signin'`. Full-bleed `position:absolute;inset:0` column. Backdrop `<img src=P('oursbackdrop',780,1688)>` `width:100%;height:100%;object-fit:cover;display:block;filter:sepia(.18) saturate(.7) brightness(.55)` with a gradient overlay `linear-gradient(to bottom,rgba(18,17,16,.35),rgba(18,17,16,.15) 40%,rgba(18,17,16,.85) 75%,#121110)`.
- Content column `position:relative;flex:1;display:flex;flex-direction:column;justify-content:flex-end;padding:0 28px 48px;color:#faf9f6`.
- `locked` banner (only when `s.locked`): `display:flex;align-items:center;gap:10px;font-size:13px;color:#a8a49a;margin-bottom:24px;padding:10px 12px;border:1px solid #2e2b26;border-radius:8px;background:rgba(18,17,16,.6)` with a 16px lock icon and copy "Locked after 30 minutes away. Sign in again."
- Wordmark "ours": `font-family:var(--font-serif);font-size:64px;line-height:.95;letter-spacing:-.01em`. Subline "Casey & {{ her }} · since Jul 12, 2024": `font-size:14px;color:#a8a49a;margin:12px 0 36px`.
- Step 1 (`isStep1 = s.step === 1`): column gap 12px; inputs Username / Password (`height:48px;padding:0 14px;border-radius:8px;border:1px solid #2e2b26;background:rgba(26,25,23,.85);color:#faf9f6;font-size:15px`); "Remember me on this device" row with a 40x24 pill toggle (`trustBg` = `var(--accent)` when `s.trust` else `#2e2b26`; knob `left` = `19px` / `3px`); "Continue" button (accent, 48px, radius 8) -> `toStep2` (`{step:2, code:'', codeErr:false}`); "Sign in with a passkey" outlined button -> `enter`; footer "Invite only. No sign-up." (`font-size:12px;color:#6e6a61;margin-top:20px;font-family:var(--font-mono)`).
- Step 2 (`isStep2`): "Enter the 6-digit code from your authenticator." then a 6-column grid of 56px boxes (`codeBoxes`: `ch = s.code[i] || ''`, border `#e26a4a` on error, `#faf9f6` for the active index `i === s.code.length`, else `#2e2b26`) over an invisible numeric input (`onCode` strips non-digits, slices to 6, auto-submits at 6: `123456` -> `{screen:'memories', code:'', codeErr:false, locked:false, step:1}`, anything else -> `{codeErr:true, code:''}`). Error copy "That code didn't work. Codes rotate every 30 seconds — try the newest one." (`color:#e26a4a`). Hint (when `!codeErr`) "prototype: type 123456 · any other code shows the error". Footer links "← Back" -> `toStep1` and "Use a recovery code instead" -> `enter`.
- `enter` = `{screen:'memories', step:1, code:'', locked:false}`. `lockNow` (from Us screen) = `{screen:'signin', locked:true, step:1}`.

**SPA interstitial ("signing you back in")**: reuse the sign-in backdrop treatment (dark image + gradient, `color:#faf9f6`, wordmark "ours" at 64px serif) with the `locked` banner style and copy "Locked after 30 minutes away. Sign in again." while the router hands off to Keycloak. No form fields.

---

## 2. APP SHELL (lines 94-96, 687-694)

Condition: `inApp = s.screen !== 'signin'`.

Structure:
```
<div style="flex:1;overflow:auto;padding-top:54px;display:flex;flex-direction:column">   <- scroll container, 54px top inset for the status bar
  [MEMORIES | GALLERY | COMPOSER | PLANS | PLAN | TODAY | DETAIL | CHAT | CALENDAR | NOTES | US]   (exactly one by s.screen)
</div>
<TAB BAR>   (absolute, always mounted while inApp)
<overlays: NEW MEMORY SHEET, MORE SHEET, NOTE COMPOSER, DELETE CONFIRM, ... LIGHTBOX>
```

`screen` state values seen in this spec: `'signin' | 'memories' | 'gallery' | 'composer' | 'detail' | 'chat' | 'calendar' | 'us' | 'plans' | 'plan' | 'today'`.

`go(screen)` = `this.setState({ screen, sheet:false, ev:null, more:false, planSheet:false })` - navigating with `go` always closes the new-memory sheet, the calendar event sheet, the plan "more" sheet and the new-plan sheet. `back` (used by Gallery and Composer) is `() => this.go('memories')`. Tab buttons call `goMemories/goPlans/goCalendar/goChat/goUs` which are all `go(...)`. Note: `goGallery`, `openComposer`, `m.open`, `openOnThisDay` and `a.open` use raw `setState` and therefore do NOT clear `sheet/ev/more/planSheet` (only `openComposer` explicitly sets `sheet:false`).

### Tab bar (lines 688-694)
`<div style="position:absolute;left:0;right:0;bottom:0;height:88px;padding:8px 8px 30px;display:grid;grid-template-columns:repeat(5,1fr);background:color-mix(in oklab,var(--bg),transparent 12%);backdrop-filter:blur(12px) saturate(1.2);border-top:1px solid var(--border);z-index:6">`
Five buttons, each `style="border:none;background:transparent;display:flex;flex-direction:column;align-items:center;gap:4px;color:{{ tab.X }};font-size:10px;cursor:pointer;padding-top:6px"` with a 22x22 icon then the label: "Memories", "Plans", "Calendar", "Chat", "Us".
- `tab.memories = active(['memories','detail','gallery','composer'].includes(s.screen))` where `active(c) = c ? 'var(--fg1)' : 'var(--fg3)'`. So Memories stays highlighted on Gallery and Composer and Detail.
- `tab.plans = active(screen in plans/plan/today)`, `tab.calendar`, `tab.chat`, `tab.us` likewise.
- Chat button is `position:relative` and shows a badge when `chatBadge = s.screen !== 'chat'`: `<span style="position:absolute;top:4px;left:calc(50% + 6px);min-width:16px;height:16px;padding:0 4px;border-radius:999px;background:var(--accent);color:#faf9f6;font-family:var(--font-mono);font-size:10px;display:flex;align-items:center;justify-content:center">{{ chatBadgeN }}</span>`; `chatBadgeN = s.sealedDone ? '2' : '3'`.
- Icons: Memories = image (rect 18x18 at 3,3 rx2; circle 9,9 r2; path `m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21`). Plans = map (paths as in source). Calendar = calendar. Chat = message-circle (`M7.9 20A9 9 0 1 0 4 16.1L2 22Z`). Us = users.

---

## 3. MEMORIES (lines 98-205)

Condition: `isMemories = s.screen === 'memories'`. Purpose: the home timeline of memories with a type filter, an optional "On this day" card, one of three layouts (A/B/C), and a floating "+" that opens the New memory sheet.

### 3.1 Header
```
<div style="display:flex;align-items:flex-end;justify-content:space-between;padding:8px 20px 0">
  <div style="font-family:var(--font-serif);font-size:36px;line-height:1">Memories</div>
  <div style="display:flex;gap:2px">
    <button onClick={{ goGallery }} style="width:40px;height:40px;border-radius:8px;border:none;background:transparent;color:var(--fg2);display:flex;align-items:center;justify-content:center;cursor:pointer">   <- grid icon (four 7x7 rects rx1 at (3,3),(14,3),(14,14),(3,14)), 20x20
    <button style="...same 40x40 style...">   <- search icon (circle 11,11 r8; path m21 21-4.3-4.3), 20x20; NO handler in the prototype
  </div>
</div>
```
- `goGallery` = `setState({ screen:'gallery' })` (does not touch `galSeg/galFilter/selecting`, so the gallery reopens in whatever state it was left).
- Search button: no interaction defined. Render it, no-op.

### 3.2 Filter chips
```
<div style="display:flex;gap:8px;padding:16px 20px 4px;overflow-x:auto;flex:none">
  for f in filters:
    <button onClick={{ f.pick }} style="flex:none;height:32px;padding:0 12px;border-radius:4px;border:1px solid {{ f.border }};background:{{ f.bg }};color:{{ f.color }};font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap">{{ f.label }}</button>
</div>
```
`filters` = `['All','Trips','Date nights','Everyday','Milestones','Videos']` mapped to `{ label, pick: () => setState({filter:f}), bg: selected ? 'var(--fg1)' : 'transparent', color: selected ? 'var(--bg)' : 'var(--fg2)', border: selected ? 'var(--fg1)' : 'var(--border)' }` where selected = `s.filter === f`. Initial `filter: 'All'`. The filter row is horizontally scrollable (hidden scrollbar).

### 3.3 On this day card (tweak `showOnThisDay`, default true)
Rendered only when `showOnThisDay` (the prop, `p.showOnThisDay ?? true`). Placed between the filters and the layout, regardless of layout or filter.
```
<div onClick={{ openOnThisDay }} style="margin:12px 20px 0;padding:12px;border-radius:8px;background:var(--surface);border:1px solid var(--border);display:flex;gap:12px;align-items:center;cursor:pointer">
  <img src=P('otd',160,160) style="width:52px;height:52px;border-radius:6px;object-fit:cover;filter:sepia(.08) saturate(.88)" alt="">
  <div style="flex:1;min-width:0">
    <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)">On this day · 2025</div>
    <div style="font-family:var(--font-serif);font-size:19px;line-height:1.15;margin-top:2px">First real cold morning</div>
  </div>
  <span style="color:var(--fg3);font-size:18px">→</span>
</div>
```
`openOnThisDay` = `setState({ screen:'detail', detailId:5 })` (opens "Rooftop movie" detail in the prototype; the card copy is static).

### 3.4 Data: `MEM` and the `memories` list
`MEM` (5 records, newest first):

| id | title | date | day | mon | loc | type | by | ex | count | size | img | img2 | month | showMonth | more |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Tuesday tacos, again | Sep 1, 2026 | 1 | Sep | Home | Everyday | her | Third week running. Nobody is complaining. | 3 photos | compact | P('tacos',600,600) | P('tacos2',400,400) | September 2026 | true | '' |
| 2 | The night the power went out | Aug 29, 2026 | 29 | Aug | Home | Everyday | Casey | Candles, a deck of cards, and the loudest silence. | 9 photos · 1 video | medium | P('candles',800,600) | P('cards',400,400) | August 2026 | true | +7 |
| 3 | Three days in Asheville | Aug 14–17, 2026 | 14 | Aug | Asheville, NC | Trip | Casey | We meant to hike. We mostly ate. | 38 photos · 2 videos | large | P('asheville',1200,800) | P('ashe2',400,400) | '' | false | +36 |
| 4 | Two years | Jul 12, 2026 | 12 | Jul | Nonna’s | Milestone | her | Same table as the first time. Same order, honestly. | 12 photos | medium | P('twoyears',800,600) | P('dinner',400,400) | July 2026 | true | +10 |
| 5 | Rooftop movie | Jul 3, 2026 | 3 | Jul | Downtown | Date night | Casey | Couldn’t hear a word. Didn’t matter. | 1 photo | compact | P('rooftop',600,600) | '' | '' | false | '' |

Shape after `renderVals`:
```ts
type MemoryCard = {
  id: number; title: string; date: string; day: string; mon: string; loc: string;
  type: 'Everyday' | 'Trip' | 'Milestone' | 'Date night'; by: string; // 'her' replaced by herName
  ex: string; count: string; size: 'large' | 'medium' | 'compact';
  img: string; img2: string; month: string; showMonth: boolean; more: string;
  isLarge: boolean; isMedium: boolean; isCompact: boolean;      // size === ...
  colSpan: 1 | 2;   // large ? 2 : 1
  rowSpan: 1 | 2;   // compact ? 1 : 2
  gridTitle: '26px' | '18px';   // large ? '26px' : '18px'
  hasMore: boolean; // !!img2
  open: () => setState({ screen:'detail', detailId: id });
}
```
Filter predicate: `s.filter === 'All' || (Trips -> type==='Trip') || (Date nights -> 'Date night') || (Everyday -> 'Everyday') || (Milestones -> 'Milestone') || (Videos -> count.includes('video'))`.
Resulting sets: All = 1,2,3,4,5; Trips = 3; Date nights = 5; Everyday = 1,2; Milestones = 4; Videos = 2,3.

**Empty state:** none is designed. With the shipped data every filter returns at least one memory. If the SPA has zero results, render the layout container empty (keep the bottom padding) - do not invent copy.

Note on `showMonth`: month headers are baked into the data (ids 1, 2, 4), not computed from the filtered list. When a filter hides id 2 but shows id 3, Asheville renders without an "August 2026" header. Reproduce this exactly (compute headers the same way: from the record flag).

### 3.5 Layout A: editorial stack (`layoutEditorial`, `timelineLayout === 'editorial'`)
```
<div style="display:flex;flex-direction:column;gap:20px;padding:8px 0 110px">
  for m in memories:
    <div style="display:flex;flex-direction:column;gap:12px">
      if m.showMonth:
        <div style="position:sticky;top:0;z-index:2;padding:8px 20px;background:color-mix(in oklab,var(--bg),transparent 15%);backdrop-filter:blur(12px);font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3)">{{ m.month }}</div>
      if m.isLarge:      (full-bleed hero)
        <div onClick={{ m.open }} style="cursor:pointer">
          <div style="position:relative;height:300px;overflow:hidden">
            <img src={{ m.img }} style="width:100%;height:100%;object-fit:cover;display:block;filter:sepia(.08) saturate(.88)" alt="">
            <div style="position:absolute;top:12px;left:20px;font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#faf9f6;background:rgba(18,17,16,.55);padding:4px 8px;border-radius:4px">{{ m.type }}</div>
            <div style="position:absolute;bottom:12px;right:20px;font-family:var(--font-mono);font-size:11px;color:#faf9f6;background:rgba(18,17,16,.55);padding:4px 8px;border-radius:4px">{{ m.count }}</div>
          </div>
          <div style="padding:14px 20px 0">
            <div style="font-family:var(--font-serif);font-size:30px;line-height:1.05">{{ m.title }}</div>
            <div style="display:flex;gap:10px;align-items:center;margin-top:8px;font-size:13px;color:var(--fg2)"><span style="font-family:var(--font-mono);font-size:12px">{{ m.date }}</span><span>·</span><span>{{ m.loc }}</span></div>
            <div style="margin-top:8px;color:var(--fg2);font-size:15px;line-height:1.5">{{ m.ex }}</div>
            <div style="margin-top:10px;font-size:12px;color:var(--fg3)">{{ m.by }} added this</div>
          </div>
        </div>
      if m.isMedium:     (card with two-image strip)
        <div onClick={{ m.open }} style="margin:0 20px;border-radius:8px;overflow:hidden;background:var(--surface);border:1px solid var(--border);cursor:pointer">
          <div style="display:grid;grid-template-columns:2fr 1fr;gap:2px;height:180px">
            <img src={{ m.img }}  style="width:100%;height:100%;object-fit:cover;display:block;filter:sepia(.08) saturate(.88)" alt="">
            <img src={{ m.img2 }} style="width:100%;height:100%;object-fit:cover;display:block;filter:sepia(.08) saturate(.88)" alt="">
          </div>
          <div style="padding:14px 16px 16px">
            <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:11px;color:var(--fg3);letter-spacing:.08em"><span>{{ m.date }}</span><span>{{ m.count }}</span></div>
            <div style="font-family:var(--font-serif);font-size:24px;line-height:1.1;margin-top:6px">{{ m.title }}</div>
            <div style="margin-top:6px;color:var(--fg2);font-size:14px">{{ m.ex }}</div>
          </div>
        </div>
      if m.isCompact:    (thumbnail row)
        <div onClick={{ m.open }} style="margin:0 20px;display:flex;gap:14px;align-items:center;cursor:pointer;padding:4px 0">
          <img src={{ m.img }} style="width:72px;height:72px;border-radius:8px;object-fit:cover;flex:none;filter:sepia(.08) saturate(.88)" alt="">
          <div style="flex:1;min-width:0">
            <div style="font-family:var(--font-mono);font-size:11px;color:var(--fg3);letter-spacing:.08em">{{ m.date }} · {{ m.type }}</div>
            <div style="font-family:var(--font-serif);font-size:21px;line-height:1.1;margin-top:3px">{{ m.title }}</div>
            <div style="font-size:13px;color:var(--fg2);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ m.ex }}</div>
          </div>
        </div>
    </div>
</div>
```
Copy: "{{ m.by }} added this" (large only). With default data the stack reads: [September 2026] compact Tacos; [August 2026] medium Power out; large Asheville (no header); [July 2026] medium Two years; compact Rooftop.

### 3.6 Layout B: photo grid (`layoutGrid`, `timelineLayout === 'grid'`)
```
<div style="display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:150px;grid-auto-flow:dense;gap:6px;padding:16px 12px 110px">
  for m in memories:
    <div onClick={{ m.open }} style="position:relative;border-radius:8px;overflow:hidden;cursor:pointer;grid-column:span {{ m.colSpan }};grid-row:span {{ m.rowSpan }}">
      <img src={{ m.img }} style="width:100%;height:100%;object-fit:cover;display:block;filter:sepia(.08) saturate(.88)" alt="">
      <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(18,17,16,.8),transparent 55%)"></div>
      <div style="position:absolute;left:12px;right:12px;bottom:10px;color:#faf9f6">
        <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:.1em;opacity:.8">{{ m.date }}</div>
        <div style="font-family:var(--font-serif);font-size:{{ m.gridTitle }};line-height:1.05;margin-top:2px">{{ m.title }}</div>
      </div>
      if m.isLarge:
        <div style="position:absolute;top:10px;right:10px;font-family:var(--font-mono);font-size:10px;color:#faf9f6;background:rgba(18,17,16,.55);padding:3px 6px;border-radius:4px">{{ m.count }}</div>
    </div>
</div>
```
Spans: large = 2 cols x 2 rows (300px tall), medium = 1 col x 2 rows, compact = 1 col x 1 row. No month headers and no "added this" line in this layout. Title size 26px for large, 18px otherwise. Grid placement is `dense`, so compact tiles backfill gaps.

### 3.7 Layout C: journal list (`layoutJournal`, `timelineLayout === 'journal'`; the props-panel default)
```
<div style="padding:20px 20px 110px;display:flex;flex-direction:column">
  for m in memories:
    <div onClick={{ m.open }} style="display:grid;grid-template-columns:56px 1fr;gap:16px;padding:18px 0;border-top:1px solid var(--border);cursor:pointer">
      <div style="font-family:var(--font-serif);line-height:1">
        <div style="font-size:32px">{{ m.day }}</div>
        <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3);margin-top:4px">{{ m.mon }}</div>
      </div>
      <div style="min-width:0">
        <div style="font-family:var(--font-serif);font-size:24px;line-height:1.1">{{ m.title }}</div>
        <div style="font-size:14px;color:var(--fg2);margin-top:6px;line-height:1.5">{{ m.ex }}</div>
        <div style="display:flex;gap:6px;margin-top:10px;height:56px">
          <img src={{ m.img }} style="width:56px;height:56px;border-radius:6px;object-fit:cover;filter:sepia(.08) saturate(.88)" alt="">
          if m.hasMore:
            <img src={{ m.img2 }} style="width:56px;height:56px;border-radius:6px;object-fit:cover;filter:sepia(.08) saturate(.88)" alt="">
            <div style="width:56px;height:56px;border-radius:6px;background:var(--surface-2);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:12px;color:var(--fg2)">{{ m.more }}</div>
        </div>
        <div style="font-family:var(--font-mono);font-size:11px;color:var(--fg3);margin-top:10px;letter-spacing:.06em">{{ m.type }} · {{ m.loc }} · {{ m.by }}</div>
      </div>
    </div>
</div>
```
Every row has a top border (including the first). `hasMore = !!m.img2`, so id 1 (tacos) shows img2 plus an empty `more` box (`''`); id 5 (rooftop) shows a single thumbnail. Reproduce that as-is.

### 3.8 Floating add button (all layouts)
`<button onClick={{ openSheet }} style="position:absolute;right:20px;bottom:104px;width:52px;height:52px;border-radius:12px;border:none;background:var(--accent);color:#faf9f6;box-shadow:var(--shadow-md);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:5">` with a 22x22 plus (`M5 12h14`, `M12 5v14`, stroke-width 1.5, linecap round). Rendered inside the `isMemories` block, but positioned against the app root (the scroll container is not `position:relative`), so it floats above the tab bar (tab bar is 88px tall; button bottom is 104px).
`openSheet` = `setState({ sheet:true })`; `closeSheet` = `setState({ sheet:false })`.

### 3.9 New memory sheet (`sheet`, lines 696-707) - opened from the FAB
```
<div onClick={{ closeSheet }} style="position:absolute;inset:0;background:rgba(0,0,0,.6);z-index:20"></div>
<div style="position:absolute;left:0;right:0;bottom:0;z-index:21;background:var(--bg);border-radius:12px 12px 0 0;padding:12px 20px 40px;display:flex;flex-direction:column;gap:16px;border-top:1px solid var(--border)">
  <div style="width:36px;height:4px;border-radius:999px;background:var(--border);margin:0 auto"></div>            <- grabber
  <div style="display:flex;justify-content:space-between;align-items:center"><span style="font-family:var(--font-serif);font-size:26px">New memory</span><span style="font-family:var(--font-mono);font-size:11px;color:var(--fg3)">Draft · saved just now</span></div>
  <input placeholder="Title" style="height:48px;border:none;border-bottom:1px solid var(--border);background:transparent;font-family:var(--font-serif);font-size:28px;color:var(--fg1);padding:0;border-radius:0">
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <span style="height:32px;padding:0 12px;border-radius:4px;border:1px solid var(--border);display:inline-flex;align-items:center;font-size:13px;color:var(--fg2)">Sep 6, 2026</span>
    <span style="...same...;color:var(--fg2)">Add a place</span>
    <span style="height:32px;padding:0 12px;border-radius:4px;border:1px solid var(--accent);background:var(--accent-soft);display:inline-flex;align-items:center;font-size:13px;color:var(--fg1)">Everyday</span>
  </div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
    <div style="aspect-ratio:1;border-radius:8px;border:1px dashed var(--border);display:flex;align-items:center;justify-content:center;color:var(--fg3)">[camera icon 20x20]</div>
    <img src=P('new1',200,200) style="aspect-ratio:1;width:100%;border-radius:8px;object-fit:cover;filter:sepia(.08) saturate(.88)" alt="">
    <div style="position:relative;aspect-ratio:1;border-radius:8px;overflow:hidden"><img src=P('new2',200,200) style="width:100%;height:100%;object-fit:cover;filter:sepia(.08) saturate(.88)" alt=""><div style="position:absolute;left:0;right:0;bottom:0;height:3px;background:var(--surface-2)"><div style="width:62%;height:100%;background:var(--accent)"></div></div></div>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center;font-size:14px;color:var(--fg2)"><span>Keep private to me until I publish</span><span style="width:40px;height:24px;border-radius:999px;background:var(--accent);position:relative"><span style="position:absolute;top:3px;left:19px;width:18px;height:18px;border-radius:999px;background:#faf9f6"></span></span></div>
  <button onClick={{ openComposer }} style="height:48px;border-radius:8px;border:none;background:var(--fg1);color:var(--bg);font-weight:500;font-size:15px;cursor:pointer">Keep writing →</button>
</div>
```
The sheet's title input, chips, media grid and privacy toggle are static in the prototype (no bindings). "Keep writing →" -> `openComposer` = `setState({ screen:'composer', sheet:false, fromPlan:false, cTitle:'' })`. Tapping the scrim closes. Camera icon path: `M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z` + `circle cx=12 cy=13 r=3`.

### 3.10 Interactions summary (Memories)
| Target | State change |
|---|---|
| Grid icon (header) | `{screen:'gallery'}` |
| Search icon | none |
| Filter chip | `{filter: label}` |
| On this day card | `{screen:'detail', detailId:5}` |
| Any memory card/tile/row | `{screen:'detail', detailId: m.id}` |
| FAB "+" | `{sheet:true}` |
| Sheet scrim | `{sheet:false}` |
| Sheet "Keep writing →" | `{screen:'composer', sheet:false, fromPlan:false, cTitle:''}` |
| Tab bar | `go(name)` |

Tweaks: `timelineLayout` selects exactly one of 3.5/3.6/3.7 (header, filters, On-this-day card and FAB are shared). `showOnThisDay=false` removes 3.3 entirely; the layout's own top padding (8 / 16 / 20px) then sits directly under the filter row's 4px bottom padding.

---

## 4. GALLERY (lines 207-228)

Condition: `isGallery = s.screen === 'gallery'`. Purpose: all media by month (Photos segment) or albums (Albums segment), with a multi-select mode and a delete flow.

State: `galSeg: 'photos' | 'albums'` (init `'photos'`), `galFilter: string` (init `'All'`), `selecting: boolean` (init false), `sel: string[]` (tile ids), `del: boolean` (confirm open), `deleted: string[]` (tile ids removed).

### 4.1 Top bar
```
<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 12px 0">
  <button onClick={{ back }} style="width:36px;height:36px;border-radius:8px;border:none;background:transparent;color:var(--fg2);display:flex;align-items:center;justify-content:center;cursor:pointer">[chevron-left 18x18: m15 18-6-6 6-6]</button>
  <div style="display:flex;gap:2px;padding:2px;border-radius:6px;background:var(--surface-2);font-size:13px">
    <button onClick={{ galPhotos }} style="height:30px;padding:0 12px;border-radius:4px;border:none;background:{{ galPhotosBg }};color:var(--fg1);cursor:pointer;font-weight:500">Photos</button>
    <button onClick={{ galAlbums }} style="height:30px;padding:0 12px;border-radius:4px;border:none;background:{{ galAlbumsBg }};color:var(--fg1);cursor:pointer;font-weight:500">Albums</button>
  </div>
  <button onClick={{ toggleSelect }} style="height:32px;padding:0 10px;border-radius:6px;border:1px solid var(--border);background:{{ selBg }};color:var(--fg1);font-size:12px;cursor:pointer">{{ selLabel }}</button>
</div>
```
- `back` = `go('memories')`.
- `galPhotos` = `{galSeg:'photos'}`, `galAlbums` = `{galSeg:'albums'}`; `galPhotosBg`/`galAlbumsBg` = `'var(--bg)'` when active else `'transparent'`.
- `selLabel` = `s.selecting ? 'Done' : 'Select'`; `selBg` = `s.selecting ? 'var(--surface-2)' : 'transparent'`; `toggleSelect` = `{selecting: !s.selecting, sel: []}` (entering or leaving select mode always clears the selection). The Select button is visible on both segments (it only affects Photos tiles).

### 4.2 Photos segment (`galIsPhotos = s.galSeg === 'photos'`)
Filter row:
```
<div style="display:flex;gap:6px;padding:14px 20px 0;overflow-x:auto">
  for f in galFilters:
    <button onClick={{ f.pick }} style="flex:none;height:30px;padding:0 12px;border-radius:4px;border:1px solid {{ f.border }};background:{{ f.bg }};color:{{ f.color }};font-size:13px;cursor:pointer;white-space:nowrap">{{ f.label }}</button>
</div>
```
`galFilters` = `['All','Photos','Videos','Favorites','Casey', her]` with the same selected styling as the memories filters (`bg var(--fg1)`/`color var(--bg)`/`border var(--fg1)` when `s.galFilter === f`, else `transparent`/`var(--fg2)`/`var(--border)`); `pick` = `{galFilter:f}`. Note: 30px tall and no `font-weight:500` (unlike the Memories chips).

Month sections:
```
<div style="padding:8px 0 120px;display:flex;flex-direction:column;gap:6px">
  for gm in galMonths:
    <div>
      <div style="position:sticky;top:0;z-index:2;padding:10px 20px 6px;background:color-mix(in oklab,var(--bg),transparent 12%);backdrop-filter:blur(12px);display:flex;justify-content:space-between;align-items:baseline">
        <span style="font-family:var(--font-serif);font-size:20px">{{ gm.label }}</span>
        <span style="font-family:var(--font-mono);font-size:11px;color:var(--fg3)">{{ gm.count }}</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px;padding:0 2px">
        for t in gm.tiles:
          <div onClick={{ t.pick }} style="position:relative;aspect-ratio:1;overflow:hidden;cursor:pointer">
            <img src={{ t.src }} style="width:100%;height:100%;object-fit:cover;display:block;filter:sepia(.08) saturate(.88);opacity:{{ t.op }}" alt="">
            if t.video: <span style="position:absolute;right:5px;bottom:5px;font-family:var(--font-mono);font-size:9px;color:#faf9f6;background:rgba(18,17,16,.6);padding:1px 4px;border-radius:3px">▶ {{ t.dur }}</span>
            if t.fav:   <span style="position:absolute;left:5px;bottom:5px;color:#faf9f6">[heart 12x12 fill=currentColor: M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z]</span>
            if t.sel:   <span style="position:absolute;top:6px;right:6px;width:20px;height:20px;border-radius:999px;background:var(--accent);border:2px solid #faf9f6;display:flex;align-items:center;justify-content:center;color:#faf9f6">[check 11x11 stroke-width 2.5: M20 6 9 17l-5-5]</span>
            if t.unsel: <span style="position:absolute;top:6px;right:6px;width:20px;height:20px;border-radius:999px;border:2px solid #faf9f6;background:rgba(18,17,16,.3)"></span>
          </div>
      </div>
    </div>
</div>
```
Data `GAL` = `[['September 2026', 9, 'sep'], ['August 2026', 15, 'aug'], ['July 2026', 12, 'jul']]`. Tiles for a month `(label, n, k)`: for `i in 0..n-1`:
```ts
type GalleryTile = {
  id: string;          // k + i, e.g. 'sep0', 'aug14'
  src: string;         // P('g' + id, 300, 300)
  video: boolean;      // i % 7 === 3
  dur: string;         // '0:' + (12 + i*3)   e.g. i=3 -> '0:21', i=10 -> '0:42'
  fav: boolean;        // i % 5 === 1
  byHer: boolean;      // i % 2 === 0
  sel: boolean;        // selecting && sel.includes(id)
  unsel: boolean;      // selecting && !sel.includes(id)
  op: 0.7 | 1;         // selecting && !selected ? .7 : 1
  pick: () => void;
}
type GalleryMonth = { label: string; count: string /* tiles.length + ' items' */; tiles: GalleryTile[] }
```
Filtering, in order: drop `deleted` ids; then `galFilter`: `All` -> all; `Photos` -> `!video`; `Videos` -> `video`; `Favorites` -> `fav`; `Casey` -> `!byHer`; `her` (e.g. `Yasmim`) -> `byHer`. `count` is computed AFTER filtering (e.g. "9 items", "2 items").
`t.pick`: when `selecting` -> toggle id in `sel`; otherwise -> `setState({ screen:'detail', detailId:3, lb:1 })` (opens the Asheville detail with the lightbox on gallery index 1 - a prototype shortcut; every tile opens the same thing).

**Empty state:** none designed. A month whose tiles filter to zero still renders its sticky header with "0 items" and an empty grid. Reproduce.

### 4.3 Albums segment (`galIsAlbums = s.galSeg === 'albums'`)
```
<div style="padding:20px 20px 120px;display:flex;flex-direction:column;gap:24px">
  <div>
    <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3);margin-bottom:10px">Yours</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      for a in customAlbums:
        <div style="cursor:pointer">
          <div style="position:relative;aspect-ratio:1;border-radius:8px;overflow:hidden"><img src={{ a.src }} style="width:100%;height:100%;object-fit:cover;display:block;filter:sepia(.08) saturate(.88)" alt=""></div>
          <div style="font-family:var(--font-serif);font-size:19px;line-height:1.1;margin-top:8px">{{ a.name }}</div>
          <div style="font-size:12px;color:var(--fg3)">{{ a.count }}</div>
        </div>
      <div style="aspect-ratio:1;border-radius:8px;border:1px dashed var(--border);display:flex;align-items:center;justify-content:center;color:var(--fg3);font-size:13px;cursor:pointer">+ New album</div>
    </div>
  </div>
  <div>
    <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3);margin-bottom:10px">One per memory</div>
    <div style="display:flex;flex-direction:column">
      for a in autoAlbums:
        <div onClick={{ a.open }} style="display:flex;gap:12px;align-items:center;padding:10px 0;border-top:1px solid var(--border);cursor:pointer">
          <img src={{ a.src }} style="width:48px;height:48px;border-radius:6px;object-fit:cover;filter:sepia(.08) saturate(.88)" alt="">
          <div style="flex:1;min-width:0">
            <div style="font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ a.name }}</div>
            <div style="font-size:12px;color:var(--fg3)">{{ a.count }}</div>
          </div>
          <span style="color:var(--fg3)">→</span>
        </div>
    </div>
  </div>
</div>
```
`customAlbums` (static, no handler): `{name:'Favorites', count:'48 items', src:P('fav',400,400)}`, `{name:'Fridge door', count:'23 photos', src:P('fridge',400,400)}`, `{name:'The dog, mostly', count:'311 photos · 9 videos', src:P('dog',400,400)}`. "+ New album" has no handler.
`autoAlbums` = `MEM.map(m => ({ name: m.title, count: m.count, src: m.img, open: () => setState({screen:'detail', detailId:m.id}) }))` - one row per memory, in MEM order, unfiltered by `s.filter`. Note `name` uses the memory title as-is (no `her` substitution needed).

### 4.4 Selection bar (`selecting`)
Rendered inside `isGallery` after both segments, only when `s.selecting`:
```
<div style="position:absolute;left:12px;right:12px;bottom:100px;z-index:7;background:var(--fg1);color:var(--bg);border-radius:8px;padding:10px 12px;display:flex;align-items:center;gap:6px;box-shadow:var(--shadow-md)">
  <span style="font-family:var(--font-mono);font-size:12px;padding:0 6px;flex:none">{{ selN }} selected</span>
  <span style="flex:1"></span>
  <button style="height:32px;padding:0 10px;border-radius:6px;border:none;background:transparent;color:var(--bg);font-size:12px;cursor:pointer;white-space:nowrap">To memory</button>
  <button style="...same...">To album</button>
  <button style="height:32px;padding:0 10px;border-radius:6px;border:none;background:transparent;color:var(--bg);font-size:12px;cursor:pointer">Save</button>
  <button onClick={{ askDelete }} style="height:32px;padding:0 10px;border-radius:6px;border:none;background:transparent;color:#e26a4a;font-size:12px;cursor:pointer">Delete</button>
</div>
```
`selN = s.sel.length`. "To memory", "To album", "Save" have no handlers. `askDelete` = `if (s.sel.length) setState({del:true})` (no-op with zero selected). The bar floats above the tab bar (z 7 > 6) and is present even on the Albums segment while `selecting` is true.

### 4.5 Delete confirm (`delOpen = s.del`, lines 737-745)
```
<div onClick={{ closeDel }} style="position:absolute;inset:0;background:rgba(0,0,0,.6);z-index:20"></div>
<div style="position:absolute;left:20px;right:20px;top:50%;transform:translateY(-50%);z-index:21;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:24px;display:flex;flex-direction:column;gap:14px;box-shadow:var(--shadow-md)">
  <div style="font-family:var(--font-serif);font-size:24px;line-height:1.1">Delete {{ selN }} photos?</div>
  <div style="font-size:14px;color:var(--fg2);line-height:1.5">They'll leave every memory and album they're in. {{ her }} will see they're gone. This can't be undone.</div>
  <div style="display:flex;gap:8px">
    <button onClick={{ closeDel }} style="flex:1;height:44px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--fg1);font-size:14px;font-weight:500;cursor:pointer">Keep them</button>
    <button onClick={{ doDelete }} style="flex:1;height:44px;border-radius:8px;border:none;background:#b33e26;color:#faf9f6;font-size:14px;font-weight:500;cursor:pointer">Delete</button>
  </div>
</div>
```
Copy uses straight apostrophes exactly as written ("They'll", "they're", "can't"). The title always says "photos" regardless of count or media type. `closeDel` = `{del:false}`; `doDelete` = `{del:false, deleted:[...s.deleted, ...s.sel], sel:[], selecting:false}` - deleting exits select mode. Deleted ids persist for the session (they never come back; there is no undo).

### 4.6 Interactions summary (Gallery)
| Target | State change |
|---|---|
| Back chevron | `go('memories')` |
| Photos / Albums segment | `{galSeg}` |
| Select / Done | `{selecting: !selecting, sel: []}` |
| Filter chip | `{galFilter}` |
| Tile (not selecting) | `{screen:'detail', detailId:3, lb:1}` |
| Tile (selecting) | toggle id in `sel` |
| Auto album row | `{screen:'detail', detailId: m.id}` |
| Custom album, + New album, To memory, To album, Save | none |
| Delete (bar) | `{del:true}` if `sel.length` |
| Scrim / Keep them | `{del:false}` |
| Delete (dialog) | `{del:false, deleted:+sel, sel:[], selecting:false}` |

Tweaks: `timelineLayout` and `showOnThisDay` do not affect the Gallery.

---

## 5. COMPOSER (full) (lines 230-257)

Condition: `isComposer = s.screen === 'composer'`. Purpose: the full-screen memory editor reached from the New memory sheet ("Keep writing →") or from a plan ("openComposerFromPlan", which pre-fills from "Japan, spring 2027").

State: `cTitle: string` (init `''`), `cType: 'Trip'|'Date night'|'Everyday'|'Milestone'` (init `'Everyday'`), `fromPlan: boolean` (init false), `priv: boolean` (init true).
Entry points:
- `openComposer` = `{screen:'composer', sheet:false, fromPlan:false, cTitle:''}` (cType is NOT reset).
- `openComposerFromPlan` = `{screen:'composer', fromPlan:true, cTitle:'Two weeks in Japan', cType:'Trip'}`.
- `clearPrefill` = `{fromPlan:false, cTitle:''}` (stays on composer; cType stays 'Trip').

### 5.1 Top bar
```
<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 12px 0">
  <button onClick={{ back }} style="height:36px;padding:0 10px;border-radius:8px;border:none;background:transparent;color:var(--fg2);font-size:14px;cursor:pointer">Close</button>
  <span style="font-family:var(--font-mono);font-size:11px;color:var(--fg3)">Draft · {{ savedLabel }}</span>
  <button onClick={{ back }} style="height:36px;padding:0 14px;border-radius:8px;border:none;background:var(--accent);color:#faf9f6;font-size:14px;font-weight:500;cursor:pointer">Publish</button>
</div>
```
`savedLabel = 'saved just now'` (constant) -> reads "Draft · saved just now". Both Close and Publish call `back` = `go('memories')`; Publish does not add a memory in the prototype.

### 5.2 Body
`<div style="padding:12px 20px 120px;display:flex;flex-direction:column;gap:16px">` containing, in order:

1. **Prefill banner** (only `fromPlan`):
   `<div style="padding:10px 12px;border-radius:8px;background:var(--accent-soft);border:1px solid var(--accent);font-size:12px;color:var(--fg1);display:flex;justify-content:space-between;align-items:center"><span>Started from <strong>Japan, spring 2027</strong> · 15 day headings · 212 photos filtered to Apr 8 – 22</span><a onClick={{ clearPrefill }} style="cursor:pointer;flex:none;margin-left:8px">Clear</a></div>`
   ("Clear" is an `<a>` so it takes the accent link color from the page `a` rule.)

2. **Title input**: `<input value={{ cTitle }} onChange={{ onCTitle }} placeholder="Give it a title" style="height:56px;border:none;border-bottom:1px solid var(--border);background:transparent;font-family:var(--font-serif);font-size:32px;color:var(--fg1);padding:0;border-radius:0;width:100%">`; `onCTitle = e => setState({cTitle: e.target.value})`.

3. **Date + place chips**: `<div style="display:flex;gap:8px;flex-wrap:wrap">`
   - `<span style="height:32px;padding:0 12px;border-radius:4px;border:1px solid var(--border);display:inline-flex;align-items:center;font-size:13px;color:var(--fg1)">{{ cDates }}</span>` where `cDates = fromPlan ? 'Apr 8 – 22, 2027' : 'Sep 6, 2026'`.
   - `<span style="...same...;color:{{ cLocColor }}">{{ cLoc }}</span>` where `cLoc = fromPlan ? 'Tokyo · Kyoto · Osaka' : 'Add a place'`, `cLocColor = fromPlan ? 'var(--fg1)' : 'var(--fg3)'`. No handlers.

4. **Type chips**: `<div style="display:flex;gap:6px;flex-wrap:wrap">` with `cTypes = ['Trip','Date night','Everyday','Milestone']` -> `<button onClick={{ t.pick }} style="height:30px;padding:0 12px;border-radius:4px;border:1px solid {{ t.border }};background:{{ t.bg }};color:var(--fg1);font-size:13px;cursor:pointer">{{ t.label }}</button>` where selected (`s.cType === t`) gives `bg var(--accent-soft)` / `border var(--accent)`, else `transparent` / `var(--border)`; `pick = {cType:t}`. Followed by a static `<span style="height:30px;padding:0 12px;border-radius:4px;border:1px dashed var(--border);display:inline-flex;align-items:center;font-size:13px;color:var(--fg3)">+ tag</span>`.

5. **Media block**: `<div>`
   - Header row `<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px"><span style="font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3)">Media · {{ cMediaN }}</span><span style="font-size:12px;color:var(--fg3)">hold to reorder</span></div>`; `cMediaN = fromPlan ? '212' : '3'`.
   - Strip `<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px">`:
     - Add tile: `<div style="flex:none;width:84px;height:84px;border-radius:8px;border:1px dashed var(--border);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;color:var(--fg3);font-size:11px">[camera icon 18x18]Add</div>` (no handler).
     - for m in cMedia: `<div style="position:relative;flex:none;width:84px;height:84px;border-radius:8px;overflow:hidden;border:1px solid {{ m.border }}"><img src={{ m.src }} style="width:100%;height:100%;object-fit:cover;display:block;filter:sepia(.08) saturate(.88);opacity:{{ m.op }}" alt="">` then
       - if `m.cover`: `<span style="position:absolute;top:5px;left:5px;font-family:var(--font-mono);font-size:8px;letter-spacing:.1em;text-transform:uppercase;color:#faf9f6;background:var(--accent);padding:2px 5px;border-radius:3px">Cover</span>`
       - if `m.uploading`: `<span style="position:absolute;left:0;right:0;bottom:0;height:3px;background:rgba(18,17,16,.5)"><span style="display:block;width:62%;height:100%;background:var(--accent)"></span></span>`
       - if `m.hasCap`: `<span style="position:absolute;left:0;right:0;bottom:0;padding:3px 5px;font-size:9px;color:#faf9f6;background:rgba(18,17,16,.6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ m.cap }}</span>`
   - `cMedia`: seeds `fromPlan ? ['jp1'..'jp6'] : ['new1','new2','new3']`, each `{ src:P(seed,200,200), cover: i===0, uploading: !fromPlan && i===2, op: (!fromPlan && i===2) ? .6 : 1, hasCap: i===1, cap: fromPlan ? 'Haneda, finally' : 'Kitchen, 11 PM', border: i===0 ? 'var(--accent)' : 'var(--border)' }`.
   - Prefill note (only `fromPlan`): `<div style="font-size:12px;color:var(--fg3);margin-top:6px">Picker is pre-filtered: photos taken Apr 8 – 22, 2027 · 212 of 4,812</div>`.

6. **Formatting toolbar**: `<div style="display:flex;gap:2px;padding:4px;border-radius:8px;background:var(--surface);border:1px solid var(--border);font-size:13px;color:var(--fg2);overflow-x:auto">` with `cTools` -> `<span style="flex:none;height:30px;min-width:32px;padding:0 10px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;font-family:{{ t.font }};font-weight:{{ t.weight }};font-style:{{ t.style }}">{{ t.label }}</span>`.
   `cTools` = `[['H','var(--font-serif)',500,'normal'], ['B','inherit',600,'normal'], ['I','inherit',400,'italic'], ['• list','inherit',400,'normal'], ['1. list','inherit',400,'normal'], ['“ quote','var(--font-serif)',400,'italic'], ['+ photo','inherit',400,'normal']]`. No handlers (display only).

7. **Blocks**: `<div style="display:flex;flex-direction:column;gap:14px;font-size:16px;line-height:1.65">` for b in `cBlocks`:
   - `isH`: `<div style="font-family:var(--font-serif);font-size:24px;line-height:1.2;margin-top:6px">{{ b.text }}</div>`
   - `isP`: `<p style="margin:0;color:{{ b.color }}">{{ b.text }}</p>`
   - `isList`: `<ul style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:4px;color:var(--fg2)"><li>{{ li.t }}</li>...</ul>`
   - `isQ`: `<blockquote style="margin:0;padding:0 0 0 16px;border-left:1px solid var(--accent);font-family:var(--font-serif);font-size:22px;line-height:1.3">{{ b.text }}</blockquote>`
   - `isImg`: `<div style="position:relative;border-radius:8px;overflow:hidden"><img src={{ b.src }} style="width:100%;height:200px;object-fit:cover;display:block;filter:sepia(.08) saturate(.88)" alt=""><span style="position:absolute;left:0;right:0;bottom:0;padding:6px 10px;font-size:12px;color:#faf9f6;background:rgba(18,17,16,.6);font-family:var(--font-mono)">{{ b.cap }}</span></div>`
   Block data:
   ```ts
   type Block =
     | { type:'h'; text:string }
     | { type:'p'; text:string; color:'var(--fg1)'|'var(--fg3)' }
     | { type:'list'; items:{t:string}[] }
     | { type:'q'; text:string }
     | { type:'img'; src:string; cap:string };
   ```
   Not from plan (default):
   1. p (fg1): "The power went out at 9:40, mid-episode. We found the candles from the wedding, still in the box."
   2. q: "The loudest silence."
   3. img: `P('candles',800,400)`, cap "Kitchen table, by candle"
   4. p (fg3): "Keep writing…"
   From plan:
   1. h "Day 1 · Thu Apr 8 · Tokyo"; list ["JL 5 · JFK → HND", "Check in · Hotel Niwa", "Ichiran ramen"]; p (fg3) "Write about day 1…"
   2. h "Day 2 · Fri Apr 9 · Tokyo"; list ["Meiji Jingu", "Shibuya Sky", "teamLab Planets"]; p (fg3) "Write about day 2…"
   3. p (fg3) "… 13 more days below"
   The blocks are static rendered text in the prototype (not editable).

8. **Privacy footer**: `<div style="border-top:1px solid var(--border);padding-top:14px;display:flex;flex-direction:column;gap:12px">`
   - `<div style="display:flex;justify-content:space-between;align-items:center;font-size:14px"><span>Keep private to me until I publish</span><span onClick={{ togglePriv }} style="width:40px;height:24px;border-radius:999px;background:{{ privBg }};position:relative;cursor:pointer"><span style="position:absolute;top:3px;left:{{ privKnob }};width:18px;height:18px;border-radius:999px;background:#faf9f6;transition:left 150ms"></span></span></div>`
   - `<div style="font-size:12px;color:var(--fg3)">{{ privNote }}</div>`
   - `privBg = priv ? 'var(--accent)' : 'var(--surface-2)'`; `privKnob = priv ? '19px' : '3px'`; `togglePriv = {priv: !priv}`;
     `privNote = priv ? her + ' won’t see this in the timeline or get a notification until you publish.' : her + ' can see the draft and add her take now.'` (curly apostrophe in "won’t").

### 5.3 Interactions summary (Composer)
| Target | State change |
|---|---|
| Close | `go('memories')` |
| Publish | `go('memories')` |
| Clear (prefill banner) | `{fromPlan:false, cTitle:''}` |
| Title input | `{cTitle: value}` |
| Type chip | `{cType: label}` |
| Privacy toggle | `{priv: !priv}` |
| Date chip, place chip, + tag, Add, media tiles, toolbar, blocks | none |

Tweaks: `timelineLayout` and `showOnThisDay` do not affect the Composer.

---

## 6. Bindings referenced by these screens (from `renderVals()`)

Values used only here: `her`, `herIni`, `theme`, `isDark`, `fontKey`, `isSignin`, `inApp`, `isStep1`, `isStep2`, `locked`, `codeBoxes`, `code`, `codeErr`, `codeHint`, `trustBg`, `trustKnob`, `toStep1`, `toStep2`, `toggleTrust`, `onCode`, `enter`, `isMemories`, `memories`, `filters`, `layoutEditorial`, `layoutGrid`, `layoutJournal`, `showOnThisDay`, `openOnThisDay`, `goGallery`, `openSheet`, `sheet`, `closeSheet`, `openComposer`, `isGallery`, `back`, `galIsPhotos`, `galIsAlbums`, `galPhotos`, `galAlbums`, `galPhotosBg`, `galAlbumsBg`, `galFilters`, `galMonths`, `customAlbums`, `autoAlbums`, `selecting`, `selN`, `selLabel`, `selBg`, `toggleSelect`, `askDelete`, `delOpen`, `closeDel`, `doDelete`, `isComposer`, `fromPlan`, `clearPrefill`, `cTitle`, `onCTitle`, `cDates`, `cLoc`, `cLocColor`, `cTypes`, `cMediaN`, `cMedia`, `cTools`, `cBlocks`, `savedLabel`, `privBg`, `privKnob`, `togglePriv`, `privNote`, `tab`, `chatBadge`, `chatBadgeN`, `goMemories`, `goPlans`, `goCalendar`, `goChat`, `goUs`.

Detail-related values computed in the same section (`DETAIL`, `CAPS`, `d`, `lb`, `lbOpen`, `closeLb`, `nextLb`, `favLb`, `shareLb`, `reactions`) belong to the MEMORY DETAIL / LIGHTBOX spec; for cross-reference only:
- `DETAIL` keyed by memory id (`3` and `default`) with `take1a, quote, take1b, inline, inlineCap, take2`.
- `d = { ...MEM[detailId] (fallback MEM[2] = Asheville), ...DETAIL[id] || DETAIL.default, by, ini, hasPlan: id === 3, planName:'Three days in Asheville', gallery: 5 items [{src:P(imgSeed+'a',400,400), span:2, video:true, dur:'0:42'}, {src:P(id+'g2',400,400), span:1} .. 'g5'] each with open: () => setState({lb:i}) }`.
- `CAPS` = `['The creek, moments before.', 'Biscuit place, morning two.', 'Parkway pull-off.', 'Somebody’s porch, not ours.', 'Last morning. Packed the car twice.']`.
- `lb = { src: gallery[lbi].src.replace('/400/400','/900/900'), pos: (lbi+1)+' of '+5, cap: CAPS[lbi], meta: d.date.split('–')[0].trim() + ' · ' + d.by, favLabel: favs.includes(lbi) ? 'Favorited' : 'Favorite', favBg: 'var(--accent-soft)' | 'transparent', favBorder: 'var(--accent)' | '#2e2b26' }`, `lbi = s.lb ?? 0`, `lbOpen = s.lb !== null && s.screen === 'detail'`.
- Gallery tiles (`t.pick`) and `openOnThisDay` feed into this: they set `detailId` (and `lb`) before switching to `'detail'`.

## 7. Initial state (relevant keys)
`screen:'signin', step:1, code:'', codeErr:false, trust:true, locked:false, detailId:3, filter:'All', sheet:false, lb:null, favs:[], galSeg:'photos', galFilter:'All', selecting:false, sel:[], del:false, deleted:[], cTitle:'', cType:'Everyday', fromPlan:false, priv:true`.
For the SPA: the app starts on `memories` after Keycloak; `detailId`, `filter`, `galSeg`, `galFilter`, `selecting`, `sel`, `deleted`, `cType` and `priv` are session-persistent across screen changes (nothing resets them on navigation except the explicit setters listed above).
