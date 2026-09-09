// tokens-and-components.md section 8: the mono status / kind pill.
// planning -> fg1, booked/decided -> green, shortlisted -> accent, others base.

import type { HTMLAttributes } from 'react'
import { cx } from './cx'

export interface KindProps extends HTMLAttributes<HTMLSpanElement> {
  /** planning | booked | shortlisted | decided | idea | dreaming | done | underway, or any kind label */
  status?: string
  /** explicit color (sets color + border-color together) */
  color?: string
  /** default 9px pill / card 10px fg2 (plan cards) / header 10px .12em fg1 (plan header) */
  size?: 'default' | 'card' | 'header'
}

const STATUS_CLASSES = new Set(['planning', 'underway', 'booked', 'decided', 'shortlisted'])

export function Kind({ status, color, size = 'default', className, style, children, ...rest }: KindProps) {
  return (
    <span
      className={cx('kind', size !== 'default' && `kind-${size}`, status && STATUS_CLASSES.has(status) && `kind-${status}`, className)}
      style={color ? { color, borderColor: color, ...style } : style}
      {...rest}
    >
      {children ?? status}
    </span>
  )
}
