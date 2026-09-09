// A fridge note (mobile-c section 3): note paper in the n1..n4 palette, an
// optional photo, the scheduled line, and the "— {from}" signature row.

import type { FridgeNote } from '../../data/types'

export function NoteCard({ note }: { note: FridgeNote }) {
  return (
    <div
      style={{
        borderRadius: 8,
        padding: 16,
        background: `var(--${note.color})`,
        border: '1px solid var(--border)',
        gridColumn: `span ${note.span}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {note.hasPhoto && note.photo && (
        <img src={note.photo} alt="" style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 6, filter: 'sepia(.08) saturate(.88)' }} />
      )}
      <div style={{ fontSize: 15, lineHeight: 1.45, color: 'var(--fg1)' }}>{note.body}</div>
      {note.scheduled && (
        <div style={{ fontSize: 11, color: 'var(--fg3)', fontFamily: 'var(--font-mono)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          {note.when}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 'auto', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--fg2)', whiteSpace: 'nowrap' }}>
          — {note.from}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg3)', whiteSpace: 'nowrap' }}>{note.time}</span>
      </div>
    </div>
  )
}
