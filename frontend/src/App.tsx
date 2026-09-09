// App root: theme + toast providers, the /api/me gate (401 -> the
// "Signing you back in" interstitial while api.ts redirects to Keycloak), then
// the shell with the route table.

import { useLocation } from 'react-router'
import { ApiError } from './api'
import { paths } from './paths'
import { AppRoutes } from './routes'
import { SessionProvider, useMe } from './session'
import SessionExpired from './shell/SessionExpired'
import { Shell } from './shell/Shell'
import { ThemeProvider } from './theme'
import { Button, ToastProvider } from './ui'

function Splash() {
  return (
    <div className="ours idp-page">
      <span style={{ fontFamily: 'var(--font-serif)', fontSize: 30, lineHeight: 1 }}>ours</span>
    </div>
  )
}

function LoadError({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="ours idp-page">
      <div className="idp" style={{ minHeight: 420, padding: '36px 28px', gap: 20, justifyContent: 'center' }}>
        <div className="eyebrow">Something broke</div>
        <h1 className="h" style={{ margin: 0 }}>
          Well, that didn't work.
        </h1>
        <p style={{ color: 'var(--fg2)', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
          The app could not reach the api. Nothing's lost — try again in a moment.
        </p>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--fg3)',
            padding: '10px 12px',
            borderRadius: 6,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            overflowWrap: 'anywhere',
          }}
        >
          {message}
        </div>
        <Button variant="secondary" size="sheet" full onClick={retry}>
          Try again →
        </Button>
      </div>
    </div>
  )
}

function Gate() {
  const { pathname } = useLocation()
  const me = useMe()

  if (pathname === paths.sessionExpired) return <SessionExpired />
  if (me.isPending) return <Splash />
  if (me.isError) {
    // a 401 means api.ts has already sent the browser to Keycloak
    const status = me.error instanceof ApiError ? me.error.status : 0
    if (status === 401) return <SessionExpired alreadyRedirecting />
    return <LoadError message={`error: ${me.error.message || 'network'}`} retry={() => void me.refetch()} />
  }

  return (
    <SessionProvider me={me.data}>
      <Shell>
        <AppRoutes />
      </Shell>
    </SessionProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Gate />
      </ToastProvider>
    </ThemeProvider>
  )
}
