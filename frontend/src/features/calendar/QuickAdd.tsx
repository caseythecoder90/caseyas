// The quick-add field. The prototype draws it as a static placeholder row
// (mobile: 44px, full width; desktop: 40px, 320px). It is a real input, but
// until the events collection lands in milestone 5 there is nowhere to save
// what gets typed, so the calendar renders it disabled with an honest
// placeholder rather than inventing a session-local event.

import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Icon } from '../../ui'

export const QUICK_ADD_DISABLED_PLACEHOLDER = 'Your own events arrive with milestone 5'

export interface QuickAddProps {
  placeholder: string
  /** returns true when the text was accepted (the field clears) */
  onSubmit?: (text: string) => boolean
  /** no saving yet: the field keeps its place in the layout but takes no input */
  disabled?: boolean
  variant?: 'mobile' | 'desktop'
  inputRef?: React.Ref<HTMLInputElement>
  style?: React.CSSProperties
}

export function QuickAdd({ placeholder, onSubmit, disabled = false, variant = 'mobile', inputRef, style }: QuickAddProps) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const desktop = variant === 'desktop'

  function accept() {
    if (disabled || !onSubmit) return
    if (onSubmit(value)) setValue('')
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    accept()
  }

  // Enter explicitly: preventDefault also stops the implicit form submission,
  // so the text is handed over exactly once.
  function keyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    accept()
  }

  return (
    <form
      onSubmit={submit}
      aria-disabled={disabled || undefined}
      title={disabled ? placeholder : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        height: desktop ? 40 : 44,
        padding: '0 14px',
        borderRadius: 8,
        border: `1px ${disabled ? 'dashed' : 'solid'} var(--border)`,
        background: disabled ? 'transparent' : 'var(--surface)',
        color: 'var(--fg3)',
        fontSize: 14,
        width: desktop ? 320 : undefined,
        flex: 'none',
        cursor: disabled ? 'not-allowed' : undefined,
        outline: focused && !disabled ? '2px solid var(--accent)' : undefined,
        outlineOffset: focused && !disabled ? 2 : undefined,
        ...style,
      }}
    >
      <Icon name="plus" size={16} style={{ flex: 'none', opacity: disabled ? 0.6 : 1 }} />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={keyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label="Quick add an event"
        style={{
          flex: 1,
          minWidth: 0,
          border: 'none',
          background: 'transparent',
          color: 'var(--fg1)',
          fontSize: 14,
          padding: 0,
          outline: 'none',
          cursor: disabled ? 'not-allowed' : undefined,
        }}
      />
    </form>
  )
}
