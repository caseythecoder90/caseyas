// OPENED SEALED NOTE (mobile-d-sheets.md section 12): centred dialog on n1
// paper. The scrim and "Keep it →" both close it and mark the note opened.

import { Sheet } from '../../ui'
import { SEALED_BODY, SEALED_EYEBROW, SEALED_KEEP } from './copy'

export function SealedNoteDialog({ open, onClose, her }: { open: boolean; onClose: () => void; her: string }) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      variant="dialog"
      gap={16}
      aria-label="Sealed note"
      style={{ background: 'var(--n1)', padding: '28px 24px' }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--fg3)' }}>
        {SEALED_EYEBROW}
      </div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, lineHeight: 1.25 }}>{SEALED_BODY}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--fg2)' }}>— {her}</span>
        <button
          type="button"
          onClick={onClose}
          style={{ border: 'none', background: 'transparent', padding: 0, font: 'inherit', fontSize: 14, color: 'var(--accent)', cursor: 'pointer' }}
        >
          {SEALED_KEEP}
        </button>
      </div>
    </Sheet>
  )
}
