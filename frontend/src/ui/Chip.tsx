// tokens-and-components.md section 7. Filter chips invert to ink when selected;
// type/tag/reaction chips use the accent-soft fill.

import type { ButtonHTMLAttributes } from 'react'
import { cx } from './cx'

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
  /** filter: ink fill when selected / accent: accent-soft fill + accent border when selected */
  tone?: 'filter' | 'accent'
  /** dashed "+ tag" chip */
  add?: boolean
  /** sm 30px (system sheet) / md 32px weight 500 (mobile screens, desktop filters) */
  size?: 'sm' | 'md'
  /** render a non-interactive span (static chips like "Sep 4 – 6, 2026") */
  asSpan?: boolean
}

export function Chip({ selected, tone = 'filter', add, size = 'sm', asSpan, className, type = 'button', children, ...rest }: ChipProps) {
  const cls = cx(
    'chip',
    size === 'md' && 'chip-md',
    selected && (tone === 'accent' ? 'chip-accent' : 'chip-selected'),
    add && 'chip-add',
    className,
  )
  if (asSpan) {
    const { style, title, id } = rest
    return (
      <span className={cls} style={style} title={title} id={id}>
        {children}
      </span>
    )
  }
  return (
    <button type={type} className={cls} aria-pressed={selected} {...rest}>
      {children}
    </button>
  )
}
