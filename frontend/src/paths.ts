// Route path builders. Pure so data hooks can point at screens without
// importing the route table (routes.tsx re-exports this).

import type { PlanId, PlanSeg } from './data/types'

/** Segment names as they appear in the URL (?seg=...). */
export type PlanSegParam = 'overview' | 'itinerary' | 'ideas' | 'bookings' | 'checklists' | 'budget' | 'documents' | 'map' | 'locked'

const SEG_TO_PARAM: Record<PlanSeg, PlanSegParam> = {
  overview: 'overview',
  itinerary: 'itinerary',
  ideas: 'ideas',
  bookings: 'bookings',
  lists: 'checklists',
  budget: 'budget',
  docs: 'documents',
  map: 'map',
  locked: 'locked',
}
const PARAM_TO_SEG: Record<PlanSegParam, PlanSeg> = {
  overview: 'overview',
  itinerary: 'itinerary',
  ideas: 'ideas',
  bookings: 'bookings',
  checklists: 'lists',
  budget: 'budget',
  documents: 'docs',
  map: 'map',
  locked: 'locked',
}

export function paramFromSeg(seg: PlanSeg): PlanSegParam {
  return SEG_TO_PARAM[seg]
}

/** Parse ?seg= (unknown or missing -> 'overview'). */
export function segFromParam(param: string | null | undefined): PlanSeg {
  return param && param in PARAM_TO_SEG ? PARAM_TO_SEG[param as PlanSegParam] : 'overview'
}

export const paths = {
  timeline: '/',
  memory: (id: number | string) => `/memories/${id}`,
  gallery: '/gallery',
  compose: '/compose',
  composeFromPlan: (planId: PlanId | string) => `/compose?from=${planId}`,
  plans: '/plans',
  plan: (id: PlanId | string, seg?: PlanSeg) => (seg && seg !== 'overview' ? `/plans/${id}?seg=${paramFromSeg(seg)}` : `/plans/${id}`),
  today: (id: PlanId | string = 'japan') => `/plans/${id}/today`,
  calendar: '/calendar',
  chat: '/chat',
  notes: '/notes',
  us: '/us',
  sessionExpired: '/session-expired',
} as const

export type TabKey = 'memories' | 'plans' | 'calendar' | 'chat' | 'us'

/** Which bottom tab a pathname belongs to (Notes is the Chat tab's second segment on mobile). */
export function tabFor(pathname: string): TabKey | null {
  if (pathname === '/' || pathname.startsWith('/memories') || pathname === '/gallery' || pathname === '/compose') return 'memories'
  if (pathname.startsWith('/plans')) return 'plans'
  if (pathname.startsWith('/calendar')) return 'calendar'
  if (pathname.startsWith('/chat') || pathname.startsWith('/notes')) return 'chat'
  if (pathname.startsWith('/us')) return 'us'
  return null
}
