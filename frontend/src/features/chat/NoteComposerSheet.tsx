// NOTE COMPOSER - "Leave a note" (mobile-d-sheets.md section 3): note paper on
// the chosen colour, the colour dots, the Schedule it / Seal it rows and the
// ink CTA whose label follows seal > schedule.

import { NOTE_APPEARS_NOW, NOTE_PLACEHOLDER, NOTE_SCHEDULE_TIME, leaveNoteLabel } from '../../data/mock'
import type { NoteColor } from '../../data/types'
import { Sheet, Toggle } from '../../ui'
import { NOTE_ADD_PHOTO, NOTE_COLOR_LABEL, NOTE_SCHEDULE_ROW, NOTE_SEAL_HINT, NOTE_SEAL_ROW, NOTE_SHEET_FOR, NOTE_SHEET_TITLE } from './copy'

export interface NoteComposerSheetProps {
  open: boolean
  onClose: () => void
  her: string
  me: string
  colors: NoteColor[]
  draft: string
  onDraft: (v: string) => void
  color: NoteColor
  onColor: (c: NoteColor) => void
  sched: boolean
  onSched: (v: boolean) => void
  seal: boolean
  onSeal: (v: boolean) => void
  onLeave: () => void
}

export function NoteComposerSheet(p: NoteComposerSheetProps) {
  return (
    <Sheet open={p.open} onClose={p.onClose} gap={14} aria-label={NOTE_SHEET_TITLE}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 26 }}>{NOTE_SHEET_TITLE}</span>
        <span style={{ fontSize: 12, color: 'var(--fg3)' }}>{NOTE_SHEET_FOR(p.her)}</span>
      </div>

      <div
        style={{
          borderRadius: 8,
          padding: 16,
          background: `var(--${p.color})`,
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          minHeight: 150,
          transition: 'background 200ms var(--ease)',
        }}
      >
        <textarea
          value={p.draft}
          onChange={(e) => p.onDraft(e.target.value)}
          placeholder={NOTE_PLACEHOLDER}
          aria-label={NOTE_PLACEHOLDER}
          style={{
            flex: 1,
            minHeight: 70,
            border: 'none',
            background: 'transparent',
            resize: 'none',
            fontSize: 16,
            lineHeight: 1.5,
            color: 'var(--fg1)',
            padding: 0,
            fontFamily: 'var(--font-sans)',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--fg2)' }}>— {p.me}</span>
          <button
            type="button"
            style={{
              height: 30,
              padding: '0 10px',
              borderRadius: 6,
              border: '1px dashed var(--border)',
              background: 'transparent',
              color: 'var(--fg2)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {NOTE_ADD_PHOTO}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', gap: 8 }}>
          {p.colors.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => p.onColor(k)}
              aria-label={`Note colour ${k}`}
              aria-pressed={p.color === k}
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                background: `var(--${k})`,
                border: `2px solid ${p.color === k ? 'var(--fg1)' : 'var(--border)'}`,
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </span>
        <span style={{ fontSize: 12, color: 'var(--fg3)' }}>{NOTE_COLOR_LABEL}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border)' }}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => p.onSched(!p.sched)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              p.onSched(!p.sched)
            }
          }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 48, fontSize: 14, cursor: 'pointer' }}
        >
          <span>
            {NOTE_SCHEDULE_ROW}
            <span style={{ color: 'var(--fg3)' }}> · {p.sched ? NOTE_SCHEDULE_TIME : NOTE_APPEARS_NOW}</span>
          </span>
          <Toggle on={p.sched} onChange={p.onSched} aria-label={NOTE_SCHEDULE_ROW} />
        </div>
        <div
          role="button"
          tabIndex={0}
          onClick={() => p.onSeal(!p.seal)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              p.onSeal(!p.seal)
            }
          }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: 48,
            fontSize: 14,
            cursor: 'pointer',
            borderTop: '1px solid var(--border)',
          }}
        >
          <span>
            {NOTE_SEAL_ROW}
            <span style={{ color: 'var(--fg3)' }}> · {NOTE_SEAL_HINT(p.her)}</span>
          </span>
          <Toggle on={p.seal} onChange={p.onSeal} aria-label={NOTE_SEAL_ROW} />
        </div>
      </div>

      <button
        type="button"
        onClick={p.onLeave}
        style={{
          height: 48,
          borderRadius: 8,
          border: 'none',
          background: 'var(--fg1)',
          color: 'var(--bg)',
          fontWeight: 500,
          fontSize: 15,
          cursor: 'pointer',
        }}
      >
        {leaveNoteLabel(p.seal, p.sched)}
      </button>
    </Sheet>
  )
}
