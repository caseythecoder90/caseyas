// tokens-and-components.md section 5. 44px on mobile, 36-40px in dense desktop rows.

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'destructive' | 'ink' | 'over-photo'
/** default 44px / dense 36px (13px label, 0 12px) / dense-lg 40px / sheet 48px (15px label) */
export type ButtonSize = 'default' | 'dense' | 'dense-lg' | 'sheet'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** width: 100% */
  full?: boolean
  /** leading icon (16-20px lucide) */
  icon?: ReactNode
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  quiet: 'btn-quiet',
  destructive: 'btn-destructive',
  ink: 'btn-ink',
  'over-photo': 'btn-over-photo',
}
const SIZE_CLASS: Record<ButtonSize, string> = {
  default: '',
  dense: 'btn-dense',
  'dense-lg': 'btn-dense-lg',
  sheet: 'btn-sheet',
}

export function Button({ variant = 'secondary', size = 'default', full, icon, className, style, type = 'button', children, ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx('btn', VARIANT_CLASS[variant], SIZE_CLASS[size], className)}
      style={{ width: full ? '100%' : undefined, ...style }}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}

/** 40x40 transparent icon button (header actions), icon 20px, color fg2. */
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number
  label: string
}
export function IconButton({ size = 40, label, className, style, type = 'button', children, ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        border: 'none',
        background: 'transparent',
        color: 'var(--fg2)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        flex: 'none',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
