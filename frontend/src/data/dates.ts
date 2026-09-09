// Dates and countdowns. "Today" in every design canvas is Sun Sep 6, 2026; the
// app uses the real clock unless a simulated date is set from the Us screen
// (dev tweak mirroring the prototype's simulateDate prop). Everything here is
// pure; the hooks (data/hooks.ts) read the simulated date from the store.

import type { Sim, SimDateOption } from './types'

export const DESIGN_TODAY = '2026-09-06'

// Japan 2027: Thu Feb 4 - Fri Feb 19, 16 days, Day N = Feb (3 + N)
export const JAPAN_START = '2027-02-04'
export const JAPAN_END = '2027-02-19'
export const JAPAN_DAYS = 16

export const LAKE_START = '2026-09-12'
export const LAKE_END = '2026-09-13'
export const ANNIV_WEEKEND_START = '2026-10-17'
export const ANNIV_WEEKEND_END = '2026-10-18'
export const ANNIVERSARY = '2026-10-18'
export const ASHEVILLE_START = '2026-08-14'
export const ASHEVILLE_END = '2026-08-17'

export const SIM_OPTIONS: SimDateOption[] = [
  { key: 'now', label: 'Sep 6, 2026 — today', date: DESIGN_TODAY },
  { key: 'during', label: 'Feb 5, 2027 — in Tokyo', date: '2027-02-05' },
  { key: 'after', label: 'Feb 21, 2027 — just home', date: '2027-02-21' },
]

const DAY_MS = 86_400_000

/** 'yyyy-mm-dd' -> local midnight Date. */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function asDate(d: Date | string): Date {
  return typeof d === 'string' ? parseISO(d) : startOfDay(d)
}

export function realToday(): Date {
  return startOfDay(new Date())
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function daysBetween(from: Date | string, to: Date | string): number {
  return Math.round((asDate(to).getTime() - asDate(from).getTime()) / DAY_MS)
}

export function daysUntil(target: Date | string, today: Date | string): number {
  return daysBetween(today, target)
}

/** 'in 151 days' | 'tomorrow' | 'today' | 'yesterday' | '3 days ago' */
export function countdown(target: Date | string, today: Date | string): string {
  const d = daysUntil(target, today)
  if (d > 1) return `in ${d} days`
  if (d === 1) return 'tomorrow'
  if (d === 0) return 'today'
  if (d === -1) return 'yesterday'
  return `${-d} days ago`
}

/** Where `today` sits relative to a date range (inclusive). */
export function simFor(today: Date | string, start: Date | string = JAPAN_START, end: Date | string = JAPAN_END): Sim {
  const t = asDate(today).getTime()
  if (t < asDate(start).getTime()) return 'now'
  if (t > asDate(end).getTime()) return 'after'
  return 'during'
}

/** 1-based day of the trip, or null when not inside it. */
export function tripDay(today: Date | string, start: Date | string = JAPAN_START, end: Date | string = JAPAN_END): number | null {
  if (simFor(today, start, end) !== 'during') return null
  return daysBetween(start, today) + 1
}

/** 'in 151 days' | 'Day 2 of 16' | 'Home 2 days' - the Japan plan's countdown. */
export function japanCountdown(today: Date | string): string {
  const sim = simFor(today)
  if (sim === 'during') return `Day ${tripDay(today) ?? 1} of ${JAPAN_DAYS}`
  if (sim === 'after') return `Home ${daysBetween(JAPAN_END, today)} days`
  return countdown(JAPAN_START, today)
}

/** 'Sep 6, 2026' */
export function formatLong(d: Date | string): string {
  return asDate(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** 'Sep 6' */
export function formatMonthDay(d: Date | string): string {
  return asDate(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** 'Sun' */
export function formatDow(d: Date | string): string {
  return asDate(d).toLocaleDateString('en-US', { weekday: 'short' })
}

/** 'Sun Sep 6' */
export function formatDowMonthDay(d: Date | string): string {
  return `${formatDow(d)} ${formatMonthDay(d)}`
}

/** Feb 4, 2027 for Day 1, and so on (Day N = Feb (3 + N)). */
export function japanDayDate(n: number): Date {
  const d = parseISO(JAPAN_START)
  d.setDate(d.getDate() + (n - 1))
  return d
}

export function simOptionFor(iso: string | null): SimDateOption | undefined {
  return SIM_OPTIONS.find((o) => o.date === iso)
}
