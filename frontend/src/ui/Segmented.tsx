// tokens-and-components.md section 7: segmented control. Track surface-2,
// active segment paper, 200ms switch.

import type { CSSProperties, ReactNode } from 'react'

export interface SegmentedOption<T extends string> {
  key: T
  label: ReactNode
}

export interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (key: T) => void
  /** default: 30px segments, 0 12px / calendar (desktop): 32px, 0 14px, fg1 labels */
  variant?: 'default' | 'calendar'
  /** stretch to the container, segments share the width */
  full?: boolean
  className?: string
  style?: CSSProperties
  'aria-label'?: string
}

export function Segmented<T extends string>({ options, value, onChange, variant = 'default', full, className, style, ...a11y }: SegmentedProps<T>) {
  const calendar = variant === 'calendar'
  return (
    <div
      role="tablist"
      aria-label={a11y['aria-label']}
      className={className}
      style={{
        display: 'flex',
        gap: 2,
        padding: 2,
        borderRadius: 6,
        background: 'var(--surface-2)',
        fontSize: 13,
        width: full ? '100%' : 'fit-content',
        ...style,
      }}
    >
      {options.map((o) => {
        const active = o.key === value
        return (
          <button
            key={o.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.key)}
            style={{
              height: calendar ? 32 : 30,
              padding: calendar ? '0 14px' : '0 12px',
              borderRadius: 4,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 500,
              flex: full ? 1 : undefined,
              background: active ? 'var(--bg)' : 'transparent',
              color: active || calendar ? 'var(--fg1)' : 'var(--fg2)',
              transition: 'background var(--dur-sheet) var(--ease), color var(--dur-sheet) var(--ease)',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
