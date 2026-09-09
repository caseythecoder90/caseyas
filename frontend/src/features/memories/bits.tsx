// Small pieces the memories screens share: the warmed photo <img>, the sticky
// month header, the accent FAB and the over-photo round buttons.

import type { CSSProperties, ReactNode } from 'react'
import { PAPER, PHOTO_FILTER, PHOTO_SCRIM_5 } from '../../ui'

export interface PhotoProps {
  src: string
  alt?: string
  style?: CSSProperties
  className?: string
}

/** Every photo in the design carries `filter:sepia(.08) saturate(.88)`. */
export function Photo({ src, alt = '', style, className }: PhotoProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ objectFit: 'cover', display: 'block', filter: PHOTO_FILTER, ...style }}
    />
  )
}

/** Sticky "AUGUST 2026" header over blurred paper. */
export function MonthHeader({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      className="blur-paper-15 eyebrow"
      style={{ position: 'sticky', top: 0, zIndex: 2, padding: '8px 20px', ...style }}
    >
      {children}
    </div>
  )
}

/** 52px accent FAB above the tab bar (mobile only; fixed so it never scrolls). */
export function Fab({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        position: 'fixed',
        right: 20,
        bottom: 104,
        width: 52,
        height: 52,
        borderRadius: 12,
        border: 'none',
        background: 'var(--accent)',
        color: PAPER,
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 5,
      }}
    >
      {children}
    </button>
  )
}

/** 36px round-cornered button on a dark scrim, used over the detail hero. */
export function OverPhotoButton({
  label,
  onClick,
  children,
  style,
}: {
  label: string
  onClick?: () => void
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        border: 'none',
        background: PHOTO_SCRIM_5,
        color: PAPER,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

/** Enter / Space activation for the card divs that carry role="button". */
export function onEnter(fn: () => void) {
  return (e: { key: string; preventDefault: () => void }) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      fn()
    }
  }
}

/** The overflow "…" glyph the prototype draws as three 1px circles. */
export function Dots({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  )
}
