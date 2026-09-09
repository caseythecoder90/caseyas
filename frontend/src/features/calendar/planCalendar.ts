// Real plan data behind the calendar (milestone 2, architecture.md section 7):
// "the calendar derives from plans - a trip shows as a spanning bar across its
// dates in the plan's color, and booked items show as timed entries with a
// small plan badge". This module derives the visible month's plan bars, booked
// items and agenda rows from usePlans() plus the plan bundles (same
// ['plan-bundle', id] cache the Plans feature fills). The calendar's own
// events stay mock until milestone 5.

import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'
import { plansApi } from '../../data/api/plansApi'
import type { ServerItem } from '../../data/api/plansApi'
import { countdown, formatDowMonthDay } from '../../data/dates'
import { usePlans } from '../../data/hooks'
import { fmtDateTime, fmtTime } from '../../data/planViews'
import type { AgendaRow, PlanBar } from '../../data/types'
import type { MonthInfo } from './calendarModel'

/** A mock PlanBar plus what the real data adds: which plan it opens. */
export type CalendarBar = PlanBar & {
  /** real bars carry their plan id; the mock lake bar does not */
  planId?: string
  /** plan name on every covered day (label only shows on the first) */
  name?: string
}

/** A booked/done plan item placed on a calendar day. */
export interface CalendarItem {
  id: string
  planId: string
  planName: string
  /** token var() - the plan's status color */
  planColor: string
  day: number
  title: string
  /** '2:30 PM', or '' when the booking has no time */
  time: string
  /** 'Thu Feb 4 · 12:55 PM' | 'Thu Feb 4' */
  when: string
  /** server kind ('flight', 'stay', ...) for the card eyebrow */
  kind: string
  loc: string
  conf: string
}

export interface PlanAgendaRow extends AgendaRow {
  item?: CalendarItem
  /** plan badge text (plan name on item rows, 'plan' on span rows) */
  plan?: string
}

/** The slice of a plan the calendar needs; only dated plans make one. */
export interface PlanSpan {
  id: string
  name: string
  color: string
  dates: string
  start: string // ISO yyyy-mm-dd
  end: string
}

// --------------------------------------------------------------- pure helpers

/** ISO first/last day of the month on screen. */
export function monthBounds(info: MonthInfo): { first: string; last: string } {
  const mm = String(info.m).padStart(2, '0')
  return { first: `${info.y}-${mm}-01`, last: `${info.y}-${mm}-${String(info.days).padStart(2, '0')}` }
}

export function overlapsMonth(span: PlanSpan, info: MonthInfo): boolean {
  const { first, last } = monthBounds(info)
  return span.start <= last && span.end >= first
}

/**
 * Per-day spanning bars for the plans covering the month, in the mock
 * PLAN_BARS geometry: 2px inset at a true start/end, -2px bleed across the
 * grid gap in between, rounded only at the plan's real first/last day, the
 * name labelled on the first visible day. First plan to claim a day wins.
 */
export function planBarsFor(spans: PlanSpan[], info: MonthInfo): Record<number, CalendarBar> {
  const { first, last } = monthBounds(info)
  const bars: Record<number, CalendarBar> = {}
  const covering = spans.filter((s) => s.start <= last && s.end >= first).sort((a, b) => a.start.localeCompare(b.start))
  for (const s of covering) {
    const from = s.start >= first ? Number(s.start.slice(8, 10)) : 1
    const to = s.end <= last ? Number(s.end.slice(8, 10)) : info.days
    for (let d = from; d <= to; d++) {
      if (bars[d]) continue
      const col = (info.leading + d - 1) % 7
      const startEdge = d === from
      const endEdge = d === to
      const roundL = startEdge && s.start >= first
      const roundR = endEdge && s.end <= last
      const L = roundL ? '3px' : '0'
      const R = roundR ? '3px' : '0'
      bars[d] = {
        bg: s.color,
        label: d === from ? s.name : '',
        l: startEdge ? '2px' : col === 0 ? '0px' : '-2px',
        r: endEdge ? '2px' : col === 6 ? '0px' : '-2px',
        rad: `${L} ${R} ${R} ${L}`,
        planId: s.id,
        name: s.name,
      }
    }
  }
  return bars
}

/** Booked/done items whose start date falls inside the month, time-sorted. */
export function monthItemsFor(items: ServerItem[], spans: PlanSpan[], info: MonthInfo): CalendarItem[] {
  const prefix = `${info.y}-${String(info.m).padStart(2, '0')}`
  return items
    .filter((i) => (i.status === 'booked' || i.status === 'done') && !!i.start && i.start.slice(0, 7) === prefix)
    .sort((a, b) => a.start!.localeCompare(b.start!))
    .map((i) => {
      const span = spans.find((s) => s.id === i.planId)
      const hasTime = i.start!.length > 10
      return {
        id: i.id,
        planId: i.planId,
        planName: span?.name ?? 'Plan',
        planColor: span?.color ?? 'var(--accent)',
        day: Number(i.start!.slice(8, 10)),
        title: i.title,
        time: hasTime ? fmtTime(i.start) : '',
        when: hasTime ? fmtDateTime(i.start) : formatDowMonthDay(i.start!.slice(0, 10)),
        kind: i.kind,
        loc: i.location?.name ?? '',
        conf: i.confirmation ?? '',
      }
    })
}

// ------------------------------------------------------------------ the hook

export interface PlanCalendar {
  /** real spanning bars for the month, keyed by day */
  bars: Record<number, CalendarBar>
  items: CalendarItem[]
  itemsByDay: Record<number, CalendarItem[]>
  /** agenda rows for the booked items (plan badge = plan name) */
  itemRows: PlanAgendaRow[]
  /** agenda rows marking a plan span's start / end inside the month */
  spanRows: PlanAgendaRow[]
}

const DOWS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const dowOf = (info: MonthInfo, day: number) => DOWS[new Date(info.y, info.m - 1, day).getDay()]

export function usePlanCalendar(info: MonthInfo): PlanCalendar {
  const { plans, today } = usePlans()

  const spans = useMemo<PlanSpan[]>(
    () =>
      plans
        .filter((p) => !!p.start)
        .map((p) => ({ id: p.id, name: p.name, color: p.color, dates: p.dates, start: p.start!, end: p.end ?? p.start! })),
    [plans],
  )
  const overlapping = useMemo(() => spans.filter((s) => overlapsMonth(s, info)), [spans, info])

  // One query per plan overlapping the month, on the same ['plan-bundle', id]
  // key the Plans feature uses, so this is normally a cache read. The grid
  // renders regardless; bars need no bundle and items appear as data lands.
  const bundleQs = useQueries({
    queries: overlapping.map((s) => ({
      queryKey: ['plan-bundle', s.id],
      queryFn: () => plansApi.bundle(s.id),
      staleTime: 10_000,
    })),
  })

  const bars = useMemo(() => planBarsFor(overlapping, info), [overlapping, info])

  const items = useMemo<CalendarItem[]>(
    () => {
      const all: ServerItem[] = []
      for (const q of bundleQs) if (q.data) all.push(...q.data.items)
      return monthItemsFor(all, overlapping, info)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [overlapping, info, ...bundleQs.map((q) => q.data)],
  )

  const itemsByDay = useMemo<Record<number, CalendarItem[]>>(() => {
    const byDay: Record<number, CalendarItem[]> = {}
    for (const it of items) (byDay[it.day] ??= []).push(it)
    return byDay
  }, [items])

  const itemRows = useMemo<PlanAgendaRow[]>(
    () =>
      items.map((it) => ({
        day: String(it.day),
        dow: dowOf(info, it.day),
        title: it.title,
        sub: it.time || 'All day',
        dot: it.planColor,
        right: countdown(new Date(info.y, info.m - 1, it.day), today),
        rightColor: 'var(--fg3)',
        planId: it.planId,
        plan: it.planName,
        item: it,
      })),
    [items, info, today],
  )

  const spanRows = useMemo<PlanAgendaRow[]>(() => {
    const { first, last } = monthBounds(info)
    const rows: PlanAgendaRow[] = []
    for (const s of overlapping) {
      if (s.start >= first && s.start <= last) {
        rows.push({
          day: String(Number(s.start.slice(8, 10))),
          dow: dowOf(info, Number(s.start.slice(8, 10))),
          title: s.name,
          sub: s.dates,
          dot: s.color,
          right: countdown(s.start, today),
          rightColor: 'var(--fg3)',
          planId: s.id,
          plan: 'plan',
        })
      }
      if (s.end !== s.start && s.end >= first && s.end <= last && s.start.slice(0, 7) !== s.end.slice(0, 7)) {
        rows.push({
          day: String(Number(s.end.slice(8, 10))),
          dow: dowOf(info, Number(s.end.slice(8, 10))),
          title: s.name,
          sub: `Ends · ${s.dates}`,
          dot: s.color,
          right: countdown(s.end, today),
          rightColor: 'var(--fg3)',
          planId: s.id,
          plan: 'plan',
        })
      }
    }
    return rows
  }, [overlapping, info, today])

  return { bars, items, itemsByDay, itemRows, spanRows }
}
