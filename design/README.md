# Design sources

Verbatim copies of the Claude Design project for Ours, read through the DesignSync tool on 2026-09-06. Project: `https://claude.ai/design/p/eafe7480-a38c-4dbb-af24-c99be14222e0`. These files are the visual reference the frontend is built from (decision 23 in `docs/architecture.md`); they are not shipped.

| File | What it is |
|---|---|
| `Ours - mobile prototype.dc.html` | The clickable mobile prototype: every screen and sheet, three timeline layouts, the Plans feature end to end, Today mode, chat, calendar, notes, Us. The `DCLogic` class at the bottom holds the state machine and the mock data. |
| `Ours - desktop.dc.html` | Desktop layouts: sidebar, timeline, memory detail, composer, two-pane chat, calendar, and the three-column plan itinerary. |
| `Ours - identity pages.dc.html` | The Keycloak pages as one theme: login, one-time code, authenticator setup, recovery codes, passkey prompt, change password, error, the app's "signing you back in" interstitial, and the account security console. Milestone 5 (Keycloakify). |
| `Ours - system sheet.dc.html` | Tokens and components: colors for light and dark, plan colors, note palette, type scale, buttons, inputs, chips, item-kind icons, cards, tab bar, sheet, motion. |
| `plans-data.js` | Placeholder content for the Plans feature shared by the mobile and desktop canvases. Written before the trip facts were corrected, so it still says April and Osaka; the app's mock data uses the real dates and Hakuba. |
| `ios-frame.jsx` | The iOS device frame the mobile canvas renders inside. Presentation only. |
| `support.js` | The design-canvas runtime that renders `.dc.html` files. Not used by the app. |
| `assets/grain.svg` | Paper grain texture used by the canvases. |
| `spec/` | Written specifications derived from the canvases by the implementation workflow: tokens and components, each mobile screen group, the sheets, data and logic, desktop, identity pages. |

## Reading a `.dc.html` file

The template sits inside `<x-dc>`. `{{ name }}` binds a value from `renderVals()`, `<sc-for list="{{ items }}" as="it">` repeats, `<sc-if value="{{ cond }}">` conditions. The `<script data-dc-script>` at the bottom is a class extending `DCLogic` whose `state` and `renderVals()` drive everything; `data-props` on that script declares the tweak controls (theme, display font, her name, simulated date, timeline layout).

## Refreshing

If the design project changes, re-read it with the DesignSync tool (`get_file` per path) and overwrite these files; then regenerate `spec/`.
