// Plan-level edit and delete (architecture section 7 API surface: PATCH and
// DELETE /api/plans/{id}), reached from the mobile More sheet and the desktop
// "···" menu. Edit: name, type (read-only), dates, destinations as comma-
// separated chips, status, the local currency and the
// manual rate -> m.updatePlan. Delete: the design's confirm dialog
// (mobile-d-sheets.md section 4) -> m.deletePlan, then back to /plans.

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import type { ServerPlanStatus } from '../../data/api/plansApi'
import { usePlan } from '../../data/hooks'
import { HER } from '../../people'
import { paths } from '../../paths'
import { Button, Field, Input, PAPER, Sheet, SheetBody, SheetFooter, SheetHeader, useToast } from '../../ui'

const STATUSES: ServerPlanStatus[] = ['dreaming', 'planning', 'booked', 'underway', 'done']

const SELECT = {
  height: 44,
  width: '100%',
  padding: '0 12px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--fg1)',
  fontSize: 14,
  fontFamily: 'inherit',
} as const

const DATE_INPUT = { border: 'none', background: 'transparent', color: 'var(--fg1)', fontSize: 14, fontFamily: 'inherit', padding: 0, width: '100%' } as const

const splitDests = (s: string) =>
  s
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean)

export function PlanEditSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { id } = useParams()
  const { serverPlan, m } = usePlan(id)
  const toast = useToast()

  const [name, setName] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [timezone, setTimezone] = useState('')
  const [dests, setDests] = useState('')
  const [status, setStatus] = useState<ServerPlanStatus>('planning')
  const [rate, setRate] = useState('')
  const [localCurrency, setLocalCurrency] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !serverPlan) return
    setName(serverPlan.name)
    setDateStart(serverPlan.dateStart ?? '')
    setDateEnd(serverPlan.dateEnd ?? '')
    setTimezone(serverPlan.timezone ?? '')
    setDests(serverPlan.destinations.map((d) => d.name).join(', '))
    setStatus(serverPlan.status)
    setRate(serverPlan.currency?.rate != null ? String(serverPlan.currency.rate) : '')
    setLocalCurrency(serverPlan.currency?.local ?? '')
    setError(null)
    setSaving(false)
  }, [open, serverPlan])

  const chips = splitDests(dests)
  const home = serverPlan?.currency?.home ?? 'USD'
  const local = localCurrency.trim().toUpperCase() || undefined
  const localChanged = local !== (serverPlan?.currency?.local ?? undefined)

  const save = async () => {
    if (saving) return
    const n = name.trim()
    if (!n) {
      setError('A plan needs a name.')
      return
    }
    if (dateStart && dateEnd && dateEnd < dateStart) {
      setError('The end is before the start.')
      return
    }
    const r = rate.trim() === '' ? undefined : Number(rate)
    if (r != null && (!Number.isFinite(r) || r <= 0)) {
      setError('The rate needs to be a number above zero.')
      return
    }
    if (local && !/^[A-Z]{3}$/.test(local)) {
      setError('The currency is a three-letter code, like JPY.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await m.updatePlan({
        name: n,
        dateStart: dateStart || undefined,
        dateEnd: dateEnd || undefined,
        timezone: timezone.trim() || undefined,
        destinations: chips,
        status,
        rate: r,
        localCurrency: localChanged ? local : undefined,
      })
      toast.show('Plan saved')
      onClose()
    } catch {
      setError('Could not save the plan. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} variant="tall" aria-label="Edit plan">
      <SheetHeader title="Edit plan" action="Cancel" onAction={onClose} />
      <SheetBody>
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} aria-label="Plan name" style={{ height: 48, fontSize: 20, fontFamily: 'var(--font-serif)' }} />
        </Field>
        <Field label="Type" hint="A plan keeps its type. Start another for the other kind.">
          <div style={{ ...SELECT, display: 'flex', alignItems: 'center', color: 'var(--fg2)' }}>{serverPlan?.type === 'event' ? 'Event' : 'Trip'}</div>
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Field label="Starts">
            <div style={{ ...SELECT, display: 'flex', alignItems: 'center' }}>
              <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} aria-label="Start date" style={DATE_INPUT} />
            </div>
          </Field>
          <Field label="Ends">
            <div style={{ ...SELECT, display: 'flex', alignItems: 'center' }}>
              <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} aria-label="End date" style={DATE_INPUT} />
            </div>
          </Field>
        </div>
        <Field label="Timezone" mono value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="Asia/Tokyo" hint="Where the days are counted; Today mode's clock." />
        <Field label="Destinations" hint="Comma-separated, in the order you go.">
          <Input value={dests} onChange={(e) => setDests(e.target.value)} placeholder="Tokyo, Hakuba, Kyoto" aria-label="Destinations" />
          {chips.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {chips.map((c) => (
                <span
                  key={c}
                  style={{ height: 26, padding: '0 10px', borderRadius: 4, border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', fontSize: 12, color: 'var(--fg2)' }}
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </Field>
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as ServerPlanStatus)} aria-label="Status" style={SELECT}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Field
            label="Local currency"
            mono
            value={localCurrency}
            onChange={(e) => setLocalCurrency(e.target.value)}
            placeholder="JPY"
            maxLength={3}
            hint={`Home stays ${home}.`}
          />
          <Field label={`Rate · ${local ?? '…'} per ${home}`} mono value={rate} onChange={(e) => setRate(e.target.value)} inputMode="decimal" placeholder="148.2" disabled={!local} />
        </div>
      </SheetBody>
      <SheetFooter>
        {error && <div style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</div>}
        <Button variant="primary" size="sheet" full disabled={saving || !serverPlan} onClick={() => void save()}>
          {saving ? 'Saving…' : 'Save plan'}
        </Button>
      </SheetFooter>
    </Sheet>
  )
}

export function DeletePlanSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { id } = useParams()
  const { serverPlan, m } = usePlan(id)
  const navigate = useNavigate()
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remove = async () => {
    if (busy || !serverPlan) return
    setBusy(true)
    setError(null)
    const name = serverPlan.name
    try {
      await m.deletePlan()
      onClose()
      navigate(paths.plans, { replace: true })
      toast.show(`Deleted · ${name}`)
    } catch {
      setError('Could not delete the plan. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} variant="dialog" aria-label="Delete this plan?">
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, lineHeight: 1.1 }}>Delete {serverPlan?.name ?? 'this plan'}?</div>
      <div style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.5 }}>
        Every item, checklist and document in it goes too. {HER} will see it's gone. This can't be undone.
      </div>
      {error && <div style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <Button style={{ flex: 1 }} onClick={onClose} disabled={busy}>
          Keep it
        </Button>
        <button
          type="button"
          onClick={() => void remove()}
          disabled={busy}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 8,
            border: 'none',
            background: 'var(--danger)',
            color: PAPER,
            fontSize: 14,
            fontWeight: 500,
            cursor: busy ? 'default' : 'pointer',
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </Sheet>
  )
}
