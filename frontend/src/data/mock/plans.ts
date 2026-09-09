// mock-data.md sections 9-18: plans, itinerary, ideas, bookings, lists, budget,
// docs, pins, today. Real-project corrections applied (Japan 2027, Feb 4-19,
// Tokyo · Hakuba · Kyoto, JPY).

import { ANNIV_WEEKEND_END, ANNIV_WEEKEND_START, ASHEVILLE_END, ASHEVILLE_START, JAPAN_END, JAPAN_START, LAKE_END, LAKE_START } from '../dates'
import { mockImage as img } from '../mockImage'
import type {
  Booking,
  BookingKindRow,
  Budget,
  Checklist,
  Idea,
  IdeaFilter,
  ItineraryDay,
  MapCity,
  MapPin,
  MoreItem,
  OverviewHero,
  PasteField,
  Plan,
  PlanDoc,
  PlanId,
  PlanSeg,
  TodayHeader,
  TodayItem,
  UnscheduledItem,
} from '../types'

export const PLANS: Plan[] = [
  {
    id: 'japan',
    name: 'Japan 2027',
    type: 'Trip',
    dates: 'Feb 4 – 19, 2027',
    dest: ['Tokyo', 'Hakuba', 'Kyoto'],
    status: 'planning',
    countdown: 'in 151 days',
    hints: '12 ideas · 4 booked · checklist 3/18',
    color: 'var(--accent)',
    cover: img('japan', 1200, 800),
    group: 'next',
    large: true,
    start: JAPAN_START,
    end: JAPAN_END,
  },
  {
    id: 'lake',
    name: 'Lake weekend',
    type: 'Trip',
    dates: 'Sep 12 – 13, 2026',
    dest: ['Lake Lure'],
    status: 'booked',
    countdown: 'in 6 days',
    hints: '3 ideas · 1 booked · checklist 5/9',
    color: 'var(--green)',
    cover: img('lake1', 600, 400),
    group: 'next',
    start: LAKE_START,
    end: LAKE_END,
  },
  {
    id: 'anniv',
    name: 'Anniversary weekend',
    type: 'Event',
    dates: 'Oct 17 – 18, 2026',
    dest: ['Home', 'Nonna’s'],
    status: 'booked',
    countdown: 'in 41 days',
    hints: '2 ideas · 2 booked · guests 6/8',
    color: 'var(--plum)',
    cover: img('anniv', 600, 400),
    group: 'next',
    start: ANNIV_WEEKEND_START,
    end: ANNIV_WEEKEND_END,
  },
  {
    id: 'portugal',
    name: 'Portugal, someday',
    type: 'Trip',
    dates: 'No dates yet',
    dest: ['Lisbon', 'Porto'],
    status: 'dreaming',
    countdown: '',
    hints: '7 ideas',
    color: 'var(--ochre)',
    cover: img('lisbon', 600, 400),
    group: 'dream',
  },
  {
    id: 'asheville',
    name: 'Three days in Asheville',
    type: 'Trip',
    dates: 'Aug 14 – 17, 2026',
    dest: ['Asheville'],
    status: 'done',
    countdown: '',
    hints: 'Memory published',
    color: 'var(--fg3)',
    cover: img('asheville', 600, 400),
    group: 'past',
    start: ASHEVILLE_START,
    end: ASHEVILLE_END,
  },
]

export const PLAN_GROUPS: [label: string, key: Plan['group']][] = [
  ['Up next', 'next'],
  ['Dreaming', 'dream'],
  ['Past', 'past'],
]

export function findPlan(id: PlanId | string | undefined): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0]
}

/** Plan overview heroes. `num` is the Sep 6 snapshot; hooks recompute it. */
export const OVERVIEW: Record<'japanNow' | 'japanAfter' | 'anniv', OverviewHero> = {
  japanNow: { num: '151', line: 'days until we land in Tokyo', kind: 'flight', title: 'JL 5 · JFK → HND', sub: 'Thu Feb 4 · 12:55 PM · Terminal 1', conf: 'Q7XR4M' },
  japanAfter: { num: '16', line: 'days, 3 cities, 212 photos', kind: 'last', title: 'JL 6 · HND → JFK', sub: 'Fri Feb 19 · landed 4:40 PM', conf: 'Q7XR4M' },
  anniv: { num: '41', line: 'days until the weekend', kind: 'reservation', title: 'Dinner at Nonna’s · table for 8', sub: 'Sat Oct 17 · 6:30 PM · the back room', conf: 'NONNA-1017' },
}

export const MORE_ITEMS: MoreItem[] = [
  { label: 'Checklists', key: 'lists', meta: '3 / 18' },
  { label: 'Budget', key: 'budget', meta: '$3,860 paid' },
  { label: 'Documents', key: 'docs', meta: '4 files' },
  { label: 'Map', key: 'map', meta: '9 pins' },
  { label: 'Locked note', key: 'locked', meta: '' },
]

/** Segment tabs. Trip: Overview / Itinerary / Ideas / Bookings / More. Event: Overview / Schedule / Guests / Bookings / More. */
export const TRIP_SEGS: [label: string, key: PlanSeg | 'more'][] = [
  ['Overview', 'overview'],
  ['Itinerary', 'itinerary'],
  ['Ideas', 'ideas'],
  ['Bookings', 'bookings'],
  ['More', 'more'],
]
export const EVENT_SEGS: [label: string, key: PlanSeg | 'more'][] = [
  ['Overview', 'overview'],
  ['Schedule', 'itinerary'],
  ['Guests', 'lists'],
  ['Bookings', 'bookings'],
  ['More', 'more'],
]
export const TRIP_MORE_KEYS: PlanSeg[] = ['lists', 'budget', 'docs', 'map', 'locked']
export const EVENT_MORE_KEYS: PlanSeg[] = ['budget', 'docs', 'map', 'locked']
export const MORE_LABELS: Record<PlanSeg, string> = {
  overview: 'Overview',
  itinerary: 'Itinerary',
  ideas: 'Ideas',
  bookings: 'Bookings',
  lists: 'Checklists',
  budget: 'Budget',
  docs: 'Documents',
  map: 'Map',
  locked: 'Locked note',
}
/** Desktop tab strip (labels, not keys). */
export const DESKTOP_TABS: [label: string, key: PlanSeg][] = [
  ['Overview', 'overview'],
  ['Itinerary', 'itinerary'],
  ['Ideas', 'ideas'],
  ['Bookings', 'bookings'],
  ['Checklists', 'lists'],
  ['Budget', 'budget'],
  ['Documents', 'docs'],
  ['Map', 'map'],
  ['Locked note', 'locked'],
]

/** Offline toggle copy: 'saved 2h ago' / 'off'. */
export function offlineNote(on: boolean): string {
  return on ? 'saved 2h ago' : 'off'
}

// ---------------------------------------------------------------- itinerary

export const DAYS: ItineraryDay[] = [
  {
    n: 1,
    dow: 'Thu',
    date: 'Feb 4',
    city: 'Tokyo',
    items: [
      { kind: 'flight', time: '12:55 PM', title: 'JL 5 · JFK → HND', place: 'Terminal 1, gate B22', cost: '$1,840', booked: true, conf: 'Q7XR4M', docs: 2, by: 'Casey' },
      { kind: 'transport', time: '5:10 PM +1', title: 'Monorail to Hamamatsucho', place: 'Haneda Airport', cost: '¥500', booked: false, docs: 0, by: 'Yasmim' },
      { kind: 'stay', time: '6:30 PM', title: 'Check in · Hotel Niwa', place: 'Chiyoda, Tokyo', cost: '$620', booked: true, conf: 'NW-88213', docs: 1, by: 'Casey' },
      { kind: 'food', time: '8:00 PM', title: 'Ichiran ramen', place: 'Shibuya', cost: '¥2,400', booked: false, docs: 0, by: 'Yasmim' },
    ],
  },
  {
    n: 2,
    dow: 'Fri',
    date: 'Feb 5',
    city: 'Tokyo',
    items: [{ kind: 'ticket', time: '5:30 PM', title: 'teamLab Planets', place: 'Toyosu', cost: '$56', booked: true, conf: 'TLP-40912', docs: 1, by: 'Casey' }],
  },
  { n: 3, dow: 'Sat', date: 'Feb 6', city: 'Tokyo', items: [] },
]

/** Day headings for the rest of the trip (not itemised in the design). */
export const JAPAN_DAY_CITIES: { from: number; to: number; city: string }[] = [
  { from: 1, to: 5, city: 'Tokyo' },
  { from: 6, to: 9, city: 'Hakuba' },
  { from: 10, to: 13, city: 'Kyoto' },
  { from: 14, to: 16, city: 'Tokyo' },
]
export function japanCityForDay(n: number): string {
  return JAPAN_DAY_CITIES.find((r) => n >= r.from && n <= r.to)?.city ?? 'Tokyo'
}

/** Desktop per-item notes (keyed by item title; fallback 'No notes yet.'). */
export const ITEM_NOTES: Record<string, string> = {
  'JL 5 · JFK → HND': 'Premium economy, the one splurge. Check in opens 24h before — set a reminder. Terminal 1, not 4.',
  'Ichiran ramen': 'The Shibuya one has a shorter line after 9. Order at the machine, tick the extra garlic box.',
  'Check in · Hotel Niwa': 'Ask for a high floor. Luggage forwarding to Kyoto from the front desk, ¥2,000 a bag.',
  'teamLab Planets': 'Wear shorts or roll your trousers — you walk through water. Tickets are timed, arrive 15 min early.',
  'Monorail to Hamamatsucho': 'Suica works. About 20 minutes.',
}
export const NO_NOTES = 'No notes yet.'
export const EMPTY_DAY_COPY = 'Nothing yet. Drop an idea here.'

export const UNSCHEDULED: UnscheduledItem[] = [
  { kind: 'activity', title: 'Fushimi Inari at sunrise', place: 'Kyoto', by: 'Yasmim' },
  { kind: 'food', title: 'Nishiki market breakfast', place: 'Kyoto', by: 'Casey' },
]

// Anniversary weekend (event plan) schedule
export const EVENT_DAYS: ItineraryDay[] = [
  {
    n: 1,
    dow: 'Sat',
    date: 'Oct 17',
    city: 'Brevard, NC',
    items: [
      { kind: 'stay', time: '3:00 PM', title: 'Check in · The Inn at Brevard', place: 'Brevard, NC', cost: '$340', booked: true, conf: 'IB-5521', docs: 1, by: 'Casey' },
      { kind: 'food', time: '6:30 PM', title: 'Dinner at Nonna’s', place: 'The back room · 8 people', cost: '$480', booked: true, conf: 'NONNA-1017', docs: 0, by: 'Yasmim' },
      { kind: 'activity', time: '9:00 PM', title: 'Rooftop, same as year one', place: 'Downtown', cost: '', booked: false, docs: 0, by: 'Casey' },
    ],
  },
]
export const EVENT_UNSCHEDULED: UnscheduledItem[] = [{ kind: 'activity', title: 'Drive up the parkway if it’s clear', place: 'Sunday', by: 'Casey' }]

// ---------------------------------------------------------------- ideas

export const IDEAS: Idea[] = [
  { title: 'Fushimi Inari at sunrise', city: 'Kyoto', by: 'Yasmim', status: 'shortlisted', img: img('inari', 400, 300), c: 'like', h: 'like' },
  { title: 'Ichiran ramen', city: 'Tokyo', by: 'Yasmim', status: 'decided', img: img('ramen', 400, 300), c: 'like', h: 'like' },
  { title: 'Ghibli Museum tickets go on sale on the 10th', city: 'Tokyo', by: 'Casey', status: 'idea', img: img('ghibli', 400, 300), c: 'like', h: 'meh' },
  { title: 'Onsen night after skiing', city: 'Hakuba', by: 'Casey', status: 'idea', img: img('onsen', 400, 300), c: 'meh', h: 'like' },
  { title: 'Nishiki market', city: 'Kyoto', by: 'Casey', status: 'shortlisted', img: img('nishiki', 400, 300), c: 'like', h: 'like' },
  { title: 'Owl café', city: 'Tokyo', by: 'Yasmim', status: 'idea', img: img('owl', 400, 300), c: 'no', h: 'meh' },
]
export const IDEA_FILTERS: IdeaFilter[] = ['All', 'Tokyo', 'Hakuba', 'Kyoto', 'Shortlisted', 'Decided']
export const IDEA_PASTE_PLACEHOLDER = 'Paste a link to add an idea…'

export function filterIdeas(list: Idea[], filter: IdeaFilter): Idea[] {
  return list.filter((i) => filter === 'All' || i.city === filter || i.status === filter.toLowerCase())
}

// ---------------------------------------------------------------- bookings

export const BOOKINGS: Booking[] = [
  { group: 'Flights', kind: 'flight', title: 'Japan Airlines · JL 5', a: 'JFK', b: 'HND', dep: 'Thu Feb 4 · 12:55 PM', arr: 'Fri Feb 5 · 4:15 PM', seats: '34A · 34B', conf: 'Q7XR4M', docs: 2, sub: 'Return JL 6 · Feb 19' },
  { group: 'Stays', kind: 'stay', title: 'Hakuba Alpine Lodge', addr: 'Happo-one, Hakuba, Nagano', dep: 'Check in Tue Feb 9 · 3 PM', arr: 'Check out Sat Feb 13 · 10 AM', seats: '+81 261-72-5533', conf: 'HAL-0209', docs: 0, sub: 'Ski lodge · breakfast included · onsen on site' },
  { group: 'Stays', kind: 'stay', title: 'Yoshikawa Inn', addr: '135 Tominokoji, Nakagyo, Kyoto', dep: 'Check in Sat Feb 13 · 3 PM', arr: 'Check out Tue Feb 16 · 11 AM', seats: '+81 75-221-5544', conf: 'YK-2027-0213', docs: 1, sub: 'Ryokan · kaiseki dinner included' },
  { group: 'Transport', kind: 'train', title: 'Hokuriku Shinkansen · Kagayaki 505', a: 'Tokyo', b: 'Nagano', dep: 'Tue Feb 9 · 9:24 AM', arr: 'Tue Feb 9 · 10:44 AM', seats: 'Car 5 · 8A, 8B · JR Pass', conf: '—', docs: 0, sub: 'Reserve seats at the station' },
  { group: 'Transport', kind: 'bus', title: 'Alpico bus · Nagano → Hakuba', a: 'Nagano', b: 'Hakuba', dep: 'Tue Feb 9 · 11:10 AM', arr: 'Tue Feb 9 · 12:20 PM', seats: 'No reservation · ¥2,800 each', conf: '—', docs: 0, sub: 'East exit bus counter · leaves from stop 26' },
  { group: 'Transport', kind: 'train', title: 'Shinkansen Nozomi 23', a: 'Tokyo', b: 'Kyoto', dep: 'Sat Feb 13 · 2:00 PM', arr: 'Sat Feb 13 · 4:15 PM', seats: 'Car 7 · 12D, 12E · JR Pass', conf: '—', docs: 0, sub: 'Reserve seats at the station' },
  { group: 'Tickets', kind: 'ticket', title: 'teamLab Planets', a: 'Toyosu', b: '', dep: 'Fri Feb 5 · 5:30 PM', arr: '', seats: '2 adults', conf: 'TLP-40912', docs: 1, sub: '' },
]
export const BOOKING_GROUP_ORDER: Booking['group'][] = ['Flights', 'Stays', 'Transport', 'Tickets']
export const ROUTE_KINDS: Booking['kind'][] = ['flight', 'train', 'bus']

export const BOOKING_KINDS: BookingKindRow[] = [
  { label: 'Flight', abbr: 'FLT', form: 'flight' },
  { label: 'Stay', abbr: 'STY', form: 'stay' },
  { label: 'Transport', abbr: 'TRN', form: null },
  { label: 'Activity', abbr: 'ACT', form: null },
  { label: 'Food', abbr: 'EAT', form: null },
  { label: 'Ticket', abbr: 'TKT', form: null },
]

export const PASTE_FIELDS: PasteField[] = [
  { k: 'Airline', v: 'Japan Airlines', tag: 'ok' },
  { k: 'Flight no.', v: 'JL 5', tag: 'ok', mono: true },
  { k: 'From → To', v: 'JFK → HND', tag: 'ok' },
  { k: 'Departs', v: 'Thu Feb 4 · 12:55 PM', tag: 'ok' },
  { k: 'Arrives', v: 'Fri Feb 5 · 4:15 PM', tag: 'check tz' },
  { k: 'Seats', v: '34A, 34B', tag: 'ok', mono: true },
  { k: 'Confirmation', v: 'Q7XR4M', tag: 'ok', mono: true },
  { k: 'Cost', v: 'Not found', tag: 'add' },
]

// ---------------------------------------------------------------- lists

export const LISTS: Checklist[] = [
  {
    name: 'Before we go',
    done: 3,
    total: 7,
    items: [
      { t: 'Renew Casey’s passport', who: 'C', done: true, due: 'Oct 1' },
      { t: 'Buy JR Pass vouchers', who: 'Y', done: false, due: 'Jan 4' },
      { t: 'Ghibli tickets (on sale the 10th)', who: 'C', done: false, due: 'Jan 10' },
      { t: 'Tell the bank', who: 'Y', done: true, due: '' },
    ],
  },
  {
    name: 'Packing (Casey)',
    done: 0,
    total: 6,
    items: [
      { t: 'Onsen-friendly sandals', who: 'C', done: false, due: '' },
      { t: 'Camera + 2 batteries', who: 'C', done: false, due: '' },
    ],
  },
  {
    name: 'Packing (Yasmim)',
    done: 0,
    total: 5,
    items: [{ t: 'Walking shoes, the real ones', who: 'Y', done: false, due: '' }],
  },
]

export const GUESTS: Checklist[] = [
  {
    name: 'Guests',
    done: 6,
    total: 8,
    items: [
      { t: 'Rosa & Miguel', who: 'Y', done: true, due: 'yes' },
      { t: 'Casey’s parents', who: 'C', done: true, due: 'yes' },
      { t: 'Dev', who: 'C', done: false, due: 'asked' },
      { t: 'Priya', who: 'Y', done: false, due: 'asked' },
    ],
  },
  {
    name: 'Shopping',
    done: 1,
    total: 4,
    items: [
      { t: 'Flowers for the table', who: 'Y', done: false, due: 'Oct 16' },
      { t: 'The good candles', who: 'C', done: true, due: '' },
    ],
  },
]

// ---------------------------------------------------------------- budget, docs

export const BUDGET: Budget = {
  planned: '$9,400',
  committed: '$5,120',
  paid: '$3,860',
  plannedJpy: '¥1,393,000',
  committedJpy: '¥758,800',
  paidJpy: '¥572,000',
  rate: '148.2',
  rows: [
    ['Flights', '$3,680', 39],
    ['Stays', '$2,900', 31],
    ['Transport', '$720', 8],
    ['Food', '$1,400', 15],
    ['Tickets', '$700', 7],
  ],
}
export const BUDGET_RATE_LINE = '1 USD = 148.2 JPY'
export const BUDGET_RATE_NOTE = 'set by you on Sep 6 · use today’s rate'

export const DOCS: PlanDoc[] = [
  { name: 'JL5-eticket.pdf', of: 'JL 5 · JFK → HND', pages: 2 },
  { name: 'yoshikawa-confirmation.pdf', of: 'Yoshikawa Inn', pages: 1 },
  { name: 'teamlab-qr.png', of: 'teamLab Planets', pages: 1 },
  { name: 'hotel-niwa.pdf', of: 'Hotel Niwa', pages: 3 },
]

// ---------------------------------------------------------------- map

export const PINS: Record<MapCity, MapPin[]> = {
  Tokyo: [
    { kind: 'stay', title: 'Hotel Niwa', place: 'Chiyoda', when: 'Day 1', x: 46, y: 38 },
    { kind: 'food', title: 'Ichiran ramen', place: 'Shibuya', when: 'Day 1', x: 24, y: 62 },
    { kind: 'ticket', title: 'teamLab Planets', place: 'Toyosu', when: 'Day 2', x: 72, y: 74 },
    { kind: 'activity', title: 'Meiji Jingu', place: 'Shibuya', when: 'Day 2', x: 20, y: 44 },
    { kind: 'ticket', title: 'Shibuya Sky', place: 'Scramble Square', when: 'Day 2', x: 28, y: 58 },
    { kind: 'transport', title: 'Haneda Airport', place: 'Ota', when: 'Day 1', x: 66, y: 88 },
  ],
  Hakuba: [
    { kind: 'stay', title: 'Hakuba Alpine Lodge', place: 'Happo-one', when: 'Days 6–9', x: 48, y: 52 },
    { kind: 'transport', title: 'Nagano Station', place: 'Nagano', when: 'Day 6', x: 78, y: 86 },
    { kind: 'activity', title: 'Happo-one lifts', place: 'Happo', when: 'Day 7', x: 34, y: 30 },
    { kind: 'activity', title: 'Onsen night after skiing', place: 'Happo', when: 'idea', x: 58, y: 64 },
  ],
  Kyoto: [
    { kind: 'stay', title: 'Yoshikawa Inn', place: 'Nakagyo', when: 'Days 10–13', x: 48, y: 50 },
    { kind: 'activity', title: 'Fushimi Inari', place: 'Fushimi', when: 'unscheduled', x: 60, y: 82 },
    { kind: 'food', title: 'Nishiki market', place: 'Nakagyo', when: 'unscheduled', x: 44, y: 46 },
  ],
}
export const MAP_CITIES: MapCity[] = ['Tokyo', 'Hakuba', 'Kyoto']
export const MAP_CAPTION = 'Tokyo · muted tiles · placeholder'

// ---------------------------------------------------------------- locked note

export const LOCKED_LINES = [
  'Casey · passport 5X8 221 904 · exp Mar 2031',
  'Yasmim · passport 7K1 088 435 · exp Nov 2029',
  'US Embassy Tokyo · +81 3-3224-5000',
  'Travel insurance · Allianz · pol. 88-2140-77',
]
export const LOCKED_FOOTNOTE = 'Hidden from offline copies and exports. Re-locks after 60 seconds.'
export const LOCKED_REVEAL = 'Click to reveal'

// ---------------------------------------------------------------- today (Day 2 of 16, Fri Feb 5, Tokyo)

export const TODAY_HEADER: TodayHeader = {
  eyebrow: 'Today · Day 2 of 16',
  title: 'Japan 2027',
  sub: 'Tokyo · Fri Feb 5 · 9:14 AM local',
  next: 'Next: Shibuya Sky at 2:00 PM',
}
export const TODAY: TodayItem[] = [
  { time: '8:30 AM', kind: 'food', title: 'Coffee at Onibus', place: 'Nakameguro', past: true },
  { time: '11:00 AM', kind: 'activity', title: 'Meiji Jingu', place: 'Shibuya · walk from Harajuku', past: true },
  { time: '2:00 PM', kind: 'ticket', title: 'Shibuya Sky', place: 'Scramble Square, 14F entrance', conf: 'SS-77120', next: true },
  { time: '5:30 PM', kind: 'ticket', title: 'teamLab Planets', place: 'Toyosu · 20 min on the Yurakucho line', conf: 'TLP-40912' },
  { time: '8:00 PM', kind: 'food', title: 'Yakitori under the tracks', place: 'Yurakucho' },
]

/** Post-trip overview banner copy. */
export const AFTER_TRIP = { title: 'You’re home', cta: 'Start a memory from this plan' } as const
