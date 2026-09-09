// mono 11px, .14em tracking, uppercase, fg3 ("on this day", "next up",
// section heads, month headers); 10px variant in the sidebar / plan cards.

import type { HTMLAttributes } from 'react'
import { cx } from './cx'

export interface EyebrowProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'span' | 'h2' | 'h3' | 'p'
  size?: 11 | 10
  /** e.g. 'var(--accent)' for the On this day / Next trip eyebrows */
  color?: string
}

export function Eyebrow({ as: Tag = 'div', size = 11, color, className, style, children, ...rest }: EyebrowProps) {
  return (
    <Tag className={cx('eyebrow', size === 10 && 'eyebrow-sm', className)} style={color ? { color, ...style } : style} {...rest}>
      {children}
    </Tag>
  )
}
