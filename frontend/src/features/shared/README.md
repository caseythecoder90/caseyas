# features/shared

Pieces that two or more features need and that are not generic enough for `src/ui/`
(a memory card used by both the timeline and the chat, a plan card used by the plans
list and the calendar). Nothing lives here until a second feature needs it; until then
keep components inside the feature that owns them.

Rules

- A feature owns its directory. Change another feature's files only through a shared
  component here, a primitive in `src/ui/`, or a hook in `src/data/`.
- `StubScreen.tsx` is the placeholder every route renders until its screen exists;
  replace the contents of the feature entry file, not the route table.
