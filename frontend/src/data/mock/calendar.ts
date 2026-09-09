// mock-data.md section 8: September 2026 (today = Sun Sep 6, grid starts Monday).

import type { AgendaRow, CalendarBlock, CalendarEvent, PlanBar } from '../types'

export const CALENDAR_MONTH = {
  year: 2026,
  month: 9,
  name: 'September',
  days: 30,
  /** leading blank cells so Sep 1 lands on Tuesday (Monday-first grid) */
  leadingBlanks: 1,
  /** trailing October days shown on the desktop month grid */
  trailingDays: 4,
  today: 6,
  weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
} as const

/** Mobile event records keyed by day of month. */
export const EVENTS: Record<number, CalendarEvent> = {
  2: { day: 2, title: 'Farmers market', kind: 'Event', owner: 'b', when: 'Wed Sep 2 · 9:00 AM', rule: 'Every Wednesday', loc: 'Union Square', past: true },
  8: { day: 8, title: 'Dentist', kind: 'Reminder', owner: 'c', when: 'Tue Sep 8 · 2:30 PM', rule: 'Does not repeat', loc: 'Elm St Dental' },
  10: { day: 10, title: 'Book club', kind: 'Recurring', owner: 'h', when: 'Thu Sep 10 · 7:00 PM', rule: 'Every second Thursday', loc: 'Rosa’s place' },
  11: { day: 11, title: 'Dinner at Nonna’s', kind: 'Event', owner: 'b', when: 'Fri Sep 11 · 7:00 PM', rule: 'Does not repeat', loc: 'Nonna’s, 14 Grove St' },
  19: { day: 19, title: 'Casey’s parents visit', kind: 'All day', owner: 'b', when: 'Sat Sep 19 – Sun Sep 20', rule: 'Does not repeat', loc: 'Home' },
  25: { day: 25, title: 'Pay the car', kind: 'Recurring', owner: 'c', when: 'Fri Sep 25', rule: 'Monthly on the 25th', loc: '' },
}

/** Desktop time blocks (month cells and the week grid); hours are decimal, len in hours. */
export const EV: CalendarBlock[] = [
  { day: 2, title: 'Farmers market', owner: 'b', start: 9, len: 1.5 },
  { day: 8, title: 'Dentist', owner: 'c', start: 14.5, len: 1 },
  { day: 10, title: 'Book club', owner: 'h', start: 19, len: 2 },
  { day: 11, title: 'Dinner at Nonna’s', owner: 'b', start: 19, len: 2 },
  { day: 19, title: 'Casey’s parents visit', owner: 'b', allDay: true },
  { day: 20, title: 'Casey’s parents visit', owner: 'b', allDay: true },
  { day: 25, title: 'Pay the car', owner: 'c', start: 9, len: 0.5 },
  { day: 7, title: 'Yoga', owner: 'h', start: 7, len: 1 },
  { day: 9, title: 'Standup', owner: 'c', start: 10, len: 0.5 },
  { day: 12, title: 'Lake day', owner: 'b', allDay: true },
]

/** Plan bars on the mobile month grid (Lake weekend, Sep 12-13). */
export const PLAN_BARS: Record<number, PlanBar> = {
  12: { bg: 'var(--green)', label: 'Lake weekend', l: '2px', r: '-2px', rad: '3px 0 0 3px' },
  13: { bg: 'var(--green)', label: '', l: '-2px', r: '2px', rad: '0 3px 3px 0' },
}
export const PLAN_BAR_PLAN_ID = 'lake' as const

/** Days whose events appear in the mobile agenda, before the fixed rows. */
export const AGENDA_EVENT_DAYS = [8, 10, 11, 19]

/** Fixed agenda rows (countdown strings are the Sep 6 snapshot; hooks recompute `right`). */
export const AGENDA_EXTRA: AgendaRow[] = [
  { day: '12', dow: 'Sat', title: 'Lake weekend', sub: 'Sep 12 – 13 · Lake Lure · check-in 3 PM', dot: 'var(--green)', right: 'in 6 days', rightColor: 'var(--fg3)', planId: 'lake' },
  { day: '18', dow: 'Oct', title: 'Anniversary', sub: 'Oct 18 → every year', dot: 'var(--fg1)', right: 'in 42 days', rightColor: 'var(--accent)' },
  { day: '4', dow: 'Feb', title: 'Japan 2027', sub: 'JL 5 · JFK → HND · 12:55 PM', dot: 'var(--accent)', right: 'in 151 days', rightColor: 'var(--accent)', planId: 'japan' },
]

/** Sort key used by the mobile agenda: 8, 10, 11, 12, 19, Oct 18, Feb 4. */
export function agendaSortKey(row: AgendaRow): number {
  return row.dow === 'Oct' ? 1000 : row.dow === 'Feb' ? 2000 : Number(row.day)
}

/** Desktop week view: Mon Sep 7 - Sun Sep 13, 7 AM - 7 PM, 56 px per hour. */
export const WEEK = {
  days: [7, 8, 9, 10, 11, 12, 13],
  dows: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  firstHour: 7,
  lastHour: 19,
  rowHeight: 56,
} as const

/** '7:00 AM', '7:30 PM' */
export function fmtHour(h: number): string {
  const hr = Math.floor(h)
  return `${((hr + 11) % 12) + 1}:${h % 1 ? '30' : '00'}${hr >= 12 ? ' PM' : ' AM'}`
}

export const CALENDAR_LEGEND: [label: string, color: string][] = [
  ['Casey', 'var(--accent)'],
  ['Yasmim', 'var(--green)'],
  ['Both', 'var(--fg1)'],
]

export const QUICK_ADD_PLACEHOLDER = 'Dinner at Nonna’s Fri 7pm'
