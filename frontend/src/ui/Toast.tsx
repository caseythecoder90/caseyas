// tokens-and-components.md section 11: ink toast with an accent action link.
// <Toast> is presentational; <ToastProvider> + useToast() show one above the
// tab bar (bottom 104px on mobile, 24px on desktop) for 4 seconds.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastProps {
  message: ReactNode
  action?: ToastAction
  style?: CSSProperties
  className?: string
}

export function Toast({ message, action, style, className }: ToastProps) {
  return (
    <div
      role="status"
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '12px 14px',
        borderRadius: 8,
        background: 'var(--fg1)',
        color: 'var(--bg)',
        fontSize: 14,
        maxWidth: 360,
        ...style,
      }}
    >
      <span>{message}</span>
      {action && (
        <a role="button" tabIndex={0} onClick={action.onClick} style={{ color: 'var(--accent)', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          {action.label}
        </a>
      )}
    </div>
  )
}

export interface ToastApi {
  /** Show a toast; replaces any visible one. ms defaults to 4000, 0 keeps it until hide(). */
  show: (message: ReactNode, action?: ToastAction, ms?: number) => void
  hide: () => void
}

const ToastContext = createContext<ToastApi | null>(null)

interface ToastState {
  id: number
  message: ReactNode
  action?: ToastAction
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const hide = useCallback(() => {
    clearTimeout(timer.current)
    setToast(null)
  }, [])

  const show = useCallback((message: ReactNode, action?: ToastAction, ms = 4000) => {
    clearTimeout(timer.current)
    setToast({ id: Date.now(), message, action })
    if (ms > 0) timer.current = setTimeout(() => setToast(null), ms)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  const api = useMemo<ToastApi>(() => ({ show, hide }), [show, hide])

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast &&
        createPortal(
          <div className="toast-host" key={toast.id}>
            <Toast
              message={toast.message}
              action={
                toast.action
                  ? {
                      label: toast.action.label,
                      onClick: () => {
                        toast.action?.onClick()
                        hide()
                      },
                    }
                  : undefined
              }
            />
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
