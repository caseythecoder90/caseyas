// The calendar's mobile and desktop designs are different layouts (month grid +
// agenda vs. a full-height month/week board), so the page picks one at the
// `md` breakpoint (768px) the same way index.css does.

import { useSyncExternalStore } from 'react'

const QUERY = '(min-width: 768px)'

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function snapshot(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(QUERY).matches
}

/** true at >= md (768px). */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, snapshot, () => false)
}
