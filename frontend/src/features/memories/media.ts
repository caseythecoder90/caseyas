// Image seeds the memory screens derive from a record (the design's
// P(seed, w, h) calls): detail gallery tiles, the 900x900 lightbox image, the
// 1600x900 desktop hero. Everything goes through mockImage - never a URL.

import { mockImage } from '../../data/mockImage'
import type { Memory } from '../../data/types'

export type Variant = 'mobile' | 'desktop'

/** Seed of detail-gallery tile i (mobile: seed+'a', id+'g2'..; desktop: id+'g1'..'g7'). */
export function gallerySeed(m: Memory, i: number, variant: Variant): string {
  if (variant === 'desktop') return m.id + 'g' + (i + 1)
  return i === 0 ? m.seed + 'a' : m.id + 'g' + (i + 1)
}

/** The lightbox image: the tile's seed at 900x900 (the design's /400/400 -> /900/900 swap). */
export function lightboxSrc(m: Memory, i: number, variant: Variant): string {
  return mockImage(gallerySeed(m, i, variant), 900, 900)
}

/** Desktop detail hero: the memory's image seed at 1600x900. */
export function heroSrc(m: Memory): string {
  return mockImage(m.seed, 1600, 900)
}

/** Desktop On-this-day strip image (otd 240x160). */
export function onThisDayDesktopSrc(): string {
  return mockImage('otd', 240, 160)
}
