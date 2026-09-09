// true at Tailwind `md` (48rem / 768px) and up - the desktop shell breakpoint.

import { useSyncExternalStore } from 'react'

const QUERY = '(min-width: 48rem)'

function subscribe(onChange: () => void): () => void {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

export function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
