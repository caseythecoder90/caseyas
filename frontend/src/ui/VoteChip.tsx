// tokens-and-components.md section 10: vote chips (24px, mono 10px) and the
// assignee chip (20px, initial only). Casey accent-soft/accent, her
// green-soft/green. Glyphs: up like, ~ meh, x no.

import type { CSSProperties } from 'react'
import { initialFor } from '../people'
import type { Vote } from '../data/types'
import { voteGlyph, whoStyle } from './tokens'

export interface VoteChipProps {
  who: 'me' | 'her'
  /** omit for the assignee/initial-only chip */
  vote?: Vote
  /** 24 (10px) / 22 (9px) / 20 (9px) / 18 (8px) */
  size?: 24 | 22 | 20 | 18
  title?: string
  style?: CSSProperties
  className?: string
}

const FONT_FOR: Record<number, number> = { 24: 10, 22: 9, 20: 9, 18: 8 }

export function VoteChip({ who, vote, size = 24, title, style, className }: VoteChipProps) {
  const fill = whoStyle(who)
  return (
    <span
      className={className}
      title={title}
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: FONT_FOR[size] ?? 9,
        background: fill.background,
        color: fill.color,
        flex: 'none',
        lineHeight: 1,
        ...style,
      }}
    >
      {initialFor(who)}
      {vote ? voteGlyph(vote) : ''}
    </span>
  )
}

/** Casey's and her vote side by side (gap 4, or 3 on small idea cards). */
export function VotePair({ c, h, size = 24, gap, style }: { c: Vote; h: Vote; size?: 24 | 22 | 20 | 18; gap?: number; style?: CSSProperties }) {
  return (
    <span style={{ display: 'inline-flex', gap: gap ?? (size <= 20 ? 3 : 4), ...style }}>
      <VoteChip who="me" vote={c} size={size} />
      <VoteChip who="her" vote={h} size={size} />
    </span>
  )
}
