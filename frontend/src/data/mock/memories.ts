// mock-data.md sections 1-3: memories, detail bodies, lightbox captions.

import { mockImage as img } from '../mockImage'
import type { GalleryTile, Memory, MemoryComment, MemoryDetail, MemoryFilter } from '../types'

export const MEM: Memory[] = [
  {
    id: 1,
    title: 'Tuesday tacos, again',
    date: 'Sep 1, 2026',
    day: '1',
    mon: 'Sep',
    loc: 'Home',
    type: 'Everyday',
    by: 'Yasmim',
    ex: 'Third week running. Nobody is complaining.',
    count: '3 photos',
    size: 'compact',
    seed: 'tacos',
    img: img('tacos', 600, 600),
    img2: img('tacos2', 400, 400),
    month: 'September 2026',
    showMonth: true,
    more: '',
  },
  {
    id: 2,
    title: 'The night the power went out',
    date: 'Aug 29, 2026',
    day: '29',
    mon: 'Aug',
    loc: 'Home',
    type: 'Everyday',
    by: 'Casey',
    ex: 'Candles, a deck of cards, and the loudest silence.',
    count: '9 photos · 1 video',
    size: 'medium',
    seed: 'candles',
    img: img('candles', 800, 600),
    img2: img('cards', 400, 400),
    month: 'August 2026',
    showMonth: true,
    more: '+7',
  },
  {
    id: 3,
    title: 'Three days in Asheville',
    date: 'Aug 14–17, 2026',
    day: '14',
    mon: 'Aug',
    loc: 'Asheville, NC',
    type: 'Trip',
    by: 'Casey',
    ex: 'We meant to hike. We mostly ate.',
    exLong: 'We meant to hike. We mostly ate. Saturday we did make it up to the parkway, late enough that the light was going gold.',
    count: '38 photos · 2 videos',
    size: 'large',
    seed: 'asheville',
    img: img('asheville', 1200, 800),
    img2: img('ashe2', 400, 400),
    month: '',
    showMonth: false,
    more: '+36',
  },
  {
    id: 4,
    title: 'Two years',
    date: 'Jul 12, 2026',
    day: '12',
    mon: 'Jul',
    loc: 'Nonna’s',
    type: 'Milestone',
    by: 'Yasmim',
    ex: 'Same table as the first time. Same order, honestly.',
    count: '12 photos',
    size: 'medium',
    seed: 'twoyears',
    img: img('twoyears', 800, 600),
    img2: img('dinner', 400, 400),
    month: 'July 2026',
    showMonth: true,
    more: '+10',
  },
  {
    id: 5,
    title: 'Rooftop movie',
    date: 'Jul 3, 2026',
    day: '3',
    mon: 'Jul',
    loc: 'Downtown',
    type: 'Date night',
    by: 'Casey',
    ex: 'Couldn’t hear a word. Didn’t matter.',
    count: '1 photo',
    size: 'compact',
    seed: 'rooftop',
    img: img('rooftop', 600, 600),
    img2: '',
    month: '',
    showMonth: false,
    more: '',
  },
]

export const MEMORY_FILTERS: MemoryFilter[] = ['All', 'Trips', 'Date nights', 'Everyday', 'Milestones', 'Videos']

/** Desktop months, in display order; label = `${month} 2026`. */
export const TIMELINE_MONTHS = ['September', 'August', 'July'] as const

/** Timeline "On this day" card (static). */
export const ON_THIS_DAY = {
  img: img('otd', 160, 160),
  eyebrow: 'On this day · 2025',
  title: 'First real cold morning',
  sub: 'Sep 6, 2025 · Home · 4 photos',
  memId: 5,
} as const

/** Reactions with their base counts. */
export const REACTIONS: [label: string, count: number][] = [
  ['loved it', 2],
  ['made me laugh', 1],
  ['miss this', 0],
  ['again please', 0],
]

export const DETAIL: Record<number | 'default', MemoryDetail> = {
  3: {
    take1a:
      'We had a plan. The plan had trailheads and a start time. What actually happened is we found a biscuit place on the first morning and built the rest of the trip around going back to it.',
    quote: 'Nobody has ever regretted a second biscuit.',
    take1b:
      'Saturday we did make it up to the parkway, late enough that the light was going gold. That’s the photo below. The creek incident is not pictured.',
    inline: img('parkway', 900, 600),
    inlineCap: 'Blue Ridge Parkway, 6:40 PM',
    take2:
      'For the record, he fell in the creek. Fully. Shoes and all. Then he asked if I got it on video, and I had, and that is the video with 2 views because we’ve watched it twice.',
  },
  default: {
    take1a:
      'A small one, but it belongs here. The kind of night that doesn’t make it into any album unless you decide it does.',
    quote: 'The ordinary ones are the ones I forget first.',
    take1b: 'So here it is, written down before it goes.',
    inline: img('inlinedef', 900, 600),
    inlineCap: 'Kitchen, later than it should have been',
    take2: 'Not much to add. It was nice. Write more of these.',
  },
}

/** Desktop inline image sizes (1200x700). */
export const DETAIL_INLINE_DESKTOP: Record<number | 'default', string> = {
  3: img('parkway', 1200, 700),
  default: img('inlinedef', 1200, 700),
}

/** Only the Asheville memory links to a plan. */
export const MEMORY_PLAN: Record<number, { planId: 'asheville'; name: string }> = {
  3: { planId: 'asheville', name: 'Three days in Asheville' },
}

export const DETAIL_COMMENTS: MemoryComment[] = [
  { by: 'Yasmim', text: 'You left out the part where you fell in the creek.', when: 'Aug 18' },
  { by: 'Casey', text: 'Artistic license.', when: 'Aug 18' },
]

/** Lightbox captions (index = gallery index). */
export const CAPS = [
  'The creek, moments before.',
  'Biscuit place, morning two.',
  'Parkway pull-off.',
  'Somebody’s porch, not ours.',
  'Last morning. Packed the car twice.',
]

/**
 * Detail gallery tiles. Mobile: 5 tiles, first seeded from the memory's image
 * seed + 'a' (400x400, span 2, video 0:42), then id + 'g2'..'g5'.
 * Desktop: 7 tiles, id + 'g1' (600x600, span 2, video) then g2..g7 at 400x400.
 */
export function detailGallery(m: Memory, variant: 'mobile' | 'desktop' = 'mobile'): GalleryTile[] {
  if (variant === 'desktop') {
    const tiles: GalleryTile[] = [{ src: img(m.id + 'g1', 600, 600), span: 2, video: true, dur: '0:42' }]
    for (let i = 2; i <= 7; i++) tiles.push({ src: img(m.id + 'g' + i, 400, 400), span: 1 })
    return tiles
  }
  const tiles: GalleryTile[] = [{ src: img(m.seed + 'a', 400, 400), span: 2, video: true, dur: '0:42' }]
  for (let i = 2; i <= 5; i++) tiles.push({ src: img(m.id + 'g' + i, 400, 400), span: 1 })
  return tiles
}

export function findMemory(id: number | string | undefined): Memory {
  const n = typeof id === 'string' ? Number(id) : id
  return MEM.find((m) => m.id === n) ?? MEM[2]
}

export function detailFor(id: number): MemoryDetail {
  return DETAIL[id] ?? DETAIL.default
}

/** The timeline filter from data-and-logic.md 4.2. */
export function filterMemories(list: Memory[], filter: MemoryFilter): Memory[] {
  return list.filter(
    (m) =>
      filter === 'All' ||
      (filter === 'Trips' && m.type === 'Trip') ||
      (filter === 'Date nights' && m.type === 'Date night') ||
      (filter === 'Everyday' && m.type === 'Everyday') ||
      (filter === 'Milestones' && m.type === 'Milestone') ||
      (filter === 'Videos' && m.count.includes('video')),
  )
}

/** Month label for a memory ('August 2026') even when `month` is '' in the data. */
export function monthOf(m: Memory): string {
  if (m.month) return m.month
  const full: Record<string, string> = { Sep: 'September', Aug: 'August', Jul: 'July' }
  const year = m.date.match(/\d{4}/)?.[0] ?? '2026'
  return `${full[m.mon] ?? m.mon} ${year}`
}

/** Recompute showMonth as "first memory of its month in the filtered list" (data-and-logic.md 8). */
export function withShowMonth(list: Memory[]): Memory[] {
  let last = ''
  return list.map((m) => {
    const month = monthOf(m)
    const showMonth = month !== last
    last = month
    return { ...m, month, showMonth }
  })
}
