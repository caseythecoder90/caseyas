# Ours — tokens and components

Source of truth: `design/Ours - system sheet.dc.html` (component sheet), the `<style>` blocks of `design/Ours - mobile prototype.dc.html` (lines 13–29) and `design/Ours - desktop.dc.html` (lines 14–30), plus the `renderVals()` helpers that color things at runtime. Everything below is transcribed verbatim from those files; where the three files disagree the differences are called out explicitly.

The whole app lives inside one wrapper element carrying `class="ours"`, `data-theme="light|dark"` and `data-font="newsreader|cormorant|lora|instrument"`. Every token is a CSS custom property scoped to `.ours`, so theme and font switch by changing those two attributes only.

---

## 1. CSS custom properties

### 1.1 Light (default) — `.ours { ... }`

| Token | Light value | Role |
|---|---|---|
| `--bg` | `#faf9f6` | paper; page background, sheet background, tab bar tint, text on ink surfaces |
| `--surface` | `#f0ede5` | cards, inputs, sidebar, elevated panels |
| `--surface-2` | `#e8e4d9` | segmented-control track, toggle off state, skeleton bars, own chat bubble |
| `--fg1` | `#121110` | ink; primary text, active tab, selected chip fill, toast background |
| `--fg2` | `#5a574f` | secondary text, quiet buttons, inactive segment labels |
| `--fg3` | `#8a857a` | tertiary text, eyebrows, mono metadata, inactive tab, placeholders |
| `--border` | `#d4d0c5` | hairlines, card/input borders, drag handle |
| `--accent` | `#c84b31` | terracotta / clay; one highlight per screen, links, selection, FAB, primary button, Casey's things |
| `--accent-soft` | `rgba(200,75,49,.12)` | accent at 12%; selected chip fill, Casey vote chip, active sidebar row |
| `--green` | `#78866a` | sage; secondary, marks her things, booked/decided status |
| `--green-soft` | `rgba(120,134,106,.16)` | her vote chip, her avatar chip fill |
| `--plum` | `#7a5c7a` | plan color (Anniversary weekend), stay pins |
| `--ochre` | `#b58b3a` | plan color (Portugal, someday), ticket pins |
| `--danger` | `#b33e26` | destructive text (system sheet only; mobile/desktop use literal `#e26a4a` for danger text) |
| `--n1` | `#f6ecd6` | note palette: cream |
| `--n2` | `#e6ebdc` | note palette: moss |
| `--n3` | `#f1ddd2` | note palette: blush |
| `--n4` | `#e4e2ea` | note palette: slate |
| `--font-serif` | `'Newsreader',Georgia,serif` | display serif (system sheet + desktop default; see 1.4 for the mobile quirk) |
| `--font-sans` | `'Inter Tight',system-ui,sans-serif` | UI sans |
| `--font-mono` | `'JetBrains Mono',ui-monospace,monospace` | codes, times, prices, dates, eyebrows |
| `--shadow-md` | `0 8px 24px rgba(40,30,20,.12)` | FAB, menus, modals, map pin popover, selection bar (mobile + desktop only; not defined in system sheet) |

Desktop-only extras (defined on `.ours` in the mobile prototype line 20, not used by the desktop or system sheet):

| Token | Value |
|---|---|
| `--plum-soft` | `rgba(122,92,122,.16)` |
| `--ochre-soft` | `rgba(181,139,58,.16)` |

### 1.2 Dark — `.ours[data-theme="dark"] { ... }`

| Token | Dark value |
|---|---|
| `--bg` | `#121110` |
| `--surface` | `#1a1917` |
| `--surface-2` | `#23211e` |
| `--fg1` | `#faf9f6` |
| `--fg2` | `#a8a49a` |
| `--fg3` | `#6e6a61` |
| `--border` | `#2e2b26` |
| `--accent` | `#d4593a` |
| `--accent-soft` | `rgba(212,89,58,.16)` |
| `--green` | `#8a9a78` |
| `--green-soft` | `rgba(138,154,120,.18)` |
| `--plum` | `#a889a8` |
| `--ochre` | `#cfa65a` |
| `--danger` | `#e26a4a` |
| `--n1` | `#2b2519` |
| `--n2` | `#222619` |
| `--n3` | `#2c201b` |
| `--n4` | `#232229` |
| `--shadow-md` | `0 8px 24px rgba(0,0,0,.4)` |

`--plum-soft` / `--ochre-soft` have no dark override. Fonts do not change with theme.

### 1.3 Literal colors that are NOT tokens (used as written)

- `#faf9f6` — text/icon color on accent and ink fills (primary button label, FAB glyph, badge digit, toggle knob, media-tile duration chip text). Note it is literally paper-white in both themes, not `var(--bg)`.
- `#121110` — canvas body text and sign-in gradient end.
- `#e9e5dc` — outer canvas `body` background around the artboards (not part of the app).
- `#2e2b26`, `#a8a49a`, `rgba(26,25,23,.85)`, `rgba(18,17,16,.6)` — sign-in screen, which is always dark regardless of theme.
- `rgba(18,17,16,.55)` / `rgba(18,17,16,.6)` / `rgba(18,17,16,.5)` — dark scrims over photos (status chips on covers, media duration chip, desktop hero buttons).
- `rgba(0,0,0,.6)` — bottom-sheet and modal scrim.
- `#e26a4a` — danger text in mobile (Delete button in selection bar, code box error border).
- `color-mix(in oklab,var(--bg),transparent 12%)` (tab bar, sticky month headers) and `transparent 15%` (mobile month header) — blurred paper.

### 1.4 Font attribute — `data-font`

| Prop value (`displayFont`) | `fontKey` | `--font-serif` |
|---|---|---|
| `Newsreader` (default) | `newsreader` | `'Newsreader',Georgia,serif` |
| `Cormorant Garamond` | `cormorant` | `'Cormorant Garamond',Georgia,serif` |
| `Lora` | `lora` | `'Lora',Georgia,serif` |
| `Instrument Serif` | `instrument` | `'Instrument Serif',Georgia,serif` |

Mapping in every file: `fontKey = ({ 'Newsreader': 'newsreader', 'Cormorant Garamond': 'cormorant', 'Lora': 'lora' })[p.displayFont ?? 'Newsreader'] || 'instrument'`.

Rule differences between files:
- System sheet and desktop: base `.ours` sets `--font-serif:'Newsreader'`; overrides exist for `cormorant`, `lora`, `instrument`. No `newsreader` rule (base covers it).
- Mobile prototype: base `.ours` sets `--font-serif:'Instrument Serif'`; overrides exist for `newsreader`, `cormorant`, `lora`. No `instrument` rule (base covers it).
- Net effect is identical. Implement with base Newsreader and explicit rules for all four keys.

Google Fonts request used by all files (load equivalent faces locally or via the allowed mechanism, never hotlink in the app):
`Instrument+Serif:ital@0;1`, `Newsreader:ital,wght@0,400;0,500;1,400`, `Cormorant+Garamond:ital,wght@0,500;0,600;1,500`, `Lora:ital,wght@0,400;0,500;1,400`, `Inter+Tight:wght@400;500;600`, `JetBrains+Mono:wght@400;500`.

---

## 2. Global base rules (the `<style>` blocks)

### 2.1 Mobile prototype `<style>` (lines 13–29) — verbatim

```css
body{margin:0;background:#e9e5dc;font-family:'Inter Tight',system-ui,sans-serif;color:#121110}
a{color:#c84b31;text-decoration:none}a:hover{text-decoration:underline;text-underline-offset:3px}
input,button{font:inherit}
*{box-sizing:border-box}
.ours{--bg:#faf9f6;--surface:#f0ede5;--surface-2:#e8e4d9;--fg1:#121110;--fg2:#5a574f;--fg3:#8a857a;--border:#d4d0c5;--accent:#c84b31;--accent-soft:rgba(200,75,49,.12);--green:#78866a;--green-soft:rgba(120,134,106,.16);--n1:#f6ecd6;--n2:#e6ebdc;--n3:#f1ddd2;--n4:#e4e2ea;--font-serif:'Instrument Serif',Georgia,serif;--font-sans:'Inter Tight',system-ui,sans-serif;--font-mono:'JetBrains Mono',ui-monospace,monospace;--shadow-md:0 8px 24px rgba(40,30,20,.12)}
.ours[data-theme="dark"]{--bg:#121110;--surface:#1a1917;--surface-2:#23211e;--fg1:#faf9f6;--fg2:#a8a49a;--fg3:#6e6a61;--border:#2e2b26;--accent:#d4593a;--accent-soft:rgba(212,89,58,.16);--green:#8a9a78;--green-soft:rgba(138,154,120,.18);--n1:#2b2519;--n2:#222619;--n3:#2c201b;--n4:#232229;--shadow-md:0 8px 24px rgba(0,0,0,.4)}
.ours{--plum:#7a5c7a;--ochre:#b58b3a;--plum-soft:rgba(122,92,122,.16);--ochre-soft:rgba(181,139,58,.16)}
.ours[data-theme="dark"]{--plum:#a889a8;--ochre:#cfa65a}
.ours[data-font="newsreader"]{--font-serif:'Newsreader',Georgia,serif}
.ours[data-font="cormorant"]{--font-serif:'Cormorant Garamond',Georgia,serif}
.ours[data-font="lora"]{--font-serif:'Lora',Georgia,serif}
.ours ::-webkit-scrollbar{display:none}
.ours input::placeholder{color:var(--fg3)}
.ours input:focus{outline:2px solid var(--accent);outline-offset:2px}
.ours button:active{transform:translateY(1px)}
```

The mobile prototype defines no other classes; the only class used in its template is `class="ours"`. Every component there is inline-styled. The `.scr`, `.card`, `.kind`, `.chip`, `.btn`, `.sec`, `.sw`, `.note` utility classes live in the system sheet (section 2.3).

Mobile wrapper element: `<div class="ours" data-theme="{{ theme }}" data-font="{{ fontKey }}" style="flex:none">` containing an `IOSDevice` frame at `width 390 × height 844`, `dark="{{ isDark }}"`. The screen root inside the frame: `height:844px;display:flex;flex-direction:column;background:var(--bg);color:var(--fg1);font-family:var(--font-sans);font-size:15px;line-height:1.5;position:relative;overflow:hidden`.

### 2.2 Desktop `<style>` (lines 14–30) — verbatim

```css
body{margin:0;background:#e9e5dc;font-family:'Inter Tight',system-ui,sans-serif;color:#121110}
a{color:#c84b31;text-decoration:none}a:hover{text-decoration:underline;text-underline-offset:3px}
input,button,textarea{font:inherit}
*{box-sizing:border-box}
.ours{--bg:#faf9f6;--surface:#f0ede5;--surface-2:#e8e4d9;--fg1:#121110;--fg2:#5a574f;--fg3:#8a857a;--border:#d4d0c5;--accent:#c84b31;--accent-soft:rgba(200,75,49,.12);--green:#78866a;--green-soft:rgba(120,134,106,.16);--font-serif:'Newsreader',Georgia,serif;--font-sans:'Inter Tight',system-ui,sans-serif;--font-mono:'JetBrains Mono',ui-monospace,monospace;--shadow-md:0 8px 24px rgba(40,30,20,.12)}
.ours[data-theme="dark"]{--bg:#121110;--surface:#1a1917;--surface-2:#23211e;--fg1:#faf9f6;--fg2:#a8a49a;--fg3:#6e6a61;--border:#2e2b26;--accent:#d4593a;--accent-soft:rgba(212,89,58,.16);--green:#8a9a78;--green-soft:rgba(138,154,120,.18);--shadow-md:0 8px 24px rgba(0,0,0,.4)}
.ours[data-font="cormorant"]{--font-serif:'Cormorant Garamond',Georgia,serif}
.ours[data-font="lora"]{--font-serif:'Lora',Georgia,serif}
.ours[data-font="instrument"]{--font-serif:'Instrument Serif',Georgia,serif}
.ours input::placeholder,.ours textarea::placeholder{color:var(--fg3)}
.ours input:focus,.ours textarea:focus{outline:2px solid var(--accent);outline-offset:2px}
.ours button:active{transform:translateY(1px)}
.ours{--plum:#7a5c7a;--ochre:#b58b3a}
.ours[data-theme="dark"]{--plum:#a889a8;--ochre:#cfa65a}
```

Desktop has no note palette (`--n1..--n4`) and no `--danger`. Desktop wrapper: `<div class="ours" data-theme="{{ theme }}" data-font="{{ fontKey }}" style="width:1440px;height:960px;background:var(--bg);color:var(--fg1);font-family:var(--font-sans);font-size:15px;line-height:1.5;display:grid;grid-template-columns:240px 1fr;border:1px solid var(--border);border-radius:12px;overflow:hidden">`.

### 2.3 System sheet `<style>` — utility classes (verbatim)

```css
body{margin:0;background:#e9e5dc;font-family:'Inter Tight',system-ui,sans-serif;color:#121110}
a{color:#c84b31;text-decoration:none}a:hover{text-decoration:underline;text-underline-offset:3px}
input,button{font:inherit}
*{box-sizing:border-box}
.ours{--bg:#faf9f6;--surface:#f0ede5;--surface-2:#e8e4d9;--fg1:#121110;--fg2:#5a574f;--fg3:#8a857a;--border:#d4d0c5;--accent:#c84b31;--accent-soft:rgba(200,75,49,.12);--green:#78866a;--green-soft:rgba(120,134,106,.16);--plum:#7a5c7a;--ochre:#b58b3a;--danger:#b33e26;--n1:#f6ecd6;--n2:#e6ebdc;--n3:#f1ddd2;--n4:#e4e2ea;--font-serif:'Newsreader',Georgia,serif;--font-sans:'Inter Tight',system-ui,sans-serif;--font-mono:'JetBrains Mono',ui-monospace,monospace}
.ours[data-theme="dark"]{--bg:#121110;--surface:#1a1917;--surface-2:#23211e;--fg1:#faf9f6;--fg2:#a8a49a;--fg3:#6e6a61;--border:#2e2b26;--accent:#d4593a;--accent-soft:rgba(212,89,58,.16);--green:#8a9a78;--green-soft:rgba(138,154,120,.18);--plum:#a889a8;--ochre:#cfa65a;--danger:#e26a4a;--n1:#2b2519;--n2:#222619;--n3:#2c201b;--n4:#232229}
.ours[data-font="cormorant"]{--font-serif:'Cormorant Garamond',Georgia,serif}
.ours[data-font="lora"]{--font-serif:'Lora',Georgia,serif}
.ours[data-font="instrument"]{--font-serif:'Instrument Serif',Georgia,serif}
.sec{background:var(--bg);color:var(--fg1);border:1px solid var(--border);border-radius:12px;padding:28px;display:flex;flex-direction:column;gap:18px;font-family:var(--font-sans);font-size:14px;line-height:1.5}
.sec h2{margin:0;font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3);font-weight:500}
.sw{display:flex;flex-direction:column;gap:6px;font-family:var(--font-mono);font-size:10px;color:var(--fg2)}
.sw span{height:44px;border-radius:6px;border:1px solid var(--border)}
.btn{height:44px;padding:0 16px;border-radius:8px;font-weight:500;font-size:14px;cursor:pointer;white-space:nowrap}
.chip{height:30px;padding:0 12px;border-radius:4px;border:1px solid var(--border);display:inline-flex;align-items:center;font-size:13px;color:var(--fg2);white-space:nowrap}
.kind{font-family:var(--font-mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--fg3);border:1px solid var(--border);padding:2px 5px;border-radius:3px}
.card{border-radius:8px;border:1px solid var(--border);background:var(--surface);overflow:hidden}
.note{font-size:12px;color:var(--fg3)}
```

Class glossary:
- `.ours` — theme/font scope; the app root.
- `.sec` — a system-sheet section panel (12px radius hero panel). Not an app component, but its `h2` is the canonical eyebrow.
- `.sw` — swatch label (mono 10 / fg2), `.sw span` = 44px swatch with 6px radius.
- `.btn` — base button: 44px tall, 0 16px padding, 8px radius, weight 500, 14px, nowrap. Variants add border/background/color (section 5).
- `.chip` — filter/tag chip: 30px tall, 0 12px padding, 4px radius, 1px border, 13px, fg2, nowrap.
- `.kind` — mono status/kind pill: 9px mono, .1em tracking, uppercase, fg3, 1px border, 2px 5px padding, 3px radius. Status variants recolor `color` and `border-color` together (section 8).
- `.card` — 8px radius, 1px border, surface fill, overflow hidden.
- `.note` — 12px fg3 caption.

There is no `.scr` class in any file; mobile screens are inline-styled `position:absolute;inset:0` containers.

Global behaviors to replicate in the app stylesheet: `*{box-sizing:border-box}`, `input,button,textarea{font:inherit}`, links `color:var(--accent)` no underline, underline on hover with `text-underline-offset:3px`, hidden scrollbars inside `.ours`, placeholder `var(--fg3)`, focus ring `outline:2px solid var(--accent);outline-offset:2px`, press `button:active{transform:translateY(1px)}`.

---

## 3. Typography

Font roles:
- Display serif: `var(--font-serif)` — default `Newsreader`, alternates `Cormorant Garamond`, `Lora`, `Instrument Serif`, all with `Georgia,serif` fallback. Used for titles, plan names, big numbers, signatures, section labels (italic), route city names, sheet titles.
- Sans: `var(--font-sans)` = `'Inter Tight',system-ui,sans-serif`. Body, UI, buttons, list rows. Weights used: 400, 500, 600.
- Mono: `var(--font-mono)` = `'JetBrains Mono',ui-monospace,monospace`. Confirmation codes, times, prices, dates, eyebrows, kind pills, badges, vote chips. Weights 400, 500.

Type scale (system sheet "Type" section, plus sizes observed in the prototypes):

| Name | Family | Size | Line-height | Style | Used for |
|---|---|---|---|---|---|
| display | serif | 56px | 1 | normal | memory titles (desktop hero), plan names, big numbers, desktop calendar month name |
| wordmark | serif | 64px | .95 | `letter-spacing:-.01em` | sign-in "ours"; also 64px/1 for plan overview countdown number |
| h1 | serif | 36px | 1 | normal | screen titles (Memories, Plans, Calendar, Us, plan name on mobile) |
| detail title | serif | 38px | 1 | normal | memory detail title (mobile) |
| city / day | serif | 30–40px | 1–1.05 | normal | "Day N" (30), city header (40), event title (30), memory card title editorial (30/1.05), "Together since" value (30/1.1) |
| card title | serif | 26px | 1 | normal | route endpoints in booking card, sheet titles (26), sidebar countdown (32) |
| h2 | serif | 22px | 1.1 | italic | section labels, signatures ("Casey's take") |
| card title small | serif | 20px | 1.1 | normal | memory card title, plan card title, sheet title in system sheet, gallery month label |
| signature | serif | 16px | — | italic, `color:var(--fg2)` | note card "— Casey" |
| body | sans | 16px | 1.6 | normal | prose; 680px measure on desktop |
| screen base | sans | 15px | 1.5 | normal | mobile/desktop root font-size |
| label | sans | 14px | — | 400/500 | UI, buttons, list rows |
| small | sans | 13px | — | normal | chips, secondary meta, sidebar name |
| caption | sans | 12px | — | normal, fg3 | `.note`, card meta, countdown line |
| micro | sans | 10px | — | normal | tab bar labels |
| mono | mono | 12px | — | normal | confirmation codes, times, prices, dates |
| mono meta | mono | 10–11px | — | normal, fg3 | card date lines, checklist due dates, draft state |
| mono code | mono | 16px | `letter-spacing:.12em` | normal | confirmation code on booking card |
| mono code box | mono | 20px | — | normal | 2FA digit box |
| eyebrow | mono | 11px | — | `letter-spacing:.14em;text-transform:uppercase;color:var(--fg3)` | "on this day", "next up", section heads, month headers; 10px variant in sidebar/plan card labels |
| kind pill | mono | 9px | — | `letter-spacing:.1em;text-transform:uppercase` | `.kind` |
| cover chip | mono | 10px | — | `letter-spacing:.12em;text-transform:uppercase;color:#faf9f6` | status chip on plan cover |

Body prose: `font-size:16px;line-height:1.6;max-width:520px` on the sheet; "680px measure on desktop".

---

## 4. Radii, shadows, motion

Radii rule (verbatim): "Radii: 4 chips/inputs · 8 cards/sheets · 12 hero panels & bubbles · 999 avatars only."

| Radius | Where |
|---|---|
| 3px | `.kind` pill, document tile count badge |
| 4px | chips, filter buttons, segmented-control segments, checklist checkbox, cover status chip, media duration chip, kind pill on plan cards |
| 6px | segmented-control track, swatches, menu rows (desktop), media tile, document tile, selection-bar buttons, "+ photo" dashed button, sidebar nav rows |
| 8px | cards, inputs (44/48px), buttons, sheets' inner panels, FAB-adjacent panels, modals, toast, code boxes, note card, empty state |
| 12px | hero panels, `.sec`, bottom sheet top corners (`12px 12px 0 0`), FAB (52px square), chat link card, sign-in wrapper |
| 999px | avatars, vote chips, toggles, badges, drag handle, note color dots, map pins (`999px 999px 999px 0` teardrop) |

Shadows: only `var(--shadow-md)` = `0 8px 24px rgba(40,30,20,.12)` light / `0 8px 24px rgba(0,0,0,.4)` dark. Used on FAB, desktop "New" menu, modals (delete confirm, sealed note), selection action bar, map pin popover. Map pins themselves use `box-shadow:0 1px 2px rgba(0,0,0,.2)`. Cards have no shadow; they use borders.

Motion (verbatim): "120ms hover/press · 200ms sheets and segment switches · 400ms screen transitions. cubic-bezier(.22,1,.36,1). Opacity + ≤8px translate. Sealed note opens with a 200ms fade, no envelope animation. Reduce-motion → instant."

Observed transitions in the prototypes:
- Toggle knob: `transition:left 150ms cubic-bezier(.22,1,.36,1)` (sign-in) / `transition:left 150ms` (elsewhere); track `transition:background 150ms`.
- Note composer card background: `transition:background 200ms`.
- Locked note blur: `transition:filter 200ms` (blur `6px` → `0px`).
- Map pin size: `transition:width 150ms,height 150ms` (16px → 22px mobile, 24px desktop).
- Press: `button:active{transform:translateY(1px)}` — "Press = 1px down. No scale, no bounce."

---

## 5. Buttons

Base `.btn`: `height:44px;padding:0 16px;border-radius:8px;font-weight:500;font-size:14px;cursor:pointer;white-space:nowrap`. "44px tall on mobile, 36–40px in dense desktop rows."

| Variant | Inline style (system sheet) |
|---|---|
| Primary | `border:1px solid var(--accent);background:var(--accent);color:#faf9f6` |
| Secondary | `border:1px solid var(--border);background:transparent;color:var(--fg1)` |
| Quiet | `border:none;background:transparent;color:var(--fg2)` |
| Destructive | `border:1px solid var(--border);background:transparent;color:var(--danger)` |
| Disabled | primary styles plus `opacity:.4;cursor:not-allowed` |

Other button forms seen in the prototypes:
- Ink primary (sheet CTA): `height:48px;border-radius:8px;border:none;background:var(--fg1);color:var(--bg);font-weight:500;font-size:15px` ("Keep writing →", "Leave it on the fridge").
- Desktop primary: `height:36px;padding:0 16px;border-radius:8px;border:none;background:var(--accent);color:#faf9f6;font-size:14px;font-weight:500` ("Publish"); sidebar "New": `width:100%;height:44px;border-radius:8px;border:none;background:var(--accent);color:#faf9f6;font-weight:500;font-size:14px;display:flex;align-items:center;justify-content:center;gap:8px` with a 16px plus icon.
- Desktop secondary: `height:36px;padding:0 12px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--fg1);font-size:13px` ("← Back", "Open in Maps").
- Over-photo button: `height:36px;padding:0 14px;border-radius:8px;border:none;background:rgba(18,17,16,.5);color:#faf9f6;font-size:13px`.
- Empty-state CTA: secondary with `margin-top:14px;height:40px`.
- FAB (mobile): `position:absolute;right:20px;bottom:104px;width:52px;height:52px;border-radius:12px;border:none;background:var(--accent);color:#faf9f6;box-shadow:var(--shadow-md);display:flex;align-items:center;justify-content:center;z-index:5`, plus icon 22px stroke 1.5.
- Icon button (desktop chat): `width:40px;height:40px;border:none;background:transparent;color:var(--fg2)`; icon 20px.
- Menu row (desktop "New" menu): `height:40px;padding:0 10px;border:none;border-radius:6px;background:transparent;color:var(--fg1);font-size:14px;text-align:left;display:flex;justify-content:space-between;align-items:center`, hint `font-size:12px;color:var(--fg3)`. Menu container: `position:absolute;top:50px;left:0;right:0;z-index:20;background:var(--bg);border:1px solid var(--border);border-radius:8px;box-shadow:var(--shadow-md);padding:6px;display:flex;flex-direction:column`.
- More-sheet row (mobile): `height:52px;border:none;border-top:1px solid var(--border);background:transparent;color:var(--fg1);font-size:16px;text-align:left;display:flex;justify-content:space-between;align-items:center;padding:0`, meta `mono 11px fg3`.

---

## 6. Inputs, pickers, toggles, code boxes

- Text input: `height:44px;padding:0 12px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--fg1);font-size:14px`. Placeholder fg3. Focus ring accent 2px, offset 2px.
- Sheet/composer title input: `height:48px;border:none;border-bottom:1px solid var(--border);background:transparent;font-family:var(--font-serif);font-size:28px;color:var(--fg1);padding:0;border-radius:0` (mobile "New memory"); composer screen variant `height:56px; font-size:32px`.
- Sign-in inputs (always dark): `height:48px;padding:0 14px;border-radius:8px;border:1px solid #2e2b26;background:rgba(26,25,23,.85);color:#faf9f6;font-size:15px`.
- Date/time picker: `height:44px;padding:0 12px;border-radius:8px;border:1px solid var(--border);background:var(--surface);display:flex;align-items:center;justify-content:space-between;font-size:14px` — left `Thu Apr 8`, right `font-family:var(--font-mono)` `12:55 PM`. Two pickers sit in `grid-template-columns:1fr 1fr;gap:8px`.
- Timezone picker: same box with `color:var(--fg2)`; label `Timezone`, value `font-family:var(--font-mono);font-size:12px` `Asia/Tokyo`.
- Toggle: track `width:40px;height:24px;border-radius:999px;background:var(--accent)` on / `var(--surface-2)` off (sign-in uses `#2e2b26` off); knob `position:absolute;top:3px;left:19px` on / `left:3px` off; `width:18px;height:18px;border-radius:999px;background:#faf9f6`. Helper: `tg = on => ({ bg: on ? 'var(--accent)' : 'var(--surface-2)', knob: on ? '19px' : '3px' })`. Compact toggle (offline): `width:36px;height:22px`, knob left `17px` on.
- Search field (desktop): `display:flex;align-items:center;gap:8px;height:32px;padding:0 12px;border:1px solid var(--border);border-radius:4px;color:var(--fg3);font-size:13px;width:180px` (timeline) / `height:36px; border-radius:6px; width:240px` (chat) / `height:40px;padding:0 14px;border-radius:8px;background:var(--surface);font-size:14px;width:320px` (calendar); 14–16px search icon.
- Code boxes (2FA, 6 digits): `display:grid;grid-template-columns:repeat(6,1fr);gap:8px`; each `height:48px;border-radius:8px;border:1px solid var(--border);background:var(--surface);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:20px`. The active (next) box has `border:1px solid var(--fg1)`. On the dark sign-in screen: empty `#2e2b26`, active `#faf9f6`, error `#e26a4a`.
- Textarea (note composer): `flex:1;min-height:70px;border:none;background:transparent;resize:none;font-size:16px;line-height:1.5;color:var(--fg1);padding:0;font-family:var(--font-sans)`, placeholder "No title. Just say it."

---

## 7. Chips, segmented control

Chip base `.chip`: `height:30px;padding:0 12px;border-radius:4px;border:1px solid var(--border);display:inline-flex;align-items:center;font-size:13px;color:var(--fg2);white-space:nowrap`. Mobile sheet chips use `height:32px`; desktop filter buttons `height:32px;font-weight:500`.

| State | Style |
|---|---|
| Selected (filter) | `background:var(--fg1);color:var(--bg);border-color:var(--fg1)` |
| Default | base |
| Accent-selected (type/tag) | `border-color:var(--accent);background:var(--accent-soft);color:var(--fg1)` |
| Add | `border-style:dashed;color:var(--fg3)` ("+ tag") |

Filter helper (mobile + desktop, identical): `bg: selected ? 'var(--fg1)' : 'transparent', color: selected ? 'var(--bg)' : 'var(--fg2)', border: selected ? 'var(--fg1)' : 'var(--border)'`. Memory filters: `All, Trips, Date nights, Everyday, Milestones, Videos`. Gallery filters: `All, Photos, Videos, Favorites, Casey, {her}`. Idea filters: `All, Tokyo, Kyoto, Osaka, Shortlisted, Decided`.

Type chips (composer, `cTypes`): `Trip, Date night, Everyday, Milestone` with `bg: on ? 'var(--accent-soft)' : 'transparent', border: on ? 'var(--accent)' : 'var(--border)'`. Reaction chips use the same accent-selected pattern.

Segmented control: track `display:flex;gap:2px;padding:2px;border-radius:6px;background:var(--surface-2);font-size:13px;width:fit-content`; segment `height:30px;padding:0 12px;border-radius:4px;display:flex;align-items:center;font-weight:500`; active `background:var(--bg)` (fg1 text), inactive `color:var(--fg2)` transparent. Desktop calendar variant: segments are buttons `height:32px;padding:0 14px;border:none;color:var(--fg1)`. Helper: `segBg = active ? 'var(--bg)' : 'transparent'`.

Plan segment tabs (mobile plan screen, underline style): `edge: on ? 'var(--accent)' : 'transparent', color: on ? 'var(--fg1)' : 'var(--fg2)'`.

---

## 8. Status pills (`.kind` variants)

Base `.kind`: `font-family:var(--font-mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--fg3);border:1px solid var(--border);padding:2px 5px;border-radius:3px`.

| Status | `color` / `border-color` |
|---|---|
| planning | `var(--fg1)` / `var(--fg1)` |
| booked | `var(--green)` / `var(--green)` |
| shortlisted | `var(--accent)` / `var(--accent)` |
| decided | `var(--green)` / `var(--green)` |
| idea | base (fg3 / border) |
| dreaming | base (fg3 / border) |
| done | base (fg3 / border) |
| underway (simulated "during") | not on the sheet; shown via plan cover chip |

Runtime helper for ideas: `stColor = st => st === 'decided' ? 'var(--green)' : st === 'shortlisted' ? 'var(--accent)' : 'var(--fg3)'`.

Plan-card status pill (mobile, small cards): `font-family:var(--font-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--fg2);border:1px solid var(--border);padding:3px 6px;border-radius:4px`. Plan header: same with `font-size:10px;letter-spacing:.12em;color:var(--fg1);padding:3px 7px`. Cover chip on large plan card: `position:absolute;top:12px;left:12px;font-family:var(--font-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#faf9f6;background:rgba(18,17,16,.55);padding:4px 8px;border-radius:4px`; countdown chip bottom-right: `font-family:var(--font-serif);font-size:20px;color:#faf9f6;background:rgba(18,17,16,.55);padding:4px 10px;border-radius:4px`.

Plan colors (from `plans-data.js`): Japan `var(--accent)`, Lake weekend `var(--green)`, Anniversary weekend `var(--plum)`, Portugal `var(--ochre)`, Asheville (past) `var(--fg3)`. Rendered as a 6px dot: `width:6px;height:6px;border-radius:999px;background:<color>`.

Kind → color for map pins and itinerary rows: `kindColor = k => ({ food: 'var(--accent)', activity: 'var(--green)', stay: 'var(--plum)', ticket: 'var(--ochre)', transport: 'var(--fg2)', flight: 'var(--fg2)' })[k] || 'var(--fg2)'`.

Ownership dot: `dotFor = o => o === 'c' ? 'var(--accent)' : o === 'h' ? 'var(--green)' : 'var(--fg1)'` (Casey / her / both).

---

## 9. Item kinds (nine icons)

Rule (verbatim): "Lucide outline, 1.5px stroke, currentColor, 16–20px. The mono abbreviation is the fallback where an icon would be too small (itinerary rows, chat cards)."

SVG wrapper: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">…</svg>`.

| Label | Abbr | Lucide icon | Path data |
|---|---|---|---|
| Flight | `FLT` | `plane` | `<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>` |
| Stay | `STY` | `bed-single` | `<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>` |
| Train | `TRN` | `train-front` (tram-front) | `<rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><path d="M8 15h.01"/><path d="M16 15h.01"/>` |
| Car | `CAR` | `car` | `<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>` |
| Activity | `ACT` | `mountain` | `<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>` |
| Food | `EAT` | `utensils` | `<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>` |
| Ticket | `TKT` | `ticket` | `<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>` |
| Idea | `IDEA` | `lightbulb` | `<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>` |
| Note | `NOTE` | `file-text` (file) | `<path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/>` |

The mobile "add item" kinds sheet lists six: Flight/FLT, Stay/STY, Transport/TRN, Activity/ACT, Food/EAT, Ticket/TKT.

Kind row on the sheet: `display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;border:1px solid var(--border);background:var(--surface)`, icon `color:var(--fg1)`, label `font-size:13px`, abbr as `.kind` with `display:inline-block;margin-top:3px`.

Other Lucide icons used (all stroke 1.5, currentColor): tab bar `image` (Memories), `map` (Plans), `calendar` (Calendar), `message-circle` (Chat), `users` (Us), all 22px; `plus` (FAB, New); `camera` (add photo); `lock` (locked banner); `check` at stroke 2.2 (checklist); `search`.

---

## 10. Avatars and vote chips

- Avatar: `width:32px;height:32px;border-radius:999px;object-fit:cover;filter:sepia(.2) saturate(.6);border:2px solid var(--bg)`. Pair: second avatar `margin-left:-10px`. Desktop sidebar pair is 28px with `margin-left:-8px` and `border:2px solid var(--surface)`; desktop chat header avatar 40px without border. Images come from the mock image helper (design seeds `caseyav`, `herav`).
- Vote chips: `width:24px;height:24px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:10px`, gap 4px between the two. Casey: `background:var(--accent-soft);color:var(--accent)`, glyph `C` + vote. Her: `background:var(--green-soft);color:var(--green)`, glyph `{herIni}` + vote. Small variant on idea cards: 20px, 9px font (sheet) or 22px, 9px font (mobile), gap 3–4px.
- Vote glyphs (verbatim): "votes: ↑ like, ~ meh, ✕ no". Helper: `vote = v => v === 'like' ? '↑' : v === 'meh' ? '~' : '✕'`.
- Assignee chip (checklist): 20px, 9px mono, same fills, glyph is the initial only (`C` / `{herIni}`). Helper: `whoBg: who === 'C' ? 'var(--accent-soft)' : 'var(--green-soft)', whoFg: who === 'C' ? 'var(--accent)' : 'var(--green)'`.

Rule (verbatim): "Sage marks {her}'s things; terracotta marks Casey's; ink marks both." Accent rule: "Accent is a brushstroke, not a fill: one highlight per screen, links, selection, the FAB."

---

## 11. Empty state and toast

Empty state: `padding:28px;border-radius:8px;border:1px dashed var(--border);text-align:center`; title `font-family:var(--font-serif);font-size:24px;line-height:1.1` "Nothing here yet."; sub `font-size:14px;color:var(--fg2);margin-top:6px` "Start with how you met."; CTA secondary `.btn` with `margin-top:14px;height:40px` "Write the first one →".

Toast: `display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:8px;background:var(--fg1);color:var(--bg);font-size:14px;max-width:360px`; message "Saved to Japan, spring 2027"; action `<a style="color:var(--accent);font-size:13px">Undo</a>`.

Selection action bar (mobile gallery, same ink surface): `position:absolute;left:12px;right:12px;bottom:100px;z-index:7;background:var(--fg1);color:var(--bg);border-radius:8px;padding:10px 12px;display:flex;align-items:center;gap:6px;box-shadow:var(--shadow-md)`; count `font-family:var(--font-mono);font-size:12px;padding:0 6px`; actions `height:32px;padding:0 10px;border-radius:6px;border:none;background:transparent;color:var(--bg);font-size:12px`; Delete `color:#e26a4a`.

Modal (delete confirm / sealed note): `position:absolute;left:20px;right:20px;top:50%;transform:translateY(-50%);z-index:21;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:24px;display:flex;flex-direction:column;gap:14px;box-shadow:var(--shadow-md)`; sealed note variant `background:var(--n1);padding:28px 24px;gap:16px`.

---

## 12. Cards (exact inline styles from the system sheet)

All cards start from `.card` = `border-radius:8px;border:1px solid var(--border);background:var(--surface);overflow:hidden`. Photos always get `filter:sepia(.08) saturate(.88)`; avatars `sepia(.2) saturate(.6)`.

### 12.1 Memory card
```html
<div class="card">
  <img style="width:100%;height:110px;object-fit:cover;display:block;filter:sepia(.08) saturate(.88)" alt="">
  <div style="padding:12px 14px">
    <div style="font-family:var(--font-mono);font-size:10px;color:var(--fg3)">Aug 29, 2026 · 9 photos</div>
    <div style="font-family:var(--font-serif);font-size:20px;line-height:1.1;margin-top:4px">The night the power went out</div>
  </div>
</div>
```

### 12.2 Plan card
```html
<div class="card" style="padding:12px 14px;display:flex;flex-direction:column;gap:4px">
  <div style="display:flex;align-items:center;gap:8px"><span style="width:6px;height:6px;border-radius:999px;background:var(--accent)"></span><span style="font-family:var(--font-mono);font-size:10px;color:var(--fg3)">Apr 8 – 22, 2027</span></div>
  <div style="font-family:var(--font-serif);font-size:20px;line-height:1.1">Japan, spring 2027</div>
  <div style="font-size:12px;color:var(--fg3)">12 ideas · 4 booked · 3/18</div>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px"><span class="kind">planning</span><span style="font-size:12px;color:var(--accent)">in 214 days</span></div>
</div>
```
Large plan card (mobile "Up next"): cover `position:relative;height:200px` with the cover status chip and serif countdown chip described in section 8.

### 12.3 Itinerary item
```html
<div class="card" style="padding:12px 14px;display:grid;grid-template-columns:60px 1fr;gap:10px">
  <div><div style="font-family:var(--font-mono);font-size:12px">12:55 PM</div><div class="kind" style="display:inline-block;margin-top:4px">flight</div></div>
  <div>
    <div style="font-size:14px;font-weight:500;display:flex;gap:8px;align-items:center">JL 5 · JFK → HND<span class="kind" style="color:var(--green);border-color:var(--green)">booked</span></div>
    <div style="font-size:12px;color:var(--fg2)">Terminal 1 · $1,840 · 2 files</div>
  </div>
</div>
```

### 12.4 Booking (route) card
```html
<div class="card" style="padding:14px">
  <div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-size:14px;font-weight:500">Nozomi 23</span><span class="note">JR Pass</span></div>
  <div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;margin-top:8px"><span style="font-family:var(--font-serif);font-size:26px;line-height:1">Tokyo</span><span style="color:var(--fg3)">→</span><span style="font-family:var(--font-serif);font-size:26px;line-height:1;text-align:right">Kyoto</span></div>
  <div style="font-family:var(--font-mono);font-size:16px;letter-spacing:.12em;margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">Q7XR4M</div>
</div>
```
Mobile booking screen uses 34px serif endpoints with `gap:12px`.

### 12.5 Idea card
```html
<div class="card">
  <img style="width:100%;height:80px;object-fit:cover;display:block;filter:sepia(.08) saturate(.88)" alt="">
  <div style="padding:10px 12px;display:flex;flex-direction:column;gap:6px">
    <div style="font-size:13px;font-weight:500">Fushimi Inari at sunrise</div>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span style="display:flex;gap:3px"><span style="width:20px;height:20px;border-radius:999px;background:var(--accent-soft);color:var(--accent);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:9px">C↑</span><span style="width:20px;height:20px;border-radius:999px;background:var(--green-soft);color:var(--green);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:9px">{herIni}↑</span></span>
      <span class="kind" style="color:var(--accent);border-color:var(--accent)">shortlisted</span>
    </div>
  </div>
</div>
```
Mobile idea card body: `padding:10px 12px 12px;gap:6px;flex:1`, title `font-size:14px;line-height:1.3;font-weight:500`, meta `font-size:11px;color:var(--fg3)` "{city} · {by}", vote chips 22px / 9px.

### 12.6 Checklist row
```html
<!-- done -->
<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);font-size:14px">
  <span style="width:20px;height:20px;border-radius:4px;background:var(--accent);display:inline-flex;align-items:center;justify-content:center;color:#faf9f6"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg></span>
  <span style="flex:1;color:var(--fg3);text-decoration:line-through">Renew passport</span>
  <span style="width:20px;height:20px;border-radius:999px;background:var(--accent-soft);color:var(--accent);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:9px">C</span>
</div>
<!-- open -->
<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);font-size:14px">
  <span style="width:20px;height:20px;border-radius:4px;border:1px solid var(--border)"></span>
  <span style="flex:1">Buy JR Pass vouchers</span>
  <span style="font-family:var(--font-mono);font-size:11px;color:var(--fg3)">Mar 1</span>
  <span style="width:20px;height:20px;border-radius:999px;background:var(--green-soft);color:var(--green);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:9px">{herIni}</span>
</div>
```
Runtime: `border: done ? 'var(--accent)' : 'var(--border)', bg: done ? 'var(--accent)' : 'transparent', color: done ? 'var(--fg3)' : 'var(--fg1)', deco: done ? 'line-through' : 'none'`.

### 12.7 Media tile
```html
<div style="position:relative;aspect-ratio:1;border-radius:6px;overflow:hidden">
  <img style="width:100%;height:100%;object-fit:cover;display:block;filter:sepia(.08) saturate(.88)" alt="">
  <span style="position:absolute;right:6px;bottom:6px;font-family:var(--font-mono);font-size:10px;color:#faf9f6;background:rgba(18,17,16,.6);padding:2px 5px;border-radius:4px">▶ 0:42</span>
</div>
```
Gallery selection: unselected tiles while selecting get `opacity:.7`.

### 12.8 Document tile
```html
<div style="position:relative;aspect-ratio:1;border-radius:6px;background:var(--surface);border:1px solid var(--border);padding:12px;display:flex;flex-direction:column;gap:5px">
  <span style="height:6px;width:70%;background:var(--surface-2);border-radius:2px"></span>
  <span style="height:4px;width:90%;background:var(--surface-2);border-radius:2px"></span>
  <span style="height:4px;width:80%;background:var(--surface-2);border-radius:2px"></span>
  <span style="position:absolute;right:8px;bottom:8px;font-family:var(--font-mono);font-size:10px;color:var(--fg2);background:var(--bg);border:1px solid var(--border);padding:2px 6px;border-radius:3px">2</span>
</div>
```

### 12.9 Note card
```html
<div style="border-radius:8px;padding:12px;background:var(--n1);border:1px solid var(--border);display:flex;flex-direction:column;gap:8px;font-size:13px">
  <span>Coffee's in the thermos.</span>
  <span style="font-family:var(--font-serif);font-style:italic;color:var(--fg2)">— {her}</span>
</div>
```
Background is one of `var(--n1..--n4)`. Composer note card: `border-radius:8px;padding:16px;background:var(--{noteColor});border:1px solid var(--border);display:flex;flex-direction:column;gap:12px;min-height:150px;transition:background 200ms`, signature `font-family:var(--font-serif);font-style:italic;font-size:16px;color:var(--fg2)`, "+ photo" button `height:30px;padding:0 10px;border-radius:6px;border:1px dashed var(--border);background:transparent;color:var(--fg2);font-size:12px`. Color picker dots: `width:28px;height:28px;border-radius:999px;background:var(--{k});border:2px solid` `var(--fg1)` selected / `var(--border)` otherwise, gap 8px.

### 12.10 Sheet caption (verbatim)
"media tile · document tile · note card. Radii: 4 chips/inputs · 8 cards/sheets · 12 hero panels & bubbles · 999 avatars only."

---

## 13. Tab bar (mobile)

Rule (verbatim): "Tab bar: 88px incl. home indicator, blurred paper, hairline top border. Active = ink, inactive = fg3. One badge, on Chat, covering messages and notes."

Container (mobile prototype, exact):
```
position:absolute;left:0;right:0;bottom:0;height:88px;padding:8px 8px 30px;display:grid;grid-template-columns:repeat(5,1fr);background:color-mix(in oklab,var(--bg),transparent 12%);backdrop-filter:blur(12px) saturate(1.2);border-top:1px solid var(--border);z-index:6
```
Tab button: `border:none;background:transparent;display:flex;flex-direction:column;align-items:center;gap:4px;color:{active ? var(--fg1) : var(--fg3)};font-size:10px;cursor:pointer;padding-top:6px`; icon 22px Lucide stroke 1.5. Helper `active = c => c ? 'var(--fg1)' : 'var(--fg3)'`.

Tabs and their active screens: Memories (`memories, detail, gallery, composer`), Plans (`plans, plan, today`), Calendar, Chat, Us.

Badge (on Chat only): `position:absolute;top:4px;left:calc(50% + 6px);min-width:16px;height:16px;padding:0 4px;border-radius:999px;background:var(--accent);color:#faf9f6;font-family:var(--font-mono);font-size:10px;display:flex;align-items:center;justify-content:center`; shown when not on the Chat screen; count 3 (2 after the sealed note is opened). System-sheet mock places it at `top:-16px;left:calc(50% + 8px)`.

FAB sits above the bar at `bottom:104px;right:20px` (section 5).

Desktop equivalent: 240px sidebar `border-right:1px solid var(--border);padding:28px 20px;display:flex;flex-direction:column;gap:28px;background:var(--surface)`; nav row `height:40px;padding:0 10px;border-radius:6px;border:none;border-left:1px solid {edge};background:{bg};color:{color};font-size:14px;font-weight:500` with `bg: on ? 'var(--accent-soft)' : 'transparent', color: on ? 'var(--fg1)' : 'var(--fg2)', edge: on ? 'var(--accent)' : 'transparent'`; badge text `font-family:var(--font-mono);font-size:10px;color:var(--accent)` (Chat 2, Notes 1).

---

## 14. Bottom sheet

Rule (verbatim): "Sheet: 12px top radius, scrim rgba(0,0,0,.6), drag handle, primary action last."

Scrim: `position:absolute;inset:0;background:rgba(0,0,0,.6);z-index:20` (click closes).
Panel: `position:absolute;left:0;right:0;bottom:0;z-index:21;background:var(--bg);border-radius:12px 12px 0 0;padding:12px 20px 40px;display:flex;flex-direction:column;gap:16px;border-top:1px solid var(--border)` (gap 4px for the menu-style More sheet, 14px for the note composer; tall form sheets split into a `flex:none` header `padding:12px 20px 0` and a scrolling body).
Drag handle: `width:36px;height:4px;border-radius:999px;background:var(--border);margin:0 auto` (`margin:0 auto 12px` on the More sheet).
Title row: `display:flex;justify-content:space-between;align-items:center` (or `baseline`); title `font-family:var(--font-serif);font-size:26px` (20px on the sheet mock); right meta `font-family:var(--font-mono);font-size:11px;color:var(--fg3)` ("Draft · saved just now") or a close link `font-size:14px;color:var(--accent)`.
Primary action last: ink CTA `height:48px;border-radius:8px;border:none;background:var(--fg1);color:var(--bg);font-weight:500;font-size:15px`.
Sticky headers inside scrolling lists use `position:sticky;top:0;z-index:2;background:color-mix(in oklab,var(--bg),transparent 15%);backdrop-filter:blur(12px)`.

---

## 15. Tweak props and template reactions

Prop definitions (from `data-props`; the mobile prototype has all six, desktop / identity / system sheet have only `displayFont`, `theme`, `herName`):

| Prop | Editor | Options / type | Default | Section |
|---|---|---|---|---|
| `displayFont` | enum | `Newsreader`, `Cormorant Garamond`, `Lora`, `Instrument Serif` | `Newsreader` | Look |
| `theme` | enum | `light`, `dark` (`'light' \| 'dark'`) | `light` | Look |
| `simulateDate` | enum | `Sep 6, 2026 — today`, `Apr 9, 2027 — in Tokyo`, `Apr 24, 2027 — just home` | `Sep 6, 2026 — today` | Plans |
| `timelineLayout` | enum | `editorial`, `grid`, `journal` | `journal` | Memories |
| `showOnThisDay` | boolean | — | `true` | Memories |
| `herName` | text | string | `Yasmim` | People |

How the template reacts:
- `displayFont` → `fontKey` (section 1.4) → `data-font="{{ fontKey }}"` on the `.ours` root, which swaps `--font-serif`. Nothing else changes.
- `theme` → `data-theme="{{ theme }}"` on the `.ours` root (swaps every color token) and `isDark: theme === 'dark'` passed to the iOS frame (`dark="{{ isDark }}"`). Mobile allows an in-app override: `theme = s.themeOverride ?? p.theme ?? 'light'`, set from the Us screen (`setLight`/`setDark`; the selected button shows `background:var(--bg)`, the other `transparent`).
- `herName` → `her` (default `'Yasmim'`) and `herIni = her[0]`; substituted in copy ("Casey & {her}"), signatures ("— {her}"), vote/assignee chips, filter labels, data records where `by === 'her'` / `'Yasmim'`.
- `simulateDate` → `sim` = `'now' | 'during' | 'after'` via `({ 'Sep 6, 2026 — today': 'now', 'Apr 9, 2027 — in Tokyo': 'during', 'Apr 24, 2027 — just home': 'after' })`. Affects the Japan plan only: status `underway` / `done`, countdown `Day 2 of 15` / `Home 2 days`; opening the plan while `during` goes to the `today` screen; overview card switches between the 214-day flight, the "during" state, and the "after" recap (`15` days, `JL 6 · HND → JFK`). Exposed as `duringTrip`, `afterTrip`.
- `timelineLayout` → `layout` (code fallback `'editorial'`, prop default `journal`) → booleans `layoutEditorial`, `layoutGrid`, `layoutJournal` that select which Memories timeline markup renders. Grid layout uses `colSpan` 2 for large memories, `rowSpan` 1 for compact, title `26px` large / `18px` otherwise.
- `showOnThisDay` → `showOnThisDay: p.showOnThisDay ?? true` wraps the "On this day" panel on the Memories screen in `<sc-if>`.

---

## 16. Screen-level constants worth keeping

- Mobile artboard 390 × 844; desktop 1440 × 960 with a 240px sidebar grid (`grid-template-columns:240px 1fr`).
- Root font 15px / 1.5 sans, `color:var(--fg1)`, `background:var(--bg)`.
- Section eyebrow: `font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3)`; sidebar/plan-card variant 10px.
- Photo treatment: `filter:sepia(.08) saturate(.88)`; avatars `sepia(.2) saturate(.6)`; sign-in backdrop `sepia(.18) saturate(.7) brightness(.55)` under `linear-gradient(to bottom,rgba(18,17,16,.35),rgba(18,17,16,.15) 40%,rgba(18,17,16,.85) 75%,#121110)`.
- Sign-in is always dark (literal colors), independent of `theme`.
- Locked banner: `display:flex;align-items:center;gap:10px;font-size:13px;color:#a8a49a;margin-bottom:24px;padding:10px 12px;border:1px solid #2e2b26;border-radius:8px;background:rgba(18,17,16,.6)` with a 16px lock icon; copy "Locked after 30 minutes away. Sign in again."
- List rows (settings): `display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-top:1px solid var(--border);min-height:52px`; title 15px, sub `font-size:12px;color:var(--fg3);margin-top:2px`.
- Map: grid backdrop `linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)` at `64px 64px`, `opacity:.5`; pin `border-radius:999px 999px 999px 0;border:2px solid var(--bg);box-shadow:0 1px 2px rgba(0,0,0,.2)`, 16px idle / 22px (mobile) or 24px (desktop) selected.
