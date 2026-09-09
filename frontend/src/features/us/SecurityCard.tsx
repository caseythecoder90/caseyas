// Security: the five designed rows (mobile-c section 5) — static, no tap
// action, every row including the first carrying the hairline, as designed.
// The screen-9 hand-off (identity-pages.md: "account console, Security; app
// links here from Us") is one explicit accent row appended to the card, so the
// five status values stay values instead of becoming link targets. The row is
// only rendered once the console address is known.

import type { SecurityRow } from '../../data/types'
import { Eyebrow } from '../../ui'
import { useAccountUrl } from './accountConsole'
import { ACCOUNT_CONSOLE_ROW } from './copy'
import { HAIRLINE } from './SettingsRows'

const ROW_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '14px 16px',
  borderTop: HAIRLINE,
  minHeight: 52,
} as const

export function SecurityCard({ rows }: { rows: SecurityRow[] }) {
  const href = useAccountUrl()
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
        {href !== undefined && (
          <a
            href={href}
            style={{
              ...ROW_STYLE,
              justifyContent: 'space-between',
              color: 'var(--accent)',
              textDecoration: 'none',
              fontSize: 15,
            }}
          >
            <span>{ACCOUNT_CONSOLE_ROW}</span>
            <span aria-hidden="true" style={{ flex: 'none' }}>
              →
            </span>
          </a>
        )}
      </div>
    </section>
  )
}
