// Who is signed in. useMe() is the /api/me query (a 401 makes api.ts redirect
// to Keycloak); SessionProvider hands the resolved user to the screens.

import { useQuery } from '@tanstack/react-query'
import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from 'react'
import { api, csrfToken, type Me } from './api'
import { ME_FALLBACK } from './people'

export function useMe() {
  return useQuery({ queryKey: ['me'], queryFn: () => api<Me>('/api/me') })
}

export interface SessionValue {
  me: Me
  /** display name for copy like "Casey & Yasmim" (falls back to ME_FALLBACK) */
  meName: string
}

const SessionContext = createContext<SessionValue | null>(null)

export function SessionProvider({ me, children }: { me: Me; children: ReactNode }) {
  const value = useMemo<SessionValue>(() => ({ me, meName: me.displayName?.trim() || ME_FALLBACK }), [me])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>')
  return ctx
}

/**
 * A real form POST to /logout so the browser follows the api's redirect to
 * Keycloak's end-session endpoint and back. fetch() could not follow that
 * cross-site hop. Put a type="submit" button inside.
 */
export function SignOutForm({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <form method="post" action="/logout" className={className} style={style}>
      <input type="hidden" name="_csrf" value={csrfToken() ?? ''} />
      {children}
    </form>
  )
}

/** The Us screen's "Lock now" button (mobile-c spec section 5): 44px, hairline, fg2, full width. */
export function SignOutButton({ label = 'Lock now', style }: { label?: string; style?: CSSProperties }) {
  return (
    <SignOutForm>
      <button
        type="submit"
        style={{
          height: 44,
          width: '100%',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'transparent',
          color: 'var(--fg2)',
          fontSize: 14,
          ...style,
        }}
      >
        {label}
      </button>
    </SignOutForm>
  )
}
