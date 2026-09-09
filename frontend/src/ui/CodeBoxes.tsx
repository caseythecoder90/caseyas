// tokens-and-components.md section 6: six mono 20px boxes (48px, radius 8,
// surface fill) over an invisible numeric input. The box at the caret gets an
// fg1 border; error turns them danger. dark: the sign-in literals
// (#2e2b26 idle, #faf9f6 active, #e26a4a error).

export interface CodeBoxesProps {
  value: string
  onChange: (digits: string) => void
  length?: number
  error?: boolean
  dark?: boolean
  height?: number
  fontSize?: number
  autoFocus?: boolean
  disabled?: boolean
  'aria-label'?: string
}

export function CodeBoxes({ value, onChange, length = 6, error, dark, height = 48, fontSize = 20, autoFocus, disabled, ...a11y }: CodeBoxesProps) {
  const digits = value.replace(/\D/g, '').slice(0, length)
  const idle = dark ? '#2e2b26' : 'var(--border)'
  const active = dark ? '#faf9f6' : 'var(--fg1)'
  const err = dark ? '#e26a4a' : 'var(--danger)'
  const bg = dark ? 'rgba(26,25,23,.85)' : 'var(--surface)'
  const color = dark ? '#faf9f6' : 'var(--fg1)'

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${length},1fr)`, gap: 8 }} aria-hidden="true">
        {Array.from({ length }, (_, i) => {
          const border = error ? err : i === digits.length ? active : idle
          return (
            <div
              key={i}
              style={{
                height,
                borderRadius: 8,
                border: `1px solid ${border}`,
                background: bg,
                color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize,
              }}
            >
              {digits[i] ?? ''}
            </div>
          )
        })}
      </div>
      <input
        value={digits}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, length))}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={length}
        autoFocus={autoFocus}
        disabled={disabled}
        aria-label={a11y['aria-label'] ?? 'Authenticator code'}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          fontSize: 16,
          color: 'transparent',
          caretColor: 'transparent',
          background: 'transparent',
          border: 'none',
          outline: 'none',
        }}
      />
    </div>
  )
}
