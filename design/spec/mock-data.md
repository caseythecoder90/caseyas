# Ours - mock data spec

Every dataset from `design/Ours - mobile prototype.dc.html` (DCLogic, lines 900-1117), `design/Ours - desktop.dc.html` (DCLogic, lines 380-488) and `design/plans-data.js`, transcribed completely with the real-project corrections applied (see `data-and-logic.md` section 0: `Japan 2027`, Feb 4 – 19, 2027, Tokyo · Hakuba · Kyoto, JPY). Her name is `Yasmim`; the design sentinels `'her'` (memories) and `'Yasmim'` (plans) are both written as `'Yasmim'` here.

Images: `img(seed, w, h)` is the app's mock image helper (the design's `P(seed, w, h)`). The seed and size are given for every image so that layouts match.

Typographic characters used by the design copy are kept exactly: `’` (curly apostrophe), `“` (open quote), `–` (en dash), `—` (em dash), `·` (middle dot), `→`, `↑`, `✕`, `…`, `¥`.

Suggested file layout: `src/data/types.ts` (section 20), `src/data/memories.ts` (1-4), `src/data/chat.ts` (5-7), `src/data/calendar.ts` (8), `src/data/plans.ts` (9-19), `src/data/us.ts` (18-19).

---

## 1. MEM - memories (5)

```ts
export const MEM: Memory[] = [
  { id: 1, title: 'Tuesday tacos, again', date: 'Sep 1, 2026', day: '1', mon: 'Sep', loc: 'Home', type: 'Everyday', by: 'Yasmim',
    ex: 'Third week running. Nobody is complaining.', count: '3 photos', size: 'compact',
    img: img('tacos', 600, 600), img2: img('tacos2', 400, 400), month: 'September 2026', showMonth: true, more: '' },
  { id: 2, title: 'The night the power went out', date: 'Aug 29, 2026', day: '29', mon: 'Aug', loc: 'Home', type: 'Everyday', by: 'Casey',
    ex: 'Candles, a deck of cards, and the loudest silence.', count: '9 photos · 1 video', size: 'medium',
    img: img('candles', 800, 600), img2: img('cards', 400, 400), month: 'August 2026', showMonth: true, more: '+7' },
  { id: 3, title: 'Three days in Asheville', date: 'Aug 14–17, 2026', day: '14', mon: 'Aug', loc: 'Asheville, NC', type: 'Trip', by: 'Casey',
    ex: 'We meant to hike. We mostly ate.', count: '38 photos · 2 videos', size: 'large',
    img: img('asheville', 1200, 800), img2: img('ashe2', 400, 400), month: '', showMonth: false, more: '+36' },
  { id: 4, title: 'Two years', date: 'Jul 12, 2026', day: '12', mon: 'Jul', loc: 'Nonna’s', type: 'Milestone', by: 'Yasmim',
    ex: 'Same table as the first time. Same order, honestly.', count: '12 photos', size: 'medium',
    img: img('twoyears', 800, 600), img2: img('dinner', 400, 400), month: 'July 2026', showMonth: true, more: '+10' },
  { id: 5, title: 'Rooftop movie', date: 'Jul 3, 2026', day: '3', mon: 'Jul', loc: 'Downtown', type: 'Date night', by: 'Casey',
    ex: 'Couldn’t hear a word. Didn’t matter.', count: '1 photo', size: 'compact',
    img: img('rooftop', 600, 600), img2: '', month: '', showMonth: false, more: '' },
];
```

Desktop differences: the desktop MEM has no `day / mon / img2 / showMonth / more`, `month` is the bare month name (`September`), and the Asheville `ex` is longer: `We meant to hike. We mostly ate. Saturday we did make it up to the parkway, late enough that the light was going gold.` Use the mobile `ex` for cards; the desktop large card may use the long one (`exLong`).

Timeline "On this day" card (static): image `img('otd', 160, 160)`, eyebrow `On this day · 2025`, title `First real cold morning`, opens memory 5.

Reactions (base counts): `[['loved it', 2], ['made me laugh', 1], ['miss this', 0], ['again please', 0]]`.

## 2. DETAIL - long-form bodies

```ts
export const DETAIL: Record<number | 'default', MemoryDetail> = {
  3: {
    take1a: 'We had a plan. The plan had trailheads and a start time. What actually happened is we found a biscuit place on the first morning and built the rest of the trip around going back to it.',
    quote: 'Nobody has ever regretted a second biscuit.',
    take1b: 'Saturday we did make it up to the parkway, late enough that the light was going gold. That’s the photo below. The creek incident is not pictured.',
    inline: img('parkway', 900, 600),          // desktop: img('parkway', 1200, 700)
    inlineCap: 'Blue Ridge Parkway, 6:40 PM',
    take2: 'For the record, he fell in the creek. Fully. Shoes and all. Then he asked if I got it on video, and I had, and that is the video with 2 views because we’ve watched it twice.',
  },
  default: {
    take1a: 'A small one, but it belongs here. The kind of night that doesn’t make it into any album unless you decide it does.',
    quote: 'The ordinary ones are the ones I forget first.',
    take1b: 'So here it is, written down before it goes.',
    inline: img('inlinedef', 900, 600),        // desktop: img('inlinedef', 1200, 700)
    inlineCap: 'Kitchen, later than it should have been',
    take2: 'Not much to add. It was nice. Write more of these.',
  },
};
```

Detail extras: `hasPlan` is true for id 3 only, `planName: 'Three days in Asheville'`; `ini` is the author's initial (`'Y'` when `by` is Yasmim, else `'C'`). `take1a` / `quote` / `take1b` are the author's take; `take2` is the other person's take.

Detail gallery (mobile, 5 tiles, seeds derived from the memory): `[{ src: img(seed + 'a', 400, 400), span: 2, video: true, dur: '0:42' }, { src: img(id + 'g2', 400, 400), span: 1 }, ... g3, g4, g5 ]`, where `seed` is the memory's image seed (`asheville` -> `ashevillea`). Desktop: 7 tiles, `img(id + 'g1', 600, 600)` span 2 video 0:42, then `g2..g7` at 400x400.

## 3. CAPS - lightbox captions (index = gallery index)

```ts
export const CAPS = ['The creek, moments before.', 'Biscuit place, morning two.', 'Parkway pull-off.', 'Somebody’s porch, not ours.', 'Last morning. Packed the car twice.'];
```

## 4. Gallery screen

```ts
export const GAL: [label: string, count: number, key: string][] = [['September 2026', 9, 'sep'], ['August 2026', 15, 'aug'], ['July 2026', 12, 'jul']];
// tile i of month key k: { id: k + i, src: img('g' + k + i, 300, 300), video: i % 7 === 3, dur: '0:' + (12 + i * 3), fav: i % 5 === 1, byHer: i % 2 === 0 }

export const CUSTOM_ALBUMS: Album[] = [
  { name: 'Favorites', count: '48 items', src: img('fav', 400, 400) },
  { name: 'Fridge door', count: '23 photos', src: img('fridge', 400, 400) },
  { name: 'The dog, mostly', count: '311 photos · 9 videos', src: img('dog', 400, 400) },
];
// AUTO_ALBUMS = MEM.map(m => ({ name: m.title, count: m.count, src: m.img, memId: m.id }))
export const GAL_FILTERS = ['All', 'Photos', 'Videos', 'Favorites', 'Casey', 'Yasmim'];
```

## 5. Chat messages (8 base messages)

```ts
export const MESSAGES: ChatMessage[] = [
  { id: 1, from: 'h', type: 'text', text: 'Did you see the sky on your way home', time: '9:38 PM' },
  { id: 2, from: 'me', type: 'photo', img: img('sunset', 480, 360), time: '9:40 PM' },                     // desktop 640x480
  { id: 3, from: 'h', type: 'photos', imgs: ['p1', 'p2', 'p3', 'p4'].map(x => ({ src: img(x, 200, 200) })), time: '9:40 PM' },  // desktop 320x240
  { id: 4, from: 'me', type: 'voice', dur: '0:42', time: '9:41 PM' },
  { id: 5, from: 'h', type: 'memory', img: img('asheville', 600, 300), title: 'Three days in Asheville', sub: 'Aug 14–17 · 38 photos', memId: 3, time: '9:41 PM' },  // desktop 400x400
  { id: 6, from: 'h', type: 'link', url: 'resy.com/nonnas', title: 'Nonna’s — Reserve a table', domain: 'resy.com', time: '9:42 PM' },
  { id: 7, from: 'me', type: 'text', text: 'Booked for Friday. 7.', time: 'Seen 9:42 PM' },
  { id: 8, from: 'h', type: 'planitem', kind: 'activity', title: 'Fushimi Inari at sunrise', sub: 'Japan 2027 · unscheduled · put it on day 11?', time: '9:44 PM' },  // desktop sub: 'Japan 2027 · unscheduled'
];
```

Sent messages: `{ id: Date.now(), from: 'me', type: 'text', text, time: 'Delivered' }`; shared photo from the lightbox: `{ id: Date.now(), from: 'me', type: 'photo', img, time: 'Delivered' }`.

Voice waveform: 30 bars, `h = 6 + Math.round(Math.abs(Math.sin(i * 1.7) * 14 + Math.cos(i * 0.8) * 4))` px, color `--fg1` for `i < 12` else `--fg3`.

Desktop chat media strip: `['sunset', 'p1', 'p2', 'p3', 'p4', 'cm1', 'cm2', 'cm3', 'cm4'].map(x => img(x, 200, 200))`.

## 6. Fridge notes (5 base notes, newest first)

```ts
export const NOTES: FridgeNote[] = [
  { body: 'Coffee’s in the thermos. The good beans, not the emergency ones.', color: 'n1', from: 'Yasmim', time: 'This morning', span: 1 },
  { body: 'Reminder that you said you’d fix the porch light. Reminder from me, not the light.', color: 'n2', from: 'Casey', time: 'Yesterday', span: 1 },
  { body: 'Found this in the glovebox.', color: 'n3', from: 'Yasmim', time: 'Aug 30', span: 2, hasPhoto: true, photo: img('glovebox', 600, 300) },
  { body: 'Happy birthday. Check the freezer.', color: 'n4', from: 'Casey', time: 'Scheduled', span: 1, scheduled: true, when: 'Appears Oct 3, 7:00 AM' },
  { body: 'You hummed the whole drive back. You didn’t notice.', color: 'n1', from: 'Yasmim', time: 'Aug 22', span: 1 },
];
```

New note from the sheet: `{ body, color: noteColor, from: 'Casey', time: sched ? 'Scheduled' : 'Just now', span: 1, scheduled: sched, when: 'Appears Oct 3, 7:00 AM' }`, prepended. Note colors: `n1..n4` (tokens `--n1..--n4`). Sheet copy: schedule note `Oct 3, 7:00 AM` / `appears now`; button `Seal it and leave it` / `Schedule it` / `Leave it on the fridge`.

## 7. Composer

```ts
export const COMPOSER_TYPES = ['Trip', 'Date night', 'Everyday', 'Milestone'];
export const COMPOSER_TOOLS: ToolbarTool[] = [
  { label: 'H', font: 'var(--font-serif)', weight: 500, style: 'normal' },
  { label: 'B', font: 'inherit', weight: 600, style: 'normal' },
  { label: 'I', font: 'inherit', weight: 400, style: 'italic' },
  { label: '• list', font: 'inherit', weight: 400, style: 'normal' },
  { label: '1. list', font: 'inherit', weight: 400, style: 'normal' },
  { label: '“ quote', font: 'var(--font-serif)', weight: 400, style: 'italic' },
  { label: '+ photo', font: 'inherit', weight: 400, style: 'normal' },
];

// Mobile media tray
export const COMPOSER_MEDIA_DEFAULT = ['new1', 'new2', 'new3'];   // img(x, 200, 200); cover i0; uploading i2 (opacity .6); caption on i1: 'Kitchen, 11 PM'
export const COMPOSER_MEDIA_FROM_PLAN = ['jp1', 'jp2', 'jp3', 'jp4', 'jp5', 'jp6'];  // cover i0; caption on i1: 'Haneda, finally'; count label '212'

// Mobile body blocks (default draft = the power outage)
export const COMPOSER_BLOCKS_DEFAULT: ComposerBlock[] = [
  { type: 'p', text: 'The power went out at 9:40, mid-episode. We found the candles from the wedding, still in the box.', color: 'var(--fg1)' },
  { type: 'q', text: 'The loudest silence.' },
  { type: 'img', src: img('candles', 800, 400), cap: 'Kitchen table, by candle' },
  { type: 'p', text: 'Keep writing…', color: 'var(--fg3)' },
];
// From-plan prefill (Japan 2027)
export const COMPOSER_BLOCKS_FROM_PLAN: ComposerBlock[] = [
  { type: 'h', text: 'Day 1 · Thu Feb 4 · Tokyo' },
  { type: 'list', items: ['JL 5 · JFK → HND', 'Check in · Hotel Niwa', 'Ichiran ramen'] },
  { type: 'p', text: 'Write about day 1…', color: 'var(--fg3)' },
  { type: 'h', text: 'Day 2 · Fri Feb 5 · Tokyo' },
  { type: 'list', items: ['Meiji Jingu', 'Shibuya Sky', 'teamLab Planets'] },
  { type: 'p', text: 'Write about day 2…', color: 'var(--fg3)' },
  { type: 'p', text: '… 14 more days below', color: 'var(--fg3)' },
];
export const COMPOSER_PREFILL = { title: 'Two weeks in Japan', type: 'Trip', dates: 'Feb 4 – 19, 2027', loc: 'Tokyo · Hakuba · Kyoto', mediaCount: '212',
  banner: 'Started from Japan 2027 · 16 day headings · 212 photos filtered to Feb 4 – 19',
  pickerNote: 'Picker is pre-filtered: photos taken Feb 4 – 19, 2027 · 212 of 4,812' };
export const COMPOSER_DEFAULT = { dates: 'Sep 6, 2026', loc: 'Add a place', mediaCount: '3', savedLabel: 'saved just now' };
// Private toggle copy
// on : 'Yasmim won’t see this in the timeline or get a notification until you publish.'
// off: 'Yasmim can see the draft and add her take now.'

// Desktop composer (Lake weekend draft): title 'A weekend at the lake', type 'Trip'
export const COMPOSER_TRAY_DESKTOP = ['lake1', 'lake2', 'lake3', 'lake4', 'lake5', 'lake6', 'lake7'];
// img(x, 300, 300); cover i0; uploading i5 (pct '62%', opacity .6); captions: i0 'First light from the dock. Cold.', i2 'Gas-station coffee, great'
```

## 8. Calendar (September 2026, today = Sun Sep 6, grid starts Monday)

Mobile event records (keyed by day of month):

```ts
export const EVENTS: Record<number, CalendarEvent> = {
  2:  { day: 2,  title: 'Farmers market',        kind: 'Event',     owner: 'b', when: 'Wed Sep 2 · 9:00 AM',  rule: 'Every Wednesday',        loc: 'Union Square', past: true },
  8:  { day: 8,  title: 'Dentist',               kind: 'Reminder',  owner: 'c', when: 'Tue Sep 8 · 2:30 PM',  rule: 'Does not repeat',        loc: 'Elm St Dental' },
  10: { day: 10, title: 'Book club',             kind: 'Recurring', owner: 'h', when: 'Thu Sep 10 · 7:00 PM', rule: 'Every second Thursday',  loc: 'Rosa’s place' },
  11: { day: 11, title: 'Dinner at Nonna’s',     kind: 'Event',     owner: 'b', when: 'Fri Sep 11 · 7:00 PM', rule: 'Does not repeat',        loc: 'Nonna’s, 14 Grove St' },
  19: { day: 19, title: 'Casey’s parents visit', kind: 'All day',   owner: 'b', when: 'Sat Sep 19 – Sun Sep 20', rule: 'Does not repeat',     loc: 'Home' },
  25: { day: 25, title: 'Pay the car',           kind: 'Recurring', owner: 'c', when: 'Fri Sep 25',           rule: 'Monthly on the 25th',    loc: '' },
};
```

Desktop time-block events (for month cells and the week grid; hours are decimal, `len` in hours):

```ts
export const EV: CalendarBlock[] = [
  { day: 2,  title: 'Farmers market',        owner: 'b', start: 9,    len: 1.5 },
  { day: 8,  title: 'Dentist',               owner: 'c', start: 14.5, len: 1 },
  { day: 10, title: 'Book club',             owner: 'h', start: 19,   len: 2 },
  { day: 11, title: 'Dinner at Nonna’s',     owner: 'b', start: 19,   len: 2 },
  { day: 19, title: 'Casey’s parents visit', owner: 'b', allDay: true },
  { day: 20, title: 'Casey’s parents visit', owner: 'b', allDay: true },
  { day: 25, title: 'Pay the car',           owner: 'c', start: 9,    len: 0.5 },
  { day: 7,  title: 'Yoga',                  owner: 'h', start: 7,    len: 1 },
  { day: 9,  title: 'Standup',               owner: 'c', start: 10,   len: 0.5 },
  { day: 12, title: 'Lake day',              owner: 'b', allDay: true },
];
```

Plan bars on the month grid (mobile): day 12 `{ bg: --green, label: 'Lake weekend', l: '2px', r: '-2px', rad: '3px 0 0 3px' }`, day 13 `{ bg: --green, label: '', l: '-2px', r: '2px', rad: '0 3px 3px 0' }`.

Agenda fixed rows (mobile, in addition to events 8, 10, 11, 19):

```ts
export const AGENDA_EXTRA: AgendaRow[] = [
  { day: '12', dow: 'Sat', title: 'Lake weekend', sub: 'Sep 12 – 13 · Lake Lure · check-in 3 PM', dot: 'var(--green)',  right: 'in 6 days',   rightColor: 'var(--fg3)',    planId: 'lake' },
  { day: '18', dow: 'Oct', title: 'Anniversary',  sub: 'Oct 18 → every year',                     dot: 'var(--fg1)',    right: 'in 42 days',  rightColor: 'var(--accent)' },
  { day: '4',  dow: 'Feb', title: 'Japan 2027',   sub: 'JL 5 · JFK → HND · 12:55 PM',             dot: 'var(--accent)', right: 'in 151 days', rightColor: 'var(--accent)', planId: 'japan' },
];
```

Desktop week view: week of Mon Sep 7 - Sun Sep 13, hours 7 AM - 7 PM, 56 px per hour.

## 9. PLANS (5)

```ts
export const PLANS: Plan[] = [
  { id: 'japan', name: 'Japan 2027', type: 'Trip', dates: 'Feb 4 – 19, 2027', dest: ['Tokyo', 'Hakuba', 'Kyoto'], status: 'planning', countdown: 'in 151 days',
    hints: '12 ideas · 4 booked · checklist 3/18', color: 'var(--accent)', cover: img('japan', 1200, 800), group: 'next', large: true },
  { id: 'lake', name: 'Lake weekend', type: 'Trip', dates: 'Sep 12 – 13, 2026', dest: ['Lake Lure'], status: 'booked', countdown: 'in 6 days',
    hints: '3 ideas · 1 booked · checklist 5/9', color: 'var(--green)', cover: img('lake1', 600, 400), group: 'next' },
  { id: 'anniv', name: 'Anniversary weekend', type: 'Event', dates: 'Oct 17 – 18, 2026', dest: ['Home', 'Nonna’s'], status: 'booked', countdown: 'in 41 days',
    hints: '2 ideas · 2 booked · guests 6/8', color: 'var(--plum)', cover: img('anniv', 600, 400), group: 'next' },
  { id: 'portugal', name: 'Portugal, someday', type: 'Trip', dates: 'No dates yet', dest: ['Lisbon', 'Porto'], status: 'dreaming', countdown: '',
    hints: '7 ideas', color: 'var(--ochre)', cover: img('lisbon', 600, 400), group: 'dream' },
  { id: 'asheville', name: 'Three days in Asheville', type: 'Trip', dates: 'Aug 14 – 17, 2026', dest: ['Asheville'], status: 'done', countdown: '',
    hints: 'Memory published', color: 'var(--fg3)', cover: img('asheville', 600, 400), group: 'past' },
];
```

Japan trip constants: start `Thu Feb 4, 2027`, end `Fri Feb 19, 2027`, 16 days, Day N = Feb (3 + N). During-trip: status `underway`, countdown `Day 2 of 16`. After: status `done`, countdown `Home 2 days`.

Plan overview heroes:

```ts
export const OVERVIEW = {
  japanNow:   { num: '151', line: 'days until we land in Tokyo', kind: 'flight',      title: 'JL 5 · JFK → HND',                sub: 'Thu Feb 4 · 12:55 PM · Terminal 1',      conf: 'Q7XR4M' },
  japanAfter: { num: '16',  line: 'days, 3 cities, 212 photos',  kind: 'last',        title: 'JL 6 · HND → JFK',                sub: 'Fri Feb 19 · landed 4:40 PM',            conf: 'Q7XR4M' },
  anniv:      { num: '41',  line: 'days until the weekend',      kind: 'reservation', title: 'Dinner at Nonna’s · table for 8', sub: 'Sat Oct 17 · 6:30 PM · the back room',   conf: 'NONNA-1017' },
};
export const MORE_ITEMS = [['Checklists', 'lists', '3 / 18'], ['Budget', 'budget', '$3,860 paid'], ['Documents', 'docs', '4 files'], ['Map', 'map', '9 pins'], ['Locked note', 'locked', '']];
// Offline toggle copy: 'saved 2h ago' / 'off'
```

## 10. DAYS - Japan itinerary (3 sample days)

```ts
export const DAYS: ItineraryDay[] = [
  { n: 1, dow: 'Thu', date: 'Feb 4', city: 'Tokyo', items: [
    { kind: 'flight',    time: '12:55 PM',    title: 'JL 5 · JFK → HND',          place: 'Terminal 1, gate B22', cost: '$1,840', booked: true,  conf: 'Q7XR4M',   docs: 2, by: 'Casey' },
    { kind: 'transport', time: '5:10 PM +1',  title: 'Monorail to Hamamatsucho',  place: 'Haneda Airport',       cost: '¥500',   booked: false,                   docs: 0, by: 'Yasmim' },
    { kind: 'stay',      time: '6:30 PM',     title: 'Check in · Hotel Niwa',     place: 'Chiyoda, Tokyo',       cost: '$620',   booked: true,  conf: 'NW-88213', docs: 1, by: 'Casey' },
    { kind: 'food',      time: '8:00 PM',     title: 'Ichiran ramen',             place: 'Shibuya',              cost: '¥2,400', booked: false,                   docs: 0, by: 'Yasmim' },
  ] },
  { n: 2, dow: 'Fri', date: 'Feb 5', city: 'Tokyo', items: [
    { kind: 'ticket',    time: '5:30 PM',     title: 'teamLab Planets',           place: 'Toyosu',               cost: '$56',    booked: true,  conf: 'TLP-40912', docs: 1, by: 'Casey' },
  ] },
  { n: 3, dow: 'Sat', date: 'Feb 6', city: 'Tokyo', items: [] },
];
```

Remaining days (not itemised in the design; used for headings and the map): Days 4-5 Tokyo (Sun Feb 7, Mon Feb 8); Days 6-9 Hakuba (Tue Feb 9 - Fri Feb 12); Days 10-13 Kyoto (Sat Feb 13 - Tue Feb 16); Days 14-16 back to Tokyo (Wed Feb 17 - Fri Feb 19, JL 6 home on Day 16).

Desktop per-item notes (right pane, keyed by item title; fallback `No notes yet.`):

```ts
export const ITEM_NOTES: Record<string, string> = {
  'JL 5 · JFK → HND': 'Premium economy, the one splurge. Check in opens 24h before — set a reminder. Terminal 1, not 4.',
  'Ichiran ramen': 'The Shibuya one has a shorter line after 9. Order at the machine, tick the extra garlic box.',
  'Check in · Hotel Niwa': 'Ask for a high floor. Luggage forwarding to Kyoto from the front desk, ¥2,000 a bag.',
  'teamLab Planets': 'Wear shorts or roll your trousers — you walk through water. Tickets are timed, arrive 15 min early.',
  'Monorail to Hamamatsucho': 'Suica works. About 20 minutes.',
};
```

## 11. UNSCHEDULED (2) and EVENT_DAYS / event unscheduled

```ts
export const UNSCHEDULED: UnscheduledItem[] = [
  { kind: 'activity', title: 'Fushimi Inari at sunrise', place: 'Kyoto', by: 'Yasmim' },
  { kind: 'food',     title: 'Nishiki market breakfast', place: 'Kyoto', by: 'Casey' },
];

// Anniversary weekend (event plan) schedule
export const EVENT_DAYS: ItineraryDay[] = [
  { n: 1, dow: 'Sat', date: 'Oct 17', city: 'Brevard, NC', items: [
    { kind: 'stay',     time: '3:00 PM', title: 'Check in · The Inn at Brevard', place: 'Brevard, NC',            cost: '$340', booked: true,  conf: 'IB-5521',    docs: 1, by: 'Casey' },
    { kind: 'food',     time: '6:30 PM', title: 'Dinner at Nonna’s',            place: 'The back room · 8 people', cost: '$480', booked: true,  conf: 'NONNA-1017', docs: 0, by: 'Yasmim' },
    { kind: 'activity', time: '9:00 PM', title: 'Rooftop, same as year one',    place: 'Downtown',               cost: '',     booked: false,                     docs: 0, by: 'Casey' },
  ] },
];
export const EVENT_UNSCHEDULED: UnscheduledItem[] = [
  { kind: 'activity', title: 'Drive up the parkway if it’s clear', place: 'Sunday', by: 'Casey' },
];
```

## 12. IDEAS (6)

```ts
export const IDEAS: Idea[] = [
  { title: 'Fushimi Inari at sunrise',                       city: 'Kyoto',  by: 'Yasmim', status: 'shortlisted', img: img('inari', 400, 300),  c: 'like', h: 'like' },
  { title: 'Ichiran ramen',                                  city: 'Tokyo',  by: 'Yasmim', status: 'decided',     img: img('ramen', 400, 300),  c: 'like', h: 'like' },
  { title: 'Ghibli Museum tickets go on sale on the 10th',   city: 'Tokyo',  by: 'Casey',  status: 'idea',        img: img('ghibli', 400, 300), c: 'like', h: 'meh' },
  { title: 'Onsen night after skiing',                       city: 'Hakuba', by: 'Casey',  status: 'idea',        img: img('onsen', 400, 300),  c: 'meh',  h: 'like' },
  { title: 'Nishiki market',                                 city: 'Kyoto',  by: 'Casey',  status: 'shortlisted', img: img('nishiki', 400, 300), c: 'like', h: 'like' },
  { title: 'Owl café',                                       city: 'Tokyo',  by: 'Yasmim', status: 'idea',        img: img('owl', 400, 300),    c: 'no',   h: 'meh' },
];
export const IDEA_FILTERS = ['All', 'Tokyo', 'Hakuba', 'Kyoto', 'Shortlisted', 'Decided'];
```

(Design: item 4 was `Dotonbori at night`, Osaka, `img('dotonbori')`, same votes.)

## 13. BOOKINGS (7; design had 4, the three Hakuba rows are the real-project additions)

```ts
export const BOOKINGS: Booking[] = [
  { group: 'Flights',   kind: 'flight', title: 'Japan Airlines · JL 5',                a: 'JFK',   b: 'HND',    dep: 'Thu Feb 4 · 12:55 PM',          arr: 'Fri Feb 5 · 4:15 PM',            seats: '34A · 34B',                      conf: 'Q7XR4M',       docs: 2, sub: 'Return JL 6 · Feb 19' },
  { group: 'Stays',     kind: 'stay',   title: 'Hakuba Alpine Lodge',                  addr: 'Happo-one, Hakuba, Nagano',          dep: 'Check in Tue Feb 9 · 3 PM',     arr: 'Check out Sat Feb 13 · 10 AM',   seats: '+81 261-72-5533',                conf: 'HAL-0209',     docs: 0, sub: 'Ski lodge · breakfast included · onsen on site' },
  { group: 'Stays',     kind: 'stay',   title: 'Yoshikawa Inn',                        addr: '135 Tominokoji, Nakagyo, Kyoto',     dep: 'Check in Sat Feb 13 · 3 PM',    arr: 'Check out Tue Feb 16 · 11 AM',   seats: '+81 75-221-5544',                conf: 'YK-2027-0213', docs: 1, sub: 'Ryokan · kaiseki dinner included' },
  { group: 'Transport', kind: 'train',  title: 'Hokuriku Shinkansen · Kagayaki 505',   a: 'Tokyo', b: 'Nagano', dep: 'Tue Feb 9 · 9:24 AM',           arr: 'Tue Feb 9 · 10:44 AM',           seats: 'Car 5 · 8A, 8B · JR Pass',       conf: '—',            docs: 0, sub: 'Reserve seats at the station' },
  { group: 'Transport', kind: 'bus',    title: 'Alpico bus · Nagano → Hakuba',         a: 'Nagano', b: 'Hakuba', dep: 'Tue Feb 9 · 11:10 AM',         arr: 'Tue Feb 9 · 12:20 PM',           seats: 'No reservation · ¥2,800 each',   conf: '—',            docs: 0, sub: 'East exit bus counter · leaves from stop 26' },
  { group: 'Transport', kind: 'train',  title: 'Shinkansen Nozomi 23',                 a: 'Tokyo', b: 'Kyoto',  dep: 'Sat Feb 13 · 2:00 PM',          arr: 'Sat Feb 13 · 4:15 PM',           seats: 'Car 7 · 12D, 12E · JR Pass',     conf: '—',            docs: 0, sub: 'Reserve seats at the station' },
  { group: 'Tickets',   kind: 'ticket', title: 'teamLab Planets',                      a: 'Toyosu', b: '',      dep: 'Fri Feb 5 · 5:30 PM',           arr: '',                               seats: '2 adults',                       conf: 'TLP-40912',    docs: 1, sub: '' },
];
```

Group order on screen: Flights, Stays, Transport, Tickets. Route rows (`flight`, `train`, `bus`) render `a → b` with `dep` / `arr`; stay rows render `addr` with check-in / check-out and a phone number in `seats`; ticket rows render `a` and `seats`.

Add-booking flow:

```ts
export const BOOKING_KINDS = [['Flight', 'FLT', 'flight'], ['Stay', 'STY', 'stay'], ['Transport', 'TRN', null], ['Activity', 'ACT', null], ['Food', 'EAT', null], ['Ticket', 'TKT', null]];
export const PASTE_FIELDS: PasteField[] = [
  { k: 'Airline',      v: 'Japan Airlines',        tag: 'ok' },
  { k: 'Flight no.',   v: 'JL 5',                  tag: 'ok' },        // mono
  { k: 'From → To',    v: 'JFK → HND',             tag: 'ok' },
  { k: 'Departs',      v: 'Thu Feb 4 · 12:55 PM',  tag: 'ok' },
  { k: 'Arrives',      v: 'Fri Feb 5 · 4:15 PM',   tag: 'check tz' },
  { k: 'Seats',        v: '34A, 34B',              tag: 'ok' },        // mono
  { k: 'Confirmation', v: 'Q7XR4M',                tag: 'ok' },        // mono
  { k: 'Cost',         v: 'Not found',             tag: 'add' },       // value in --fg3
];
```

## 14. LISTS - checklists (Japan) and GUESTS (Anniversary)

```ts
export const LISTS: Checklist[] = [
  { name: 'Before we go', done: 3, total: 7, items: [
    { t: 'Renew Casey’s passport',              who: 'C', done: true,  due: 'Oct 1' },
    { t: 'Buy JR Pass vouchers',                who: 'Y', done: false, due: 'Jan 4' },     // design: Mar 1
    { t: 'Ghibli tickets (on sale the 10th)',   who: 'C', done: false, due: 'Jan 10' },    // design: Mar 10
    { t: 'Tell the bank',                       who: 'Y', done: true,  due: '' },
  ] },
  { name: 'Packing (Casey)',  done: 0, total: 6, items: [
    { t: 'Onsen-friendly sandals', who: 'C', done: false, due: '' },
    { t: 'Camera + 2 batteries',   who: 'C', done: false, due: '' },
  ] },
  { name: 'Packing (Yasmim)', done: 0, total: 5, items: [
    { t: 'Walking shoes, the real ones', who: 'Y', done: false, due: '' },
  ] },
];

export const GUESTS: Checklist[] = [
  { name: 'Guests',   done: 6, total: 8, items: [
    { t: 'Rosa & Miguel',   who: 'Y', done: true,  due: 'yes' },
    { t: 'Casey’s parents', who: 'C', done: true,  due: 'yes' },
    { t: 'Dev',             who: 'C', done: false, due: 'asked' },
    { t: 'Priya',           who: 'Y', done: false, due: 'asked' },
  ] },
  { name: 'Shopping', done: 1, total: 4, items: [
    { t: 'Flowers for the table', who: 'Y', done: false, due: 'Oct 16' },
    { t: 'The good candles',      who: 'C', done: true,  due: '' },
  ] },
];
```

`done` / `total` are list-level counts that exceed the sample `items` shown; the visible ring value is `done + (ticked now) - (done in data)` over `total`.

## 15. BUDGET

```ts
export const BUDGET: Budget = {
  planned: '$9,400', committed: '$5,120', paid: '$3,860',
  plannedJpy: '¥1,393,000', committedJpy: '¥758,800', paidJpy: '¥572,000',
  rate: '148.2',
  rows: [['Flights', '$3,680', 39], ['Stays', '$2,900', 31], ['Transport', '$720', 8], ['Food', '$1,400', 15], ['Tickets', '$700', 7]],
};
// Totals rendered as three tiles: Planned / Committed / Paid, USD large with JPY beneath. Rows: category, amount, bar at pct% of planned.
```

## 16. DOCS (4)

```ts
export const DOCS: PlanDoc[] = [
  { name: 'JL5-eticket.pdf',            of: 'JL 5 · JFK → HND', pages: 2 },
  { name: 'yoshikawa-confirmation.pdf', of: 'Yoshikawa Inn',    pages: 1 },
  { name: 'teamlab-qr.png',             of: 'teamLab Planets',  pages: 1 },
  { name: 'hotel-niwa.pdf',             of: 'Hotel Niwa',       pages: 3 },
];
```

## 17. PINS - map (x / y are percentages of the map panel)

```ts
export const PINS: Record<MapCity, MapPin[]> = {
  Tokyo: [
    { kind: 'stay',      title: 'Hotel Niwa',      place: 'Chiyoda',         when: 'Day 1', x: 46, y: 38 },
    { kind: 'food',      title: 'Ichiran ramen',   place: 'Shibuya',         when: 'Day 1', x: 24, y: 62 },
    { kind: 'ticket',    title: 'teamLab Planets', place: 'Toyosu',          when: 'Day 2', x: 72, y: 74 },
    { kind: 'activity',  title: 'Meiji Jingu',     place: 'Shibuya',         when: 'Day 2', x: 20, y: 44 },
    { kind: 'ticket',    title: 'Shibuya Sky',     place: 'Scramble Square', when: 'Day 2', x: 28, y: 58 },
    { kind: 'transport', title: 'Haneda Airport',  place: 'Ota',             when: 'Day 1', x: 66, y: 88 },
  ],
  Hakuba: [
    { kind: 'stay',      title: 'Hakuba Alpine Lodge',      place: 'Happo-one', when: 'Days 6–9', x: 48, y: 52 },
    { kind: 'transport', title: 'Nagano Station',           place: 'Nagano',    when: 'Day 6',    x: 78, y: 86 },
    { kind: 'activity',  title: 'Happo-one lifts',          place: 'Happo',     when: 'Day 7',    x: 34, y: 30 },
    { kind: 'activity',  title: 'Onsen night after skiing', place: 'Happo',     when: 'idea',     x: 58, y: 64 },
  ],
  Kyoto: [
    { kind: 'stay',     title: 'Yoshikawa Inn',  place: 'Nakagyo', when: 'Days 10–13',  x: 48, y: 50 },
    { kind: 'activity', title: 'Fushimi Inari',  place: 'Fushimi', when: 'unscheduled', x: 60, y: 82 },
    { kind: 'food',     title: 'Nishiki market', place: 'Nakagyo', when: 'unscheduled', x: 44, y: 46 },
  ],
};
export const MAP_CITIES: MapCity[] = ['Tokyo', 'Hakuba', 'Kyoto'];
```

(Design: `Osaka: [food 'Dotonbori', 'Namba', 'idea', 50, 60]`; Kyoto stay `Days 6–9`. The desktop map uses the Tokyo set only.)

## 18. TODAY - Day 2 of 16 (Fri Feb 5, Tokyo)

```ts
export const TODAY_HEADER = { eyebrow: 'Today · Day 2 of 16', title: 'Japan 2027', sub: 'Tokyo · Fri Feb 5 · 9:14 AM local', next: 'Next: Shibuya Sky at 2:00 PM' };
export const TODAY: TodayItem[] = [
  { time: '8:30 AM',  kind: 'food',     title: 'Coffee at Onibus',          place: 'Nakameguro',                             past: true },
  { time: '11:00 AM', kind: 'activity', title: 'Meiji Jingu',               place: 'Shibuya · walk from Harajuku',           past: true },
  { time: '2:00 PM',  kind: 'ticket',   title: 'Shibuya Sky',               place: 'Scramble Square, 14F entrance',          conf: 'SS-77120', next: true },
  { time: '5:30 PM',  kind: 'ticket',   title: 'teamLab Planets',           place: 'Toyosu · 20 min on the Yurakucho line',  conf: 'TLP-40912' },
  { time: '8:00 PM',  kind: 'food',     title: 'Yakitori under the tracks', place: 'Yurakucho' },
];
```

## 19. Us screen, preferences, sign-in

```ts
export const STATS: Stat[] = [{ n: '599', l: 'memories' }, { n: '4,812', l: 'photos' }, { n: '37', l: 'places' }, { n: '5', l: 'trips' }, { n: '786', l: 'days' }];
export const SECURITY: SecurityRow[] = [
  { t: 'Password',        d: 'Changed 4 months ago',            r: 'Change', c: 'var(--fg2)' },
  { t: 'Authenticator',   d: 'TOTP · 8 backup codes left',      r: 'On',     c: 'var(--green)' },
  { t: 'Passkeys',        d: 'Casey’s iPhone · MacBook',        r: '2',      c: 'var(--fg2)' },
  { t: 'Active sessions', d: 'This phone · Chrome on Mac',      r: '2',      c: 'var(--fg2)' },
  { t: 'Recent logins',   d: 'Today 9:41 PM · Sep 4 · Sep 2',   r: 'View',   c: 'var(--fg2)' },
];
export const NOTIF_ROWS = [['push', 'Push', 'Messages, notes, calendar reminders'], ['email', 'Email', 'Weekly digest of new memories'], ['quiet', 'Quiet hours', '10 PM – 7 AM, both timezones']];
export const PLAN_NOTIF_CHIPS = [['votes', 'Votes'], ['comments', 'Comments'], ['decisions', 'Decisions'], ['bookings', 'Bookings']];   // section header: 'Per plan · Japan 2027'
export const OPT_INS = [['map', 'Map view', 'Shows plan items and memories on a map. Loads map tiles from a third party.'], ['paste', 'Paste a confirmation', 'Turns pasted text or screenshots into a booking form. Runs on your device only.']];
export const DEFAULT_PREFS: Prefs = { notif: { push: true, email: false, quiet: true }, planNotif: { votes: true, comments: true, decisions: true, bookings: true }, optIn: { map: false, paste: false } };
export const DEMO_CODE = '123456';   // the only accepted authenticator code in the prototype
```

Desktop nav badges: Chat `2`, Notes `1`. Mobile chat tab badge: `3`, drops to `2` once the sealed note is opened.

## 20. Proposed `src/data/types.ts`

```ts
// src/data/types.ts
export type Person = 'Casey' | 'Yasmim';
export type Owner = 'c' | 'h' | 'b';              // Casey, her, both
export type Initial = 'C' | 'Y';

export type MemoryType = 'Trip' | 'Date night' | 'Everyday' | 'Milestone';
export type MemorySize = 'large' | 'medium' | 'compact';
export type MemoryFilter = 'All' | 'Trips' | 'Date nights' | 'Everyday' | 'Milestones' | 'Videos';
export type TimelineLayout = 'editorial' | 'grid' | 'journal';

export interface Memory {
  id: number;
  title: string;
  date: string;        // 'Aug 14–17, 2026'
  day: string;         // '14'
  mon: string;         // 'Aug'
  loc: string;
  type: MemoryType;
  by: Person;
  ex: string;          // excerpt
  exLong?: string;     // desktop large card
  count: string;       // '38 photos · 2 videos'
  size: MemorySize;
  img: string;
  img2: string;        // '' when none
  month: string;       // 'August 2026' or ''
  showMonth: boolean;
  more: string;        // '+36' or ''
}

export interface MemoryDetail {
  take1a: string;
  quote: string;
  take1b: string;
  inline: string;
  inlineCap: string;
  take2: string;
}

export interface GalleryTile { src: string; span: 1 | 2; video?: boolean; dur?: string }
export interface PhotoTile { id: string; src: string; video: boolean; dur: string; fav: boolean; byHer: boolean }
export interface Album { name: string; count: string; src: string; memId?: number }
export type GalleryFilter = 'All' | 'Photos' | 'Videos' | 'Favorites' | 'Casey' | 'Yasmim';

export type MessageType = 'text' | 'photo' | 'photos' | 'voice' | 'memory' | 'link' | 'planitem';
export interface ChatMessage {
  id: number;
  from: 'me' | 'h';
  type: MessageType;
  time: string;        // '9:38 PM' | 'Seen 9:42 PM' | 'Delivered'
  text?: string;
  img?: string;
  imgs?: { src: string }[];
  dur?: string;
  title?: string;
  sub?: string;
  memId?: number;
  url?: string;
  domain?: string;
  kind?: ItemKind;
}

export type NoteColor = 'n1' | 'n2' | 'n3' | 'n4';
export interface FridgeNote {
  body: string;
  color: NoteColor;
  from: Person;
  time: string;        // 'This morning' | 'Yesterday' | 'Aug 30' | 'Scheduled' | 'Just now'
  span: 1 | 2;
  hasPhoto?: boolean;
  photo?: string;
  scheduled?: boolean;
  when?: string;       // 'Appears Oct 3, 7:00 AM'
}

export type BlockType = 'h' | 'p' | 'list' | 'q' | 'img';
export interface ComposerBlock { type: BlockType; text?: string; color?: string; items?: string[]; src?: string; cap?: string }
export interface ToolbarTool { label: string; font: string; weight: 400 | 500 | 600; style: 'normal' | 'italic' }

export type EventKind = 'Reminder' | 'Recurring' | 'Event' | 'All day';
export interface CalendarEvent {
  day: number;         // day of September 2026
  title: string;
  kind: EventKind;
  owner: Owner;
  when: string;        // 'Tue Sep 8 · 2:30 PM'
  rule: string;        // 'Does not repeat' | 'Every second Thursday' | ...
  loc: string;         // '' -> 'No location'
  past?: boolean;
}
export interface CalendarBlock { day: number; title: string; owner: Owner; start?: number; len?: number; allDay?: boolean }
export interface AgendaRow { day: string; dow: string; title: string; sub: string; dot: string; right: string; rightColor: string; planId?: PlanId; eventDay?: number }

export type PlanId = 'japan' | 'lake' | 'anniv' | 'portugal' | 'asheville';
export type PlanType = 'Trip' | 'Event';
export type PlanStatus = 'planning' | 'booked' | 'dreaming' | 'done' | 'underway';
export type PlanGroup = 'next' | 'dream' | 'past';
export type PlanSeg = 'overview' | 'itinerary' | 'ideas' | 'bookings' | 'lists' | 'budget' | 'docs' | 'map' | 'locked';
export interface Plan {
  id: PlanId;
  name: string;
  type: PlanType;
  dates: string;
  dest: string[];
  status: PlanStatus;
  countdown: string;
  hints: string;
  color: string;       // token var()
  cover: string;
  group: PlanGroup;
  large?: boolean;
}
export interface OverviewHero { num: string; line: string; kind: 'flight' | 'last' | 'reservation'; title: string; sub: string; conf: string }

export type ItemKind = 'flight' | 'transport' | 'stay' | 'food' | 'activity' | 'ticket';
export interface ItineraryItem {
  kind: ItemKind;
  time: string;
  title: string;
  place: string;
  cost: string;
  booked: boolean;
  conf?: string;
  docs: number;
  by: Person;
}
export interface ItineraryDay { n: number; dow: string; date: string; city: string; items: ItineraryItem[] }
export interface UnscheduledItem { kind: ItemKind; title: string; place: string; by: Person }

export type Vote = 'like' | 'meh' | 'no';
export type IdeaStatus = 'idea' | 'shortlisted' | 'decided';
export type MapCity = 'Tokyo' | 'Hakuba' | 'Kyoto';
export type IdeaFilter = 'All' | MapCity | 'Shortlisted' | 'Decided';
export interface Idea { title: string; city: MapCity; by: Person; status: IdeaStatus; img: string; c: Vote; h: Vote }

export type BookingKind = 'flight' | 'train' | 'bus' | 'stay' | 'ticket';
export type BookingGroup = 'Flights' | 'Stays' | 'Transport' | 'Tickets';
export interface Booking {
  group: BookingGroup;
  kind: BookingKind;
  title: string;
  a?: string;          // route origin / ticket venue
  b?: string;          // route destination ('' for tickets)
  addr?: string;       // stays
  dep: string;
  arr: string;
  seats: string;       // seats, phone (stays) or guests (tickets)
  conf: string;        // '—' when none
  docs: number;
  sub: string;
}
export interface PasteField { k: string; v: string; tag: 'ok' | 'check tz' | 'add' }
export type BookingForm = null | 'kinds' | 'flight' | 'stay' | 'paste';

export interface ChecklistItem { t: string; who: Initial; done: boolean; due: string }
export interface Checklist { name: string; done: number; total: number; items: ChecklistItem[] }

export interface Budget {
  planned: string; committed: string; paid: string;
  plannedJpy: string; committedJpy: string; paidJpy: string;
  rate: string;
  rows: [category: string, amount: string, pct: number][];
}
export interface PlanDoc { name: string; of: string; pages: number }
export interface MapPin { kind: ItemKind; title: string; place: string; when: string; x: number; y: number }
export interface TodayItem { time: string; kind: ItemKind; title: string; place: string; conf?: string; past?: boolean; next?: boolean }

export interface Stat { n: string; l: string }
export interface SecurityRow { t: string; d: string; r: string; c: string }
export interface Prefs {
  notif: { push: boolean; email: boolean; quiet: boolean };
  planNotif: { votes: boolean; comments: boolean; decisions: boolean; bookings: boolean };
  optIn: { map: boolean; paste: boolean };
}

export type Sim = 'now' | 'during' | 'after';
export type Screen = 'signin' | 'memories' | 'detail' | 'gallery' | 'composer' | 'plans' | 'plan' | 'today' | 'calendar' | 'chat' | 'us';
```
