// mobile-b-plans.md 2.9 / desktop.md 7.2 - Budget: three totals in both
// currencies, category rows, and the plan's manual exchange rate (home ->
// local, from the plan's currency record). Typing a rate and leaving the
// field saves it through m.setRate; there is no live FX lookup by design
// (architecture section 7, "a rate typed once is accurate enough").

import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { usePlan } from '../../data/hooks'
import type { Budget } from '../../data/types'
import { Bar } from './bits'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function setByLine(rateSetAt?: string | null): string {
  if (!rateSetAt) return 'no rate yet · type one to see local totals'
  const d = new Date(rateSetAt)
  if (Number.isNaN(d.getTime())) return 'set by hand'
  return `set by hand on ${MONTHS[d.getMonth()]} ${d.getDate()}`
}

export function SegBudget({ budget, variant = 'mobile' }: { budget: Budget; variant?: 'mobile' | 'desktop' }) {
  const desktop = variant === 'desktop'
  const { id } = useParams()
  const { serverPlan, m } = usePlan(id)
  const home = serverPlan?.currency?.home ?? 'USD'
  const local = serverPlan?.currency?.local ?? null

  const [rate, setRate] = useState(budget.rate)
  const [busy, setBusy] = useState(false)
  const [savedNow, setSavedNow] = useState(false)
  const [rateError, setRateError] = useState<string | null>(null)

  // follow the server once it answers (the first render may be the skeleton)
  useEffect(() => {
    setRate(budget.rate)
  }, [budget.rate])

  const commitRate = async () => {
    const text = rate.trim()
    if (text === budget.rate || busy) return
    const parsed = Number(text)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setRateError('Enter a number above zero.')
      return
    }
    setRateError(null)
    setBusy(true)
    try {
      await m.setRate(parsed)
      setSavedNow(true)
    } catch {
      setRateError('Could not save the rate.')
    } finally {
      setBusy(false)
    }
  }

  const note = busy ? 'saving…' : savedNow ? 'set by hand just now' : setByLine(serverPlan?.currency?.rateSetAt)

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

  const rowsBlock =
    budget.rows.length === 0 ? (
      <div style={{ fontSize: 13, color: 'var(--fg3)', lineHeight: 1.5 }}>Nothing costed yet. Add a cost to any item and it lands here.</div>
    ) : (
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
      onChange={(e) => {
        setRate(e.target.value)
        setSavedNow(false)
      }}
      onBlur={() => void commitRate()}
      onKeyDown={(e) => {
        if (e.key === 'Enter') void commitRate()
      }}
      disabled={busy || !local}
      aria-label={`Exchange rate, ${local ?? 'local'} per ${home}`}
      inputMode="decimal"
      placeholder="—"
      style={{
        width: 72,
        border: 'none',
        borderBottom: '1px solid var(--border)',
        background: 'transparent',
        fontFamily: 'var(--font-mono)',
        fontSize: 14,
        color: 'var(--fg1)',
        padding: '2px 0',
        borderRadius: 0,
        textAlign: 'center',
      }}
    />
  )

  const rateCard = local ? (
    <>
      <div style={{ fontSize: 14 }}>
        1 {home} = {rateInput} {local}
      </div>
      <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 4 }}>{note}</div>
      {rateError && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{rateError}</div>}
    </>
  ) : (
    <div style={{ fontSize: 12, color: 'var(--fg3)', lineHeight: 1.5 }}>Totals in {home}. A local currency is picked when a plan is created.</div>
  )

  if (desktop) {
    return (
      <div style={{ padding: '24px 40px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignContent: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {totalsBlock}
          {rowsBlock}
        </div>
        <div style={{ padding: '16px 18px', borderRadius: 8, border: '1px solid var(--border)', alignSelf: 'start' }}>{rateCard}</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {totalsBlock}
      {rowsBlock}
      <div style={{ padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>{rateCard}</div>
    </div>
  )
}
