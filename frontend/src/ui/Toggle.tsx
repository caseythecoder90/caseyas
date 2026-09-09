// tokens-and-components.md section 6: 40x24 pill, accent on / surface-2 off,
// 18px paper knob at left 19 / 3, 150ms. Compact (offline): 36x22, knob at 17.

import type { CSSProperties } from 'react'

export interface ToggleProps {
  on: boolean
  onChange?: (on: boolean) => void
  size?: 'default' | 'compact'
  /** track color when off (sign-in uses #2e2b26) */
  offColor?: string
  /** knob shadow (the Stay form's "Paid" toggle) */
  shadowKnob?: boolean
  disabled?: boolean
  'aria-label'?: string
  'aria-labelledby'?: string
  style?: CSSProperties
  className?: string
}

export function Toggle({ on, onChange, size = 'default', offColor = 'var(--surface-2)', shadowKnob, disabled, style, className, ...a11y }: ToggleProps) {
  const compact = size === 'compact'
  const w = compact ? 36 : 40
  const h = compact ? 22 : 24
  const k = compact ? 16 : 18
  const left = on ? (compact ? 17 : 19) : 3
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={a11y['aria-label']}
      aria-labelledby={a11y['aria-labelledby']}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        onChange?.(!on)
      }}
      className={className}
      style={{
        width: w,
        height: h,
        borderRadius: 999,
        background: on ? 'var(--accent)' : offColor,
        position: 'relative',
        border: 'none',
        padding: 0,
        flex: 'none',
        transition: 'background 150ms',
        ...style,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left,
          width: k,
          height: k,
          borderRadius: 999,
          background: '#faf9f6',
          transition: 'left 150ms var(--ease)',
          boxShadow: shadowKnob ? '0 1px 2px rgba(0,0,0,.2)' : undefined,
        }}
      />
    </button>
  )
}
