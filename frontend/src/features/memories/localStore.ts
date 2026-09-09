// A minimal external store for the session state this feature keeps between
// screens (gallery selection mode, composer drafts). Mirrors data/store.ts so
// the feature never has to touch the shared store; the api swap later can
// replace these with hooks in data/.

import { useSyncExternalStore } from 'react'

export interface LocalStore<T extends object> {
  get: () => T
  set: (patch: Partial<T> | ((s: T) => Partial<T>)) => void
  subscribe: (listener: () => void) => () => void
  use: <S>(selector: (s: T) => S) => S
}

export function createStore<T extends object>(initial: T): LocalStore<T> {
  let state = initial
  const listeners = new Set<() => void>()
  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }
  return {
    get: () => state,
    set: (patch) => {
      const next = typeof patch === 'function' ? patch(state) : patch
      state = { ...state, ...next }
      listeners.forEach((l) => l())
    },
    subscribe,
    use: <S,>(selector: (s: T) => S): S =>
      useSyncExternalStore(
        subscribe,
        () => selector(state),
        () => selector(state),
      ),
  }
}
