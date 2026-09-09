// mobile-d-sheets.md section 9 - "New plan", opened from the Plans FAB.
// Trip / Event picker, a serif title line, three dashed placeholder chips, an
// ink CTA and the footnote. The CTA creates the plan for real and opens it.

import { useState } from 'react'
import { useNavigate } from 'react-router'
import { usePlans } from '../../data/hooks'
import { paths } from '../../paths'
import { Button, Sheet } from '../../ui'
import type { PlanType } from '../../data/types'

const TYPES: { key: PlanType; title: string; sub: string }[] = [
  { key: 'Trip', title: 'Trip', sub: 'Days away. Itinerary, bookings, packing.' },
  { key: 'Event', title: 'Event', sub: 'One day. Schedule, guests, shopping.' },
]

const PLACEHOLDER_CHIPS = ['Dates, if you know them', 'Where', 'Cover photo']

export function NewPlanSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [planType, setPlanType] = useState<PlanType>('Trip')
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { createPlan } = usePlans()
  const navigate = useNavigate()

  const start = async () => {
    const name = title.trim()
    if (!name) {
      setError('Give it a name first.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const created = await createPlan({ name, type: planType === 'Event' ? 'event' : 'trip' })
      onClose()
      setTitle('')
      navigate(paths.plan(created.id))
    } catch {
      setError('Could not create the plan. Check the connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="New plan" aria-label="New plan">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {TYPES.map((t) => {
          const on = planType === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setPlanType(t.key)}
              aria-pressed={on}
              style={{
                padding: 14,
                borderRadius: 8,
                border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                background: on ? 'var(--accent-soft)' : 'transparent',
                color: 'var(--fg1)',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 500 }}>{t.title}</div>
              <div style={{ fontSize: 12, color: 'var(--fg2)', marginTop: 4, lineHeight: 1.4 }}>{t.sub}</div>
            </button>
          )
        })}
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What are we calling it?"
        aria-label="Plan name"
        style={{
          height: 48,
          border: 'none',
          borderBottom: '1px solid var(--border)',
          background: 'transparent',
          fontFamily: 'var(--font-serif)',
          fontSize: 26,
          color: 'var(--fg1)',
          padding: 0,
          borderRadius: 0,
          width: '100%',
        }}
      />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {PLACEHOLDER_CHIPS.map((c) => (
          <span
            key={c}
            style={{
              height: 32,
              padding: '0 12px',
              borderRadius: 4,
              border: '1px dashed var(--border)',
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: 13,
              color: 'var(--fg3)',
            }}
          >
            {c}
          </span>
        ))}
      </div>

      {error && <div style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</div>}
      <Button variant="ink" size="sheet" full disabled={submitting} onClick={() => void start()}>
        {submitting ? 'Creating…' : 'Start planning →'}
      </Button>
      <div style={{ fontSize: 12, color: 'var(--fg3)', textAlign: 'center' }}>Nothing else is required. Add the rest as you go.</div>
    </Sheet>
  )
}
