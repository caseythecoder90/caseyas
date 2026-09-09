// The server side of the Plans feature: types mirroring the backend documents
// (backend/common/src/main/java/dev/ours/common/plan, media) and typed fetchers.
// Everything goes through the shared api() helper so CSRF and the 401 redirect
// apply. This module is transport only; view mapping lives in ../planViews.

import { api } from '../../api'

// ---------------------------------------------------------------- server types

export type ServerPlanType = 'trip' | 'event'
export type ServerPlanStatus = 'dreaming' | 'planning' | 'booked' | 'underway' | 'done'
export type ServerItemKind = 'flight' | 'stay' | 'transport' | 'activity' | 'food' | 'ticket' | 'idea' | 'note'
export type ServerItemStatus = 'idea' | 'shortlisted' | 'decided' | 'booked' | 'done' | 'cancelled'
export type ServerVote = 'like' | 'meh' | 'no'

export interface ServerDestination {
  name: string
  countryCode?: string | null
}

export interface ServerPlan {
  id: string
  name: string
  type: ServerPlanType
  status: ServerPlanStatus
  dateStart?: string | null // ISO yyyy-mm-dd
  dateEnd?: string | null
  timezone?: string | null
  destinations: ServerDestination[]
  coverMediaId?: string | null
  currency?: { home: string; local: string; rate?: number | null; rateSetAt?: string | null } | null
  linkedMemoryId?: string | null
  createdBy?: string | null
  createdAt: string
  updatedAt: string
}

export interface ServerLocation {
  name?: string | null
  address?: string | null
  lat?: number | null
  lng?: number | null
  mapsUrl?: string | null
}

export type ServerDetails =
  | { type: 'flight'; airline?: string; flightNumber?: string; fromAirport?: string; toAirport?: string; depart?: string; arrive?: string; seats?: string; pnr?: string }
  | { type: 'stay'; checkIn?: string; checkOut?: string; phone?: string; roomInfo?: string }
  | { type: 'transport'; mode?: string; from?: string; to?: string; depart?: string; arrive?: string; passInfo?: string }
  | { type: 'activity'; durationMinutes?: number; bookingRequired?: boolean; openingHours?: string }
  | { type: 'food'; cuisine?: string; reservationAt?: string; partySize?: number }
  | { type: 'ticket'; validFrom?: string; validTo?: string; quantity?: number }

export interface ServerItem {
  id: string
  planId: string
  kind: ServerItemKind
  title: string
  status: ServerItemStatus
  day?: number | null
  start?: string | null // ISO local date-time at the destination
  end?: string | null
  timezone?: string | null
  location?: ServerLocation | null
  details?: ServerDetails | null
  cost?: { amount: number; currency: string; paid: boolean } | null
  confirmation?: string | null
  links: { url: string; title?: string | null; image?: string | null; site?: string | null }[]
  attachmentIds: string[]
  tags: string[]
  votes: Record<string, ServerVote>
  comments: { id: string; authorId: string; text: string; at: string }[]
  sortKey: number
  createdBy?: string | null
  createdAt: string
  updatedAt: string
}

export interface ServerChecklistItem {
  id: string
  text: string
  done: boolean
  assignee?: string | null
  dueDate?: string | null
  doneBy?: string | null
}

export interface ServerChecklist {
  id: string
  planId: string
  name: string
  kind: 'todo' | 'packing' | 'shopping' | 'guests'
  items: ServerChecklistItem[]
}

export interface ServerMedia {
  id: string
  kind: 'photo' | 'video' | 'document'
  mime: string
  size: number
  originalName: string
  status: 'pending' | 'uploaded' | 'processing' | 'ready' | 'failed'
  width?: number | null
  height?: number | null
  pageCount?: number | null
  caption?: string | null
  planId?: string | null
  urls: { original?: string | null; thumb?: string | null; large?: string | null }
  createdAt: string
}

export interface ServerBudget {
  planned: number
  committed: number
  paid: number
  plannedLocal?: number | null
  committedLocal?: number | null
  paidLocal?: number | null
  home: string
  local?: string | null
  rate?: number | null
  rows: { kind: ServerItemKind; amount: number; pct: number }[]
}

export interface ServerBundle {
  plan: ServerPlan
  items: ServerItem[]
  checklists: ServerChecklist[]
  media: ServerMedia[]
}

export interface ServerUser {
  id: string
  username: string
  displayName: string
}

export interface LinkPreview {
  url: string
  title?: string | null
  image?: string | null
  site?: string | null
}

// ---------------------------------------------------------------- requests

export interface CreatePlanInput {
  name: string
  type: ServerPlanType
  dateStart?: string
  dateEnd?: string
  timezone?: string
  destinations?: string[]
  localCurrency?: string
}

export interface CreateItemInput {
  kind: ServerItemKind
  title: string
  status?: ServerItemStatus
  day?: number
  start?: string
  end?: string
  timezone?: string
  location?: ServerLocation
  details?: ServerDetails
  cost?: { amount: number; currency: string; paid: boolean }
  confirmation?: string
  links?: LinkPreview[]
  attachmentIds?: string[]
  tags?: string[]
}

export interface UpdateItemInput extends Partial<CreateItemInput> {
  clearDay?: boolean
  clearStart?: boolean
  clearCost?: boolean
}

export interface ReorderEntry {
  itemId: string
  day: number | null
  sortKey: number
}

// ---------------------------------------------------------------- fetchers

const json = (body: unknown): RequestInit => ({ method: 'POST', body: JSON.stringify(body) })

export const plansApi = {
  list: () => api<ServerPlan[]>('/api/plans'),
  bundle: (id: string) => api<ServerBundle>(`/api/plans/${id}/bundle`),
  budget: (id: string) => api<ServerBudget>(`/api/plans/${id}/budget`),
  users: () => api<ServerUser[]>('/api/users'),

  createPlan: (input: CreatePlanInput) => api<ServerPlan>('/api/plans', json(input)),
  updatePlan: (id: string, patch: Record<string, unknown>) =>
    api<ServerPlan>(`/api/plans/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),

  createItem: (planId: string, input: CreateItemInput) => api<ServerItem>(`/api/plans/${planId}/items`, json(input)),
  updateItem: (planId: string, itemId: string, patch: UpdateItemInput) =>
    api<ServerItem>(`/api/plans/${planId}/items/${itemId}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteItem: (planId: string, itemId: string) => api<void>(`/api/plans/${planId}/items/${itemId}`, { method: 'DELETE' }),
  reorder: (planId: string, entries: ReorderEntry[]) => api<ServerItem[]>(`/api/plans/${planId}/items/reorder`, json({ items: entries })),
  vote: (planId: string, itemId: string, vote: ServerVote | null) =>
    api<ServerItem>(`/api/plans/${planId}/items/${itemId}/vote`, { method: 'PUT', body: JSON.stringify({ vote }) }),
  comment: (planId: string, itemId: string, text: string) => api<ServerItem>(`/api/plans/${planId}/items/${itemId}/comments`, json({ text })),

  addChecklistItem: (planId: string, listId: string, text: string, assignee?: string, dueDate?: string) =>
    api<ServerChecklist>(`/api/plans/${planId}/checklists/${listId}/items`, json({ text, assignee, dueDate })),
  updateChecklistItem: (planId: string, listId: string, itemId: string, patch: { done?: boolean; text?: string }) =>
    api<ServerChecklist>(`/api/plans/${planId}/checklists/${listId}/items/${itemId}`, { method: 'PATCH', body: JSON.stringify(patch) }),

  linkPreview: (url: string) => api<LinkPreview>('/api/links/preview', json({ url })),

  media: (id: string) => api<ServerMedia>(`/api/media/${id}`),
}

/**
 * The browser-to-bucket upload contract, architecture section 8: presign, direct
 * PUT, complete, then poll while the worker makes the variants.
 */
export async function uploadFile(file: File, planId: string | undefined, onStatus?: (s: string) => void): Promise<ServerMedia> {
  onStatus?.('presigning')
  const slot = await api<{ mediaId: string; key: string; uploadUrl: string }>(
    '/api/media/uploads',
    json({ name: file.name, size: file.size, mime: file.type || 'application/octet-stream', planId }),
  )
  onStatus?.('uploading')
  const put = await fetch(slot.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
  if (!put.ok) throw new Error(`upload failed (${put.status})`)
  onStatus?.('processing')
  let media = await api<ServerMedia>(`/api/media/${slot.mediaId}/complete`, { method: 'POST' })
  for (let i = 0; i < 30 && media.status !== 'ready' && media.status !== 'failed'; i++) {
    await new Promise((r) => setTimeout(r, 1000))
    media = await plansApi.media(slot.mediaId)
  }
  return media
}
