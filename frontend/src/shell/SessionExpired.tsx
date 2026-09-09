// identity-pages.md screen 8 / "SPA interstitial": shown while the app hands
// off to the identity service after a 401 (or on /session-expired).

import { useEffect } from 'react'
import { LOGIN_PATH } from '../api'

let redirectIssued = false

export default function SessionExpired({ alreadyRedirecting = false }: { alreadyRedirecting?: boolean }) {
  useEffect(() => {
    if (alreadyRedirecting || redirectIssued) return
    redirectIssued = true
    window.location.assign(LOGIN_PATH)
  }, [alreadyRedirecting])

  return (
    <div className="ours idp-page">
      <div
        className="idp"
        style={{
          minHeight: 420,
          padding: '36px 28px',
          gap: 20,
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div
          className="spin"
          aria-hidden="true"
          style={{ width: 40, height: 40, borderRadius: 999, border: '1px solid var(--border)', borderTopColor: 'var(--accent)', flex: 'none' }}
        />
        <h1 className="h" style={{ margin: 0 }}>
          Signing you back in
        </h1>
        <p style={{ color: 'var(--fg2)', fontSize: 15, lineHeight: 1.6, maxWidth: 300, margin: 0 }}>
          Your session timed out while you were away. Hang on — this device is trusted, so this should be quick.
        </p>
        <div role="status" aria-live="polite" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg3)' }}>
          Redirecting to the identity service…
        </div>
        <a href={LOGIN_PATH} style={{ fontSize: 14, color: 'var(--fg2)' }}>
          Taking too long? Sign in manually →
        </a>
      </div>
    </div>
  )
}
