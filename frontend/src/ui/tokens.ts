// Runtime color helpers transcribed from the design's renderVals()
// (tokens-and-components.md sections 1.3, 8, 10; data-and-logic.md 4.1).
// Everything returns a CSS value string so it can go straight into a style prop.

import type { IdeaStatus, ItemKind, Owner, PlanStatus, Vote } from '../data/types'

/** Text/icon color on accent and ink fills - paper-white in both themes. */
export const PAPER = '#faf9f6'
export const INK = '#121110'
export const SCRIM = 'rgba(0,0,0,.6)'
/** Dark scrims over photos (status chips on covers, media duration chip). */
export const PHOTO_SCRIM_55 = 'rgba(18,17,16,.55)'
export const PHOTO_SCRIM_6 = 'rgba(18,17,16,.6)'
export const PHOTO_SCRIM_5 = 'rgba(18,17,16,.5)'
/** Danger text literal used by the mobile prototype (selection bar Delete). */
export const DANGER_LITERAL = '#e26a4a'
export const SIGNIN_BORDER = '#2e2b26'
export const SIGNIN_MUTED = '#a8a49a'

export const PHOTO_FILTER = 'sepia(.08) saturate(.88)'
export const AVATAR_FILTER = 'sepia(.2) saturate(.6)'
export const BLURRED_PAPER = 'color-mix(in oklab,var(--bg),transparent 12%)'
export const BLURRED_PAPER_15 = 'color-mix(in oklab,var(--bg),transparent 15%)'

export const EASE = 'cubic-bezier(.22,1,.36,1)'
export const DUR_PRESS = '120ms'
export const DUR_SHEET = '200ms'
export const DUR_SCREEN = '400ms'

/** Ownership dot: Casey terracotta, her sage, both ink. */
export function dotFor(owner: Owner): string {
  return owner === 'c' ? 'var(--accent)' : owner === 'h' ? 'var(--green)' : 'var(--fg1)'
}

/** Desktop month cell chip background by owner. */
export function bgFor(owner: Owner): string {
  return owner === 'c' ? 'var(--accent-soft)' : owner === 'h' ? 'var(--green-soft)' : 'var(--surface-2)'
}

/** Kind -> color for map pins and itinerary rows. */
export function kindColor(kind: ItemKind | string): string {
  switch (kind) {
    case 'food':
      return 'var(--accent)'
    case 'activity':
      return 'var(--green)'
    case 'stay':
      return 'var(--plum)'
    case 'ticket':
      return 'var(--ochre)'
    default:
      return 'var(--fg2)'
  }
}

/** Idea status color. */
export function stColor(status: IdeaStatus | string): string {
  return status === 'decided' ? 'var(--green)' : status === 'shortlisted' ? 'var(--accent)' : 'var(--fg3)'
}

/** .kind pill color + border-color per status (section 8). */
export function statusColor(status: PlanStatus | IdeaStatus | string): string {
  switch (status) {
    case 'planning':
    case 'underway':
      return 'var(--fg1)'
    case 'booked':
    case 'decided':
      return 'var(--green)'
    case 'shortlisted':
      return 'var(--accent)'
    default:
      return 'var(--fg3)'
  }
}

export function statusBorder(status: PlanStatus | IdeaStatus | string): string {
  const c = statusColor(status)
  return c === 'var(--fg3)' ? 'var(--border)' : c
}

/** votes: up like, ~ meh, x no */
export function voteGlyph(v: Vote): string {
  return v === 'like' ? '↑' : v === 'meh' ? '~' : '✕'
}

/** Toggle track/knob values. */
export function tg(on: boolean, compact = false): { bg: string; knob: string } {
  return { bg: on ? 'var(--accent)' : 'var(--surface-2)', knob: on ? (compact ? '17px' : '19px') : '3px' }
}

/** Selected-chip style (filters, gallery, ideas, map cities). */
export function filterChip(selected: boolean): { background: string; color: string; borderColor: string } {
  return {
    background: selected ? 'var(--fg1)' : 'transparent',
    color: selected ? 'var(--bg)' : 'var(--fg2)',
    borderColor: selected ? 'var(--fg1)' : 'var(--border)',
  }
}

/** Accent-chip style (type chips, reactions, Trip/Event). */
export function accentChip(on: boolean): { background: string; borderColor: string } {
  return { background: on ? 'var(--accent-soft)' : 'transparent', borderColor: on ? 'var(--accent)' : 'var(--border)' }
}

/** Segmented control segment background. */
export function segBg(active: boolean): string {
  return active ? 'var(--bg)' : 'transparent'
}

/** Vote / assignee chip fills for Casey ('C') vs her. */
export function whoStyle(who: 'C' | 'Y' | 'me' | 'her'): { background: string; color: string } {
  const casey = who === 'C' || who === 'me'
  return casey
    ? { background: 'var(--accent-soft)', color: 'var(--accent)' }
    : { background: 'var(--green-soft)', color: 'var(--green)' }
}

/** Checklist row runtime styles. */
export function checkStyle(done: boolean): { border: string; bg: string; color: string; deco: string } {
  return {
    border: done ? 'var(--accent)' : 'var(--border)',
    bg: done ? 'var(--accent)' : 'transparent',
    color: done ? 'var(--fg3)' : 'var(--fg1)',
    deco: done ? 'line-through' : 'none',
  }
}

/** Plan segment tab (underline style) colors. */
export function segTab(on: boolean): { edge: string; color: string } {
  return { edge: on ? 'var(--accent)' : 'transparent', color: on ? 'var(--fg1)' : 'var(--fg2)' }
}

/** Sidebar nav row colors (desktop). */
export function navRow(on: boolean): { bg: string; color: string; edge: string } {
  return {
    bg: on ? 'var(--accent-soft)' : 'transparent',
    color: on ? 'var(--fg1)' : 'var(--fg2)',
    edge: on ? 'var(--accent)' : 'transparent',
  }
}

/** Tab bar icon/label color. */
export function tabColor(active: boolean): string {
  return active ? 'var(--fg1)' : 'var(--fg3)'
}
