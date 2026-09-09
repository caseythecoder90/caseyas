// mock-data.md section 19: Us screen, preferences, sign-in, sidebar widgets.

import type { NotifRow, OptInRow, PlanNotifKey, Prefs, SecurityRow, Stat } from '../types'

export const STATS: Stat[] = [
  { n: '599', l: 'memories' },
  { n: '4,812', l: 'photos' },
  { n: '37', l: 'places' },
  { n: '5', l: 'trips' },
  { n: '786', l: 'days' },
]

export const PERSON_CARDS = {
  me: { name: 'Casey', memories: '312 memories', seed: 'caseyav' },
  her: { name: 'Yasmim', memories: '287 memories', seed: 'herav' },
} as const

export const SECURITY: SecurityRow[] = [
  { t: 'Password', d: 'Changed 4 months ago', r: 'Change', c: 'var(--fg2)' },
  { t: 'Authenticator', d: 'TOTP · 8 backup codes left', r: 'On', c: 'var(--green)' },
  { t: 'Passkeys', d: 'Casey’s iPhone · MacBook', r: '2', c: 'var(--fg2)' },
  { t: 'Active sessions', d: 'This phone · Chrome on Mac', r: '2', c: 'var(--fg2)' },
  { t: 'Recent logins', d: 'Today 9:41 PM · Sep 4 · Sep 2', r: 'View', c: 'var(--fg2)' },
]

export const NOTIF_ROWS: NotifRow[] = [
  { key: 'push', t: 'Push', d: 'Messages, notes, calendar reminders' },
  { key: 'email', t: 'Email', d: 'Weekly digest of new memories' },
  { key: 'quiet', t: 'Quiet hours', d: '10 PM – 7 AM, both timezones' },
]

export const PLAN_NOTIF_CHIPS: [key: PlanNotifKey, label: string][] = [
  ['votes', 'Votes'],
  ['comments', 'Comments'],
  ['decisions', 'Decisions'],
  ['bookings', 'Bookings'],
]
export const PLAN_NOTIF_HEADER = 'Per plan · Japan 2027'

export const OPT_INS: OptInRow[] = [
  { key: 'map', t: 'Map view', d: 'Shows plan items and memories on a map. Loads map tiles from a third party.' },
  { key: 'paste', t: 'Paste a confirmation', d: 'Turns pasted text or screenshots into a booking form. Runs on your device only.' },
]
export const OPT_INS_HEADER = 'Optional · off by default'

export const DEFAULT_PREFS: Prefs = {
  notif: { push: true, email: false, quiet: true },
  planNotif: { votes: true, comments: true, decisions: true, bookings: true },
  optIn: { map: false, paste: false },
}

/** Static preference rows. */
export const US_STATIC = {
  themeLabel: 'Theme',
  themeLight: 'Light',
  themeDark: 'Late night',
  currency: { label: 'Home currency', value: 'USD · $' },
  timezone: { label: 'Timezone', value: 'America/New_York' },
  storage: { label: 'Storage', value: '41.2 GB of 200 GB' },
  export: { label: 'Export everything' },
  lockNow: 'Lock now',
  togetherSince: 'Together since',
} as const

/** The only accepted authenticator code in the prototype (Keycloak owns the real one). */
export const DEMO_CODE = '123456'

/** Desktop sidebar "Upcoming" widget. */
export const SIDEBAR_UPCOMING = [
  { dot: 'var(--fg1)', title: 'Dinner at Nonna’s', sub: 'Fri 7:00 PM' },
  { dot: 'var(--green)', title: 'Lake weekend', sub: 'Sat · in 6 days' },
] as const
export const SIDEBAR_NEXT_TRIP = { eyebrow: 'Next trip', line: 'days to Japan', planId: 'japan' } as const

/** Desktop "New" menu rows. */
export const NEW_MENU = [
  { label: 'Memory', hint: 'photos + writing', to: '/compose' },
  { label: 'Plan', hint: 'trip or event', to: '/plans?new=1' },
  { label: 'Idea', hint: 'into a plan', to: '/plans/japan?seg=ideas' },
  { label: 'Event', hint: 'on the calendar', to: '/calendar?new=1' },
] as const
