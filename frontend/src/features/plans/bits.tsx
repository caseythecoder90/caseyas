// Small pieces the Plans screens share. Every style string is transcribed from
// design/spec/mobile-b-plans.md and design/spec/desktop.md.

import { useCallback, type CSSProperties, type ReactNode } from 'react'
import { Avatar, PAPER, PHOTO_FILTER, useToast } from '../../ui'

/** Destination chip on the large plan card and the plan header (26px, radius 4). */
export function DestChip({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        height: 26,
        padding: '0 10px',
        borderRadius: 4,
        border: '1px solid var(--border)',
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 12,
        color: 'var(--fg2)',
      }}
    >
      {children}
    </span>
  )
}

/** The couple, 22px, second overlapping by -6px. */
export function PlanAvatars({ border = 'var(--surface)' }: { border?: string }) {
  return (
    <span style={{ display: 'flex' }}>
      <Avatar who="me" size={22} border={border} />
      <Avatar who="her" size={22} border={border} style={{ marginLeft: -6 }} />
    </span>
  )
}

/** Cover photo with the design's warm filter. */
export function CoverImage({ src, style, alt = '' }: { src: string; style?: CSSProperties; alt?: string }) {
  return <img src={src} alt={alt} style={{ objectFit: 'cover', display: 'block', filter: PHOTO_FILTER, ...style }} />
}

/** Copies a confirmation code to the clipboard and confirms with a toast. */
export function useCopyCode(): (code: string) => void {
  const toast = useToast()
  return useCallback(
    (code: string) => {
      const value = (code ?? '').trim()
      if (!value || value === '—') return
      const done = () => toast.show(`Copied · ${value}`)
      try {
        const clip = navigator.clipboard
        if (clip?.writeText) void clip.writeText(value).then(done, () => toast.show('Could not copy that one'))
        else done()
      } catch {
        done()
      }
    },
    [toast],
  )
}

/** Thin progress bar (checklists, budget rows). */
export function Bar({ pct, height = 3 }: { pct: string; height?: number }) {
  return (
    <div style={{ height, borderRadius: height > 3 ? 3 : 2, background: 'var(--surface-2)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: pct, background: 'var(--accent)' }} />
    </div>
  )
}

/** Conic checklist ring: `n` = "3/7", `pct` = "43%". */
export function Ring({ n, pct, size = 44 }: { n: string; pct: string; size?: number }) {
  const inner = size - 10
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: `conic-gradient(var(--accent) ${pct}, var(--surface-2) 0)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
      }}
    >
      <span
        style={{
          width: inner,
          height: inner,
          borderRadius: 999,
          background: 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
        }}
      >
        {n}
      </span>
    </span>
  )
}

/** mono 9px .1em uppercase fg3 tag used for kinds in trays and rows (no border variant available). */
export function KindTag({ children, bordered = true }: { children: ReactNode; bordered?: boolean }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: 'var(--fg3)',
        border: bordered ? '1px solid var(--border)' : undefined,
        padding: bordered ? '2px 5px' : undefined,
        borderRadius: bordered ? 3 : undefined,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

/** 28 x 36 document stub used beside confirmation codes. */
export function DocThumb() {
  return (
    <span
      style={{
        width: 28,
        height: 36,
        borderRadius: 3,
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        display: 'inline-flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--fg3)',
        paddingBottom: 2,
      }}
    >
      PDF
    </span>
  )
}

/** Checklist checkbox (20px, radius 4, accent fill + paper tick when done). */
export function CheckBox({ done }: { done: boolean }) {
  return (
    <span
      style={{
        width: 20,
        height: 20,
        borderRadius: 4,
        border: `1px solid ${done ? 'var(--accent)' : 'var(--border)'}`,
        background: done ? 'var(--accent)' : 'transparent',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: PAPER,
        flex: 'none',
      }}
    >
      {done && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
    </span>
  )
}

export const LOCK_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

export const LOCK_ICON_SM = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
