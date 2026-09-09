// Security. Honest by default: one row saying that passkeys, the authenticator
// and devices live in Keycloak's account console (identity-pages.md screen 9:
// "account console, Security; app links here from Us"), linked once the
// console address is known (useAccountUrl). With the design preview on, the
// five designed status rows (mobile-c section 5) render above the accent
// hand-off row exactly as before - static, every row carrying the hairline.

import type { SecurityRow } from '../../data/types'
import { Eyebrow } from '../../ui'
import { useAccountUrl } from './accountConsole'
import { ACCOUNT_CONSOLE_ROW, SECURITY_LIVES_IN_CONSOLE } from './copy'
import { HAIRLINE } from './SettingsRows'

const ROW_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '14px 16px',
  borderTop: HAIRLINE,
  minHeight: 52,
} as const

/** `rows` empty = the honest single row; non-empty = the design preview's five rows plus the hand-off. */
export function SecurityCard({ rows }: { rows: SecurityRow[] }) {
  const href = useAccountUrl()
  const preview = rows.length > 0
  return (
    <section>
      <Eyebrow as="h2" style={{ margin: '0 0 8px', fontWeight: 400 }}>
        Security
      </Eyebrow>
      <div className="card">
        {rows.map((r) => (
          <div key={r.t} style={ROW_STYLE}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15 }}>{r.t}</div>
              <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2 }}>{r.d}</div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: r.c, flex: 'none' }}>{r.r}</span>
          </div>
        ))}
        {preview ? (
          href !== undefined && (
            <a href={href} style={{ ...ROW_STYLE, justifyContent: 'space-between', color: 'var(--accent)', textDecoration: 'none', fontSize: 15 }}>
              <span>{ACCOUNT_CONSOLE_ROW}</span>
              <span aria-hidden="true" style={{ flex: 'none' }}>
                →
              </span>
            </a>
          )
        ) : href !== undefined ? (
          <a
            href={href}
            style={{ ...ROW_STYLE, borderTop: 'none', justifyContent: 'space-between', color: 'var(--accent)', textDecoration: 'none', fontSize: 15 }}
          >
            <span>{SECURITY_LIVES_IN_CONSOLE}</span>
            <span aria-hidden="true" style={{ flex: 'none' }}>
              →
            </span>
          </a>
        ) : (
          <div style={{ ...ROW_STYLE, borderTop: 'none', fontSize: 15, color: 'var(--fg2)' }}>{SECURITY_LIVES_IN_CONSOLE}.</div>
        )}
      </div>
    </section>
  )
}
