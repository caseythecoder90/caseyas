// mobile-b-plans.md 2.9 / desktop.md 7.2 - Budget: three totals in both
// currencies, category rows, and the editable USD -> JPY rate.

import { useState } from 'react'
import { useParams } from 'react-router'
import { BUDGET_RATE_NOTE } from '../../data/mock'
import { usePlan } from '../../data/hooks'
import type { Budget } from '../../data/types'
import { Bar } from './bits'

// "set by you on Sep 6 · use today’s rate" — the second half is the reset link.
const [RATE_SET_BY = '', RATE_RESET = ''] = BUDGET_RATE_NOTE.split(' · ')
const RATE_RESET_LABEL = RATE_RESET.charAt(0).toUpperCase() + RATE_RESET.slice(1)

const LINK_BUTTON = {
  font: 'inherit',
  color: 'var(--accent)',
  border: 'none',
  background: 'transparent',
  padding: 0,
  cursor: 'pointer',
} as const

export function SegBudget({ budget, variant = 'mobile' }: { budget: Budget; variant?: 'mobile' | 'desktop' }) {
  const desktop = variant === 'desktop'
  const { id } = useParams()
  const { m } = usePlan(id)
  const [rate, setRate] = useState(budget.rate)
  const [savedNow, setSavedNow] = useState(false)
  const [rateError, setRateError] = useState<string | null>(null)

  const commitRate = async () => {
    const parsed = parseFloat(rate)
    if (!Number.isFinite(parsed) || parsed <= 0 || String(parsed) === budget.rate) return
    setRateError(null)
    try {
      await m.setRate(parsed)
      setSavedNow(true)
    } catch {
      setRateError('Could not save the rate.')
    }
  }

  const setByLine = savedNow ? 'set by you just now' : RATE_SET_BY

  const totals = [
    { l: 'Planned', usd: budget.planned, jpy: budget.plannedJpy },
    { l: 'Committed', usd: budget.committed, jpy: budget.committedJpy },
    { l: 'Paid', usd: budget.paid, jpy: budget.paidJpy },
  ]

  const totalsBlock = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: desktop ? 12 : 8 }}>
      {totals.map((t) => (
        <div key={t.l} style={{ padding: desktop ? '16px 18px' : 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--fg3)' }}>{t.l}</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: desktop ? 34 : 24, lineHeight: 1.1, marginTop: desktop ? 8 : 6 }}>{t.usd}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: desktop ? 12 : 11, color: 'var(--fg3)', marginTop: 2 }}>{t.jpy}</div>
        </div>
      ))}
    </div>
  )

  const rowsBlock = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {budget.rows.map(([k, v, pct]) => (
        <div
          key={k}
          style={{
            display: 'grid',
            gridTemplateColumns: desktop ? '120px 1fr auto' : '90px 1fr auto',
            gap: desktop ? 16 : 12,
            alignItems: 'center',
            padding: desktop ? '12px 0' : '10px 0',
            borderTop: '1px solid var(--border)',
            fontSize: 14,
          }}
        >
          <span>{k}</span>
          <Bar pct={`${pct}%`} height={4} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: desktop ? 13 : 12 }}>{v}</span>
        </div>
      ))}
    </div>
  )

  const rateInput = (
    <input
      value={rate}
      onChange={(e) => setRate(e.target.value)}
      onBlur={() => void commitRate()}
      onKeyDown={(e) => {
        if (e.key === 'Enter') void commitRate()
      }}
      aria-label="Exchange rate, JPY per USD"
      inputMode="decimal"
      style={{
        width: 64,
        border: 'none',
        borderBottom: '1px solid var(--border)',
        background: 'transparent',
        fontFamily: 'var(--font-mono)',
        fontSize: 14,
        color: 'var(--fg1)',
        padding: '2px 0',
        borderRadius: 0,
      }}
    />
  )

  if (desktop) {
    return (
      <div style={{ padding: '24px 40px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignContent: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {totalsBlock}
          {rowsBlock}
        </div>
        <div style={{ padding: '16px 18px', borderRadius: 8, border: '1px solid var(--border)', alignSelf: 'start' }}>
          <div style={{ fontSize: 14 }}>1 USD = {rateInput} JPY</div>
          <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 4 }}>
            {setByLine} ·{' '}
            <button type="button" onClick={() => setRate(budget.rate)} style={LINK_BUTTON}>
              {RATE_RESET}
            </button>
          </div>
          {rateError && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{rateError}</div>}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {totalsBlock}
      {rowsBlock}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border)', gap: 12 }}>
        <div>
          <div style={{ fontSize: 14 }}>1 USD = {rateInput} JPY</div>
          <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2 }}>{setByLine}</div>
          {rateError && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 2 }}>{rateError}</div>}
        </div>
        <button type="button" onClick={() => setRate(budget.rate)} style={{ ...LINK_BUTTON, fontSize: 13, whiteSpace: 'nowrap' }}>
          {RATE_RESET_LABEL}
        </button>
      </div>
    </div>
  )
}
