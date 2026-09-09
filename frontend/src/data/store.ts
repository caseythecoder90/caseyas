// A tiny external store for the session-only state the prototype kept in its
// DCLogic state object (reactions, favourites, sent messages, notes left,
// checklist ticks, preferences, the simulated date). Milestone 2+ swaps the
// hooks' implementation to the api; screens never touch this file directly.
//
// Two values persist in localStorage: the simulated date ('ours.simDate') and
// the `designPreview` dev flag ('ours.designPreview'). With the flag off (the
// default) the tabs whose milestones have not landed show honest empty states;
// on, they render the design's placeholder data behind a "Design preview" banner.

import { useSyncExternalStore } from 'react'
import { DEFAULT_PREFS } from './mock/us'
import type { ChatMessage, FridgeNote, Prefs, TimelineLayout } from './types'

export interface AppState {
  /** ISO yyyy-mm-dd, or null for the real clock (dev tweak). */
  simDate: string | null
  /** show the design's mock data on the tabs that are not built yet (dev tweak) */
  designPreview: boolean
  prefs: Prefs
  timelineLayout: TimelineLayout
  showOnThisDay: boolean
  /** memory id -> reaction label ('' when none) */
  reactions: Record<number, string>
  /** memory id -> favourited lightbox indices */
  favs: Record<number, number[]>
  /** gallery tile ids soft-deleted this session */
  deletedTiles: string[]
  /** messages sent this session (after the base thread) */
  sent: ChatMessage[]
  typing: boolean
  /** the sealed note has been opened once */
  sealedDone: boolean
  /** notes left this session (rendered before the base notes) */
  addedNotes: FridgeNote[]
  /** checklist overrides keyed '<listIdx>-<itemIdx>' */
  ticks: Record<string, boolean>
}

const SIM_KEY = 'ours.simDate'

function readSimDate(): string | null {
  try {
    const v = localStorage.getItem(SIM_KEY)
    return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null
  } catch {
    return null
  }
}

const PREVIEW_KEY = 'ours.designPreview'

function readDesignPreview(): boolean {
  try {
    return localStorage.getItem(PREVIEW_KEY) === 'true'
  } catch {
    return false
  }
}

const initialState: AppState = {
  simDate: readSimDate(),
  designPreview: readDesignPreview(),
  prefs: DEFAULT_PREFS,
  timelineLayout: 'journal',
  showOnThisDay: true,
  reactions: {},
  favs: {},
  deletedTiles: [],
  sent: [],
  typing: false,
  sealedDone: false,
  addedNotes: [],
  ticks: {},
}

let state: AppState = initialState
const listeners = new Set<() => void>()

export function getState(): AppState {
  return state
}

export function setState(patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)): void {
  const next = typeof patch === 'function' ? patch(state) : patch
  state = { ...state, ...next }
  if ('simDate' in next) {
    try {
      if (state.simDate) localStorage.setItem(SIM_KEY, state.simDate)
      else localStorage.removeItem(SIM_KEY)
    } catch {
      /* storage unavailable */
    }
  }
  if ('designPreview' in next) {
    try {
      if (state.designPreview) localStorage.setItem(PREVIEW_KEY, 'true')
      else localStorage.removeItem(PREVIEW_KEY)
    } catch {
      /* storage unavailable */
    }
  }
  listeners.forEach((l) => l())
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Select a slice. Selectors must return a value that is referentially stable
 * for an unchanged state (a field, not a freshly built array); derive in the
 * hook with useMemo.
 */
export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  )
}

/** Test/dev helper: reset every session value. */
export function resetStore(): void {
  setState({ ...initialState, simDate: state.simDate, designPreview: state.designPreview })
}
