// Maps server plan documents to the display shapes the screens render (types.ts).
// The screens were built against the design's view models; this module is the
// one place that knows how real data becomes those views.

import type {
  ServerBudget,
  ServerBundle,
  ServerChecklist,
  ServerItem,
  ServerMedia,
  ServerPlan,
  ServerUser,
} from './api/plansApi'
import { countdown, daysBetween, parseISO } from './dates'
import { mockImage } from './mockImage'
import type {
  Booking,
  BookingGroup,
  Budget,
  Checklist,
  Idea,
  IdeaStatus,
  ItemKind,
  ItineraryDay,
  ItineraryItem,
  MapPin,
  Person,
  Plan,
  PlanDoc,
  PlanGroup,
  PlanStatus,
  TodayItem,
  UnscheduledItem,
  Vote,
} from './types'

// ---------------------------------------------------------------- formatting

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DOWS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** 'Feb 4 – 19, 2027' | 'Feb 4 – Mar 2, 2027' | 'No dates yet' */
export function fmtRange(startIso?: string | null, endIso?: string | null): string {
  if (!startIso) return 'No dates yet'
  const s = parseISO(startIso)
  if (!endIso || endIso === startIso) return `${MONTHS[s.getMonth()]} ${s.getDate()}, ${s.getFullYear()}`
  const e = parseISO(endIso)
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()
  const left = `${MONTHS[s.getMonth()]} ${s.getDate()}`
  const right = sameMonth ? `${e.getDate()}` : `${MONTHS[e.getMonth()]} ${e.getDate()}`
  return `${left} – ${right}, ${e.getFullYear()}`
}

/** '12:55 PM' from an ISO local date-time; '—' when absent. */
export function fmtTime(iso?: string | null): string {
  if (!iso) return '—'
  const t = iso.slice(11, 16)
  if (!t) return '—'
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

/** 'Thu Feb 4 · 12:55 PM' */
export function fmtDateTime(iso?: string | null): string {
  if (!iso) return ''
  const d = parseISO(iso.slice(0, 10))
  return `${DOWS[d.getDay()]} ${MONTHS[d.getMonth()]} ${d.getDate()} · ${fmtTime(iso)}`
}

const SYMBOLS: Record<string, string> = { USD: '$', JPY: '¥', EUR: '€', GBP: '£' }

export function money(amount?: number | null, currency?: string | null): string {
  if (amount == null) return ''
  const symbol = SYMBOLS[(currency ?? 'USD').toUpperCase()] ?? (currency ?? '') + ' '
  const rounded = Math.round(amount * 100) / 100
  const text = Number.isInteger(rounded) ? rounded.toLocaleString('en-US') : rounded.toLocaleString('en-US', { minimumFractionDigits: 2 })
  return symbol + text
}

// ---------------------------------------------------------------- people

/** Two-person app: casey is Casey, the other account is her. */
export function personFor(userId: string | null | undefined, users: ServerUser[]): Person {
  const user = users.find((u) => u.id === userId)
  return user && user.username !== 'casey' ? 'Yasmim' : 'Casey'
}

function votesFor(item: ServerItem, users: ServerUser[]): { c: Vote | undefined; h: Vote | undefined } {
  let c: Vote | undefined
  let h: Vote | undefined
  for (const [userId, vote] of Object.entries(item.votes ?? {})) {
    if (personFor(userId, users) === 'Casey') c = vote
    else h = vote
  }
  return { c, h }
}

// ---------------------------------------------------------------- plan card

const STATUS_COLOR: Record<string, string> = {
  planning: 'var(--accent)',
  underway: 'var(--accent)',
  booked: 'var(--green)',
  dreaming: 'var(--ochre)',
  done: 'var(--fg3)',
}

export interface PlanCounts {
  ideas: number
  booked: number
  listDone: number
  listTotal: number
}

export function bundleCounts(bundle: ServerBundle): PlanCounts {
  const ideas = bundle.items.filter((i) => i.status === 'idea' || i.status === 'shortlisted').length
  const booked = bundle.items.filter((i) => i.status === 'booked' || i.status === 'done').length
  const all = bundle.checklists.flatMap((l) => l.items)
  return { ideas, booked, listDone: all.filter((i) => i.done).length, listTotal: all.length }
}

/** Trip day number for `today`, 1-based, or null when outside the dates. */
export function tripDayOf(plan: ServerPlan, today: Date): number | null {
  if (!plan.dateStart || !plan.dateEnd) return null
  const start = parseISO(plan.dateStart)
  const end = parseISO(plan.dateEnd)
  if (today < start || today > end) return null
  return daysBetween(start, today) + 1
}

export function tripLength(plan: ServerPlan): number {
  if (!plan.dateStart || !plan.dateEnd) return 0
  return daysBetween(parseISO(plan.dateStart), parseISO(plan.dateEnd)) + 1
}

export function toPlanCard(plan: ServerPlan, counts: PlanCounts | undefined, today: Date): Plan {
  const day = tripDayOf(plan, today)
  const ended = plan.dateEnd ? parseISO(plan.dateEnd) < today : false
  const status: PlanStatus = day != null ? 'underway' : ended && plan.status !== 'dreaming' ? 'done' : plan.status
  const group: PlanGroup = status === 'dreaming' ? 'dream' : status === 'done' ? 'past' : 'next'
  const countdownText =
    day != null
      ? `Day ${day} of ${tripLength(plan)}`
      : status === 'done' && plan.dateEnd
        ? `Home ${daysBetween(parseISO(plan.dateEnd), today)} days`
        : plan.dateStart
          ? countdown(plan.dateStart, today)
          : ''
  const hints =
    status === 'done'
      ? plan.linkedMemoryId
        ? 'Memory published'
        : 'Turn it into a memory'
      : counts
        ? `${counts.ideas} ideas · ${counts.booked} booked · checklist ${counts.listDone}/${counts.listTotal}`
        : ''
  return {
    id: plan.id,
    name: plan.name,
    type: plan.type === 'event' ? 'Event' : 'Trip',
    dates: fmtRange(plan.dateStart, plan.dateEnd),
    dest: plan.destinations.map((d) => d.name),
    status,
    countdown: countdownText,
    hints,
    color: STATUS_COLOR[status] ?? 'var(--accent)',
    cover: mockImage(plan.name, 1200, 800),
    group,
    large: group === 'next' && plan.type === 'trip',
    start: plan.dateStart ?? undefined,
    end: plan.dateEnd ?? undefined,
  }
}

// ---------------------------------------------------------------- items

const VIEW_KIND: Record<string, ItemKind> = {
  flight: 'flight',
  stay: 'stay',
  transport: 'transport',
  activity: 'activity',
  food: 'food',
  ticket: 'ticket',
  idea: 'activity',
  note: 'activity',
}

export function toItineraryItem(item: ServerItem, users: ServerUser[]): ItineraryItem & { id: string } {
  return {
    id: item.id,
    kind: VIEW_KIND[item.kind] ?? 'activity',
    time: fmtTime(item.start),
    title: item.title,
    place: item.location?.name ?? '',
    cost: item.cost ? money(item.cost.amount, item.cost.currency) : '',
    booked: item.status === 'booked' || item.status === 'done',
    conf: item.confirmation ?? undefined,
    docs: item.attachmentIds.length,
    by: personFor(item.createdBy, users),
  }
}

/** Days 1..N with their time-sorted items; city from the day's items or the leg of the trip. */
export function toDays(plan: ServerPlan, items: ServerItem[], users: ServerUser[]): ItineraryDay[] {
  const length = Math.max(tripLength(plan), 1)
  const start = plan.dateStart ? parseISO(plan.dateStart) : null
  const days: ItineraryDay[] = []
  for (let n = 1; n <= length; n++) {
    const date = start ? new Date(start.getFullYear(), start.getMonth(), start.getDate() + n - 1) : null
    const dayItems = items
      .filter((i) => i.day === n && i.status !== 'cancelled' && i.kind !== 'idea')
      .sort((a, b) => (a.start ?? '').localeCompare(b.start ?? '') || a.sortKey - b.sortKey)
    const city = dayItems.map((i) => i.location?.name).find(Boolean) ?? legCity(plan, n, length)
    days.push({
      n,
      dow: date ? DOWS[date.getDay()] : '',
      date: date ? `${MONTHS[date.getMonth()]} ${date.getDate()}` : '',
      city: city ?? '',
      items: dayItems.map((i) => toItineraryItem(i, users)),
    })
  }
  return days
}

/** Splits the trip evenly across the destinations for the day header fallback. */
function legCity(plan: ServerPlan, n: number, length: number): string | undefined {
  const dests = plan.destinations
  if (!dests.length) return undefined
  const per = length / dests.length
  return dests[Math.min(dests.length - 1, Math.floor((n - 1) / per))]?.name
}

export function toUnscheduled(items: ServerItem[], users: ServerUser[]): (UnscheduledItem & { id: string })[] {
  return items
    .filter((i) => i.day == null && (i.status === 'decided' || i.status === 'shortlisted') && i.kind !== 'idea' && i.kind !== 'note')
    .map((i) => ({
      id: i.id,
      kind: VIEW_KIND[i.kind] ?? 'activity',
      title: i.title,
      place: i.location?.name ?? i.tags[0] ?? '',
      by: personFor(i.createdBy, users),
    }))
}

export function toIdeas(items: ServerItem[], users: ServerUser[]): (Idea & { id: string })[] {
  return items
    .filter((i) => i.status === 'idea' || i.status === 'shortlisted' || (i.kind === 'idea' && i.status === 'decided'))
    .map((i) => {
      const { c, h } = votesFor(i, users)
      return {
        id: i.id,
        title: i.title,
        city: (i.tags[0] ?? i.location?.name ?? '') as Idea['city'],
        by: personFor(i.createdBy, users),
        status: (i.status === 'decided' ? 'decided' : i.status) as IdeaStatus,
        img: i.links[0]?.image ?? mockImage('idea-' + i.title, 400, 300),
        c: c as Vote,
        h: h as Vote,
      }
    })
}

// ---------------------------------------------------------------- bookings

const BOOKING_GROUP: Record<string, BookingGroup> = {
  flight: 'Flights',
  stay: 'Stays',
  transport: 'Transport',
  ticket: 'Tickets',
  food: 'Tickets',
  activity: 'Tickets',
}

export function toBookings(items: ServerItem[]): (Booking & { id: string })[] {
  return items
    .filter((i) => (i.status === 'booked' || i.status === 'done') && i.kind !== 'idea' && i.kind !== 'note')
    .map((i) => {
      const d = i.details
      const base = {
        id: i.id,
        group: BOOKING_GROUP[i.kind] ?? ('Tickets' as BookingGroup),
        title: i.title,
        conf: i.confirmation ?? '—',
        docs: i.attachmentIds.length,
        sub: '',
      }
      if (d?.type === 'flight') {
        return {
          ...base,
          kind: 'flight' as const,
          a: d.fromAirport ?? '',
          b: d.toAirport ?? '',
          dep: fmtDateTime(d.depart ?? i.start),
          arr: fmtDateTime(d.arrive ?? i.end),
          seats: d.seats ?? '',
          sub: [d.airline, d.flightNumber].filter(Boolean).join(' · '),
        }
      }
      if (d?.type === 'stay') {
        return {
          ...base,
          kind: 'stay' as const,
          addr: i.location?.address ?? i.location?.name ?? '',
          dep: d.checkIn ? 'Check in ' + fmtDateTime(d.checkIn + 'T15:00') : '',
          arr: d.checkOut ? 'Check out ' + fmtDateTime(d.checkOut + 'T11:00') : '',
          seats: d.phone ?? '',
          sub: d.roomInfo ?? '',
        }
      }
      if (d?.type === 'transport') {
        return {
          ...base,
          kind: (d.mode === 'bus' ? 'bus' : 'train') as Booking['kind'],
          a: d.from ?? '',
          b: d.to ?? '',
          dep: fmtDateTime(d.depart ?? i.start),
          arr: fmtDateTime(d.arrive ?? i.end),
          seats: d.passInfo ?? '',
        }
      }
      return {
        ...base,
        kind: 'ticket' as const,
        a: i.location?.name ?? '',
        b: '',
        dep: fmtDateTime(i.start),
        arr: '',
        seats: i.cost ? money(i.cost.amount, i.cost.currency) : '',
      }
    })
}

// ---------------------------------------------------------------- checklists

export interface ChecklistItemView {
  key: string
  listId: string
  itemId: string
  t: string
  who: 'C' | 'Y'
  done: boolean
  due: string
}

export interface ChecklistView extends Omit<Checklist, 'items'> {
  id: string
  items: ChecklistItemView[]
  doneNow: number
  pct: string
}

export function toChecklists(lists: ServerChecklist[], users: ServerUser[]): ChecklistView[] {
  return lists.map((l) => {
    const items = l.items.map((it) => ({
      key: `${l.id}:${it.id}`,
      listId: l.id,
      itemId: it.id,
      t: it.text,
      who: (personFor(it.assignee, users) === 'Casey' ? 'C' : 'Y') as 'C' | 'Y',
      done: it.done,
      due: it.dueDate ? fmtRange(it.dueDate).replace(/, \d{4}$/, '') : '',
    }))
    const doneNow = items.filter((i) => i.done).length
    const total = items.length
    return {
      id: l.id,
      name: l.name,
      done: doneNow,
      total,
      items,
      doneNow,
      pct: total ? Math.round((doneNow / total) * 100) + '%' : '0%',
    }
  })
}

// ---------------------------------------------------------------- budget, docs, pins, today

export function toBudget(b: ServerBudget): Budget {
  const local = (v?: number | null) => (v == null || !b.local ? '' : money(v, b.local))
  const LABELS: Record<string, string> = {
    flight: 'Flights',
    stay: 'Stays',
    transport: 'Transport',
    food: 'Food',
    ticket: 'Tickets',
    activity: 'Activities',
    idea: 'Ideas',
    note: 'Notes',
  }
  return {
    planned: money(b.planned, b.home),
    committed: money(b.committed, b.home),
    paid: money(b.paid, b.home),
    plannedJpy: local(b.plannedLocal),
    committedJpy: local(b.committedLocal),
    paidJpy: local(b.paidLocal),
    rate: b.rate != null ? String(b.rate) : '',
    rows: b.rows.map((r) => [LABELS[r.kind] ?? r.kind, money(r.amount, b.home), r.pct]),
  }
}

export function toDocs(media: ServerMedia[], items: ServerItem[]): (PlanDoc & { id: string; thumb?: string })[] {
  return media
    .filter((m) => m.status !== 'failed')
    .map((m) => ({
      id: m.id,
      name: m.originalName,
      of: items.find((i) => i.attachmentIds.includes(m.id))?.title ?? '—',
      pages: m.pageCount ?? 1,
      thumb: m.urls.thumb ?? m.urls.original ?? undefined,
    }))
}

export function toPins(plan: ServerPlan, items: ServerItem[]): Record<string, MapPin[]> {
  const cities = plan.destinations.map((d) => d.name)
  const result: Record<string, MapPin[]> = Object.fromEntries(cities.map((c) => [c, []]))
  const located = items.filter((i) => i.location?.lat != null && i.location?.lng != null)
  const cityOf = (place: string) => cities.find((c) => place.toLowerCase().includes(c.toLowerCase())) ?? cities[0] ?? 'All'
  const grouped = new Map<string, ServerItem[]>()
  for (const item of located) {
    const city = cityOf(item.location?.name ?? '')
    grouped.set(city, [...(grouped.get(city) ?? []), item])
  }
  for (const [city, cityItems] of grouped) {
    const lats = cityItems.map((i) => i.location!.lat!)
    const lngs = cityItems.map((i) => i.location!.lng!)
    const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)]
    const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)]
    const span = (v: number, min: number, max: number) => (max === min ? 50 : 10 + ((v - min) / (max - min)) * 80)
    result[city] = cityItems.map((i) => ({
      kind: VIEW_KIND[i.kind] ?? 'activity',
      title: i.title,
      place: i.location?.name ?? '',
      when: i.day ? `Day ${i.day}` : '',
      x: span(i.location!.lng!, minLng, maxLng),
      y: 100 - span(i.location!.lat!, minLat, maxLat),
    }))
  }
  return result
}

export function toTodayItems(plan: ServerPlan, items: ServerItem[], today: Date, now: Date): TodayItem[] {
  const day = tripDayOf(plan, today)
  if (day == null) return []
  const nowKey = now.toISOString().slice(11, 16)
  const dayItems = items
    .filter((i) => i.day === day && i.status !== 'cancelled' && i.kind !== 'idea')
    .sort((a, b) => (a.start ?? '').localeCompare(b.start ?? ''))
  let nextMarked = false
  return dayItems.map((i) => {
    const time = i.start?.slice(11, 16) ?? ''
    const past = !!time && time < nowKey
    const next = !past && !nextMarked && !!time ? (nextMarked = true) : false
    return {
      time: fmtTime(i.start),
      kind: VIEW_KIND[i.kind] ?? 'activity',
      title: i.title,
      place: i.location?.name ?? '',
      conf: i.confirmation ?? undefined,
      past,
      next,
    }
  })
}
