# Claude Design prompt — private couples memory and planning app

Paste everything below the line into Claude Design. Replace `[HER NAME]` with your wife's name and swap the working name "Ours" if you have a better one. If you already generated a canvas from the earlier version of this prompt, the changes are: a new **Plans** tab with its own screens (sections 3 and 4), Notes moved inside the Chat tab, plan items appearing on the Calendar, and a linked-plan strip on Memory detail.

---

## What this is

Design a private, two-person web app for a married couple: Casey and [HER NAME]. Only two accounts will ever exist. There is no public side, no followers, no likes from strangers, no discovery. It is four things in one:

1. **A shared memory journal.** Posts about a trip, a date night, a random Tuesday, a milestone. Each post holds photos, videos, and long-form blog-style writing about what we did, what was funny, how it felt.
2. **A planner for trips and events.** One plan per trip or event, holding everything: flights, hotels, train tickets, restaurant ideas, a day-by-day itinerary, checklists, a budget, and the documents. It should be the thing we open every day for the months before a trip and the thing we use on the ground during it. The first real plan is a trip to Japan next year.
3. **A private messenger.** One live chat, just us, where we can send anything: text, photos, videos, voice notes, links, memory posts, and plan items.
4. **A shared calendar.** Events, reminders, recurring things, anniversaries, countdowns, with trips and bookings from the planner showing up automatically.

Plus a small fifth thing inside the chat: **Notes**, a place to leave each other notes that persist like sticky notes on the fridge, separate from the chat stream.

Working name: **Ours** (placeholder wordmark, keep it simple and typographic).

## Platform and frame sizes

Mobile-first responsive web app that installs as a PWA. Design mobile frames at 390 x 844 as the primary deliverable. Provide desktop variants at 1440 wide for: Timeline, Plan detail, Memory detail, Composer, Chat, Calendar.

## Aesthetic direction

- **Feel:** warm, intimate, editorial. A well-made photo book or a paper journal translated to screen. Personal, not product-y. The planner should feel like the same journal with a practical side, not like a travel booking site dropped into it.
- **Avoid:** generic SaaS dashboard, purple-gradient "AI app" look, dating-app pink with hearts everywhere, heavy card borders and drop shadows, corporate blue, pill-shaped everything, airline-app blue and boarding-pass clichés.
- **Color:** warm off-white paper base, deep warm ink for text, one committed accent (terracotta/clay or deep rose, pick one and use it consistently), a muted sage or olive as secondary. Each plan gets one of a small set of plan colors used for its calendar bars and map pins. Full dark mode as a "late night" theme: warm charcoal, never pure black, same accent.
- **Type:** a characterful serif for memory titles, plan names, dates, and section headings (editorial feel). A clean humanist sans for UI, labels, body copy, and anything tabular like times, confirmation codes, and prices. Generous line-height and measure for blog-style reading.
- **Photos are the hero.** The UI recedes around media. Modest corner radius (8 to 12px). Let big photos bleed edge to edge on mobile.
- **Details:** a few handwritten-feeling touches used sparingly, like a date stamp or a small "from Casey" signature on a note. Optional very subtle paper texture on the light theme. Nothing kitschy, nothing scrapbook-cliché (no washi tape, no polaroid frames everywhere).
- **Motion:** gentle and short. No bounce.

## Navigation

- **Mobile:** bottom tab bar with five tabs: Memories, Plans, Calendar, Chat, Us. A floating "+" on the Memories tab for a new memory and on the Plans tab for a new item or idea. Unread badge on Chat, which covers messages and notes.
- **Desktop:** left sidebar with Memories, Plans, Calendar, Chat, Notes, Us, a persistent "New" button with a small menu (memory, plan, idea, event), and a small "upcoming" widget under the nav showing the next two calendar items and the countdown to the next trip.

## Screens to design, in priority order

### 1. Sign in (and the other identity pages)
- Step one: username and password, with a "Sign in with a passkey" button that skips the code step entirely, and a "Remember me" toggle. Step two: 6-digit authenticator (TOTP) code entry with auto-advancing boxes and a "use a recovery code instead" link.
- No sign-up flow anywhere. Accounts are invite-only. No social login buttons.
- It should feel like unlocking something personal, not a corporate portal. A single photo of the couple or a memory as the backdrop is welcome, treated tastefully.
- These pages are served by a separate identity service and will be built as its theme, so also design, in exactly the same visual language: first-time authenticator setup (QR code, "can't scan" manual key, confirm with a code), the recovery codes page shown once after setup (ten codes, copy and download, "I saved these" confirmation), a "set up a passkey on this device" prompt with a skip link, a change-password page, a failed-code error state, and a generic error page.
- Also design the app's own "session expired, signing you back in" interstitial.

### 2. Memories timeline (home tab)
- Reverse-chronological feed of memory posts. Each card shows cover photo or photos, title, date (or date range for trips), location chip, who posted, a one- or two-line excerpt, and a media count ("38 photos · 2 videos").
- Mixed card sizes: a trip with 40 photos gets a large visual treatment; a one-photo "random Tuesday" post is compact. Show at least three card sizes in the mockup.
- Year and month markers that stick as you scroll.
- Filter chips across the top: All, Trips, Date nights, Everyday, Milestones, Videos.
- An "On this day" strip at the top when a memory exists from a previous year on today's date.
- Search entry point.
- Empty state for a brand-new account, written warmly ("Nothing here yet. Start with how you met.").

### 3. Plans list (Plans tab)
- Sections: **Up next** (plans with dates in the future, nearest first), **Dreaming** (no dates yet or far away), **Past**. A plan that is happening right now sits pinned at the top with a "Today" treatment.
- Plan card: cover photo, name, date range, destination chips, a status pill (dreaming, planning, booked, underway, done), a countdown ("in 151 days"), and small progress hints: "12 ideas · 4 booked · checklist 3/18". Both avatars.
- Two card sizes: a large one for the next trip, compact rows for the rest.
- "New plan" sheet: type picker (Trip or Event) with a one-line explanation of each, name, optional dates, optional destination, cover photo. Nothing else is required to start.
- Empty state: "Where to first?"

### 4. Plan detail (the most important screen after the timeline)
- **Header:** cover photo, plan name in the serif, date range, destination chips, countdown, status pill, both avatars, an "Available offline" toggle with "saved 2h ago", and an overflow menu (edit, share to chat, print, export to calendar, archive).
- **Segmented views** under the header, horizontally scrollable on mobile: **Overview · Itinerary · Ideas · Bookings · More**. "More" opens a sheet with Checklists, Budget, Documents, Map, Locked note.

Design each view:

- **Overview:** countdown block, "next up" card showing the next booked thing (a flight with departure time and terminal, for example), a key-bookings strip (flights, stays), a budget snapshot bar (planned, committed, paid), checklist progress rings, the three newest ideas with who added them, and the locked-note tile blurred.
- **Itinerary:** day headers (day number, weekday, date, city) with time-sorted item cards beneath. Item card: kind icon, time, title, place, cost, a confirmation badge when booked, attachment count, and who added it. An **Unscheduled** tray at the top for items without a day. Drag to reorder within a day and drag between days. A "+" under each day. Show a day with four items, a day with one, and an empty day with a gentle "nothing yet" line.
- **Ideas:** a board of idea cards. Each card: image from the link preview, title, city or area tag, who added it, both partners' votes as two small avatar reactions (like, meh, no), and a status chip (idea, shortlisted, decided). Filters by city, tag, and status. An "add idea" quick sheet where pasting a link produces a preview with title and image. A "put it on a day" action that picks a day and, when needed, a kind (food, activity, ticket).
- **Bookings:** grouped by kind: Flights, Stays, Transport, Tickets, Reservations. Booking cards are structured: a flight shows airline, flight number, from and to airport codes, departure and arrival times with the date, seats, and the confirmation code as large copyable text; a stay shows name, address, check-in and check-out, phone, confirmation; a train shows from, to, times, and pass or seat info. Each card shows attached documents as small thumbnails and has "open in Maps".
- **Checklists:** several lists in one view: "Before we go", "Packing (Casey)", "Packing ([HER NAME])", "Shopping", and for events "Guests". Items with a checkbox, assignee avatar, optional due date, and who ticked it. Progress per list. Reorder by drag.
- **Budget:** three totals (planned, committed, paid) in the home currency with the local currency underneath, a breakdown by kind (flights, stays, food...), and an inline field for the exchange rate with "set by you on Sep 6".
- **Documents:** a grid of every PDF and image attached anywhere in the plan, with first-page thumbnails, file name, which item it belongs to, and a page count badge.
- **Map:** pins for every item with a location, colored by kind, with a small card when a pin is tapped. Keep the map muted so it matches the palette.
- **Locked note:** a single note for passport numbers and emergency contacts, blurred until tapped, with a small lock and a "hidden from offline copies and exports" caption.

Also design these plan states and sheets:

- **Today mode:** when the trip is underway, the plan opens here. Destination local date and time at the top, today's items as a timeline with the next one highlighted, confirmation codes as large copyable text, "open in Maps" buttons, a quiet offline banner when there is no connection, and a one-tap "tomorrow".
- **Item forms:** one sheet per kind: flight, stay, transport, activity, food, ticket. Structured fields first, then place, cost, links, attachments, and notes. Show the flight form and the stay form fully; the others can be implied.
- **Paste a confirmation:** a sheet where pasted text or a screenshot becomes a pre-filled booking form for review, with a clear "Review before saving" header and a one-line privacy note. Design the review state only.
- **Post-trip banner:** "Turn this trip into a memory", with a preview of what it will pre-fill.
- **Event variant:** a second plan detail for an event plan ("Our anniversary weekend"), which has a single-day Schedule instead of the itinerary and a Guests checklist, to show the same layout adapting.
- **Desktop:** a three-column Itinerary layout: days on the left, the selected item's detail in the middle, the Ideas tray on the right so ideas can be dragged onto days.

### 5. Memory detail
- Header: title, date or date range, location, type tag (Trip, Date night, Everyday, Milestone), author avatar, "added 3 days ago". When a memory came from a plan, a small linked-plan strip: "Planned in Japan 2027" with a jump link.
- Media: masonry or gallery grid. Videos show an inline player with a duration badge. Tapping opens a full-screen lightbox with swipe, caption, and a "share to chat" action. Design the lightbox as its own frame.
- Long-form body: blog-style text with headings, bold, lists, a pull-quote style, and photos inserted inline between paragraphs.
- **Two perspectives:** each partner can add their own take on the same memory. Show this as two clearly separated sections labeled with our names ("Casey's take" / "[HER NAME]'s take"), not merged.
- Reactions (a small curated set, not a full emoji picker) and a short comment thread between the two of us.
- Edit and "add to album" actions.

### 6. Create / edit memory (composer)
- Fields: title, date or date range picker, location search, type (Trip, Date night, Everyday, Milestone), tags.
- Media: tap-to-add on mobile, drag-and-drop on desktop. Upload progress per file, reorder by drag, choose cover, per-photo captions, remove.
- Rich text body editor: headings, bold, italic, lists, pull-quote, inline photo insertion from the already-uploaded set.
- Autosave indicator ("Saved just now"), Draft vs Published, and a "Keep private to me until I publish" toggle so a surprise post can be prepared quietly.
- When created from a finished plan, show the pre-filled state: one heading per day, the day's items as a starting list, and a media picker pre-filtered to photos taken during the trip.
- Mobile and desktop versions. Desktop is a two-column layout: writing on the left, media tray on the right.

### 7. Gallery (all media)
- Every photo and video across all memories in a dense grid, grouped by month with sticky month headers.
- Albums view: one auto-album per memory plus custom albums, and a Favorites album.
- Selection mode: multi-select, then add to memory, add to album, download, or delete with confirmation.
- Filters: photos, videos, favorites, by person who uploaded.

### 8. Chat (with Notes as a second segment)
- The Chat tab has a segmented control at the top: **Messages · Notes**. Messages is the default and there is exactly one conversation, ever. No conversation list.
- Message types to design: text, single photo, multiple photos (grid), video, voice note with waveform, link with preview, a **shared memory card** that deep-links to a memory post, and a **shared plan item card** ("Fushimi Inari at sunrise · Japan 2027 · Day 5") that deep-links into the plan.
- Interactions: reply / quote, reactions, typing indicator, read receipts ("Seen 9:42 PM"), edit, delete, unsend.
- Date separators. Search within chat. Pinned messages bar at the top.
- **"Save to memories"** and **"Save to plan"** actions on any message. "Save to plan" asks which plan and drops the link or photo in as an idea.
- Desktop: two-pane. Conversation on the left, a right panel with pinned messages and a media grid from the chat.

### 9. Notes (the second segment of the Chat tab)
- A board of notes we leave each other that persist, distinct from the chat.
- Note card: body text, optional photo, a color chosen from a small palette, "from Casey" signature, timestamp. No title field.
- Notes can be **scheduled** (appears on her birthday morning) and can be **sealed**: an envelope state the recipient has to open. Design both the sealed and opened states.
- Board view (mobile grid and desktop masonry), a composer sheet, and an "Unopened" section at the top when a sealed note is waiting.

### 10. Calendar
- Views: month (mobile and desktop), week (desktop), agenda list (mobile default under the month grid).
- Events colored by owner: Casey, [HER NAME], or both. Types: event, reminder, recurring, all-day, birthday/anniversary, countdown.
- **Plans on the calendar:** a trip shows as a spanning bar across its dates in the plan's color with the plan name, and booked items (a flight, a hotel check-in, a dinner reservation) show as timed entries with a small plan badge. Tapping one opens a compact read-only card with a "open in plan" link, not the full event editor.
- Event detail sheet: title, time, recurrence rule shown in plain English ("Every second Friday"), multiple reminders (push and email, with lead time), location, notes, and after the date passes an "Add a memory from this" button that links the event to a memory post.
- Quick-add field that accepts natural language ("Dinner at Nonna's Fri 7pm").
- Upcoming widget style for use on the desktop sidebar: "Japan in 151 days" and "Anniversary in 42 days".
- Empty month state.

### 11. Us (profile and settings)
- Both profiles side by side, "Together since" date, and simple stats: memories, photos, places, trips planned, days together.
- **Security section** (this matters, give it real design attention). It lives on an account page served by the identity service, themed to match, and the app links into it. Design that page: change password, authenticator status with re-enroll, passkeys list with add and remove, regenerate recovery codes, signed-in devices with per-device sign-out, and recent sign-in activity.
- Preferences: home currency, timezone, theme (light, dark, system), notification preferences including per-plan "notify me about votes, comments, decisions, bookings", and one clearly labeled switch that is off by default: "Paste a confirmation", with a one-line note that pasted text is sent to an outside service to be read.
- Storage used, export everything.

### Optional extras (only if they fit naturally, lowest priority)
- **Places:** a map with a pin for every memory that has a location, distinct from the per-plan map.
- **Someday:** a shared bucket list of trips and things to do that have no plan yet, with a "start a plan from this" action.
- **Year in review:** a scrolling recap of one year of memories and trips.

## Design system sheet

Include one artboard that defines: color tokens for light and dark including the small set of plan colors, type scale, buttons (primary, secondary, quiet, destructive), inputs and pickers including a time and timezone picker, chips, memory card variants, plan card variants, itinerary item card by kind, booking card, idea card with the two-avatar vote, checklist row, bottom sheet, toast, empty state pattern, media tile, document tile, avatar pair, segmented control, tab bar, and the icon style (outline vs filled, stroke weight) including the item-kind icon set: flight, stay, train, car, activity, food, ticket, idea, note.

## Deliverables

- One artboard per screen above, mobile first. Desktop variants for Timeline, Plan detail, Memory detail, Composer, Chat, Calendar.
- Light and dark versions of at least Sign in, Timeline, Plan detail, and Chat.
- Realistic placeholder content, never lorem ipsum. Memory titles like "Three days in Asheville", "Tuesday tacos, again", "The night the power went out". For the plan, use "Japan 2027", 4 to 19 February 2027, with Tokyo, Hakuba, and Kyoto: a flight with a real-looking flight number and confirmation code, a Tokyo hotel, a ski lodge in Hakuba with a check-in and check-out, the Shinkansen to Nagano and the bus up to Hakuba, a ryokan in Kyoto, teamLab tickets, ideas like "Fushimi Inari at sunrise", "Ichiran ramen", "Onsen night after skiing", "Ghibli Museum tickets go on sale on the 10th", a packing list with ski gear on it, and a budget in USD with JPY underneath. Use Casey and [HER NAME] as the two people throughout.
- Short annotations on any interaction that is not obvious from the static frame (swipe, long-press, drag to reorder or between days, sealed note opening, offline toggle).
