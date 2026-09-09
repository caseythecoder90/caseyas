// The Us screen's settings chrome (mobile-c spec section 5): an eyebrow over a
// .card, 52px list rows (14px 16px padding, hairline between), switch rows
// that toggle from anywhere on the row, and the 20px per-plan checkboxes.

import { useId, type CSSProperties, type ReactNode } from 'react'
import { Card, Eyebrow, Icon, PAPER, Toggle } from '../../ui'

export const HAIRLINE = '1px solid var(--border)'

const ROW: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 16px',
  minHeight: 52,
}

/** Eyebrow (mono 11, 8px below) over a surface card. */
export function Section({ eyebrow, children, style }: { eyebrow?: ReactNode; children: ReactNode; style?: CSSProperties }) {
  return (
    <section style={style}>
      {eyebrow !== undefined && (
        <Eyebrow as="h2" style={{ margin: '0 0 8px', fontWeight: 400 }}>
          {eyebrow}
        </Eyebrow>
      )}
      <Card>{children}</Card>
    </section>
  )
}

/** Mono value on the right of a row (currency, timezone: 12px fg2; storage: 11px fg3). */
export function MonoValue({ children, size = 12, color = 'var(--fg2)' }: { children: ReactNode; size?: 11 | 12; color?: string }) {
  return <span style={{ fontFamily: 'var(--font-mono)', fontSize: size, color }}>{children}</span>
}

export interface RowProps {
  label: ReactNode
  sub?: ReactNode
  right?: ReactNode
  /** hairline above the row (every row but the first of a card) */
  divider?: boolean
  gap?: number
  style?: CSSProperties
}

/** Static list row: 15px label (12px fg3 sub) left, anything right. */
export function Row({ label, sub, right, divider = true, gap, style }: RowProps) {
  return (
    <div style={{ ...ROW, gap, borderTop: divider ? HAIRLINE : undefined, ...style }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 15 }}>{label}</div>
        {sub !== undefined && <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  )
}

export interface ToggleRowProps {
  title: string
  sub: string
  on: boolean
  onToggle: () => void
  /** opt-in rows: 12px gap so the switch never touches the long description */
  gap?: number
  /** opt-in rows: 1.4 */
  subLineHeight?: number
}

/**
 * A switch row. The whole row is tappable (prototype onClick on the row); the
 * Toggle inside is the keyboard and assistive-tech target — it stops its own
 * click from bubbling, so a tap on either toggles exactly once. The row itself
 * is only an enlarged hit area for that switch, so it is role="presentation":
 * it carries no semantics of its own and needs no key handler of its own.
 */
export function ToggleRow({ title, sub, on, onToggle, gap, subLineHeight }: ToggleRowProps) {
  const id = useId()
  return (
    <div role="presentation" onClick={onToggle} style={{ ...ROW, gap, borderTop: HAIRLINE, cursor: 'pointer' }}>
      <div style={{ minWidth: 0 }}>
        <div id={id} style={{ fontSize: 15 }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2, lineHeight: subLineHeight }}>{sub}</div>
      </div>
      <Toggle on={on} onChange={onToggle} aria-labelledby={id} />
    </div>
  )
}

/** Per-plan notification checkbox: 40px row, 14px label (fg1 on / fg3 off), 20px box. */
export function CheckRow({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 40,
        fontSize: 14,
        border: 'none',
        background: 'transparent',
        padding: 0,
        width: '100%',
        textAlign: 'left',
        color: on ? 'var(--fg1)' : 'var(--fg3)',
      }}
    >
      <span>{label}</span>
      <span
        aria-hidden="true"
        style={{
          width: 20,
          height: 20,
          borderRadius: 4,
          border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
          background: on ? 'var(--accent)' : 'transparent',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: PAPER,
          flex: 'none',
        }}
      >
        {on && <Icon name="check" size={12} strokeWidth={2.2} />}
      </span>
    </button>
  )
}
