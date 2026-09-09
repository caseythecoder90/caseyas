// mock-data.md section 7: composer types, tools, media trays, body blocks.

import { mockImage as img } from '../mockImage'
import type { ComposerBlock, ComposerMediaTile, MemoryType, ToolbarTool } from '../types'

export const COMPOSER_TYPES: MemoryType[] = ['Trip', 'Date night', 'Everyday', 'Milestone']

export const COMPOSER_TOOLS: ToolbarTool[] = [
  { label: 'H', font: 'var(--font-serif)', weight: 500, style: 'normal' },
  { label: 'B', font: 'inherit', weight: 600, style: 'normal' },
  { label: 'I', font: 'inherit', weight: 400, style: 'italic' },
  { label: '• list', font: 'inherit', weight: 400, style: 'normal' },
  { label: '1. list', font: 'inherit', weight: 400, style: 'normal' },
  { label: '“ quote', font: 'var(--font-serif)', weight: 400, style: 'italic' },
  { label: '+ photo', font: 'inherit', weight: 400, style: 'normal' },
]

// Mobile media tray seeds (200x200): cover i0; default tray uploads i2 (opacity .6);
// caption on i1: 'Kitchen, 11 PM' (default) / 'Haneda, finally' (from plan).
export const COMPOSER_MEDIA_DEFAULT_SEEDS = ['new1', 'new2', 'new3']
export const COMPOSER_MEDIA_FROM_PLAN_SEEDS = ['jp1', 'jp2', 'jp3', 'jp4', 'jp5', 'jp6']

export function composerMedia(fromPlan: boolean): ComposerMediaTile[] {
  const seeds = fromPlan ? COMPOSER_MEDIA_FROM_PLAN_SEEDS : COMPOSER_MEDIA_DEFAULT_SEEDS
  return seeds.map((seed, i) => ({
    seed,
    src: img(seed, 200, 200),
    cover: i === 0,
    uploading: !fromPlan && i === 2,
    cap: i === 1 ? (fromPlan ? 'Haneda, finally' : 'Kitchen, 11 PM') : undefined,
  }))
}

// Body blocks: default draft = the power outage
export const COMPOSER_BLOCKS_DEFAULT: ComposerBlock[] = [
  { type: 'p', text: 'The power went out at 9:40, mid-episode. We found the candles from the wedding, still in the box.', color: 'var(--fg1)' },
  { type: 'q', text: 'The loudest silence.' },
  { type: 'img', src: img('candles', 800, 400), cap: 'Kitchen table, by candle' },
  { type: 'p', text: 'Keep writing…', color: 'var(--fg3)' },
]

// From-plan prefill (Japan 2027)
export const COMPOSER_BLOCKS_FROM_PLAN: ComposerBlock[] = [
  { type: 'h', text: 'Day 1 · Thu Feb 4 · Tokyo' },
  { type: 'list', items: ['JL 5 · JFK → HND', 'Check in · Hotel Niwa', 'Ichiran ramen'] },
  { type: 'p', text: 'Write about day 1…', color: 'var(--fg3)' },
  { type: 'h', text: 'Day 2 · Fri Feb 5 · Tokyo' },
  { type: 'list', items: ['Meiji Jingu', 'Shibuya Sky', 'teamLab Planets'] },
  { type: 'p', text: 'Write about day 2…', color: 'var(--fg3)' },
  { type: 'p', text: '… 14 more days below', color: 'var(--fg3)' },
]

export const COMPOSER_PREFILL = {
  title: 'Two weeks in Japan',
  type: 'Trip' as MemoryType,
  dates: 'Feb 4 – 19, 2027',
  loc: 'Tokyo · Hakuba · Kyoto',
  mediaCount: '212',
  banner: 'Started from Japan 2027 · 16 day headings · 212 photos filtered to Feb 4 – 19',
  pickerNote: 'Picker is pre-filtered: photos taken Feb 4 – 19, 2027 · 212 of 4,812',
}

export const COMPOSER_DEFAULT = {
  dates: 'Sep 6, 2026',
  loc: 'Add a place',
  mediaCount: '3',
  savedLabel: 'saved just now',
  type: 'Everyday' as MemoryType,
}

/** Private toggle copy. */
export function privNote(priv: boolean, her: string): string {
  return priv
    ? her + ' won’t see this in the timeline or get a notification until you publish.'
    : her + ' can see the draft and add her take now.'
}

// Desktop composer (Lake weekend draft)
export const COMPOSER_DESKTOP = {
  title: 'A weekend at the lake',
  placeholder: 'Give it a title',
  type: 'Trip' as MemoryType,
  dates: 'Sep 4 – 6, 2026',
  loc: 'Lake Lure, NC',
  savedLabel: 'Draft · Saved just now',
  privacyLabel: 'Keep private to me until I publish',
  mediaLabel: 'Media · 7',
  blocks: [
    { type: 'h', text: 'Friday, late' },
    {
      type: 'p',
      text: 'We got there after dark, which was the plan, but the cabin key was not where the email said it would be. Twenty minutes with phone flashlights. It was under the third rock, not the second. Of course it was.',
    },
    { type: 'q', text: 'The lake was just a sound until morning.' },
    { type: 'img', src: img('lake1', 1200, 600), cap: 'First light from the dock. Cold.' },
    { type: 'list', items: ['Coffee from the gas station, somehow great', 'Yasmim swam. I supervised.', 'Zero photos of the trout because there was no trout'] },
    { type: 'p', text: 'Keep writing…', color: 'var(--fg3)' },
  ] as ComposerBlock[],
  /** In the paragraph above, "third" is bold. */
  boldWord: 'third',
}

export const COMPOSER_TRAY_DESKTOP_SEEDS = ['lake1', 'lake2', 'lake3', 'lake4', 'lake5', 'lake6', 'lake7']
export function composerTrayDesktop(): ComposerMediaTile[] {
  return COMPOSER_TRAY_DESKTOP_SEEDS.map((seed, i) => ({
    seed,
    src: img(seed, 300, 300),
    cover: i === 0,
    uploading: i === 5,
    pct: i === 5 ? '62%' : undefined,
    cap: i === 0 ? 'First light from the dock. Cold.' : i === 2 ? 'Gas-station coffee, great' : undefined,
  }))
}
