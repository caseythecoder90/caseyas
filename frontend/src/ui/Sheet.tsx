// tokens-and-components.md section 14 / mobile-d-sheets.md section 0.
// Bottom sheet: scrim rgba(0,0,0,.6), 12px top radius, drag handle, primary
// action last. 200ms in/out (opacity + 8px rise); closes on scrim tap and
// Escape. Rendered in a portal so it escapes the scroll container.
// Variants: bottom (default) / tall (top:80px, header/body/footer) / dialog
// (centered modal: delete confirm, sealed note).

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cx } from './cx'

export const SHEET_MS = 200

export type SheetVariant = 'bottom' | 'tall' | 'dialog'

export interface SheetProps {
  open: boolean
  onClose: () => void
  children?: ReactNode
  variant?: SheetVariant
  /** column gap: 16 default, 14 note composer, 4 menu-style (More sheet) */
  gap?: number
  /** serif 26px title in a title row */
  title?: ReactNode
  /** mono 11px fg3 on the right of the title row ("Draft · saved just now") */
  meta?: ReactNode
  /** accent 14px close link on the right of the title row instead of meta */
  closeLabel?: string
  /** show the drag handle (default: everything but dialog) */
  handle?: boolean
  style?: CSSProperties
  className?: string
  'aria-label'?: string
}

export function Sheet({ open, onClose, children, variant = 'bottom', gap, title, meta, closeLabel, handle, style, className, ...a11y }: SheetProps) {
  const [mounted, setMounted] = useState(open)

  useEffect(() => {
    if (open) {
      setMounted(true)
      return
    }
    const t = setTimeout(() => setMounted(false), SHEET_MS)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!mounted) return null

  const closing = !open
  const showHandle = handle ?? variant !== 'dialog'
  const panelStyle: CSSProperties = {
    gap: gap ?? (variant === 'dialog' ? 14 : variant === 'tall' ? 0 : 16),
    ...style,
  }

  return createPortal(
    <>
      <div className="sheet-scrim" data-closing={closing || undefined} onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={a11y['aria-label']}
        className={cx('sheet-panel', className)}
        data-variant={variant}
        data-closing={closing || undefined}
        style={panelStyle}
      >
        {showHandle && <div className="sheet-handle" style={variant === 'tall' ? { marginTop: 12 } : undefined} />}
        {(title !== undefined || meta !== undefined || closeLabel) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1.1 }}>{title}</div>
            {closeLabel ? (
              <a role="button" tabIndex={0} onClick={onClose} style={{ fontSize: 14, color: 'var(--accent)', cursor: 'pointer' }}>
                {closeLabel}
              </a>
            ) : meta !== undefined ? (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg3)' }}>{meta}</span>
            ) : null}
          </div>
        )}
        {children}
      </div>
    </>,
    document.body,
  )
}

/** Tall-sheet fixed header: serif 26px title, 14px fg2 action link, baseline aligned. */
export function SheetHeader({ title, action, onAction, children }: { title?: ReactNode; action?: string; onAction?: () => void; children?: ReactNode }) {
  return (
    <div style={{ padding: '12px 20px 0', flex: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(title !== undefined || action) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1.1 }}>{title}</div>
          {action && (
            <a role="button" tabIndex={0} onClick={onAction} style={{ fontSize: 14, color: 'var(--fg2)', cursor: 'pointer' }}>
              {action}
            </a>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

/** Tall-sheet scrolling body. */
export function SheetBody({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0, ...style }}>{children}</div>
  )
}

/** Tall-sheet fixed footer with a hairline; put the primary action here. */
export function SheetFooter({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ padding: '12px 20px 40px', borderTop: '1px solid var(--border)', flex: 'none', display: 'flex', flexDirection: 'column', gap: 10, ...style }}>
      {children}
    </div>
  )
}

/** Menu-style sheet row (More sheet): 52px, hairline top, 16px label, mono 11px meta. */
export function SheetRow({ label, meta, onClick }: { label: ReactNode; meta?: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 52,
        border: 'none',
        borderTop: '1px solid var(--border)',
        background: 'transparent',
        color: 'var(--fg1)',
        fontSize: 16,
        textAlign: 'left',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 0,
        width: '100%',
      }}
    >
      <span>{label}</span>
      {meta !== undefined && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg3)' }}>{meta}</span>}
    </button>
  )
}
