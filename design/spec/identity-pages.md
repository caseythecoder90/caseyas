# Ours — identity pages (Keycloak theme) — spec

Source of truth: `C:\Users\casey\Projects\caseyas\design\Ours - identity pages.dc.html`
(template inside `<x-dc>` = visual truth; `DCLogic.renderVals()` = interaction truth).

Scope and status
- Screens 1–7 and 9 are the **Keycloak login/account theme** (milestone 5, Keycloakify). They are NOT implemented in the SPA today. Each maps to a Keycloak FreeMarker template (`*.ftl`) or the account console; the mapping is written in the canvas labels and repeated per screen below.
- Screen 8 is the only one the SPA owns: the **session-expired interstitial** shown while the app redirects to the identity service (`/oauth2/authorization/keycloak`). A precise SPA spec is in section 8 and section "SPA interstitial".
- Canvas frame (the `.ours` wrapper with `padding:40px`, the page heading, the numbered `.idl` labels like `1 login.ftl · step 1`) is authoring chrome, not product UI. Do not build it.

Canvas heading copy (for reference only):
"Ours — identity pages (Keycloak theme)" / "Served by the identity service, styled as one theme. Same tokens as the app: paper/ink, terracotta, serif headings, mono for codes. Cards are 420 wide (mobile-first; center them on desktop). Toggle theme and display font in Tweaks."

---

## 0. Tokens, fonts, global rules

Canvas-level CSS (identity file). Same values as the app foundation; the identity file omits `--plum`, `--ochre`, `--n1..--n4`, `--shadow-md` because nothing on these pages uses them.

```
.ours {
  --bg:#faf9f6; --surface:#f0ede5; --surface-2:#e8e4d9;
  --fg1:#121110; --fg2:#5a574f; --fg3:#8a857a; --border:#d4d0c5;
  --accent:#c84b31; --accent-soft:rgba(200,75,49,.12);
  --green:#78866a; --green-soft:rgba(120,134,106,.16);
  --danger:#b33e26;
  --font-serif:'Newsreader',Georgia,serif;
  --font-sans:'Inter Tight',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',ui-monospace,monospace;
}
.ours[data-theme="dark"] {
  --bg:#121110; --surface:#1a1917; --surface-2:#23211e;
  --fg1:#faf9f6; --fg2:#a8a49a; --fg3:#6e6a61; --border:#2e2b26;
  --accent:#d4593a; --accent-soft:rgba(212,89,58,.16);
  --green:#8a9a78; --green-soft:rgba(138,154,120,.18);
  --danger:#e26a4a;
}
.ours[data-font="cormorant"]  { --font-serif:'Cormorant Garamond',Georgia,serif }
.ours[data-font="lora"]       { --font-serif:'Lora',Georgia,serif }
.ours[data-font="instrument"] { --font-serif:'Instrument Serif',Georgia,serif }

.ours input::placeholder { color:var(--fg3) }
.ours input:focus        { outline:2px solid var(--accent); outline-offset:2px }
.ours button:active      { transform:translateY(1px) }
input,button { font:inherit }
* { box-sizing:border-box }
a { color:#c84b31; text-decoration:none }
a:hover { text-decoration:underline; text-underline-offset:3px }
```

Notes
- Display font is a Tweak (`displayFont` prop: Newsreader | Cormorant Garamond | Lora | Instrument Serif; default Newsreader on this canvas). The mobile/desktop prototypes default to Instrument Serif. Implementation should read `--font-serif` from the shared foundation, not hardcode a family.
- Theme prop `theme`: `'light' | 'dark'`, default `light`. Screen 1 (login) is always rendered on a dark photo backdrop regardless of theme.
- `herName` prop, default `Yasmim`, appears only on screen 1 ("Casey & {{ her }}").
- Anchor default color is the raw accent `#c84b31` (not the token); links that should be quiet override `color` inline (see each screen).
- Every `<a>` in the canvas has no `href`; treat each as an action/link target listed per screen.
- No emoji anywhere. Icons are inline SVG (stroke 1.5, round caps/joins, `currentColor`).

---

## 1. Shared classes

```
.idp   { width:420px; background:var(--bg); color:var(--fg1); font-family:var(--font-sans);
         font-size:15px; line-height:1.5; border:1px solid var(--border); border-radius:12px;
         overflow:hidden; display:flex; flex-direction:column }
.eyebrow { font-family:var(--font-mono); font-size:11px; letter-spacing:.14em;
           text-transform:uppercase; color:var(--fg3) }
.h     { font-family:var(--font-serif); font-size:34px; line-height:1.05 }
.fld   { height:48px; padding:0 14px; border-radius:8px; border:1px solid var(--border);
         background:var(--surface); color:var(--fg1); font-size:15px; width:100% }
.btn   { height:48px; border-radius:8px; border:1px solid var(--accent); background:var(--accent);
         color:#faf9f6; font-weight:500; font-size:15px; cursor:pointer; width:100% }
.btn2  { height:48px; border-radius:8px; border:1px solid var(--border); background:transparent;
         color:var(--fg1); font-weight:500; font-size:15px; cursor:pointer; width:100%;
         white-space:nowrap }
.lbl   { font-size:13px; color:var(--fg2); margin-bottom:6px }
```

- `.idp` is the page card: 420px wide, radius 12 (hero-panel radius), 1px border, `flex-direction:column`. Most screens add `padding:36px 28px; gap:20px` inline. On desktop the card is centered on the page; on mobile it is the whole viewport (mobile-first).
- `.btn` primary text color is the literal `#faf9f6` (paper) in both themes.
- Small-button variant used on screen 9: `.btn2` + `width:auto; height:40px; padding:0 16px; font-size:14px`.
- Button text is always a plain label; the passkey button (screen 1) adds a 16px icon with `display:flex; align-items:center; justify-content:center; gap:8px`.
- `.idl` / `.idl b` (mono 10.5px labels with a black numbered chip) are canvas annotations. Not product UI.

Shared sub-patterns
- **Toggle switch** (screens 1 and 6): outer `span` 40x24, `border-radius:999px; background:var(--accent); position:relative`; knob `span` absolute `top:3px; left:19px; width:18px; height:18px; border-radius:999px; background:#faf9f6`. Only the ON state is drawn. OFF (inferred, not in canvas): background `var(--surface-2)`, knob `left:3px`.
- **Code boxes** (screens 2 and 3): 6-column grid `display:grid; grid-template-columns:repeat(6,1fr); gap:8px`; each box `border-radius:8px; border:1px solid <border>; background:var(--surface); display:flex; align-items:center; justify-content:center; font-family:var(--font-mono); font-size:22px`. Height 56px on screen 2, 52px on screen 3. Active/focused box border is `var(--fg1)`; idle `var(--border)`; error `var(--danger)`.
- **Header block**: `.eyebrow` then `.h` with `margin-top:8px`, then a lede `color:var(--fg2); margin-top:8px; font-size:15px`.
- **Passkey icon** (screens 1 and 5), path is identical in both:
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>` — 16x16 on screen 1, 26x26 on screen 5.
- **Check icon** (screen 4): `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`.

---

## 2. Screen 1 — Sign in (`login.ftl`, step 1)

Card: `.idp` + `height:760px; position:relative`. Full-bleed photo backdrop, content bottom-anchored. Always dark on top of the photo (uses literal dark-theme hex values, not tokens, so it is dark in light theme too).

DOM
```
div.idp [height:760px; position:relative]
  img [position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
       filter:sepia(.18) saturate(.7) brightness(.55)] alt=""
      -- canvas src is picsum seed "oursbackdrop" 840x1520; implementation: mock image helper, portrait ~1:1.8
  div [position:absolute; inset:0;
       background:linear-gradient(to bottom, rgba(18,17,16,.3), rgba(18,17,16,.1) 35%, rgba(18,17,16,.85) 65%, #121110)]
  div [position:relative; margin-top:auto; padding:0 28px 36px; color:#faf9f6; display:flex; flex-direction:column; gap:12px]
    div [font-family:var(--font-serif); font-size:60px; line-height:.95]                  "ours"
    div [font-size:14px; color:#a8a49a; margin-bottom:12px]                                 "Casey & {{ her }} · since Jul 12, 2024"
    input.fld [background:rgba(26,25,23,.85); border-color:#2e2b26; color:#faf9f6] placeholder="Username"  value "casey"
    input.fld[type=password] [same overrides] placeholder="Password"                       value "••••••••••••"
    div [display:flex; align-items:center; justify-content:space-between; padding:4px 0]
      span [font-size:14px; color:#a8a49a]                                                 "Remember me on this device"
      <toggle ON>
    button.btn                                                                              "Continue"
    button.btn2 [border-color:#2e2b26; color:#faf9f6; display:flex; align-items:center; justify-content:center; gap:8px]
      <passkey icon 16x16> "Sign in with a passkey"
    div [font-family:var(--font-mono); font-size:12px; color:#6e6a61; margin-top:8px]       "Invite only. No sign-up."
```

Keycloak mapping
- `login.ftl`: username -> `username` field, password -> `password`, remember-me -> `rememberMe` checkbox (rendered as the toggle), Continue -> `login` submit. "Sign in with a passkey" -> the WebAuthn authenticator "try another way" / `webauthn-authenticate.ftl` conditional-UI entry.
- No "Forgot password", no registration link, no social providers. The footer line "Invite only. No sign-up." replaces the registration prompt.
- Error state for wrong credentials is not drawn; reuse the screen 2 error pattern (danger-colored 13px line under the fields, field border `var(--danger)`).

---

## 3. Screen 2 — One-time code (`login-otp.ftl`, step 2 + error)

Card: `.idp` + `padding:36px 28px; gap:20px`.

DOM (normal state)
```
div.idp
  div
    div.eyebrow                                    "Step 2 of 2"
    div.h [margin-top:8px]                         "One more thing."
    div [color:var(--fg2); margin-top:8px; font-size:15px]   "Enter the 6-digit code from your authenticator."
  div [display:grid; grid-template-columns:repeat(6,1fr); gap:8px]
    x6 div [height:56px; border-radius:8px; border:1px solid {{ b.border }}; background:var(--surface);
            display:flex; align-items:center; justify-content:center; font-family:var(--font-mono); font-size:22px]  {{ b.ch }}
       -- mock: chars ['4','8','1','','',''], border var(--fg1) on index 3 (next empty), var(--border) otherwise
  div [font-size:12px; color:var(--fg3)]           "Boxes auto-advance; paste fills all six."
  button.btn                                       "Verify"
  div [display:flex; justify-content:space-between; font-size:14px]
    a [color:var(--fg2)]                           "← Back"
    a [color:var(--fg1); border-bottom:1px solid var(--fg3)]   "Use a recovery code instead"
```

Error state (drawn below a divider in the canvas; in the real page it replaces the normal boxes):
```
  div [border-top:1px solid var(--border); padding-top:20px; display:flex; flex-direction:column; gap:12px]   -- canvas-only divider
    div.eyebrow [color:var(--danger)]              "Error state"      -- canvas label, not product copy
    div [6-col grid as above]
      x6 div [height:56px; border-radius:8px; border:1px solid var(--danger); background:var(--surface); ...mono 22px]  '9','0','2','1','1','7'
    div [font-size:13px; color:var(--danger)]      "That code didn't work. Codes rotate every 30 seconds — try the newest one. 2 attempts left."
```

Behaviour
- Six single-character inputs, mono 22px, numeric inputmode, auto-advance on entry, backspace moves back, paste of 6 digits fills all boxes, submit on the sixth digit or on Verify.
- Active box border `var(--fg1)`; all six borders turn `var(--danger)` on error and the message appears under the hint line.
- Attempts-left count comes from Keycloak brute-force settings; keep the sentence shape.

Keycloak mapping
- `login-otp.ftl`: the six boxes concatenate into the single `otp` field; Verify -> submit. "← Back" -> restart login (`url.loginRestartFlowUrl`). "Use a recovery code instead" -> `login-recovery-authn-code-input.ftl` via "try another way" (`url.loginAction` with `tryAnotherWay`).
- `login-recovery-authn-code-input.ftl` is not drawn; use this layout with eyebrow "Step 2 of 2", one `.fld` mono input for the code, same Verify/Back row.

---

## 4. Screen 3 — Authenticator setup (`login-config-totp.ftl`, first-time setup)

Card: `.idp` + `padding:36px 28px; gap:20px`.

DOM
```
div.idp
  div
    div.eyebrow                                    "Set up your authenticator"
    div.h [margin-top:8px]                         "Scan this once."
    div [color:var(--fg2); margin-top:8px; font-size:15px]
        "Open your authenticator app and scan the code. It'll start producing 6-digit codes for Ours."
  div [display:flex; justify-content:center; padding:20px; border-radius:8px; background:#faf9f6; border:1px solid var(--border)]
    div [display:grid; grid-template-columns:repeat(21,8px); grid-auto-rows:8px; gap:0]
      x441 span [background:{{ q.c }}]             -- 21x21 modules, 8px each = 168px square; on = #121110, off = transparent
  details [font-size:14px]
    summary [cursor:pointer; color:var(--fg1)]     "Can't scan? Enter the key manually"
    div [margin-top:10px; padding:12px 14px; border-radius:8px; background:var(--surface); border:1px solid var(--border);
         font-family:var(--font-mono); font-size:13px; letter-spacing:.08em; word-break:break-all;
         display:flex; justify-content:space-between; gap:12px]
      span                                         "JBSW Y3DP EHPK 3PXP 7QRS TMNQ"
      a [flex:none]                                "Copy"
    div [font-size:12px; color:var(--fg3); margin-top:6px]   "Type: time-based · Digits: 6 · Interval: 30s"
  div
    div.lbl                                        "Confirm with a code from the app"
    div [6-col grid, gap:8px]
      x6 div [height:52px; border-radius:8px; border:1px solid {{ b.border }}; background:var(--surface)]
         -- empty; border var(--fg1) on index 0, var(--border) otherwise
  div
    div.lbl                                        "Device name " + span[color:var(--fg3)] "(optional)"
    input.fld                                      value "Casey's iPhone"
  button.btn                                       "Turn on authenticator"
```

Notes
- QR panel background is the literal `#faf9f6` in both themes (scanners want a light quiet zone). Real QR from `totp.totpSecretQrCode` (base64 PNG) replaces the module grid; keep the 20px padding, radius 8 and 1px border.
- Manual key groups the secret in 4-char blocks (`totp.totpSecretEncoded` split every 4). "Copy" copies the unspaced secret. Type/digits/interval line reads from `totp.policy`.
- `<details>` is native; closed by default.

Keycloak mapping
- `login-config-totp.ftl`: boxes -> `totp` field (6 digits); device name -> `userLabel`; button -> submit. Hidden `totpSecret` is carried through as Keycloak requires.

---

## 5. Screen 4 — Recovery codes (`login-recovery-authn-code-config.ftl`, shown once)

Card: `.idp` + `padding:36px 28px; gap:20px`. Stateful: `saved` (default false) gates Continue.

DOM
```
div.idp
  div
    div.eyebrow                                    "Recovery codes"
    div.h [margin-top:8px]                         "Save these somewhere real."
    div [color:var(--fg2); margin-top:8px; font-size:15px]
        "Each code works once, if you ever lose your phone. You won't see them again after this page."
  div [display:grid; grid-template-columns:1fr 1fr; gap:8px 20px; padding:18px 20px; border-radius:8px;
       background:var(--surface); border:1px solid var(--border); font-family:var(--font-mono); font-size:14px; letter-spacing:.06em]
    x10 div [display:flex; gap:10px]
      span [color:var(--fg3)]                      {{ c.i }}   -- "01".."10", zero-padded
      span                                         {{ c.v }}   -- e.g. "QH7T-2MKD"
  div [display:flex; gap:8px]
    button.btn2                                    "Copy"
    button.btn2                                    "Download .txt"
  div [display:flex; gap:12px; align-items:flex-start; cursor:pointer; padding:4px 0]  onClick=toggleSaved
    span [width:22px; height:22px; border-radius:4px; border:1px solid {{ savedBorder }}; background:{{ savedBg }};
          flex:none; display:flex; align-items:center; justify-content:center; color:#faf9f6; margin-top:1px]
      <check icon 14x14>  only when saved
    span [font-size:14px; color:var(--fg1)]        "I saved these. I understand they won't be shown again."
  button.btn [opacity:{{ contOp }}] disabled={{ notSaved }}   "Continue"
```

Interaction (from renderVals)
- `saved:false` -> checkbox border `var(--border)`, background `transparent`, no check; Continue `opacity:.4`, `disabled`.
- `saved:true` -> border and background `var(--accent)`, white check; Continue `opacity:1`, enabled.
- Clicking anywhere on the checkbox row toggles.
- Mock codes (10): QH7T-2MKD, X9PL-4RWN, BC3V-8JSA, MT6Y-1ZQE, WK2F-7HDR, PN8G-3LXC, RJ5S-9VBT, ZD4A-6NMY, FH1W-5KPQ, LS7C-2GTX. Real codes come from `recoveryAuthnCodesConfigBean.generatedRecoveryAuthnCodesList`.
- Copy: all ten codes, one per line. Download .txt: same content as a text file (Keycloak's default names it with the realm/user; keep the button label exactly "Download .txt").

Keycloak mapping
- `login-recovery-authn-code-config.ftl`: checkbox -> `kcRecoveryCodesConfirmationCheck` (required), hidden `generatedRecoveryAuthnCodes` and `generatedAt`, Continue -> `saveRecoveryAuthnCodesBtn`. Keycloak's optional "cancel" is not drawn; omit.

---

## 6. Screen 5 — Passkey prompt (`webauthn-register.ftl`, optional)

Card: `.idp` + `padding:36px 28px; gap:20px`.

DOM
```
div.idp
  div [width:56px; height:56px; border-radius:8px; background:var(--accent-soft); color:var(--accent);
       display:flex; align-items:center; justify-content:center]
    <passkey icon 26x26>
  div
    div.h                                          "Skip the code next time."
    div [color:var(--fg2); margin-top:10px; font-size:15px; line-height:1.6]
        "Set up a passkey on this device and sign in with your face or fingerprint. It stays on this phone — nothing leaves it."
  div [display:flex; flex-direction:column; gap:8px; font-size:14px; color:var(--fg2)]
    div [display:flex; gap:10px]  span[color:var(--green)] "—"   "Works offline, can't be phished"
    div [display:flex; gap:10px]  span[color:var(--green)] "—"   "Your authenticator still works as backup"
  button.btn                                       "Set up a passkey"
  a [text-align:center; font-size:14px; color:var(--fg2)]   "Not now"
```

Notes
- No eyebrow on this screen; the icon tile takes its place.
- Bullets are em-dashes in sage, not list markers.

Keycloak mapping
- `webauthn-register.ftl` (passwordless/WebAuthn register required action, set as optional/skippable): "Set up a passkey" -> triggers `navigator.credentials.create` then submits `registerWebAuthn` form; "Not now" -> the `cancelAIA` / skip action. Device label field is not drawn; Keycloak's `authenticatorLabel` can default to the UA-derived name.

---

## 7. Screen 6 — Change password (`login-update-password.ftl`)

Card: `.idp` + `padding:36px 28px; gap:16px` (note tighter 16px gap).

DOM
```
div.idp
  div
    div.eyebrow                                    "Account"
    div.h [margin-top:8px]                         "Change password"
  div  div.lbl "Current password"       input.fld[type=password]  value "••••••••••••"
  div  div.lbl "New password"           input.fld[type=password]  value "••••••••••••••••"
       div [display:flex; gap:4px; margin-top:8px]
         x4 span [flex:1; height:3px; border-radius:2px; background:...]   -- 3x var(--green), 1x var(--surface-2)
       div [font-size:12px; color:var(--fg3); margin-top:6px]   "Strong. 16 characters, not in any known breach."
  div  div.lbl "Confirm new password"   input.fld[type=password]  value "••••••••••••••••"
  div [display:flex; align-items:center; justify-content:space-between; padding:6px 0]
    span [font-size:14px; color:var(--fg2)]        "Sign out of other devices"
    <toggle ON>
  button.btn                                       "Update password"
```

Strength meter
- Four 3px segments, radius 2, gap 4. Filled segments `var(--green)`, empty `var(--surface-2)`. Drawn state: 3 of 4 filled with caption "Strong. 16 characters, not in any known breach." Weaker levels are not drawn; keep the same segment count and caption shape ("<Level>. <n> characters, ...").

Keycloak mapping
- `login-update-password.ftl`: `password-new`, `password-confirm`; "Sign out of other devices" -> `logout-sessions` checkbox (rendered as the toggle, ON by default). The "Current password" field is the account-console password change (`password.ftl` in the account theme); on the required-action page it can be omitted since Keycloak does not ask for it there.

---

## 8. Screen 7 — Error (`error.ftl`, generic)

Card: `.idp` + `padding:36px 28px; gap:20px; min-height:420px; justify-content:center`.

DOM
```
div.idp
  div.eyebrow                                      "Something broke"
  div.h                                            "Well, that didn't work."
  div [color:var(--fg2); font-size:15px; line-height:1.6]
      "The sign-in link may have expired, or the page was opened twice. Nothing's lost — start again from the app."
  div [font-family:var(--font-mono); font-size:11px; color:var(--fg3); padding:10px 12px; border-radius:6px;
       background:var(--surface); border:1px solid var(--border)]
      "error: invalid_request · ref 7f3a-21c"
  button.btn2                                      "Back to Ours →"
```

Notes
- Vertically centered content, left-aligned text. No `.h` margin-top here (gap:20px handles spacing).
- Technical line: `error: <message.summary or error code> · ref <short id>`; radius 6 (smaller than the 8 used elsewhere) — keep it.

Keycloak mapping
- `error.ftl`: headline/lede are fixed copy; the mono line shows `message.summary`; "Back to Ours →" -> `client.baseUrl` (or `url.loginUrl` if no client). Also reuse for `login-page-expired.ftl` (copy already covers the expired case).

---

## 9. Screen 8 — Session expired (app interstitial, SPA)

Card: `.idp` + `padding:36px 28px; gap:20px; min-height:420px; justify-content:center; align-items:center; text-align:center`.

DOM
```
div.idp
  div [width:40px; height:40px; border-radius:999px; border:1px solid var(--border); border-top-color:var(--accent); animation:none]
      -- spinner ring; canvas freezes it, app spins it
  div.h                                            "Signing you back in"
  div [color:var(--fg2); font-size:15px; line-height:1.6; max-width:300px]
      "Your session timed out while you were away. Hang on — this device is trusted, so this should be quick."
  div [font-family:var(--font-mono); font-size:11px; color:var(--fg3)]   "Redirecting to the identity service…"
  a [font-size:14px; color:var(--fg2)]             "Taking too long? Sign in manually →"
```

See "SPA interstitial" below for the full implementation spec.

---

## 10. Screen 9 — Account security (account console, Security; app links here from Us)

Card: `.idp` + `width:960px; padding:40px 48px 48px; gap:32px`. Two-column grid of cards.

Card pattern (`.sec-card`, inferred name): `border-radius:8px; border:1px solid var(--border); background:var(--surface); padding:24px; display:flex; flex-direction:column; gap:14px` (list cards use `gap:4px` and a 10px `margin-bottom` on the header row).
Card header row: `display:flex; justify-content:space-between; align-items:baseline`; title `font-size:17px; font-weight:500`; right side is a mono 11px status or a link.
List row: `display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-top:1px solid var(--border)`; primary `font-size:15px`, meta `font-family:var(--font-mono); font-size:11px; color:var(--fg3); margin-top:2px`.
Small button: `.btn2` + `width:auto; height:40px; padding:0 16px; font-size:14px` (add `align-self:flex-start` when alone).

DOM
```
div.idp [width:960px; padding:40px 48px 48px; gap:32px]
  div [display:flex; justify-content:space-between; align-items:flex-end]
    div
      div.eyebrow                                  "Account · Casey"
      div.h [font-size:44px; margin-top:8px]       "Security"
    a [font-size:14px; color:var(--fg2)]           "← Back to Ours"
  div [display:grid; grid-template-columns:1fr 1fr; gap:24px; align-items:start]
    div [display:flex; flex-direction:column; gap:24px]          -- LEFT column
      card Password
        header: "Password" | mono fg3 "changed 4 months ago"
        small .btn2 "Change password"
      card Authenticator app
        header: "Authenticator app" | mono [color:var(--green)] "on · Casey's iPhone"
        p [font-size:14px; color:var(--fg2)] "Time-based codes. Re-enrolling replaces the current app — you'll scan a new QR code."
        div [display:flex; gap:8px]  small .btn2 "Re-enroll"   small .btn2 [color:var(--danger); border-color:var(--border)] "Turn off"
      card Recovery codes
        header: "Recovery codes" | mono fg3 "8 of 10 unused"
        p [font-size:14px; color:var(--fg2)] "Regenerating invalidates the old set immediately."
        small .btn2 "Regenerate codes"
      card Passkeys [gap:4px]
        header [margin-bottom:10px]: "Passkeys" | a [font-size:14px] (accent) "+ Add a passkey"
        x{{ passkeys }} row: name / meta  |  a [font-size:13px; color:var(--fg2)] "Remove"
          mock: "Casey’s iPhone" / "added Mar 2, 2026 · last used today"
                "MacBook Pro · Touch ID" / "added Mar 2, 2026 · last used Sep 4"
    div [display:flex; flex-direction:column; gap:24px]          -- RIGHT column
      card Signed-in devices [gap:4px]
        header [margin-bottom:10px]: "Signed-in devices" | a [font-size:13px; color:var(--danger)] "Sign out everywhere else"
        x{{ devices }} row:
          left: div [display:flex; gap:12px; align-items:center]
                  span dot [width:8px; height:8px; border-radius:999px; background:{{ dv.dot }}]
                  div name [15px] / meta [mono 11 fg3]
          right: a [font-size:13px; color:{{ dv.actionColor }}; white-space:nowrap; flex:none] {{ dv.action }}
          mock: "iPhone · Ours app" / "This device · Asheville, NC · now"  dot var(--green)  "Current" fg3
                "Chrome on macOS"   / "Asheville, NC · 2 hours ago"        dot var(--fg3)    "Sign out" fg2
                "Safari on iPad"    / "Charlotte, NC · Aug 21"             dot var(--fg3)    "Sign out" fg2
      card Recent sign-in activity [gap:4px]
        div [font-size:17px; font-weight:500; margin-bottom:10px] "Recent sign-in activity"
        x{{ logins }} row [display:grid; grid-template-columns:110px 1fr auto; gap:12px; padding:10px 0;
                           border-top:1px solid var(--border); font-size:14px; align-items:center]
          span [mono 12px fg3] {{ when }}   span {{ what }}   span [mono 11px; color:{{ c }}] {{ status }}
          mock: "Today 9:41 PM"  "Passkey · iPhone"                   "ok"     green
                "Sep 4 8:12 AM"  "Password + code · Chrome, macOS"    "ok"     green
                "Sep 2 11:03 PM" "Password · wrong code ×2"           "failed" danger
                "Aug 21 6:30 PM" "Password + code · Safari, iPad"     "ok"     green
                "Aug 19 7:55 AM" "Passkey · MacBook"                  "ok"     green
        div [font-size:12px; color:var(--fg3); margin-top:8px]
            "Don't recognise something? Change your password and sign out everywhere else."
```

Notes
- The passkey names use a curly apostrophe ("Casey’s iPhone") in renderVals; the TOTP status line in the template uses a straight one ("Casey's iPhone"). Keep each as written.
- Below ~960px collapse the grid to one column (`grid-template-columns:1fr`), card width 100%, padding 24px.

Keycloak mapping
- Account console (Keycloak account v3 / Keycloakify account theme), "Signing in" + "Device activity" pages merged into one Security page:
  - Password -> account password page (screen 6 layout with current-password field).
  - Authenticator app -> `otp` credential: Re-enroll = set up new (`CONFIGURE_TOTP` AIA -> screen 3), Turn off = delete credential.
  - Recovery codes -> `recovery-authn-codes` credential: Regenerate = AIA (`CONFIGURE_RECOVERY_AUTHN_CODES` -> screen 4); "8 of 10 unused" from credential metadata.
  - Passkeys -> `webauthn-passwordless` credentials list; "+ Add a passkey" = AIA `webauthn-register-passwordless` (screen 5); Remove = delete credential.
  - Signed-in devices -> sessions API; "Sign out everywhere else" = logout all except current; per-row "Sign out" = delete session; current session shows "Current" and a sage dot.
  - Recent sign-in activity -> events API (LOGIN / LOGIN_ERROR), grouped as "<method> · <device>".
  - "← Back to Ours" -> app origin `/us`. The SPA's Us tab links here.

---

## SPA interstitial (screen 8) — implementation spec

Where it lives
- Rendered by the SPA when an API call returns 401 and `api.ts` has called `window.location.assign(LOGIN_PATH)` (`LOGIN_PATH = '/oauth2/authorization/keycloak'`). Today `App.tsx` shows a plain "Signing you in…" line for this case; this screen replaces it.
- Also render it on an explicit `/session-expired` route or whenever the app decides the session is gone (e.g. `me` query errors with 401). It is a full-viewport page, not a modal.

Layout
- Page: `min-height:100dvh; display:flex; align-items:center; justify-content:center; background:var(--bg); color:var(--fg1); font-family:var(--font-sans)`.
- Card: the `.idp` card, `width:420px; max-width:100%; min-height:420px; padding:36px 28px; gap:20px; border:1px solid var(--border); border-radius:12px; background:var(--bg); display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center`.
  - On viewports narrower than ~460px drop the border and radius and let the card fill the viewport (mobile-first, as the canvas note says).
- Children, in order, with `gap:20px` between them:
  1. Spinner: `div` 40x40, `border-radius:999px; border:1px solid var(--border); border-top-color:var(--accent)`; animate `rotate 0deg -> 360deg`, linear, 900ms, infinite. Respect `prefers-reduced-motion: reduce` -> `animation:none` (this is what the canvas shows). `aria-hidden="true"`.
  2. Heading: `h1` with `.h` styles — `font-family:var(--font-serif); font-size:34px; line-height:1.05; font-weight:400; margin:0`. Text exactly: `Signing you back in` (no trailing period).
  3. Lede: `p` `color:var(--fg2); font-size:15px; line-height:1.6; max-width:300px; margin:0`. Text exactly:
     `Your session timed out while you were away. Hang on — this device is trusted, so this should be quick.` (em dash U+2014)
  4. Status line: `div` `font-family:var(--font-mono); font-size:11px; color:var(--fg3)`. Text exactly: `Redirecting to the identity service…` (U+2026 ellipsis). Give it `role="status" aria-live="polite"`.
  5. Escape hatch: `a` `font-size:14px; color:var(--fg2); text-decoration:none` (underline on hover, `text-underline-offset:3px`). Text exactly: `Taking too long? Sign in manually →` (U+2192). `href={LOGIN_PATH}`. Always rendered (the canvas shows it immediately); it is a plain anchor so it works even if JS has stalled.

Behaviour
- On mount, if a redirect has not already been issued, call `window.location.assign(LOGIN_PATH)`. Do not double-assign if `api.ts` already did.
- No timers change the copy; the escape-hatch link is the fallback. If the orchestrator wants a delayed reveal, do NOT — the design shows it at rest.
- No back-button trap: this is a leaf screen with no nav, no tabs, no header.
- Theme: honours `data-theme` / `prefers-color-scheme` through the tokens; no literal hex on this screen.
- Fonts: `--font-serif` from the foundation (Instrument Serif in the prototypes; Newsreader default on this canvas — use the foundation value), `--font-sans` Inter Tight, `--font-mono` JetBrains Mono. No external font URLs; use whatever the foundation already loads.

Acceptance
- Visual diff against the canvas card 8 at 420px: same order, sizes (40px ring, 34px serif, 15px/1.6 lede capped at 300px, 11px mono, 14px link), same 20px gaps, centered text.
- Spinner rotates in normal motion mode, is static under reduced motion.
- Link navigates to `/oauth2/authorization/keycloak` without JS.

---

## Copy index (exact strings)

Screen 1: "ours" · "Casey & {{ her }} · since Jul 12, 2024" · "Username" · "Password" · "Remember me on this device" · "Continue" · "Sign in with a passkey" · "Invite only. No sign-up."
Screen 2: "Step 2 of 2" · "One more thing." · "Enter the 6-digit code from your authenticator." · "Boxes auto-advance; paste fills all six." · "Verify" · "← Back" · "Use a recovery code instead" · "That code didn't work. Codes rotate every 30 seconds — try the newest one. 2 attempts left."
Screen 3: "Set up your authenticator" · "Scan this once." · "Open your authenticator app and scan the code. It'll start producing 6-digit codes for Ours." · "Can't scan? Enter the key manually" · "JBSW Y3DP EHPK 3PXP 7QRS TMNQ" · "Copy" · "Type: time-based · Digits: 6 · Interval: 30s" · "Confirm with a code from the app" · "Device name (optional)" · "Casey's iPhone" · "Turn on authenticator"
Screen 4: "Recovery codes" · "Save these somewhere real." · "Each code works once, if you ever lose your phone. You won't see them again after this page." · "Copy" · "Download .txt" · "I saved these. I understand they won't be shown again." · "Continue"
Screen 5: "Skip the code next time." · "Set up a passkey on this device and sign in with your face or fingerprint. It stays on this phone — nothing leaves it." · "Works offline, can't be phished" · "Your authenticator still works as backup" · "Set up a passkey" · "Not now"
Screen 6: "Account" · "Change password" · "Current password" · "New password" · "Strong. 16 characters, not in any known breach." · "Confirm new password" · "Sign out of other devices" · "Update password"
Screen 7: "Something broke" · "Well, that didn't work." · "The sign-in link may have expired, or the page was opened twice. Nothing's lost — start again from the app." · "error: invalid_request · ref 7f3a-21c" · "Back to Ours →"
Screen 8: "Signing you back in" · "Your session timed out while you were away. Hang on — this device is trusted, so this should be quick." · "Redirecting to the identity service…" · "Taking too long? Sign in manually →"
Screen 9: "Account · Casey" · "Security" · "← Back to Ours" · "Password" · "changed 4 months ago" · "Change password" · "Authenticator app" · "on · Casey's iPhone" · "Time-based codes. Re-enrolling replaces the current app — you'll scan a new QR code." · "Re-enroll" · "Turn off" · "Recovery codes" · "8 of 10 unused" · "Regenerating invalidates the old set immediately." · "Regenerate codes" · "Passkeys" · "+ Add a passkey" · "Remove" · "Signed-in devices" · "Sign out everywhere else" · "Current" · "Sign out" · "Recent sign-in activity" · "ok" · "failed" · "Don't recognise something? Change your password and sign out everywhere else."
