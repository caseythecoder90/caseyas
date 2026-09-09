// desktop.md section 0: the layouts switch at Tailwind `md` (768px). Us renders
// a structurally different tree at md+ (the section 8 placeholder), so the
// breakpoint has to be a value, not a media query in CSS.

import { useSyncExternalStore } from 'react'

const QUERY = '(min-width: 48rem)'

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

function getSnapshot(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(QUERY).matches
}

/** true at >= 768px (the desktop shell). */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
