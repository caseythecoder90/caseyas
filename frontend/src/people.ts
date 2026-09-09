// The two people. Her name is fixed to Yasmim (the design's herName tweak);
// Casey's display name comes from /api/me with ME_FALLBACK as the fallback.

import type { Person } from './data/types'

export const HER: Person = 'Yasmim'
export const ME_FALLBACK: Person = 'Casey'

/** First letter of a name, upper-cased: 'Yasmim' -> 'Y'. Mirrors the design's `her[0]`. */
export function initial(name: string): string {
  const trimmed = name.trim()
  return trimmed ? trimmed[0].toUpperCase() : ''
}

/** Up to `max` initials from the words of a name: 'Casey Smith' -> 'CS'. */
export function initials(name: string, max = 2): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, max)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export const HER_INI = initial(HER) // 'Y'
export const ME_INI = initial(ME_FALLBACK) // 'C'

/** Initial used on vote / assignee chips for a data record's author. */
export function initialFor(person: Person | 'me' | 'her' | 'C' | 'Y'): string {
  return person === 'her' || person === HER || person === 'Y' ? HER_INI : ME_INI
}

export function isHer(person: Person | 'me' | 'her' | 'h' | 'c'): boolean {
  return person === HER || person === 'her' || person === 'h'
}

/** Mock-image seeds for the two avatars (design: caseyav / herav, 128x128). */
export const AVATAR_SEED = { me: 'caseyav', her: 'herav' } as const

export const TOGETHER_SINCE = 'Jul 12, 2024'
