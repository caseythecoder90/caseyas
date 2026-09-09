// Unit tests for the server-document -> view-model mapping in planViews.ts.
// Fixtures are the seeded Japan trip (Thu Feb 4 - Fri Feb 19, 2027; Tokyo ·
// Hakuba · Kyoto). Dates are built with new Date(y, m - 1, d) like the code
// does, so the expectations hold in any machine timezone.

import { describe, expect, it } from 'vitest'
import type {
  ServerBudget,
  ServerBundle,
  ServerChecklist,
  ServerItem,
  ServerMedia,
  ServerPlan,
  ServerUser,
} from './api/plansApi'
import {
  bundleCounts,
  fmtDateTime,
  fmtRange,
  fmtTime,
  money,
  personFor,
  toBookings,
  toBudget,
  toChecklists,
  toDays,
  toDocs,
  toIdeas,
  toPins,
  toPlanCard,
  toTodayItems,
  toUnscheduled,
  tripDayOf,
  tripLength,
  wallClock,
} from './planViews'

// ---------------------------------------------------------------- fixtures

const CASEY = 'u-casey'
const HER = 'u-her'
const USERS: ServerUser[] = [
  { id: CASEY, username: 'casey', displayName: 'Casey' },
  { id: HER, username: 'yasmim', displayName: 'Yasmim' },
]

const STAMP = '2026-06-01T00:00:00Z'
const DESIGN_TODAY = new Date(2026, 8, 6) // Sun Sep 6, 2026

const local = (y: number, m: number, d: number) => new Date(y, m - 1, d)

function plan(overrides: Partial<ServerPlan> = {}): ServerPlan {
  return {
    id: 'japan',
    name: 'Japan 2027',
    type: 'trip',
    status: 'booked',
    dateStart: '2027-02-04',
    dateEnd: '2027-02-19',
    timezone: 'Asia/Tokyo',
    destinations: [{ name: 'Tokyo', countryCode: 'JP' }, { name: 'Hakuba' }, { name: 'Kyoto' }],
    currency: { home: 'USD', local: 'JPY', rate: 150 },
    linkedMemoryId: null,
    createdBy: CASEY,
    createdAt: STAMP,
    updatedAt: STAMP,
    ...overrides,
  }
}

let seq = 0
/** A decided, unscheduled activity by Casey; override what the test cares about. */
function item(overrides: Partial<ServerItem> = {}): ServerItem {
  seq += 1
  return {
    id: `item-${seq}`,
    planId: 'japan',
    kind: 'activity',
    title: `Item ${seq}`,
    status: 'decided',
    day: null,
    start: null,
    end: null,
    timezone: null,
    location: null,
    details: null,
    cost: null,
    confirmation: null,
    links: [],
    attachmentIds: [],
    tags: [],
    votes: {},
    comments: [],
    sortKey: seq,
    createdBy: CASEY,
    createdAt: STAMP,
    updatedAt: STAMP,
    ...overrides,
  }
}

function checklist(overrides: Partial<ServerChecklist> = {}): ServerChecklist {
  return { id: 'list-1', planId: 'japan', name: 'Before we go', kind: 'todo', items: [], ...overrides }
}

function media(overrides: Partial<ServerMedia> = {}): ServerMedia {
  return {
    id: 'media-1',
    kind: 'document',
    mime: 'application/pdf',
    size: 1024,
    originalName: 'doc.pdf',
    status: 'ready',
    pageCount: null,
    planId: 'japan',
    urls: {},
    createdAt: STAMP,
    ...overrides,
  }
}

function budget(overrides: Partial<ServerBudget> = {}): ServerBudget {
  return {
    planned: 6200,
    committed: 4100.5,
    paid: 1500,
    plannedLocal: 930000,
    committedLocal: 615000,
    paidLocal: null,
    home: 'USD',
    local: 'JPY',
    rate: 150,
    rows: [
      { kind: 'flight', amount: 2400, pct: 39 },
      { kind: 'stay', amount: 1800, pct: 29 },
      { kind: 'idea', amount: 0, pct: 0 },
    ],
    ...overrides,
  }
}

// ---------------------------------------------------------------- formatting

describe('fmtRange', () => {
  it('collapses a range inside one month', () => {
    expect(fmtRange('2027-02-04', '2027-02-19')).toBe('Feb 4 – 19, 2027')
  })
  it('spells both months when they differ', () => {
    expect(fmtRange('2027-02-04', '2027-03-02')).toBe('Feb 4 – Mar 2, 2027')
  })
  it('spells both months across a year boundary, dated by the end year', () => {
    expect(fmtRange('2026-12-30', '2027-01-02')).toBe('Dec 30 – Jan 2, 2027')
  })
  it('renders a single day when the end is missing or equals the start', () => {
    expect(fmtRange('2027-02-04')).toBe('Feb 4, 2027')
    expect(fmtRange('2027-02-04', null)).toBe('Feb 4, 2027')
    expect(fmtRange('2027-02-04', '2027-02-04')).toBe('Feb 4, 2027')
  })
  it('says "No dates yet" without a start', () => {
    expect(fmtRange()).toBe('No dates yet')
    expect(fmtRange(null, '2027-02-19')).toBe('No dates yet')
  })
})

describe('fmtTime', () => {
  it('formats afternoon and morning times in 12-hour form', () => {
    expect(fmtTime('2027-02-04T12:55')).toBe('12:55 PM')
    expect(fmtTime('2027-02-04T09:05:00')).toBe('9:05 AM')
    expect(fmtTime('2027-02-04T23:59')).toBe('11:59 PM')
  })
  it('treats midnight as 12 AM and noon as 12 PM', () => {
    expect(fmtTime('2027-02-04T00:00')).toBe('12:00 AM')
    expect(fmtTime('2027-02-04T12:00')).toBe('12:00 PM')
  })
  it('returns a dash when absent or date-only', () => {
    expect(fmtTime()).toBe('—')
    expect(fmtTime(null)).toBe('—')
    expect(fmtTime('')).toBe('—')
    expect(fmtTime('2027-02-04')).toBe('—')
  })
})

describe('fmtDateTime', () => {
  it('prefixes the weekday and month day', () => {
    expect(fmtDateTime('2027-02-04T12:55')).toBe('Thu Feb 4 · 12:55 PM')
    expect(fmtDateTime('2027-02-19T09:00')).toBe('Fri Feb 19 · 9:00 AM')
  })
  it('is empty when absent', () => {
    expect(fmtDateTime()).toBe('')
    expect(fmtDateTime(null)).toBe('')
  })
})

describe('money', () => {
  it('formats USD with a thousands separator and two decimals when needed', () => {
    expect(money(1234.5, 'USD')).toBe('$1,234.50')
    expect(money(100, 'USD')).toBe('$100')
    expect(money(7.5, 'usd')).toBe('$7.50')
  })
  it('formats JPY with the yen sign', () => {
    expect(money(48000, 'JPY')).toBe('¥48,000')
  })
  it('falls back to the code and a space for unknown currencies', () => {
    expect(money(50, 'CAD')).toBe('CAD 50')
  })
  it('defaults to USD when the currency is missing', () => {
    expect(money(50)).toBe('$50')
    expect(money(50, null)).toBe('$50')
  })
  it('rounds to cents', () => {
    expect(money(19.999, 'USD')).toBe('$20')
    expect(money(12.349, 'EUR')).toBe('€12.35')
  })
  it('is empty when the amount is missing but keeps zero', () => {
    expect(money(null, 'USD')).toBe('')
    expect(money(undefined, 'USD')).toBe('')
    expect(money(0, 'USD')).toBe('$0')
  })
})

describe('wallClock', () => {
  const instant = new Date('2027-02-05T01:30:00Z')
  it('reads the 24-hour wall-clock time in the given zone', () => {
    expect(wallClock(instant, 'Asia/Tokyo')).toBe('10:30')
    expect(wallClock(instant, 'UTC')).toBe('01:30')
    expect(wallClock(new Date('2027-02-05T15:05:00Z'), 'America/New_York')).toBe('10:05')
  })
  it('falls back to the device zone for a missing or invalid zone instead of throwing', () => {
    expect(wallClock(instant, null)).toMatch(/^\d{2}:\d{2}$/)
    expect(wallClock(instant, 'Not/AZone')).toMatch(/^\d{2}:\d{2}$/)
  })
})

describe('personFor', () => {
  it('maps casey to Casey and the other account to her', () => {
    expect(personFor(CASEY, USERS)).toBe('Casey')
    expect(personFor(HER, USERS)).toBe('Yasmim')
  })
  it('defaults to Casey for unknown or missing ids', () => {
    expect(personFor('nobody', USERS)).toBe('Casey')
    expect(personFor(null, USERS)).toBe('Casey')
    expect(personFor(undefined, USERS)).toBe('Casey')
  })
})

// ---------------------------------------------------------------- trip days

describe('tripDayOf', () => {
  const japan = plan()
  it('is null the day before the trip', () => {
    expect(tripDayOf(japan, local(2027, 2, 3))).toBeNull()
  })
  it('counts from 1 on the first day', () => {
    expect(tripDayOf(japan, local(2027, 2, 4))).toBe(1)
    expect(tripDayOf(japan, local(2027, 2, 5))).toBe(2)
  })
  it('is 16 on the last day', () => {
    expect(tripDayOf(japan, local(2027, 2, 19))).toBe(16)
  })
  it('is null the day after the trip', () => {
    expect(tripDayOf(japan, local(2027, 2, 20))).toBeNull()
  })
  it('is null for undated plans', () => {
    expect(tripDayOf(plan({ dateStart: null, dateEnd: null }), local(2027, 2, 5))).toBeNull()
    expect(tripDayOf(plan({ dateEnd: null }), local(2027, 2, 5))).toBeNull()
  })
})

describe('tripLength', () => {
  it('counts both ends inclusively', () => {
    expect(tripLength(plan())).toBe(16)
    expect(tripLength(plan({ dateStart: '2026-09-12', dateEnd: '2026-09-13' }))).toBe(2)
    expect(tripLength(plan({ dateStart: '2026-10-18', dateEnd: '2026-10-18' }))).toBe(1)
  })
  it('is 0 for undated plans', () => {
    expect(tripLength(plan({ dateStart: null, dateEnd: null }))).toBe(0)
    expect(tripLength(plan({ dateStart: null }))).toBe(0)
  })
})

// ---------------------------------------------------------------- plan card

describe('toPlanCard', () => {
  const counts = { ideas: 3, booked: 2, listDone: 1, listTotal: 4 }

  it('maps a booked upcoming trip with a countdown and hints from the counts', () => {
    const card = toPlanCard(plan(), counts, DESIGN_TODAY)
    expect(card).toMatchObject({
      id: 'japan',
      name: 'Japan 2027',
      type: 'Trip',
      dates: 'Feb 4 – 19, 2027',
      dest: ['Tokyo', 'Hakuba', 'Kyoto'],
      status: 'booked',
      group: 'next',
      countdown: 'in 151 days',
      hints: '3 ideas · 2 booked · checklist 1/4',
      color: 'var(--green)',
      large: true,
      start: '2027-02-04',
      end: '2027-02-19',
    })
    expect(card.cover).toMatch(/^data:image\/svg\+xml/)
  })

  it('has no hints without counts', () => {
    expect(toPlanCard(plan(), undefined, DESIGN_TODAY).hints).toBe('')
  })

  it('says tomorrow the day before and Day 1 on the first day', () => {
    expect(toPlanCard(plan(), counts, local(2027, 2, 3)).countdown).toBe('tomorrow')
    const first = toPlanCard(plan(), counts, local(2027, 2, 4))
    expect(first.status).toBe('underway')
    expect(first.countdown).toBe('Day 1 of 16')
  })

  it('becomes underway inside the dates', () => {
    const card = toPlanCard(plan(), counts, local(2027, 2, 5))
    expect(card).toMatchObject({
      status: 'underway',
      group: 'next',
      countdown: 'Day 2 of 16',
      color: 'var(--accent)',
      hints: '3 ideas · 2 booked · checklist 1/4',
    })
  })

  it('becomes done after the end date and asks for a memory', () => {
    const card = toPlanCard(plan(), counts, local(2027, 2, 21))
    expect(card).toMatchObject({
      status: 'done',
      group: 'past',
      countdown: 'Home 2 days',
      hints: 'Turn it into a memory',
      color: 'var(--fg3)',
      large: false,
    })
  })

  it('reports a published memory on a done plan', () => {
    const card = toPlanCard(plan({ linkedMemoryId: 'mem-1' }), counts, local(2027, 2, 21))
    expect(card.hints).toBe('Memory published')
  })

  it('keeps a dreaming plan dreaming even after its dates', () => {
    const dream = plan({ id: 'asheville', status: 'dreaming', dateStart: '2026-08-14', dateEnd: '2026-08-17' })
    const card = toPlanCard(dream, counts, DESIGN_TODAY)
    expect(card).toMatchObject({ status: 'dreaming', group: 'dream', color: 'var(--ochre)', countdown: '23 days ago', large: false })
  })

  it('maps an undated dream with no countdown', () => {
    const dream = plan({ id: 'iceland', status: 'dreaming', dateStart: null, dateEnd: null, destinations: [] })
    const card = toPlanCard(dream, undefined, DESIGN_TODAY)
    expect(card).toMatchObject({ status: 'dreaming', group: 'dream', dates: 'No dates yet', countdown: '', dest: [] })
    expect(card.start).toBeUndefined()
    expect(card.end).toBeUndefined()
  })

  it('maps events as Event and never large', () => {
    const event = plan({ id: 'anniv', type: 'event', status: 'planning', dateStart: '2026-10-18', dateEnd: '2026-10-18' })
    const card = toPlanCard(event, counts, DESIGN_TODAY)
    expect(card).toMatchObject({ type: 'Event', status: 'planning', group: 'next', large: false, dates: 'Oct 18, 2026', color: 'var(--accent)' })
  })
})

describe('bundleCounts', () => {
  it('counts ideas, bookings and checklist progress', () => {
    const bundle: ServerBundle = {
      plan: plan(),
      items: [
        item({ status: 'idea' }),
        item({ status: 'shortlisted' }),
        item({ status: 'decided' }),
        item({ status: 'booked' }),
        item({ status: 'done' }),
        item({ status: 'cancelled' }),
      ],
      checklists: [
        checklist({
          id: 'l1',
          items: [
            { id: 'a', text: 'Passports', done: true },
            { id: 'b', text: 'Yen', done: false },
          ],
        }),
        checklist({ id: 'l2', kind: 'packing', items: [{ id: 'c', text: 'Boots', done: true }] }),
      ],
      media: [],
    }
    expect(bundleCounts(bundle)).toEqual({ ideas: 2, booked: 2, listDone: 2, listTotal: 3 })
  })

  it('is all zeros for an empty bundle', () => {
    expect(bundleCounts({ plan: plan(), items: [], checklists: [], media: [] })).toEqual({ ideas: 0, booked: 0, listDone: 0, listTotal: 0 })
  })
})

// ---------------------------------------------------------------- itinerary

describe('toDays', () => {
  it('produces one entry per trip day with weekday and month-day headers', () => {
    const days = toDays(plan(), [], USERS)
    expect(days).toHaveLength(16)
    expect(days[0]).toMatchObject({ n: 1, dow: 'Thu', date: 'Feb 4', items: [] })
    expect(days[1]).toMatchObject({ n: 2, dow: 'Fri', date: 'Feb 5' })
    expect(days[15]).toMatchObject({ n: 16, dow: 'Fri', date: 'Feb 19' })
  })

  it('splits the trip evenly across the destinations when a day has no located items', () => {
    const cities = toDays(plan(), [], USERS).map((d) => d.city)
    expect(cities.slice(0, 6)).toEqual(Array(6).fill('Tokyo'))
    expect(cities.slice(6, 11)).toEqual(Array(5).fill('Hakuba'))
    expect(cities.slice(11, 16)).toEqual(Array(5).fill('Kyoto'))
  })

  it('sorts a day by start time, then sortKey, and names the city from the first located item', () => {
    const items = [
      item({ title: 'A', day: 1, start: '2027-02-04T16:00', sortKey: 1, location: { name: 'Park Hotel Tokyo' } }),
      item({ title: 'B', day: 1, start: '2027-02-04T12:55', sortKey: 2, location: { name: 'Haneda Airport' } }),
      item({ title: 'C', day: 1, sortKey: 9 }),
      item({ title: 'D', day: 1, sortKey: 3 }),
      item({ title: 'elsewhere', day: 2, start: '2027-02-05T08:00' }),
    ]
    const days = toDays(plan(), items, USERS)
    expect(days[0].items.map((i) => i.title)).toEqual(['D', 'C', 'B', 'A'])
    expect(days[0].city).toBe('Haneda Airport')
    expect(days[1].items.map((i) => i.title)).toEqual(['elsewhere'])
    expect(days[2].items).toEqual([])
  })

  it('excludes cancelled items and ideas', () => {
    const items = [
      item({ title: 'keep', day: 3, start: '2027-02-06T10:00' }),
      item({ title: 'cancelled', day: 3, status: 'cancelled', start: '2027-02-06T09:00' }),
      item({ title: 'idea', day: 3, kind: 'idea', start: '2027-02-06T08:00' }),
    ]
    const days = toDays(plan(), items, USERS)
    expect(days[2].items.map((i) => i.title)).toEqual(['keep'])
  })

  it('maps each item to the itinerary row shape', () => {
    const flight = item({
      id: 'f1',
      kind: 'flight',
      title: 'JFK → HND',
      status: 'booked',
      day: 1,
      start: '2027-02-04T12:55',
      location: { name: 'Haneda Airport' },
      cost: { amount: 1180, currency: 'USD', paid: true },
      confirmation: 'ABC123',
      attachmentIds: ['m1', 'm2'],
      createdBy: HER,
    })
    const note = item({ id: 'n1', kind: 'note', title: 'Remember the JR pass', day: 1, cost: { amount: 4800, currency: 'JPY', paid: false } })
    const [day1] = toDays(plan(), [flight, note], USERS)
    expect(day1.items[0]).toMatchObject({
      id: 'n1',
      kind: 'activity',
      time: '—',
      title: 'Remember the JR pass',
      place: '',
      cost: '¥4,800',
      booked: false,
      docs: 0,
      by: 'Casey',
    })
    expect(day1.items[0].conf).toBeUndefined()
    expect(day1.items[1]).toMatchObject({
      id: 'f1',
      kind: 'flight',
      time: '12:55 PM',
      title: 'JFK → HND',
      place: 'Haneda Airport',
      cost: '$1,180',
      booked: true,
      conf: 'ABC123',
      docs: 2,
      by: 'Yasmim',
    })
  })

  it('gives an undated plan a single blank day named after the first destination', () => {
    const days = toDays(plan({ dateStart: null, dateEnd: null }), [], USERS)
    expect(days).toHaveLength(1)
    expect(days[0]).toMatchObject({ n: 1, dow: '', date: '', city: 'Tokyo' })
    expect(toDays(plan({ dateStart: null, dateEnd: null, destinations: [] }), [], USERS)[0].city).toBe('')
  })
})

describe('toUnscheduled', () => {
  it('keeps unscheduled decided and shortlisted items that are not ideas or notes', () => {
    const items = [
      item({ id: 'u1', title: 'Kaiseki dinner', kind: 'food', status: 'decided', location: { name: 'Gion' }, createdBy: HER }),
      item({ id: 'u2', title: 'Onsen', status: 'shortlisted', tags: ['Hakuba'] }),
      item({ id: 'u3', title: 'Scheduled', status: 'decided', day: 3 }),
      item({ id: 'u4', title: 'Still an idea', status: 'idea' }),
      item({ id: 'u5', title: 'Booked', status: 'booked' }),
      item({ id: 'u6', title: 'Idea kind', kind: 'idea', status: 'decided' }),
      item({ id: 'u7', title: 'Note', kind: 'note', status: 'decided' }),
      item({ id: 'u8', title: 'No place', status: 'decided' }),
    ]
    const rows = toUnscheduled(items, USERS)
    expect(rows.map((r) => r.id)).toEqual(['u1', 'u2', 'u8'])
    expect(rows[0]).toMatchObject({ kind: 'food', title: 'Kaiseki dinner', place: 'Gion', by: 'Yasmim' })
    expect(rows[1]).toMatchObject({ kind: 'activity', title: 'Onsen', place: 'Hakuba', by: 'Casey' })
    expect(rows[2].place).toBe('')
  })
})

describe('toIdeas', () => {
  it('maps votes to Casey and her and takes the city from tags or location', () => {
    const items = [
      item({
        id: 'i1',
        title: 'teamLab Planets',
        status: 'idea',
        tags: ['Tokyo'],
        votes: { [CASEY]: 'like', [HER]: 'meh' },
        links: [{ url: 'https://example.com', image: 'https://img.example.com/1.jpg' }],
        createdBy: HER,
      }),
      item({ id: 'i2', title: 'Snow monkeys', status: 'shortlisted', location: { name: 'Jigokudani' }, votes: { [HER]: 'no' } }),
      item({ id: 'i3', title: 'Decided idea', kind: 'idea', status: 'decided' }),
      item({ id: 'i4', title: 'Decided activity', status: 'decided' }),
      item({ id: 'i5', title: 'Booked', status: 'booked' }),
      item({ id: 'i6', title: 'Cancelled', status: 'cancelled' }),
    ]
    const ideas = toIdeas(items, USERS)
    expect(ideas.map((i) => i.id)).toEqual(['i1', 'i2', 'i3'])
    expect(ideas[0]).toMatchObject({
      title: 'teamLab Planets',
      city: 'Tokyo',
      by: 'Yasmim',
      status: 'idea',
      img: 'https://img.example.com/1.jpg',
      c: 'like',
      h: 'meh',
    })
    expect(ideas[1]).toMatchObject({ city: 'Jigokudani', status: 'shortlisted', by: 'Casey', h: 'no' })
    expect(ideas[1].c).toBeUndefined()
    expect(ideas[1].img).toMatch(/^data:image\/svg\+xml/)
    expect(ideas[2]).toMatchObject({ status: 'decided', city: '' })
    expect(ideas[2].c).toBeUndefined()
    expect(ideas[2].h).toBeUndefined()
  })
})

// ---------------------------------------------------------------- bookings

describe('toBookings', () => {
  it('keeps only booked or done items that are not ideas or notes', () => {
    const items = [
      item({ id: 'b1', status: 'booked', kind: 'ticket' }),
      item({ id: 'b2', status: 'done', kind: 'food' }),
      item({ id: 'b3', status: 'decided', kind: 'ticket' }),
      item({ id: 'b4', status: 'booked', kind: 'idea' }),
      item({ id: 'b5', status: 'booked', kind: 'note' }),
      item({ id: 'b6', status: 'cancelled', kind: 'flight' }),
    ]
    expect(toBookings(items).map((b) => b.id)).toEqual(['b1', 'b2'])
  })

  it('maps a flight with airports, times, seats and an airline subtitle', () => {
    const [b] = toBookings([
      item({
        id: 'f1',
        kind: 'flight',
        status: 'booked',
        title: 'New York to Tokyo',
        start: '2027-02-03T13:05',
        end: '2027-02-04T17:20',
        confirmation: 'ABC123',
        attachmentIds: ['m1'],
        details: {
          type: 'flight',
          airline: 'JAL',
          flightNumber: 'JL 5',
          fromAirport: 'JFK',
          toAirport: 'HND',
          depart: '2027-02-03T13:05',
          arrive: '2027-02-04T17:20',
          seats: '32A, 32B',
        },
      }),
    ])
    expect(b).toMatchObject({
      id: 'f1',
      group: 'Flights',
      kind: 'flight',
      title: 'New York to Tokyo',
      a: 'JFK',
      b: 'HND',
      dep: 'Wed Feb 3 · 1:05 PM',
      arr: 'Thu Feb 4 · 5:20 PM',
      seats: '32A, 32B',
      conf: 'ABC123',
      docs: 1,
      sub: 'JAL · JL 5',
    })
  })

  it('falls back to the item start/end for a flight without detail times', () => {
    const [b] = toBookings([
      item({ kind: 'flight', status: 'booked', start: '2027-02-19T11:00', end: '2027-02-19T10:30', details: { type: 'flight', airline: 'JAL' } }),
    ])
    expect(b).toMatchObject({ dep: 'Fri Feb 19 · 11:00 AM', arr: 'Fri Feb 19 · 10:30 AM', a: '', b: '', seats: '', sub: 'JAL', conf: '—' })
  })

  it('maps a stay with check-in/out times, address, phone and room info', () => {
    const [b] = toBookings([
      item({
        id: 's1',
        kind: 'stay',
        status: 'booked',
        title: 'Park Hotel Tokyo',
        location: { name: 'Park Hotel Tokyo', address: '1-7-1 Higashi-Shimbashi, Minato' },
        details: { type: 'stay', checkIn: '2027-02-04', checkOut: '2027-02-09', phone: '+81 3 6252 1111', roomInfo: 'Twin, non-smoking' },
      }),
    ])
    expect(b).toMatchObject({
      group: 'Stays',
      kind: 'stay',
      addr: '1-7-1 Higashi-Shimbashi, Minato',
      dep: 'Check in Thu Feb 4 · 3:00 PM',
      arr: 'Check out Tue Feb 9 · 11:00 AM',
      seats: '+81 3 6252 1111',
      sub: 'Twin, non-smoking',
    })
  })

  it('uses the location name as a stay address when there is no address, and blanks missing dates', () => {
    const [b] = toBookings([item({ kind: 'stay', status: 'done', location: { name: 'Hakuba lodge' }, details: { type: 'stay' } })])
    expect(b).toMatchObject({ addr: 'Hakuba lodge', dep: '', arr: '', seats: '', sub: '' })
  })

  it('maps transport as train or bus with the pass info as seats', () => {
    const [train, bus, unknown] = toBookings([
      item({
        kind: 'transport',
        status: 'booked',
        title: 'Shinkansen to Kyoto',
        details: { type: 'transport', mode: 'train', from: 'Nagano', to: 'Kyoto', depart: '2027-02-14T09:12', arrive: '2027-02-14T12:40', passInfo: 'JR Pass, car 7' },
      }),
      item({ kind: 'transport', status: 'booked', start: '2027-02-09T08:00', details: { type: 'transport', mode: 'bus', from: 'Nagano', to: 'Hakuba' } }),
      item({ kind: 'transport', status: 'booked', details: { type: 'transport' } }),
    ])
    expect(train).toMatchObject({
      group: 'Transport',
      kind: 'train',
      a: 'Nagano',
      b: 'Kyoto',
      dep: 'Sun Feb 14 · 9:12 AM',
      arr: 'Sun Feb 14 · 12:40 PM',
      seats: 'JR Pass, car 7',
      sub: '',
    })
    expect(bus).toMatchObject({ kind: 'bus', a: 'Nagano', b: 'Hakuba', dep: 'Tue Feb 9 · 8:00 AM', arr: '', seats: '' })
    expect(unknown).toMatchObject({ kind: 'train', dep: '', arr: '' })
  })

  it('maps everything else as a ticket at the venue with the cost as the seats line', () => {
    const [ticket, food, activity] = toBookings([
      item({
        kind: 'ticket',
        status: 'booked',
        title: 'teamLab Planets',
        start: '2027-02-06T14:00',
        location: { name: 'Toyosu' },
        cost: { amount: 3800, currency: 'JPY', paid: true },
        confirmation: 'TL-99',
      }),
      item({ kind: 'food', status: 'booked', title: 'Sushi Saito', details: { type: 'food', cuisine: 'sushi' } }),
      item({ kind: 'activity', status: 'done', title: 'Ski lesson', details: { type: 'activity', durationMinutes: 120 } }),
    ])
    expect(ticket).toMatchObject({
      group: 'Tickets',
      kind: 'ticket',
      a: 'Toyosu',
      b: '',
      dep: 'Sat Feb 6 · 2:00 PM',
      arr: '',
      seats: '¥3,800',
      conf: 'TL-99',
    })
    expect(food).toMatchObject({ group: 'Tickets', kind: 'ticket', a: '', dep: '', seats: '', conf: '—' })
    expect(activity).toMatchObject({ group: 'Tickets', kind: 'ticket' })
  })
})

// ---------------------------------------------------------------- checklists

describe('toChecklists', () => {
  it('maps items with composite keys, initials, due dates and progress', () => {
    const lists = toChecklists(
      [
        checklist({
          id: 'l1',
          name: 'Before we go',
          items: [
            { id: 'a', text: 'Renew passports', done: true, assignee: CASEY, dueDate: '2027-01-15' },
            { id: 'b', text: 'Order yen', done: false, assignee: HER, dueDate: null },
            { id: 'c', text: 'Travel insurance', done: false, assignee: null },
          ],
        }),
        checklist({ id: 'l2', name: 'Packing', kind: 'packing', items: [] }),
        checklist({
          id: 'l3',
          name: 'Shopping',
          kind: 'shopping',
          items: [
            { id: 'x', text: 'Adapters', done: true },
            { id: 'y', text: 'Hand warmers', done: true },
            { id: 'z', text: 'Snacks', done: false },
          ],
        }),
      ],
      USERS,
    )
    expect(lists).toHaveLength(3)
    expect(lists[0]).toMatchObject({ id: 'l1', name: 'Before we go', done: 1, total: 3, doneNow: 1, pct: '33%' })
    expect(lists[0].items).toEqual([
      { key: 'l1:a', listId: 'l1', itemId: 'a', t: 'Renew passports', who: 'C', done: true, due: 'Jan 15' },
      { key: 'l1:b', listId: 'l1', itemId: 'b', t: 'Order yen', who: 'Y', done: false, due: '' },
      { key: 'l1:c', listId: 'l1', itemId: 'c', t: 'Travel insurance', who: 'C', done: false, due: '' },
    ])
    expect(lists[1]).toMatchObject({ id: 'l2', done: 0, total: 0, pct: '0%', items: [] })
    expect(lists[2]).toMatchObject({ done: 2, total: 3, pct: '67%' })
  })
})

// ---------------------------------------------------------------- budget, docs, pins, today

describe('toBudget', () => {
  it('formats home and local totals, the rate and labelled rows', () => {
    expect(toBudget(budget())).toEqual({
      planned: '$6,200',
      committed: '$4,100.50',
      paid: '$1,500',
      plannedJpy: '¥930,000',
      committedJpy: '¥615,000',
      paidJpy: '',
      rate: '150',
      rows: [
        ['Flights', '$2,400', 39],
        ['Stays', '$1,800', 29],
        ['Ideas', '$0', 0],
      ],
    })
  })

  it('leaves local strings and the rate empty without a local currency', () => {
    const b = toBudget(budget({ local: null, rate: null, plannedLocal: 930000, rows: [] }))
    expect(b).toMatchObject({ plannedJpy: '', committedJpy: '', paidJpy: '', rate: '', rows: [] })
  })

  it('labels every item kind', () => {
    const rows = toBudget(
      budget({
        rows: (['transport', 'food', 'ticket', 'activity', 'note'] as const).map((kind) => ({ kind, amount: 10, pct: 1 })),
      }),
    ).rows.map((r) => r[0])
    expect(rows).toEqual(['Transport', 'Food', 'Tickets', 'Activities', 'Notes'])
  })
})

describe('toDocs', () => {
  it('lists non-failed media with the owning item, page count and thumb', () => {
    const items = [item({ title: 'New York to Tokyo', attachmentIds: ['m1'] })]
    const docs = toDocs(
      [
        media({ id: 'm1', originalName: 'JAL-eticket.pdf', pageCount: 2, urls: { thumb: 'https://t/1', original: 'https://o/1' } }),
        media({ id: 'm2', originalName: 'broken.pdf', status: 'failed' }),
        media({ id: 'm3', originalName: 'rail-pass.pdf', urls: { original: 'https://o/3' } }),
        media({ id: 'm4', originalName: 'pending.pdf', status: 'processing', urls: {} }),
      ],
      items,
    )
    expect(docs.map((d) => d.id)).toEqual(['m1', 'm3', 'm4'])
    expect(docs[0]).toEqual({ id: 'm1', name: 'JAL-eticket.pdf', of: 'New York to Tokyo', pages: 2, thumb: 'https://t/1' })
    expect(docs[1]).toMatchObject({ name: 'rail-pass.pdf', of: '—', pages: 1, thumb: 'https://o/3' })
    expect(docs[2].thumb).toBeUndefined()
  })
})

describe('toPins', () => {
  const sensoji = item({ title: 'Senso-ji', day: 2, location: { name: 'Senso-ji, Tokyo', lat: 35.7148, lng: 139.7967 } })
  const shibuya = item({ title: 'Shibuya Crossing', day: 3, location: { name: 'Shibuya, Tokyo', lat: 35.6595, lng: 139.7004 } })
  const meiji = item({ title: 'Meiji Shrine', kind: 'ticket', location: { name: 'Meiji Jingu, Tokyo', lat: 35.6764, lng: 139.6993 } })
  const inari = item({ title: 'Fushimi Inari', day: 13, location: { name: 'Fushimi Inari, Kyoto', lat: 34.9671, lng: 135.7727 } })
  const unlocated = item({ title: 'No coordinates', location: { name: 'Somewhere in Tokyo' } })

  it('groups located items by destination and keeps empty destinations', () => {
    const pins = toPins(plan(), [sensoji, shibuya, meiji, inari, unlocated])
    expect(Object.keys(pins)).toEqual(['Tokyo', 'Hakuba', 'Kyoto'])
    expect(pins.Tokyo.map((p) => p.title)).toEqual(['Senso-ji', 'Shibuya Crossing', 'Meiji Shrine'])
    expect(pins.Hakuba).toEqual([])
    expect(pins.Kyoto.map((p) => p.title)).toEqual(['Fushimi Inari'])
  })

  it('spreads several pins across 10..90 by longitude and latitude (y inverted)', () => {
    const { Tokyo } = toPins(plan(), [sensoji, shibuya, meiji])
    const [s, sh, m] = Tokyo
    expect(s.x).toBeCloseTo(90) // easternmost
    expect(s.y).toBeCloseTo(10) // northernmost
    expect(m.x).toBeCloseTo(10) // westernmost
    expect(sh.y).toBeCloseTo(90) // southernmost
    expect(sh.x).toBeGreaterThan(10)
    expect(sh.x).toBeLessThan(s.x)
    expect(m.y).toBeGreaterThan(10)
    expect(m.y).toBeLessThan(90)
    expect(s).toMatchObject({ kind: 'activity', title: 'Senso-ji', place: 'Senso-ji, Tokyo', when: 'Day 2' })
    expect(m).toMatchObject({ kind: 'ticket', when: '' })
  })

  it('centres a lone pin at 50,50', () => {
    const { Kyoto } = toPins(plan(), [inari])
    expect(Kyoto).toEqual([{ id: 'item-4', kind: 'activity', title: 'Fushimi Inari', place: 'Fushimi Inari, Kyoto', when: 'Day 13', x: 50, y: 50 }])
  })

  it('files pins that match no destination under the first one, or "All" without destinations', () => {
    const osaka = item({ title: 'Osaka Castle', location: { name: 'Osaka', lat: 34.6873, lng: 135.5262 } })
    expect(toPins(plan(), [osaka]).Tokyo.map((p) => p.title)).toEqual(['Osaka Castle'])
    const none = toPins(plan({ destinations: [] }), [osaka, inari])
    expect(Object.keys(none)).toEqual(['All'])
    expect(none.All).toHaveLength(2)
  })
})

describe('toTodayItems', () => {
  // Day 2 of the trip at 10:30 on the Tokyo wall clock (the plan fixture's zone, UTC+9).
  const today = local(2027, 2, 5)
  const now = new Date('2027-02-05T01:30:00Z')
  const items = [
    item({ title: 'Dinner', kind: 'food', day: 2, start: '2027-02-05T19:00', location: { name: 'Sushi Saito' } }),
    item({ title: 'teamLab Planets', kind: 'ticket', day: 2, start: '2027-02-05T14:00', confirmation: 'TL-99', location: { name: 'Toyosu' } }),
    item({ title: 'Tsukiji market', day: 2, start: '2027-02-05T09:30' }),
    item({ title: 'Breakfast', kind: 'food', day: 2, start: '2027-02-05T08:00' }),
    item({ title: 'Free wander', day: 2 }),
    item({ title: 'Cancelled', day: 2, status: 'cancelled', start: '2027-02-05T11:00' }),
    item({ title: 'Just an idea', kind: 'idea', day: 2, start: '2027-02-05T12:00' }),
    item({ title: 'Tomorrow', day: 3, start: '2027-02-06T09:00' }),
  ]

  it('lists the current day sorted by time, marking past items and the single next one', () => {
    const rows = toTodayItems(plan(), items, today, now)
    expect(rows.map((r) => r.title)).toEqual(['Free wander', 'Breakfast', 'Tsukiji market', 'teamLab Planets', 'Dinner'])
    expect(rows.map((r) => [r.past, r.next])).toEqual([
      [false, false],
      [true, false],
      [true, false],
      [false, true],
      [false, false],
    ])
    expect(rows[0]).toMatchObject({ time: '—', kind: 'activity', place: '' })
    expect(rows[0].start).toBeUndefined()
    expect(rows[3]).toMatchObject({ id: items[1].id, start: '2027-02-05T14:00', time: '2:00 PM', kind: 'ticket', place: 'Toyosu', conf: 'TL-99' })
    expect(rows[4]).toMatchObject({ time: '7:00 PM', kind: 'food', place: 'Sushi Saito' })
    expect(rows[4].conf).toBeUndefined()
  })

  it('treats an item starting exactly now as next, not past', () => {
    const rows = toTodayItems(plan(), [item({ title: 'Now', day: 2, start: '2027-02-05T10:30' })], today, now)
    expect(rows[0]).toMatchObject({ past: false, next: true })
  })

  it('judges past/next on the plan zone, not UTC', () => {
    // 01:30Z is 10:30 in Tokyo but 01:30 in a UTC plan: nothing has started yet there.
    const utcPlan = plan({ timezone: 'UTC' })
    const rows = toTodayItems(utcPlan, items, today, now)
    expect(rows.map((r) => [r.past, r.next])).toEqual([
      [false, false],
      [false, true],
      [false, false],
      [false, false],
      [false, false],
    ])
  })

  it('marks everything past with no next once the day is over', () => {
    const rows = toTodayItems(plan(), items, today, new Date('2027-02-05T14:00:00Z')) // 23:00 in Tokyo
    expect(rows.slice(1).every((r) => r.past && !r.next)).toBe(true)
  })

  it('is empty outside the trip', () => {
    expect(toTodayItems(plan(), items, DESIGN_TODAY, now)).toEqual([])
    expect(toTodayItems(plan({ dateStart: null, dateEnd: null }), items, today, now)).toEqual([])
  })
})
