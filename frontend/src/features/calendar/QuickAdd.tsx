// The quick-add field. The prototype draws it as a static placeholder row
// (mobile: 44px, full width; desktop: 40px, 320px); here it is a real input -
// typing "Dinner at Nonna's Fri 7pm" and pressing Enter drops the event on the
// grid and in Upcoming.

import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Icon } from '../../ui'

export interface QuickAddProps {
  placeholder: string
  onSubmit: (text: string) => boolean
  variant?: 'mobile' | 'desktop'
  inputRef?: React.Ref<HTMLInputElement>
  style?: React.CSSProperties
}

export function QuickAdd({ placeholder, onSubmit, variant = 'mobile', inputRef, style }: QuickAddProps) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const desktop = variant === 'desktop'

  function submit(e: FormEvent) {
    e.preventDefault()
    if (onSubmit(value)) setValue('')
  }

  // Enter explicitly: preventDefault also stops the implicit form submission,
  // so the event is added exactly once.
  function keyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (onSubmit(value)) setValue('')
  }

  return (
    <form
      onSubmit={submit}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        height: desktop ? 40 : 44,
        padding: '0 14px',
        borderRadius: 8,
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        color: 'var(--fg3)',
        fontSize: 14,
        width: desktop ? 320 : undefined,
        flex: 'none',
        outline: focused ? '2px solid var(--accent)' : undefined,
        outlineOffset: focused ? 2 : undefined,
        ...style,
      }}
    >
      <Icon name="plus" size={16} style={{ flex: 'none' }} />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={keyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
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
        }}
      />
    </form>
  )
}
