// Calendar state shared by the mobile and desktop screens: which month is on
// screen, the day cells, the events added from the quick-add field this
// session, the agenda rows and the open event sheet.
//
// Sources: mobile-c-chat-calendar-notes-us.md section 4 (grid, agenda, legend),
// mobile-d-sheets.md section 10 (EVENT SHEET), desktop.md section 6 (month +
// week), mobile-b-plans.md PLAN_BARS (day 12/13 open the Lake plan).

import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useEvents } from '../../data/hooks'
import { PLAN_BAR_PLAN_ID, agendaSortKey, fmtHour } from '../../data/mock'
import { countdown, toISO } from '../../data/dates'
import type { AgendaRow, CalendarBlock, CalendarEvent } from '../../data/types'
import { paths } from '../../paths'
import { dotFor } from '../../ui'
import { usePlanCalendar } from './planCalendar'
import type { CalendarBar, CalendarItem } from './planCalendar'

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const
const MONTH_ABBR = MONTH_NAMES.map((m) => m.slice(0, 3))
/** Sunday-first, indexed by Date#getDay(). */
const DOW_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export interface MonthInfo {
  y: number
  m: number // 1-12
  /** 'September' */
  name: string
  /** '2026' */
  year: string
  days: number
  /** leading blank cells so the 1st lands on its weekday (Monday-first grid) */
  leading: number
}

export function monthInfo(y: number, m: number): MonthInfo {
  const first = new Date(y, m - 1, 1)
  return {
    y,
    m,
    name: MONTH_NAMES[m - 1],
    year: String(y),
    days: new Date(y, m, 0).getDate(),
    leading: (first.getDay() + 6) % 7,
  }
}

export interface DayCell {
  key: string
  /** '' on the leading blanks */
  n: string
  /** day of month, or null on a blank cell */
  day: number | null
  blank: boolean
  /** an October day shown at the tail of the desktop grid */
  trailing: boolean
  event?: CalendarEvent
  bar?: CalendarBar
  today: boolean
  selected: boolean
  /** desktop month-cell chips */
  blocks: CalendarBlock[]
  /** real booked plan items on this day */
  items: CalendarItem[]
}

export interface CalendarAgendaRow extends AgendaRow {
  key: string
  /** the event this row opens, when it has one */
  event?: CalendarEvent
  /** plan badge text ('plan' on the mock rows, the plan name on real item rows) */
  plan?: string
  /** the real booked item this row opens, when it has one */
  item?: CalendarItem
}

/** '7:00 PM' from 19, '2:30 PM' from 14.5 — re-exported so the screens import one module. */
export { fmtHour }

// ------------------------------------------------------------------ quick add

const TIME_RE = /\b(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m\.?\b/i
const MONTH_DAY_RE = new RegExp(`\\b(${MONTH_ABBR.join('|')})[a-z]*\\.?\\s*(\\d{1,2})\\b`, 'i')
const DOW_RE = /\b(mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)[a-z]*\b/i
const DOW_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

function cleanTitle(raw: string, cuts: string[]): string {
  let out = raw
  for (const c of cuts) if (c) out = out.replace(c, ' ')
  out = out
    .replace(/\s+/g, ' ')
    .replace(/[\s,]+$/g, '')
    .replace(/^[\s,]+/g, '')
    .replace(/\s+(at|on|the)$/i, '')
    .trim()
  return out || raw.trim()
}

export interface QuickAddResult {
  event: CalendarEvent
  /** decimal hour (19, 14.5) when the text carried a time; undefined = all day */
  start?: number
}

/**
 * Turns "Dinner at Nonna's Fri 7pm" into a September event. Understands a
 * month + day ("Sep 12"), a weekday name (the next one on or after today) and
 * a time; anything it cannot read falls back to the selected day.
 */
export function parseQuickAdd(text: string, info: MonthInfo, fallbackDay: number): QuickAddResult | null {
  const raw = text.trim()
  if (!raw) return null

  const cuts: string[] = []
  let day = Math.min(Math.max(fallbackDay, 1), info.days)

  const md = raw.match(MONTH_DAY_RE)
  const dow = raw.match(DOW_RE)
  if (md) {
    const n = Number(md[2])
    if (n >= 1 && n <= info.days) day = n
    cuts.push(md[0])
  } else if (dow) {
    const want = DOW_KEYS.indexOf(dow[1].slice(0, 3).toLowerCase())
    for (let i = 0; i < info.days; i++) {
      const n = ((fallbackDay - 1 + i) % info.days) + 1
      if (new Date(info.y, info.m - 1, n).getDay() === want) {
        day = n
        break
      }
    }
    cuts.push(dow[0])
  }

  let time = ''
  let start: number | undefined
  const tm = raw.match(TIME_RE)
  if (tm) {
    const h = Number(tm[1])
    if (h >= 1 && h <= 12) {
      time = `${h}:${tm[2] ?? '00'} ${tm[3].toUpperCase()}M`
      // the week board draws on half-hour rows, so snap the minutes
      const mins = Number(tm[2] ?? '0')
      start = (h % 12) + (tm[3].toLowerCase() === 'p' ? 12 : 0) + (mins >= 30 ? 0.5 : 0)
      cuts.push(tm[0])
    }
  }

  const dowLabel = DOW_ABBR[new Date(info.y, info.m - 1, day).getDay()]
  const when = `${dowLabel} ${MONTH_ABBR[info.m - 1]} ${day}${time ? ` · ${time}` : ''}`
  const event: CalendarEvent = { day, title: cleanTitle(raw, cuts), kind: 'Event', owner: 'c', when, rule: 'Does not repeat', loc: '' }
  return { event, start }
}

// ------------------------------------------------------------------ the hook

/** An event typed into the quick-add field, tagged with the month it was added to. */
interface AddedEvent {
  y: number
  m: number
  event: CalendarEvent
  /** decimal hour, when the text carried a time */
  start?: number
}

export type CalendarView = 'month' | 'agenda'
export type DesktopView = 'month' | 'week'

export function useCalendar() {
  const { events, blocks, planBars, agenda, month, week, legend, today } = useEvents()
  const navigate = useNavigate()

  const [view, setView] = useState<CalendarView>('month')
  const [desktopView, setDesktopView] = useState<DesktopView>('month')
  const [cursor, setCursor] = useState<{ y: number; m: number }>({ y: month.year, m: month.month })
  const [addedAll, setAdded] = useState<AddedEvent[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [openEvent, setOpenEvent] = useState<CalendarEvent | null>(null)
  const [openItem, setOpenItem] = useState<CalendarItem | null>(null)

  const info = useMemo(() => monthInfo(cursor.y, cursor.m), [cursor])
  const isDataMonth = cursor.y === month.year && cursor.m === month.month
  /** real plan spans + booked items for the month on screen */
  const planCal = usePlanCalendar(info)
  /** quick-added events belonging to the month on screen */
  const addedHere = useMemo(() => addedAll.filter((a) => a.y === cursor.y && a.m === cursor.m), [addedAll, cursor])

  /** every event on screen this month, keyed by day (a mock event keeps the day it owns) */
  const monthEvents = useMemo<Record<number, CalendarEvent>>(() => {
    const base: Record<number, CalendarEvent> = isDataMonth ? { ...events } : {}
    for (const a of addedHere) if (!base[a.event.day]) base[a.event.day] = a.event
    return base
  }, [events, addedHere, isDataMonth])

  /**
   * Real bars everywhere; in the mock month the mock lake bar stays only while
   * no real plan covers those dates (a real bar on a day always wins).
   */
  const monthBars = useMemo<Record<number, CalendarBar>>(() => {
    const real = planCal.bars
    const keepMock = isDataMonth && !real[12] && !real[13]
    return keepMock ? { ...planBars, ...real } : real
  }, [planBars, isDataMonth, planCal.bars])

  /** quick-added events as week/month chips: a parsed time places them, otherwise all-day */
  const addedBlocks = useMemo<CalendarBlock[]>(
    () =>
      addedHere.map(({ event: e, start }) =>
        start === undefined
          ? { day: e.day, title: e.title, owner: e.owner, allDay: true }
          : { day: e.day, title: e.title, owner: e.owner, start, len: 1 },
      ),
    [addedHere],
  )

  const monthBlocks = useMemo<Record<number, CalendarBlock[]>>(() => {
    const byDay: Record<number, CalendarBlock[]> = {}
    if (isDataMonth) {
      for (const b of blocks) (byDay[b.day] ??= []).push(b)
    }
    for (const b of addedBlocks) (byDay[b.day] ??= []).push(b)
    return byDay
  }, [blocks, addedBlocks, isDataMonth])

  const todayDay = today.getFullYear() === cursor.y && today.getMonth() + 1 === cursor.m ? today.getDate() : null

  const cells = useCallback(
    (withTrailing: boolean): DayCell[] => {
      const out: DayCell[] = []
      for (let i = 0; i < info.leading; i++) {
        out.push({ key: `b${i}`, n: '', day: null, blank: true, trailing: false, today: false, selected: false, blocks: [], items: [] })
      }
      for (let n = 1; n <= info.days; n++) {
        out.push({
          key: `d${n}`,
          n: String(n),
          day: n,
          blank: false,
          trailing: false,
          event: monthEvents[n],
          bar: monthBars[n],
          today: n === todayDay,
          selected: n === selectedDay,
          blocks: monthBlocks[n] ?? [],
          items: planCal.itemsByDay[n] ?? [],
        })
      }
      if (withTrailing) {
        const total = Math.ceil((info.leading + info.days) / 7) * 7
        for (let i = 1; i <= total - info.leading - info.days; i++) {
          out.push({ key: `t${i}`, n: String(i), day: null, blank: false, trailing: true, today: false, selected: false, blocks: [], items: [] })
        }
      }
      return out
    },
    [info, monthEvents, monthBars, monthBlocks, planCal.itemsByDay, todayDay, selectedDay],
  )

  /** Desktop week view: the Monday week that starts the displayed month (Sep 7 - 13). */
  const weekDays = useMemo(() => {
    const first = new Date(info.y, info.m - 1, 1)
    const offset = (8 - first.getDay()) % 7
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(info.y, info.m - 1, 1 + offset + i)
      return {
        key: `w${i}`,
        n: d.getDate(),
        dow: week.dows[i],
        today: d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate(),
      }
    })
  }, [info, week, today])

  const hours = useMemo(
    () => Array.from({ length: week.lastHour - week.firstHour + 1 }, (_, i) => ({ h: week.firstHour + i, label: fmtHour(week.firstHour + i) })),
    [week],
  )

  const rows = useMemo<CalendarAgendaRow[]>(() => {
    // the mock agenda belongs to the mock month; other months are real-only
    const fromHook: CalendarAgendaRow[] = isDataMonth
      ? agenda.map((r, i) => ({
          ...r,
          key: `a${i}`,
          event: r.eventDay !== undefined ? events[r.eventDay] : undefined,
          plan: r.planId ? 'plan' : undefined,
        }))
      : []
    // real booked items always; plan span start/end rows only outside the mock
    // month (the mock agenda already carries its own Lake/Japan rows)
    const real: CalendarAgendaRow[] = [
      ...planCal.itemRows.map((r, i) => ({ ...r, key: `p${i}` })),
      ...(isDataMonth ? [] : planCal.spanRows.map((r, i) => ({ ...r, key: `s${i}` }))),
    ]
    // only the month on screen: agendaSortKey reads a bare day number, so rows
    // from another month would sort into the middle of this one
    const mine: CalendarAgendaRow[] = addedHere.map((a, i) => ({
      key: `n${i}`,
      day: String(a.event.day),
      dow: a.event.when.slice(0, 3),
      title: a.event.title,
      sub: a.event.when.includes('· ') ? a.event.when.split('· ')[1] : a.event.when,
      dot: dotFor(a.event.owner),
      right: countdown(toISO(new Date(a.y, a.m - 1, a.event.day)), today),
      rightColor: 'var(--fg3)',
      event: a.event,
    }))
    return [...fromHook, ...real, ...mine].sort((a, b) => agendaSortKey(a) - agendaSortKey(b))
  }, [agenda, addedHere, events, today, isDataMonth, planCal.itemRows, planCal.spanRows])

  /** the mock week blocks plus anything quick-added to the month on screen */
  const weekBlocks = useMemo(() => [...(isDataMonth ? blocks : []), ...addedBlocks], [blocks, isDataMonth, addedBlocks])

  const emptyMonth = Object.keys(monthEvents).length === 0 && Object.keys(monthBars).length === 0 && planCal.items.length === 0

  const step = useCallback((delta: number) => {
    setSelectedDay(null)
    setCursor((c) => {
      const next = new Date(c.y, c.m - 1 + delta, 1)
      return { y: next.getFullYear(), m: next.getMonth() + 1 }
    })
  }, [])

  const openPlanFor = useCallback((planId: string) => navigate(paths.plan(planId)), [navigate])

  /**
   * A day cell tap: an event opens the sheet, a booked plan item opens its
   * read-only card, a plan bar opens the plan, anything else selects the day.
   */
  const pickDay = useCallback(
    (cell: DayCell) => {
      if (cell.blank || cell.trailing || cell.day === null) return
      if (cell.event) {
        setOpenEvent(cell.event)
        return
      }
      if (cell.items.length) {
        setOpenItem(cell.items[0])
        return
      }
      if (cell.bar) {
        openPlanFor(cell.bar.planId ?? PLAN_BAR_PLAN_ID)
        return
      }
      setSelectedDay((d) => (d === cell.day ? null : cell.day))
    },
    [openPlanFor],
  )

  const pickRow = useCallback(
    (row: CalendarAgendaRow) => {
      if (row.event) {
        setOpenEvent(row.event)
        return
      }
      if (row.item) {
        setOpenItem(row.item)
        return
      }
      if (row.planId) openPlanFor(row.planId)
    },
    [openPlanFor],
  )

  const closeEvent = useCallback(() => setOpenEvent(null), [])
  const closeItem = useCallback(() => setOpenItem(null), [])
  /** desktop month chips open the same read-only item card */
  const openItemCard = useCallback((item: CalendarItem) => setOpenItem(item), [])
  /** the card's "Open in plan →" link: /plans/{planId}?seg=itinerary */
  const openItemPlan = useCallback(() => {
    if (openItem) navigate(paths.plan(openItem.planId, 'itinerary'))
    setOpenItem(null)
  }, [openItem, navigate])

  /**
   * The past event's CTA. mobile-d-sheets.md section 10: "both buttons just
   * close (ev: null). No memory is created."
   */
  const addMemoryFromEvent = useCallback(() => setOpenEvent(null), [])

  const quickAdd = useCallback(
    (text: string): boolean => {
      const parsed = parseQuickAdd(text, info, selectedDay ?? todayDay ?? 1)
      if (!parsed) return false
      const { event: ev, start } = parsed
      setAdded((list) => [
        ...list.filter((a) => a.y !== info.y || a.m !== info.m || a.event.day !== ev.day || a.event.title !== ev.title),
        { y: info.y, m: info.m, event: ev, start },
      ])
      setSelectedDay(ev.day)
      return true
    },
    [info, selectedDay, todayDay],
  )

  return {
    info,
    isDataMonth,
    cells,
    rows,
    emptyMonth,
    legend,
    week,
    weekdays: month.weekdays,
    weekDays,
    hours,
    weekBlocks,
    eventsByDay: monthEvents,
    today,
    todayDay,
    view,
    setView,
    desktopView,
    setDesktopView,
    prevMonth: useCallback(() => step(-1), [step]),
    nextMonth: useCallback(() => step(1), [step]),
    selectedDay,
    pickDay,
    pickRow,
    openEvent,
    setOpenEvent,
    closeEvent,
    addMemoryFromEvent,
    openItem,
    openItemCard,
    closeItem,
    openItemPlan,
    quickAdd,
  }
}

export type CalendarModel = ReturnType<typeof useCalendar>
