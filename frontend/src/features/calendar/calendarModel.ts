// Calendar state shared by the mobile and desktop screens: which month is on
// screen, the day cells, the agenda rows, the desktop week rail and the open
// plan-item card. Everything on it is real: plan spans and booked items from
// the plans api (planCalendar.ts) plus the anniversary as a yearly all-day
// row (useEvents). The calendar's own events, reminders and recurring things
// arrive with milestone 5 - until then nothing is invented to fill the grid.
//
// Sources: mobile-c-chat-calendar-notes-us.md section 4 (grid, agenda, legend),
// desktop.md section 6 (month + week), architecture.md section 7 ("Calendar
// and reminders") and section 10.

import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useEvents } from '../../data/hooks'
import { countdown } from '../../data/dates'
import type { RecurringDay } from '../../data/types'
import { paths } from '../../paths'
import { usePlanCalendar } from './planCalendar'
import type { CalendarBar, CalendarItem, PlanAgendaRow } from './planCalendar'

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
/** Sunday-first, indexed by Date#getDay(). */
const DOW_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
/** Monday-first, the desktop month header (desktop.md section 6). */
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

/** The desktop week board (desktop.md section 6): 7 AM - 7 PM at 56px an hour; the rail grows when a booking sits outside it. */
export const WEEK_RAIL = { firstHour: 7, lastHour: 19, rowHeight: 56 } as const

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
  /** day of month, or null on a blank / trailing cell */
  day: number | null
  blank: boolean
  /** a next-month day shown at the tail of the desktop grid */
  trailing: boolean
  /** the plan span covering this day */
  bar?: CalendarBar
  /** real booked plan items on this day, time-sorted */
  items: CalendarItem[]
  /** the anniversary, when it falls on this day */
  recurring?: RecurringDay
  today: boolean
  selected: boolean
}

export interface CalendarAgendaRow extends PlanAgendaRow {
  key: string
}

export interface LegendEntry {
  key: string
  label: string
  color: string
}

export interface WeekDay {
  key: string
  date: Date
  /** day of month */
  n: number
  /** 'Mon' */
  dow: string
  today: boolean
  /** false on the days that spill into the neighbouring month */
  inMonth: boolean
}

/** '7:00 AM' from 7, '12:55 PM' from 12.92, '7:30 PM' from 19.5. */
export function fmtHour(h: number): string {
  const hr = Math.floor(h)
  const mins = Math.round((h - hr) * 60)
  return `${((hr + 11) % 12) + 1}:${String(mins).padStart(2, '0')}${hr >= 12 ? ' PM' : ' AM'}`
}

/** Monday on or before `d` (local). */
function mondayOf(d: Date): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  out.setDate(out.getDate() - ((out.getDay() + 6) % 7))
  return out
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export type CalendarView = 'month' | 'agenda'
export type DesktopView = 'month' | 'week'

export function useCalendar() {
  const { recurring, today } = useEvents()
  const navigate = useNavigate()

  const [view, setView] = useState<CalendarView>('month')
  const [desktopView, setDesktopView] = useState<DesktopView>('month')
  // the month on screen starts at today's (real or simulated) and steps across years freely
  const [cursor, setCursor] = useState<{ y: number; m: number }>({ y: today.getFullYear(), m: today.getMonth() + 1 })
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [openItem, setOpenItem] = useState<CalendarItem | null>(null)

  const info = useMemo(() => monthInfo(cursor.y, cursor.m), [cursor])
  /** real plan spans + booked items for the month on screen */
  const planCal = usePlanCalendar(info)

  /** the yearly dates falling in this month, keyed by day */
  const recurringByDay = useMemo<Record<number, RecurringDay>>(() => {
    const byDay: Record<number, RecurringDay> = {}
    for (const r of recurring) if (r.month === info.m && r.day <= info.days) byDay[r.day] = r
    return byDay
  }, [recurring, info])

  const todayDay = today.getFullYear() === cursor.y && today.getMonth() + 1 === cursor.m ? today.getDate() : null

  const cells = useCallback(
    (withTrailing: boolean): DayCell[] => {
      const out: DayCell[] = []
      for (let i = 0; i < info.leading; i++) {
        out.push({ key: `b${i}`, n: '', day: null, blank: true, trailing: false, today: false, selected: false, items: [] })
      }
      for (let n = 1; n <= info.days; n++) {
        out.push({
          key: `d${n}`,
          n: String(n),
          day: n,
          blank: false,
          trailing: false,
          bar: planCal.bars[n],
          items: planCal.itemsByDay[n] ?? [],
          recurring: recurringByDay[n],
          today: n === todayDay,
          selected: n === selectedDay,
        })
      }
      if (withTrailing) {
        const total = Math.ceil((info.leading + info.days) / 7) * 7
        for (let i = 1; i <= total - info.leading - info.days; i++) {
          out.push({ key: `t${i}`, n: String(i), day: null, blank: false, trailing: true, today: false, selected: false, items: [] })
        }
      }
      return out
    },
    [info, planCal.bars, planCal.itemsByDay, recurringByDay, todayDay, selectedDay],
  )

  /** the plans visible this month, in the color their bars use */
  const legend = useMemo<LegendEntry[]>(() => planCal.plans.map((p) => ({ key: p.id, label: p.name, color: p.color })), [planCal.plans])

  /** Upcoming: plan span start/end rows, booked items and the anniversary, by day */
  const rows = useMemo<CalendarAgendaRow[]>(() => {
    const yearly: CalendarAgendaRow[] = Object.values(recurringByDay).map((r) => ({
      key: `r-${r.key}`,
      day: String(r.day),
      dow: DOW_ABBR[new Date(info.y, info.m - 1, r.day).getDay()],
      title: r.title,
      sub: r.sub,
      dot: r.dot,
      right: countdown(new Date(info.y, info.m - 1, r.day), today),
      rightColor: 'var(--accent)',
    }))
    return [
      ...planCal.spanRows.map((r, i) => ({ ...r, key: `s${i}` })),
      ...planCal.itemRows.map((r, i) => ({ ...r, key: `p${i}` })),
      ...yearly,
    ].sort((a, b) => Number(a.day) - Number(b.day))
  }, [planCal.spanRows, planCal.itemRows, recurringByDay, info, today])

  const emptyMonth = rows.length === 0 && Object.keys(planCal.bars).length === 0

  // ---------------------------------------------------------------- week

  /**
   * Desktop week view: the Monday week holding today when today is in this
   * month, otherwise the first Monday week of the month.
   */
  const weekDays = useMemo<WeekDay[]>(() => {
    const first = new Date(info.y, info.m - 1, 1)
    const anchor = todayDay !== null ? new Date(info.y, info.m - 1, todayDay) : new Date(info.y, info.m - 1, 1 + ((8 - first.getDay()) % 7))
    const monday = mondayOf(anchor)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
      return {
        key: `w${i}`,
        date: d,
        n: d.getDate(),
        dow: DOW_ABBR[d.getDay()],
        today: sameDay(d, today),
        inMonth: d.getFullYear() === info.y && d.getMonth() === info.m - 1,
      }
    })
  }, [info, todayDay, today])

  /** timed bookings per week column (all-day bookings are not drawn on the rail) */
  const weekItems = useMemo<Record<string, CalendarItem[]>>(() => {
    const byKey: Record<string, CalendarItem[]> = {}
    for (const w of weekDays) {
      byKey[w.key] = w.inMonth ? (planCal.itemsByDay[w.n] ?? []).filter((it) => it.startHour !== undefined) : []
    }
    return byKey
  }, [weekDays, planCal.itemsByDay])

  /** the hour rail, stretched to hold any booking outside 7 AM - 7 PM */
  const hours = useMemo(() => {
    let first: number = WEEK_RAIL.firstHour
    let last: number = WEEK_RAIL.lastHour
    for (const list of Object.values(weekItems)) {
      for (const it of list) {
        first = Math.min(first, Math.floor(it.startHour!))
        last = Math.max(last, Math.ceil(it.endHour ?? it.startHour! + 1))
      }
    }
    return Array.from({ length: last - first + 1 }, (_, i) => ({ h: first + i, label: fmtHour(first + i) }))
  }, [weekItems])

  // ---------------------------------------------------------------- actions

  const step = useCallback((delta: number) => {
    setSelectedDay(null)
    setCursor((c) => {
      const next = new Date(c.y, c.m - 1 + delta, 1)
      return { y: next.getFullYear(), m: next.getMonth() + 1 }
    })
  }, [])

  const openPlanFor = useCallback((planId: string) => navigate(paths.plan(planId)), [navigate])

  /**
   * A day cell tap: a booked plan item opens its read-only card, a plan bar
   * opens the plan, anything else selects the day.
   */
  const pickDay = useCallback(
    (cell: DayCell) => {
      if (cell.blank || cell.trailing || cell.day === null) return
      if (cell.items.length) {
        setOpenItem(cell.items[0])
        return
      }
      if (cell.bar?.planId) {
        openPlanFor(cell.bar.planId)
        return
      }
      setSelectedDay((d) => (d === cell.day ? null : cell.day))
    },
    [openPlanFor],
  )

  const pickRow = useCallback(
    (row: CalendarAgendaRow) => {
      if (row.item) {
        setOpenItem(row.item)
        return
      }
      if (row.planId) openPlanFor(row.planId)
    },
    [openPlanFor],
  )

  const closeItem = useCallback(() => setOpenItem(null), [])
  /** desktop month chips and week blocks open the same read-only item card */
  const openItemCard = useCallback((item: CalendarItem) => setOpenItem(item), [])
  /** the card's "Open in plan →" link: /plans/{planId}?seg=itinerary */
  const openItemPlan = useCallback(() => {
    if (openItem) navigate(paths.plan(openItem.planId, 'itinerary'))
    setOpenItem(null)
  }, [openItem, navigate])

  return {
    info,
    cells,
    rows,
    emptyMonth,
    legend,
    weekdays: WEEKDAYS,
    weekDays,
    weekItems,
    hours,
    rowHeight: WEEK_RAIL.rowHeight,
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
    /** a plan bar tap: /plans/{planId} */
    openPlan: openPlanFor,
    openItem,
    openItemCard,
    closeItem,
    openItemPlan,
  }
}

export type CalendarModel = ReturnType<typeof useCalendar>
