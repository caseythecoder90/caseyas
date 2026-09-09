// tokens-and-components.md section 12: 8px radius, 1px border, surface fill,
// overflow hidden. Cards have no shadow.

import { createElement, type HTMLAttributes, type KeyboardEvent } from 'react'
import { cx } from './cx'

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** inner padding, e.g. '12px 14px' */
  padding?: number | string
  /** pointer cursor + button role + Enter/Space activation for tappable cards */
  interactive?: boolean
  as?: 'div' | 'section' | 'article' | 'li'
}

export function Card({ padding, interactive, as = 'div', className, style, onClick, onKeyDown, ...rest }: CardProps) {
  const handleKey = (e: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(e)
    if (interactive && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      e.currentTarget.click()
    }
  }
  return createElement(as, {
    className: cx('card', className),
    role: interactive ? 'button' : undefined,
    tabIndex: interactive ? 0 : undefined,
    onClick,
    onKeyDown: interactive || onKeyDown ? handleKey : undefined,
    style: { padding, cursor: interactive ? 'pointer' : undefined, ...style },
    ...rest,
  })
}
