// mobile-b-plans.md 2.12 / desktop.md 7.2 - the locked note: mono lines under
// a 6px blur until tapped, re-locking after 60 seconds as the footnote promises.

import { useEffect, useState } from 'react'
import { LOCK_ICON } from './bits'

const RELOCK_MS = 60_000

/** What the note is for, not anyone's numbers: the real note arrives with milestone 6. */
const LOCKED_LINES = ['Passport numbers and expiry dates', 'Embassy and emergency contacts', 'Travel insurance policy', 'Nothing saved here yet']
const LOCKED_FOOTNOTE = 'Hidden from offline copies and exports. Re-locks after 60 seconds.'

export function SegLocked({ variant = 'mobile' }: { variant?: 'mobile' | 'desktop' }) {
  const desktop = variant === 'desktop'
  const [reveal, setReveal] = useState(false)

  useEffect(() => {
    if (!reveal) return
    const t = setTimeout(() => setReveal(false), RELOCK_MS)
    return () => clearTimeout(t)
  }, [reveal])

  return (
    <div
      style={
        desktop
          ? { flex: 1, padding: 40, display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 640 }
          : { padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }
      }
    >
      <button
        type="button"
        onClick={() => setReveal((r) => !r)}
        aria-pressed={reveal}
        aria-label={reveal ? 'Hide the locked note' : desktop ? 'Click to reveal the locked note' : 'Tap to reveal the locked note'}
        style={{
          position: 'relative',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          padding: desktop ? 24 : 18,
          cursor: 'pointer',
          overflow: 'hidden',
          textAlign: 'left',
          color: 'var(--fg1)',
          width: '100%',
        }}
      >
        <span
          style={{
            display: 'block',
            filter: reveal ? 'blur(0px)' : 'blur(6px)',
            fontFamily: 'var(--font-mono)',
            fontSize: desktop ? 14 : 13,
            color: 'var(--fg1)',
            lineHeight: desktop ? 1.9 : 1.8,
            transition: 'filter 200ms',
            userSelect: 'none',
          }}
        >
          {LOCKED_LINES.map((l) => (
            <span key={l} style={{ display: 'block' }}>
              {l}
            </span>
          ))}
        </span>
        {!reveal && (
          <span
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 14,
            }}
          >
            {!desktop && LOCK_ICON}
            {desktop ? 'Click to reveal' : 'Tap to reveal'}
          </span>
        )}
      </button>
      <div style={{ fontSize: 12, color: 'var(--fg3)', lineHeight: 1.5 }}>{LOCKED_FOOTNOTE}</div>
      <div style={{ fontSize: 12, color: 'var(--fg3)', lineHeight: 1.5 }}>The locked note arrives with milestone 6</div>
    </div>
  )
}
