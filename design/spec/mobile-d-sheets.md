# Mobile D — Sheets, dialogs and overlays

Source: `design/Ours - mobile prototype.dc.html`, template lines 696–878 (overlays) and 885–897 (notes panel); state and `renderVals()` at lines 922–1113.

All overlays live inside the 390 × 844 phone frame (`<x-import IOSDevice>`), inside the `<sc-if value="{{ inApp }}">` wrapper (line 95, closed at line 880), so `position:absolute; inset:0` is relative to the phone screen, not the page. They never render on the sign-in screen (`inApp = s.screen !== 'signin'`). Every overlay is a sibling of the tab bar and is rendered after it, so it paints above the screens and the tab bar.

Tokens referenced here (`.ours` at line 18; dark variants at line 19): `--bg`, `--surface`, `--surface-2`, `--fg1`, `--fg2`, `--fg3`, `--border`, `--accent`, `--accent-soft`, `--green`, `--plum`, `--ochre`, `--n1..--n4` (note paper colors: light `#f6ecd6 / #e6ebdc / #f1ddd2 / #e4e2ea`), `--font-serif`, `--font-sans`, `--font-mono`, `--shadow-md`. Hard-coded colors that are NOT tokens and must be copied literally: `#faf9f6` (knob / button text on accent and fg1), `#b33e26` (delete red), `#121110` and `#2e2b26`, `#a8a49a`, `#6e6a61`, `rgba(250,249,246,.1)` (lightbox).

---

## 0. Shared sheet chrome (reference as "sheet chrome")

Every bottom sheet below uses exactly this structure unless a section says otherwise.

```html
<!-- scrim: tapping it closes the sheet -->
<div onClick="{{ close }}" style="position:absolute;inset:0;background:rgba(0,0,0,.6);z-index:20"></div>
<!-- panel -->
<div style="position:absolute;left:0;right:0;bottom:0;z-index:21;background:var(--bg);border-radius:12px 12px 0 0;padding:12px 20px 40px;display:flex;flex-direction:column;gap:16px;border-top:1px solid var(--border)">
  <!-- drag handle (decorative only; no drag-to-dismiss logic in the prototype) -->
  <div style="width:36px;height:4px;border-radius:999px;background:var(--border);margin:0 auto"></div>
  ...
</div>
```

- Scrim: `rgba(0,0,0,.6)`, `z-index:20`, full inset, `onClick` = the sheet's close handler.
- Panel: anchored bottom, `z-index:21`, `background:var(--bg)`, top radius 12, `border-top:1px solid var(--border)`, padding `12px 20px 40px` (40px bottom clears the home indicator), column flex. The `gap` varies per sheet (16 / 14 / 4) and is called out below.
- Handle: 36 × 4, radius 999, `background:var(--border)`, centered with `margin:0 auto` (More sheet adds `margin-bottom:12px`).
- No transition/animation is defined in the prototype; sheets appear and disappear instantly on state change.
- There is no focus trap or Escape handling in the prototype; the scrim tap is the only implicit dismissal.
- "Tall sheet" variant (Flight, Stay, Paste review): panel also has `top:80px` and no padding on the panel itself; it is split into a fixed header (`padding:12px 20px 0`), a scrolling body (`flex:1;overflow:auto;padding:16px 20px 20px`) and a fixed footer (`padding:12px 20px 40px;border-top:1px solid var(--border);flex:none`). Header row: serif 26px title on the left, a 14px `var(--fg2)` `<a>` action ("Cancel" / "Discard") on the right, `align-items:baseline`.
- "Centered dialog" variant (Delete confirm, Opened sealed note): same scrim; the panel is `position:absolute;left:20px;right:20px;top:50%;transform:translateY(-50%);z-index:21;border:1px solid var(--border);border-radius:8px;box-shadow:var(--shadow-md)`. No handle.
- Toggle switch (used in New memory, Note composer, Stay): outer `width:40px;height:24px;border-radius:999px;background:{on ? var(--accent) : var(--surface-2)};position:relative`; knob `position:absolute;top:3px;left:{on ? 19px : 3px};width:18px;height:18px;border-radius:999px;background:#faf9f6`. The Note composer knobs add `transition:left 150ms`; the Stay "Paid" knob adds `box-shadow:0 1px 2px rgba(0,0,0,.2)`. The helper in the script is `tg(on) => ({ bg, knob })` (line 1008).
- Primary CTA (dark): `height:48px;border-radius:8px;border:none;background:var(--fg1);color:var(--bg);font-weight:500;font-size:15px;cursor:pointer`.
- Primary CTA (accent, forms): same but `background:var(--accent);color:#faf9f6`, `width:100%` inside the footer.
- Secondary CTA: `height:48px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--fg1);font-weight:500;font-size:15px`.
- Field label: `<div style="font-size:12px;color:var(--fg2);margin-bottom:4px">Label</div>` above the control.
- Text input (forms): `height:44px;width:100%;padding:0 12px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--fg1);font-size:14px`. Mono variant adds `font-family:var(--font-mono)`.
- Read-only date/time row (forms): `height:44px;padding:0 12px;border-radius:8px;border:1px solid var(--border);background:var(--surface);display:flex;align-items:center;justify-content:space-between;font-size:14px` with `<span>Day</span><span style="font-family:var(--font-mono)">Time</span>`.
- Key/value row (forms, "meta block"): `display:flex;justify-content:space-between;align-items:center;height:44px;font-size:14px` with `border-top:1px solid var(--border)` on every row except the first; key is `<span style="color:var(--fg2)">`.
- Attachment thumb: `width:24px;height:30px;border-radius:3px;background:var(--surface-2);border:1px solid var(--border)`; the add tile is `border:1px dashed var(--border);display:inline-flex;align-items:center;justify-content:center;color:var(--fg3);font-size:12px` with text `+`. Thumbs sit in `<span style="display:flex;gap:6px">`.

---

## 1. NEW MEMORY SHEET (lines 696–707)

**State**: `s.sheet: boolean` (default `false`). Bound as `sheet`.
**Open**: `openSheet` = `setState({ sheet: true })`, wired to the accent FAB on the Memories timeline (line 204: 52 × 52, radius 12, `bottom:104px;right:20px`, plus icon).
**Close**: `closeSheet` = `setState({ sheet: false })` via scrim tap. Also cleared by any tab change (`go()` sets `sheet:false`) and by `openComposer`.
**Chrome**: sheet chrome, panel `gap:16px`.

DOM inside the panel, in order:

1. Handle.
2. Title row `display:flex;justify-content:space-between;align-items:center`:
   - `<span style="font-family:var(--font-serif);font-size:26px">New memory</span>`
   - `<span style="font-family:var(--font-mono);font-size:11px;color:var(--fg3)">Draft · saved just now</span>`
3. Title input: `<input placeholder="Title" style="height:48px;border:none;border-bottom:1px solid var(--border);background:transparent;font-family:var(--font-serif);font-size:28px;color:var(--fg1);padding:0;border-radius:0">` — uncontrolled in the prototype (no binding).
4. Chip row `display:flex;gap:8px;flex-wrap:wrap` (static, not interactive):
   - `Sep 6, 2026` — `height:32px;padding:0 12px;border-radius:4px;border:1px solid var(--border);display:inline-flex;align-items:center;font-size:13px;color:var(--fg2)`
   - `Add a place` — same style
   - `Everyday` — selected chip: `border:1px solid var(--accent);background:var(--accent-soft);color:var(--fg1)` (otherwise same box)
5. Media grid `display:grid;grid-template-columns:repeat(4,1fr);gap:6px`:
   - Add tile: `aspect-ratio:1;border-radius:8px;border:1px dashed var(--border);display:flex;align-items:center;justify-content:center;color:var(--fg3)` containing a 20 × 20 camera SVG (stroke 1.5, path `M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z` + circle 12,13 r3).
   - Photo tile: `<img>` seed `new1` 200 × 200, `aspect-ratio:1;width:100%;border-radius:8px;object-fit:cover;filter:sepia(.08) saturate(.88)`.
   - Uploading tile: `position:relative;aspect-ratio:1;border-radius:8px;overflow:hidden` wrapping an `<img>` (seed `new2`, `width:100%;height:100%;object-fit:cover;filter:sepia(.08) saturate(.88)`) and a progress track `position:absolute;left:0;right:0;bottom:0;height:3px;background:var(--surface-2)` with fill `width:62%;height:100%;background:var(--accent)`.
   - (Fourth cell is empty.)
6. Privacy row `display:flex;justify-content:space-between;align-items:center;font-size:14px;color:var(--fg2)`: text `Keep private to me until I publish` + toggle. In this sheet the toggle is hard-coded ON (`background:var(--accent)`, knob `left:19px`) and has no handler. (The full composer binds the same concept to `s.priv` via `privBg/privKnob/togglePriv`; the sheet does not.)
7. CTA: `<button onClick="{{ openComposer }}">Keep writing →</button>` (dark primary CTA).

**Confirm**: `openComposer` = `setState({ screen: 'composer', sheet: false, fromPlan: false, cTitle: '' })` — closes the sheet and navigates to the full composer screen with an empty title. Nothing typed in the sheet's title input is carried over in the prototype.

---

## 2. MORE SHEET (lines 709–716)

**State**: `s.more: boolean` (default `false`). Bound as `moreOpen`.
**Open**: the plan-detail segment control's "More" segment (`segs[].pick` for key `more` = `setState({ more: true })`, line 978). When one of the More destinations is the current `planSeg`, that segment's label reads e.g. `Checklists ▾` (`{name} + ' ▾'`), else `More`.
**Close**: `closeMore` = `setState({ more: false })` via scrim; also closed by every item pick and by `go()`.
**Chrome**: sheet chrome, panel `gap:4px`; handle has `margin:0 auto 12px`.

Items: `<sc-for list="{{ moreItems }}" as="mi">` — one `<button onClick="{{ mi.pick }}">` per item with `height:52px;border:none;border-top:1px solid var(--border);background:transparent;color:var(--fg1);font-size:16px;text-align:left;cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:0`, containing `<span>{{ mi.label }}</span>` and `<span style="font-family:var(--font-mono);font-size:11px;color:var(--fg3)">{{ mi.meta }}</span>`.

`moreItems` (line 979) is a fixed list of 5, in this order — it is NOT filtered for the event variant even though `moreKeys` for the event plan omits `lists`:

| label | planSeg key | meta |
|---|---|---|
| Checklists | `lists` | `3 / 18` |
| Budget | `budget` | `$3,860 paid` |
| Documents | `docs` | `4 files` |
| Map | `map` | `9 pins` |
| Locked note | `locked` | (empty string) |

**Pick**: `setState({ planSeg: key, more: false })`.

---

## 3. NOTE COMPOSER — "Leave a note" (lines 718–735)

**State**: `s.noteSheet: boolean` (false), `s.noteDraft: string` (''), `s.noteColor: 'n1'|'n2'|'n3'|'n4'` ('n1'), `s.sched: boolean` (false), `s.seal: boolean` (false), `s.addedNotes: Note[]` ([]).
**Open**: `openNoteSheet` = `setState({ noteSheet: true })`, wired to the "Leave a note" button on the Chat > Notes segment (line 611: 36px tall pill with plus icon).
**Close**: `closeNoteSheet` = `setState({ noteSheet: false })` via scrim. Closing does NOT clear `noteDraft`, `noteColor`, `sched`, `seal` — reopening shows them as left.
**Chrome**: sheet chrome, panel `gap:14px`.

DOM inside the panel:

1. Handle.
2. Title row `display:flex;justify-content:space-between;align-items:baseline`: `<span style="font-family:var(--font-serif);font-size:26px">Leave a note</span>` and `<span style="font-size:12px;color:var(--fg3)">for {{ her }}</span>` (`her` = `props.herName ?? 'Yasmim'`).
3. Note paper `border-radius:8px;padding:16px;background:var(--{{ noteColor }});border:1px solid var(--border);display:flex;flex-direction:column;gap:12px;min-height:150px;transition:background 200ms`:
   - `<textarea value="{{ noteDraft }}" onChange="{{ onNoteDraft }}" placeholder="No title. Just say it." style="flex:1;min-height:70px;border:none;background:transparent;resize:none;font-size:16px;line-height:1.5;color:var(--fg1);padding:0;font-family:var(--font-sans)">` — controlled; `onNoteDraft = e => setState({ noteDraft: e.target.value })`.
   - Footer row `display:flex;justify-content:space-between;align-items:center`: signature `<span style="font-family:var(--font-serif);font-style:italic;font-size:16px;color:var(--fg2)">— Casey</span>` and `<button style="height:30px;padding:0 10px;border-radius:6px;border:1px dashed var(--border);background:transparent;color:var(--fg2);font-size:12px;cursor:pointer">+ photo</button>` (no handler).
4. Color row `display:flex;justify-content:space-between;align-items:center`: left `<span style="display:flex;gap:8px">` with `<sc-for list="{{ noteColors }}" as="c">` → `<button onClick="{{ c.pick }}" style="width:28px;height:28px;border-radius:999px;background:var(--{{ c.k }});border:2px solid {{ c.border }};cursor:pointer">`; right `<span style="font-size:12px;color:var(--fg3)">color</span>`.
   - `noteColors` (line 1007): keys `n1..n4`; `border` = `var(--fg1)` when `s.noteColor === k`, else `var(--border)`; `pick` = `setState({ noteColor: k })`.
5. Options block `display:flex;flex-direction:column;border-top:1px solid var(--border)` with two rows, each `display:flex;justify-content:space-between;align-items:center;min-height:48px;font-size:14px;cursor:pointer` (the whole row is the click target):
   - Schedule row (`onClick="{{ toggleSched }}"`): `<span>Schedule it<span style="color:var(--fg3)"> · {{ schedNote }}</span></span>` + toggle bound to `schedBg`/`schedKnob`. `schedNote` = `'Oct 3, 7:00 AM'` when on, `'appears now'` when off. `toggleSched` = `setState({ sched: !s.sched })`.
   - Seal row (adds `border-top:1px solid var(--border)`; `onClick="{{ toggleSeal }}"`): `<span>Seal it<span style="color:var(--fg3)"> · {{ her }} has to open it</span></span>` + toggle bound to `sealBg`/`sealKnob`. `toggleSeal` = `setState({ seal: !s.seal })`.
   - Toggle knobs here have `transition:left 150ms`.
6. CTA `<button onClick="{{ leaveNote }}">{{ leaveLabel }}</button>` (dark primary CTA).
   - `leaveLabel` = `s.seal ? 'Seal it and leave it' : s.sched ? 'Schedule it' : 'Leave it on the fridge'` (seal wins over schedule).

**Confirm** (`leaveNote`, line 1083): if `noteDraft.trim()` is empty, do nothing (button stays enabled; no error state). Otherwise
`setState({ noteSheet: false, noteDraft: '', addedNotes: [{ body: s.noteDraft, color: s.noteColor, from: 'Casey', time: s.sched ? 'Scheduled' : 'Just now', span: 1, scheduled: s.sched, when: 'Appears Oct 3, 7:00 AM' }, ...s.addedNotes] })`.
The new note is prepended to the Notes board (`notes = [...s.addedNotes, ...fixed five]`). `noteColor`, `sched` and `seal` are NOT reset. The `seal` flag is not written to the note object (sealed-by-me notes render like any other note on the board in the prototype).

Note object shape consumed by the board (line 624): `{ body, color: 'n1'..'n4', from, time, span: 1|2, scheduled?: boolean, when?: string, hasPhoto?: boolean, photo?: string }`. Scheduled notes show a 12px clock icon + `{{ n.when }}` in mono 11px `var(--fg3)`.

---

## 4. DELETE CONFIRM (lines 737–745)

**State**: `s.del: boolean` (false), plus `s.sel: string[]` (selected gallery tile ids), `s.deleted: string[]`, `s.selecting: boolean`. Bound as `delOpen`, `selN = s.sel.length`.
**Open**: `askDelete` = `if (s.sel.length) setState({ del: true })` — from the Gallery multi-select action bar; a no-op when nothing is selected.
**Close**: `closeDel` = `setState({ del: false })` via scrim or the "Keep them" button.
**Chrome**: centered dialog variant. Panel: `position:absolute;left:20px;right:20px;top:50%;transform:translateY(-50%);z-index:21;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:24px;display:flex;flex-direction:column;gap:14px;box-shadow:var(--shadow-md)`.

DOM:

1. `<div style="font-family:var(--font-serif);font-size:24px;line-height:1.1">Delete {{ selN }} photos?</div>` (no singular form in the prototype).
2. `<div style="font-size:14px;color:var(--fg2);line-height:1.5">They'll leave every memory and album they're in. {{ her }} will see they're gone. This can't be undone.</div>` (straight apostrophes in the source).
3. Button row `display:flex;gap:8px`:
   - `<button onClick="{{ closeDel }}" style="flex:1;height:44px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--fg1);font-size:14px;font-weight:500;cursor:pointer">Keep them</button>`
   - `<button onClick="{{ doDelete }}" style="flex:1;height:44px;border-radius:8px;border:none;background:#b33e26;color:#faf9f6;font-size:14px;font-weight:500;cursor:pointer">Delete</button>`

**Confirm** (`doDelete`): `setState({ del: false, deleted: [...s.deleted, ...s.sel], sel: [], selecting: false })` — tiles whose id is in `deleted` are filtered out of every gallery month; selection mode exits.

---

## 5. KIND PICKER — "Add to day" (lines 747–757)

**State**: `s.form: null | 'kinds' | 'flight' | 'stay' | 'paste'` (null). Bound as `kindsOpen = s.form === 'kinds'`, `flightOpen`, `stayOpen`, `pasteOpen` likewise. Exactly one of the four form overlays is visible at a time; switching sets `form` directly (no stack).
**Open**: `openKinds` = `setState({ form: 'kinds' })`, from the dashed "+ Add to day {{ dy.n }}" button under each itinerary day (line 356).
**Close**: `closeForms` = `setState({ form: null })` via scrim.
**Chrome**: sheet chrome, panel `gap:14px`.

DOM:

1. Handle.
2. `<div style="font-family:var(--font-serif);font-size:24px">Add to day 1</div>` — hard-coded "day 1" regardless of which day's button was tapped.
3. Grid `display:grid;grid-template-columns:repeat(3,1fr);gap:8px` of `<sc-for list="{{ kinds }}" as="k">` → `<button onClick="{{ k.pick }}" style="height:64px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--fg1);font-size:13px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px"><span style="font-family:var(--font-mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg3)">{{ k.abbr }}</span>{{ k.label }}</button>`.

   `kinds` (line 1021), in order:

   | label | abbr | pick → `form` |
   |---|---|---|
   | Flight | FLT | `'flight'` |
   | Stay | STY | `'stay'` |
   | Transport | TRN | `null` (closes the picker) |
   | Activity | ACT | `null` |
   | Food | EAT | `null` |
   | Ticket | TKT | `null` |

4. `<button onClick="{{ openPaste }}" style="height:48px;border-radius:8px;border:1px dashed var(--border);background:transparent;color:var(--fg1);font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">` with a 16 × 16 clipboard SVG (rect 8×4 at 8,2 rx1; path `M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2`) and text `Paste a confirmation instead`. `openPaste` = `setState({ form: 'paste' })`.
5. `<div style="font-size:12px;color:var(--fg3);text-align:center">Flight and Stay forms are designed in full; the others follow the same shape.</div>` (prototype annotation copy; it is part of the sheet as designed).

---

## 6. FLIGHT FORM (lines 759–779)

**State**: `flightOpen = s.form === 'flight'`. Opened from the Kind picker ("Flight") or from the Paste review's "Edit fields" (`openFlight` = `setState({ form: 'flight' })`). Closed by scrim, the "Cancel" link, or the save button — all `closeForms` (`form: null`). Nothing is persisted; all inputs are uncontrolled with hard-coded `value`s.
**Chrome**: tall sheet variant (`top:80px`). Header title `Flight`, header action `<a onClick="{{ closeForms }}" style="font-size:14px;color:var(--fg2);cursor:pointer">Cancel</a>`. Header wrapper `padding:12px 20px 0;display:flex;flex-direction:column;gap:10px;flex:none` containing handle + title row. Body `flex:1;overflow:auto;padding:16px 20px 20px;display:flex;flex-direction:column;gap:14px`.

Body, in order:

1. Grid `1fr 110px`, gap 8:
   - **Airline** — text input, default `Japan Airlines`.
   - **Flight no.** — mono text input, default `JL 5`.
2. Grid `1fr auto 1fr`, gap 8, `align-items:end`:
   - **From** — input default `JFK`, style `height:56px;width:100%;padding:0 12px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--fg1);font-size:26px;font-family:var(--font-serif);text-align:center`.
   - `<span style="color:var(--fg3);padding-bottom:16px">→</span>`
   - **To** — same style, default `HND`.
3. Grid `1fr 1fr`, gap 8:
   - **Departs** — read-only date/time row `Thu Apr 8` / `12:55 PM`; helper below `<div style="font-size:11px;color:var(--fg3);margin-top:3px;font-family:var(--font-mono)">America/New_York</div>`.
   - **Arrives** — `Fri Apr 9` / `4:15 PM`; helper `Asia/Tokyo · +1 day`.
4. Grid `1fr 1fr`, gap 8:
   - **Seats** — mono input, default `34A, 34B`.
   - **Confirmation** — mono input, default `Q7XR4M`, `font-size:16px;letter-spacing:.12em`.
5. Meta block `border-top:1px solid var(--border);padding-top:14px;display:flex;flex-direction:column;gap:10px`:
   - `Place` → `Terminal 1, JFK`
   - `Cost` → `<span style="font-family:var(--font-mono)">$1,840.00 <span style="color:var(--fg3)">USD</span></span>`
   - `Links` → `<span style="color:var(--accent)">jal.co.jp/manage →</span>`
   - `Attachments` → two filled thumbs + one add tile
   - Notes: wrapper `border-top:1px solid var(--border);padding-top:10px`; label `Notes`; box `min-height:64px;padding:10px 12px;border-radius:8px;border:1px solid var(--border);background:var(--surface);font-size:14px;color:var(--fg1);line-height:1.5` with text `Premium economy. Check-in opens 24h before.` (a div, not a textarea).

Footer: `<button onClick="{{ closeForms }}" style="width:100%;height:48px;border-radius:8px;border:none;background:var(--accent);color:#faf9f6;font-weight:500;font-size:15px;cursor:pointer">Save to day 1</button>`.

**Confirm**: `closeForms` only — no state is written; the itinerary is unchanged.

---

## 7. STAY FORM (lines 781–801)

**State**: `stayOpen = s.form === 'stay'`. Opened from the Kind picker ("Stay"). Closed by scrim / "Cancel" / save via `closeForms`.
**Chrome**: tall sheet variant, identical header pattern with title `Stay` and `Cancel`.

Body (`gap:14px`), in order:

1. **Name** — input default `Yoshikawa Inn`, `height:48px;...;font-size:18px;font-family:var(--font-serif)` (otherwise the standard input style).
2. **Address** — input default `135 Tominokoji, Nakagyo, Kyoto 604-8093`; helper `<div style="font-size:11px;color:var(--fg3);margin-top:3px">Matched on the map · Kyoto</div>`.
3. Grid `1fr 1fr`, gap 8:
   - **Check in** — read-only row `Tue Apr 13` / `3:00 PM`.
   - **Check out** — `Fri Apr 16` / `11:00 AM`.
4. `<div style="font-size:12px;color:var(--fg3);margin-top:-6px">3 nights · appears on days 6 – 9</div>`
5. Grid `1fr 1fr`, gap 8:
   - **Phone** — mono input, default `+81 75-221-5544`.
   - **Confirmation** — mono input, default `YK-2027-0413`, `letter-spacing:.06em` (14px, not 16px).
6. Meta block (same wrapper as Flight):
   - `Cost` → `<span style="font-family:var(--font-mono)">¥186,000 <span style="color:var(--fg3)">≈ $1,255</span></span>`
   - `Paid` → toggle, OFF, static (`background:var(--surface-2)`, knob `left:3px`, knob has `box-shadow:0 1px 2px rgba(0,0,0,.2)`), no handler.
   - `Attachments` → one filled thumb + add tile.
   - Notes box (same style as Flight; no explicit `color`): `Kaiseki dinner included both nights. Tell them about the shellfish thing.`

Footer: accent CTA `Save stay` → `closeForms`.

---

## 8. PASTE A CONFIRMATION — review (lines 803–817)

**State**: `pasteOpen = s.form === 'paste'`. Opened via `openPaste` from the Kind picker. Closed by scrim / "Discard" / "Save flight" via `closeForms`. "Edit fields" → `openFlight` (`form: 'flight'`), replacing this sheet with the Flight form.
**Chrome**: tall sheet variant. Header: title `Review before saving`, action `<a onClick="{{ closeForms }}" ...>Discard</a>`, then a third header line `<div style="font-size:12px;color:var(--fg3);line-height:1.5">Read from the text you pasted, on this device. Nothing was sent anywhere. Check every field — it guesses.</div>`. Body `gap:12px`.

Body:

1. Pasted-text preview `padding:10px 12px;border-radius:8px;background:var(--surface);border:1px solid var(--border);font-family:var(--font-mono);font-size:11px;color:var(--fg3);line-height:1.6;max-height:72px;overflow:hidden`:
   `Your booking is confirmed. Confirmation code Q7XR4M. JL0005 New York (JFK) 08 Apr 12:55 → Tokyo Haneda (HND) 09 Apr 16:15. Passengers: QUINN/CASEY, QUINN/YASMIM. Seats 34A 34B…`
2. Detection row `display:flex;align-items:center;gap:8px;font-size:13px`: tag `<span style="font-family:var(--font-mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--green);border:1px solid var(--green);padding:2px 6px;border-radius:3px">Flight</span>` + `<span style="color:var(--fg2)">detected · 7 of 8 fields</span>`.
3. `<sc-for list="{{ pasteFields }}" as="pf">` → row `display:grid;grid-template-columns:100px 1fr auto;gap:10px;align-items:center;padding:10px 0;border-top:1px solid var(--border)` with `<span style="font-size:12px;color:var(--fg2)">{{ pf.k }}</span>`, `<span style="font-size:14px;font-family:{{ pf.font }};color:{{ pf.color }}">{{ pf.v }}</span>`, `<span style="font-family:var(--font-mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:{{ pf.tagColor }}">{{ pf.tag }}</span>`.

   `pasteFields` (line 1022):

   | k | v | tag | font | color | tagColor |
   |---|---|---|---|---|---|
   | Airline | Japan Airlines | ok | inherit | fg1 | green |
   | Flight no. | JL 5 | ok | mono | fg1 | green |
   | From → To | JFK → HND | ok | inherit | fg1 | green |
   | Departs | Thu Apr 8 · 12:55 PM | ok | inherit | fg1 | green |
   | Arrives | Fri Apr 9 · 4:15 PM | check tz | inherit | fg1 | accent |
   | Seats | 34A, 34B | ok | mono | fg1 | green |
   | Confirmation | Q7XR4M | ok | mono | fg1 | green |
   | Cost | Not found | add | inherit | fg3 | accent |

   Rules: `font` is mono for Confirmation / Flight no. / Seats; `color` is `var(--fg3)` when tag is `add`; `tagColor` is `var(--green)` for `ok`, else `var(--accent)`.

Footer `display:flex;gap:8px`: secondary `Edit fields` (`onClick="{{ openFlight }}"`, `flex:1`) and accent `Save flight` (`onClick="{{ closeForms }}"`, `flex:1`).

**Confirm**: no state written.

---

## 9. NEW PLAN SHEET (lines 819–834)

**State**: `s.planSheet: boolean` (false), `s.planType: 'Trip' | 'Event'` ('Trip'). Bound as `planSheet`, and `tripBorder/tripBg/eventBorder/eventBg`.
**Open**: `openPlanSheet` = `setState({ planSheet: true })`, from the accent FAB on the Plans list (line 298, same FAB as Memories).
**Close**: `closePlanSheet` = `setState({ planSheet: false })` via scrim or the CTA; also cleared by `go()`. `planType` persists across open/close.
**Chrome**: sheet chrome, panel `gap:16px`.

DOM:

1. Handle.
2. `<div style="font-family:var(--font-serif);font-size:26px">New plan</div>`
3. Type picker `display:grid;grid-template-columns:1fr 1fr;gap:8px`; each card `padding:14px;border-radius:8px;border:1px solid {{ border }};background:{{ bg }};cursor:pointer` with `<div style="font-size:15px;font-weight:500">Title</div><div style="font-size:12px;color:var(--fg2);margin-top:4px;line-height:1.4">Sub</div>`:
   - `onClick="{{ pickTrip }}"` — `Trip` / `Days away. Itinerary, bookings, packing.`
   - `onClick="{{ pickEvent }}"` — `Event` / `One day. Schedule, guests, shopping.`
   - Selected: `border` `var(--accent)`, `bg` `var(--accent-soft)`; unselected: `var(--border)` / `transparent`. `pickTrip` = `setState({ planType: 'Trip' })`, `pickEvent` = `setState({ planType: 'Event' })`.
4. `<input placeholder="What are we calling it?" style="height:48px;border:none;border-bottom:1px solid var(--border);background:transparent;font-family:var(--font-serif);font-size:26px;color:var(--fg1);padding:0;border-radius:0">` — uncontrolled.
5. Chip row `display:flex;gap:8px;flex-wrap:wrap`, three dashed placeholder chips `height:32px;padding:0 12px;border-radius:4px;border:1px dashed var(--border);display:inline-flex;align-items:center;font-size:13px;color:var(--fg3)`: `Dates, if you know them`, `Where`, `Cover photo` (static).
6. CTA `<button onClick="{{ closePlanSheet }}">Start planning →</button>` (dark primary CTA).
7. `<div style="font-size:12px;color:var(--fg3);text-align:center">Nothing else is required. Add the rest as you go.</div>`

**Confirm**: `closePlanSheet` only — no plan is created and no navigation happens.

---

## 10. EVENT SHEET (lines 836–848)

**State**: `s.ev: number | null` (null) — the day-of-month key into `EVENTS`. Bound as `evOpen = !!s.ev` and `ev`.
**Open**: tapping a calendar day cell that has an event (`days[].pick` → `setState({ ev: n })`) or an agenda row for days 8/10/11/19 (`agenda[].pick`). Lake weekend / Japan agenda rows navigate to the plan instead.
**Close**: `closeEv` = `setState({ ev: null })` via scrim or either button; also cleared by `go()`.
**Chrome**: sheet chrome, panel `gap:14px`.

`ev` (line 1047) = `{ ...EVENTS[s.ev], dot: dotFor(owner), loc: evd.loc || 'No location', past: !!evd.past, future: !evd.past }`; when `s.ev` is null it is `{ past:false, future:true }`. `dotFor`: owner `c` → `var(--accent)`, `h` → `var(--green)`, `b` (both) → `var(--fg1)`.

`EVENTS` (lines 914–921):

| key | title | kind | owner | when | rule | loc | past |
|---|---|---|---|---|---|---|---|
| 8 | Dentist | Reminder | c | Tue Sep 8 · 2:30 PM | Does not repeat | Elm St Dental | |
| 10 | Book club | Recurring | h | Thu Sep 10 · 7:00 PM | Every second Thursday | Rosa’s place | |
| 11 | Dinner at Nonna’s | Event | b | Fri Sep 11 · 7:00 PM | Does not repeat | Nonna’s, 14 Grove St | |
| 19 | Casey’s parents visit | All day | b | Sat Sep 19 – Sun Sep 20 | Does not repeat | Home | |
| 25 | Pay the car | Recurring | c | Fri Sep 25 | Monthly on the 25th | (empty → `No location`) | |
| 2 | Farmers market | Event | b | Wed Sep 2 · 9:00 AM | Every Wednesday | Union Square | true |

DOM:

1. Handle.
2. Eyebrow `display:flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3)`: `<span style="width:8px;height:8px;border-radius:999px;background:{{ ev.dot }}"></span>{{ ev.kind }}`.
3. `<div style="font-family:var(--font-serif);font-size:30px;line-height:1.05">{{ ev.title }}</div>`
4. `<div style="font-size:15px;color:var(--fg1)">{{ ev.when }}</div>`
5. Details `display:flex;flex-direction:column;gap:8px;font-size:14px;color:var(--fg2);padding-top:8px;border-top:1px solid var(--border)`: three lines `{{ ev.rule }}`, `Remind: push 1 hour before · email the morning of` (static), `{{ ev.loc }}`.
6. `<sc-if value="{{ ev.past }}">` → accent CTA `Add a memory from this →` (`height:48px;border-radius:8px;border:none;background:var(--accent);color:#faf9f6;font-weight:500;font-size:15px`), `onClick="{{ closeEv }}"`.
7. `<sc-if value="{{ ev.future }}">` → secondary CTA `Edit`, `onClick="{{ closeEv }}"`.

**Confirm**: both buttons just close (`ev: null`). No memory is created.

---

## 11. LIGHTBOX (lines 850–868)

**State**: `s.lb: number | null` (null) — index into the current detail memory's `gallery`; `s.favs: number[]` ([]) — favorited indices (per index, not per memory). Bound as `lbOpen = s.lb !== null && s.screen === 'detail'` and `lb`.
**Open**: tapping a gallery tile on the memory detail screen (`d.gallery[i].open` → `setState({ lb: i })`, line 941). The Gallery screen's tile tap does `setState({ screen: 'detail', detailId: 3, lb: 1 })`, i.e. opens the Asheville detail with the lightbox already on tile 2.
**Close**: `closeLb` = `setState({ lb: null })` (X button). No scrim — the lightbox is a full-screen opaque layer.
**Chrome**: NOT the sheet chrome. Single layer `position:absolute;inset:0;background:#121110;z-index:30;display:flex;flex-direction:column;color:#faf9f6`. Always dark regardless of theme.

`lb` (line 944):
- `src` = the tile's 400 × 400 mock image URL with `/400/400` replaced by `/900/900` (gallery seeds: `{imgSeed}a`, `{id}g2`..`{id}g5`).
- `pos` = `'{i+1} of {gallery.length}'` (gallery always has 5 tiles).
- `cap` = `CAPS[i]`: `The creek, moments before.` / `Biscuit place, morning two.` / `Parkway pull-off.` / `Somebody’s porch, not ours.` / `Last morning. Packed the car twice.`
- `meta` = `d.date.split('–')[0].trim() + ' · ' + d.by` (e.g. `Aug 14 · Casey`).
- `favLabel` = `Favorited` / `Favorite`; `favBg` = `var(--accent-soft)` / `transparent`; `favBorder` = `var(--accent)` / `#2e2b26`.

DOM:

1. Top bar `display:flex;justify-content:space-between;align-items:center;padding:58px 16px 0`:
   - Close: `<button onClick="{{ closeLb }}" style="width:36px;height:36px;border-radius:8px;border:none;background:rgba(250,249,246,.1);color:#faf9f6;display:flex;align-items:center;justify-content:center;cursor:pointer">` with 18 × 18 X icon (`M18 6 6 18` / `m6 6 12 12`).
   - `<span style="font-family:var(--font-mono);font-size:12px;color:#a8a49a">{{ lb.pos }}</span>`
   - Overflow: same button style, three-dot icon (circles at 12/19/5, r1), no handler.
2. Stage `onClick="{{ nextLb }}" style="flex:1;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:16px 0"` with `<img src="{{ lb.src }}" style="width:100%;max-height:100%;object-fit:contain;display:block;filter:sepia(.08) saturate(.88)" alt="">`. `nextLb` = `setState({ lb: (i + 1) % gallery.length })` — tap anywhere on the image advances and wraps.
3. Bottom `padding:0 20px 44px;display:flex;flex-direction:column;gap:14px`:
   - `<div style="font-family:var(--font-serif);font-size:20px;line-height:1.3;color:#faf9f6">{{ lb.cap }}</div>`
   - `<div style="font-family:var(--font-mono);font-size:11px;color:#6e6a61">{{ lb.meta }} · swipe for next</div>`
   - Button row `display:flex;gap:8px`:
     - `<button onClick="{{ shareLb }}" style="flex:1;height:44px;border-radius:8px;border:1px solid #2e2b26;background:transparent;color:#faf9f6;font-size:14px;font-weight:500;cursor:pointer">Share to chat</button>`
     - `<button onClick="{{ favLb }}" style="flex:1;height:44px;border-radius:8px;border:1px solid {{ lb.favBorder }};background:{{ lb.favBg }};color:#faf9f6;font-size:14px;font-weight:500;cursor:pointer">{{ lb.favLabel }}</button>`

**Actions**:
- `favLb`: toggles the index in `s.favs`.
- `shareLb`: `setState({ lb: null, screen: 'chat', sent: [...s.sent, { id: Date.now(), from: 'me', type: 'photo', img: <tile 400×400 src>, time: 'Delivered' }] })` — closes, switches to Chat (messages segment unchanged) and appends a photo bubble from me.

---

## 12. OPENED SEALED NOTE (lines 870–878)

**State**: `s.sealedOpen: boolean` (false), `s.sealedDone: boolean` (false). Bound as `sealedOpen`; `hasUnopened = !s.sealedDone` controls the sealed-note card on the Notes board (line 613–617, "A sealed note from {{ her }}") and the chat badge count (`chatBadgeN = s.sealedDone ? '2' : '3'`).
**Open**: `openSealed` = `setState({ sealedOpen: true })` by tapping the sealed-note card.
**Close**: `closeSealed` = `setState({ sealedOpen: false, sealedDone: true })` via scrim or "Keep it →". Once closed, the sealed card disappears from the board for the session and the Chat tab badge drops from 3 to 2.
**Chrome**: centered dialog variant on note paper: `position:absolute;left:20px;right:20px;top:50%;transform:translateY(-50%);z-index:21;background:var(--n1);border:1px solid var(--border);border-radius:8px;padding:28px 24px;display:flex;flex-direction:column;gap:16px;box-shadow:var(--shadow-md)`.

DOM:

1. `<div style="font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3)">Sealed Sep 5 · opened just now</div>`
2. `<div style="font-family:var(--font-serif);font-size:24px;line-height:1.25">You were asleep before I got home and I didn't want to wake you. The porch light was on. That's the whole note, really.</div>` (straight apostrophes in the source).
3. Footer `display:flex;justify-content:space-between;align-items:baseline`: `<span style="font-family:var(--font-serif);font-style:italic;font-size:18px;color:var(--fg2)">— {{ her }}</span>` and `<a onClick="{{ closeSealed }}" style="font-size:14px;cursor:pointer">Keep it →</a>` (inherits `var(--fg1)`).

---

## 13. NOTES PANEL (lines 885–897) — canvas annotation, not product UI

A 300px-wide column rendered beside the phone frame on the design canvas (`width:300px;flex:none;display:flex;flex-direction:column;gap:24px;font-size:13px;line-height:1.55;color:#5a574f;padding-top:8px`). It is documentation for reviewers and is NOT part of the app; do not build it. Its content is useful as a behavioral checklist:

- Heading `Ours — mobile, round 1` (Instrument Serif 28px, `#121110`) with eyebrow `390 × 844 · clickable` (JetBrains Mono 11px, `.14em`, uppercase, `#8a857a`).
- **Try it**: Sign in → Continue → type `123456` (anything else shows the error). Tabs switch screens. Tap any memory card, the sealed note, a calendar day or agenda row, the + button, and send a chat message. "Lock now" in Us shows the expired-session state.
- **Tweaks**: theme (light / late night), her name, three timeline layouts (Editorial, Photo grid, Journal).
- **Design decisions**: terracotta is the one accent; sage is secondary and marks her events. Serif for titles and dates, sans for UI, mono for timestamps and eyebrows. Photos bleed edge-to-edge on the large card. "Her take" is a separate section, never merged. Placeholder photos are warmed and slightly desaturated (`filter:sepia(.08) saturate(.88)`).
- **Round 5**: Gallery (month-grouped grid, filters, Select → multi-select → Delete confirm; Albums tab); full composer ("Keep writing" from the sheet, or "Start the memory" on the post-trip banner → from-plan prefilled); Notes composer (color, schedule, seal; lands on the board); Plan map under More; Us prefs.
- **Round 4**: Simulate date tweak (Today mode, post-trip banner); "+ Add to day" → kind picker → Flight / Stay forms or Paste a confirmation (review state); "Anniversary weekend" event variant (Schedule / Guests segments).
- **Round 3**: Plans tab, plan detail segments, More sheet destinations (Checklists, Budget, Documents, Locked note), Notes as a Chat segment.
- **Round 2**: display-font tweak; sign-in per brief; gallery tile → lightbox; "Share to chat".
- **See also**: links to `Ours — desktop.dc.html` and `Ours — identity pages.dc.html`.
- **Still to do** (stale list from round 1): gallery/albums tab, full mobile composer, empty states, notes composer sheet.

---

## Appendix — state keys and handlers at a glance

| Overlay | visible when | open | close | confirm |
|---|---|---|---|---|
| New memory sheet | `s.sheet` | `openSheet` (Memories FAB) | `closeSheet`, `go()` | `openComposer` → composer screen, `sheet:false` |
| More sheet | `s.more` | segment "More" | `closeMore`, `go()` | `mi.pick` → `planSeg`, `more:false` |
| Note composer | `s.noteSheet` | `openNoteSheet` | `closeNoteSheet` | `leaveNote` → prepend to `addedNotes`, clear `noteDraft` |
| Delete confirm | `s.del` | `askDelete` (needs `sel.length`) | `closeDel` | `doDelete` → append `sel` to `deleted`, exit select mode |
| Kind picker | `s.form === 'kinds'` | `openKinds` | `closeForms` | `k.pick` → `form: 'flight' | 'stay' | null` |
| Flight form | `s.form === 'flight'` | kind pick / `openFlight` | `closeForms` | `closeForms` (no-op) |
| Stay form | `s.form === 'stay'` | kind pick | `closeForms` | `closeForms` (no-op) |
| Paste review | `s.form === 'paste'` | `openPaste` | `closeForms` | `closeForms` (no-op); `openFlight` for Edit fields |
| New plan sheet | `s.planSheet` | `openPlanSheet` (Plans FAB) | `closePlanSheet`, `go()` | `closePlanSheet` (no-op); `pickTrip`/`pickEvent` set `planType` |
| Event sheet | `!!s.ev` | day cell / agenda row → `ev: n` | `closeEv`, `go()` | `closeEv` |
| Lightbox | `s.lb !== null && screen === 'detail'` | gallery tile → `lb: i` | `closeLb` | `nextLb`, `favLb`, `shareLb` |
| Opened sealed note | `s.sealedOpen` | `openSealed` | `closeSealed` (sets `sealedDone:true`) | same as close |

`go(screen)` (line 924) resets `sheet`, `ev`, `more`, `planSheet` but not `noteSheet`, `form`, `del`, `lb`, `sealedOpen`.
