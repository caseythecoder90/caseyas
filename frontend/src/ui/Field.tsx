// tokens-and-components.md section 6: 44px input (0 12px, radius 8, border,
// surface fill, 14px), 12px fg2 label 4px above, mono variant for codes.

import { useId, type CSSProperties, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean
}

export function Input({ mono, style, ...rest }: InputProps) {
  return (
    <input
      style={{
        height: 44,
        width: '100%',
        padding: '0 12px',
        borderRadius: 8,
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        color: 'var(--fg1)',
        fontSize: 14,
        fontFamily: mono ? 'var(--font-mono)' : undefined,
        ...style,
      }}
      {...rest}
    />
  )
}

/** Note-composer textarea: borderless, 16px/1.5, resize none. */
export function Textarea({ style, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      style={{
        flex: 1,
        minHeight: 70,
        width: '100%',
        border: 'none',
        background: 'transparent',
        resize: 'none',
        fontSize: 16,
        lineHeight: 1.5,
        color: 'var(--fg1)',
        padding: 0,
        fontFamily: 'var(--font-sans)',
        ...style,
      }}
      {...rest}
    />
  )
}

export interface FieldProps extends InputProps {
  label: ReactNode
  /** 12px fg3 line under the control */
  hint?: ReactNode
  /** custom control instead of the default <Input> */
  children?: ReactNode
  wrapStyle?: CSSProperties
  wrapClassName?: string
}

export function Field({ label, hint, children, wrapStyle, wrapClassName, id, ...input }: FieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className={wrapClassName} style={wrapStyle}>
      <label htmlFor={inputId} style={{ display: 'block', fontSize: 12, color: 'var(--fg2)', marginBottom: 4 }}>
        {label}
      </label>
      {children ?? <Input id={inputId} {...input} />}
      {hint !== undefined && <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 4 }}>{hint}</div>}
    </div>
  )
}

/** Read-only date/time picker row: label left, mono value right (Timezone: fg2, 12px mono). */
export function PickerRow({ left, right, muted, onClick, style }: { left: ReactNode; right: ReactNode; muted?: boolean; onClick?: () => void; style?: CSSProperties }) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      style={{
        height: 44,
        padding: '0 12px',
        borderRadius: 8,
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 14,
        color: muted ? 'var(--fg2)' : undefined,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      <span>{left}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: muted ? 12 : undefined }}>{right}</span>
    </div>
  )
}
