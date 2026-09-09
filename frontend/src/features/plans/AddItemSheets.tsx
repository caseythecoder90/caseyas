// mobile-d-sheets.md sections 5-8: the "+ Add to day" flow.
//   kinds  -> the six kind tiles + "Paste a confirmation instead"
//   flight -> the full Flight form (tall sheet), saves a booked flight item
//   stay   -> the full Stay form (tall sheet), saves a booked stay item
//   other kinds -> a minimal title step that saves a decided item
//   paste  -> "Review before saving" (static demo until the milestone 6 parser)
// Exactly one is visible at a time.

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { useParams } from 'react-router'
import { BOOKINGS, BOOKING_KINDS, PASTE_FIELDS } from '../../data/mock'
import { usePlan } from '../../data/hooks'
import type { BookingForm } from '../../data/types'
import { Button, Field, Input, PickerRow, Sheet, SheetBody, SheetFooter, SheetHeader, Toggle, useToast } from '../../ui'

const FLIGHT = BOOKINGS.find((b) => b.kind === 'flight')!
const STAY = BOOKINGS.find((b) => b.title === 'Yoshikawa Inn') ?? BOOKINGS.find((b) => b.kind === 'stay')!

const PASTED_TEXT =
  'Your booking is confirmed. Confirmation code Q7XR4M. JL0005 New York (JFK) 04 Feb 12:55 → Tokyo Haneda (HND) 05 Feb 16:15. Passengers: QUINN/CASEY, QUINN/YASMIM. Seats 34A 34B…'

/** mobile-d-sheets.md 7 - form helper lines are 11px, not the Field default 12px. */
const HINT = { fontSize: 11 } as const
const MONO_HINT = { ...HINT, fontFamily: 'var(--font-mono)' } as const

/** Borderless native pickers that sit inside the PickerRow shell. */
const DATE_INPUT: CSSProperties = { border: 'none', background: 'transparent', color: 'var(--fg1)', fontSize: 14, fontFamily: 'inherit', padding: 0 }
const TIME_INPUT: CSSProperties = { ...DATE_INPUT, fontFamily: 'var(--font-mono)', textAlign: 'right' }

const ERROR_LINE: CSSProperties = { fontSize: 12, color: 'var(--danger)' }

/** The four kinds without a designed form save through the minimal title step. */
type SimpleKind = 'transport' | 'activity' | 'food' | 'ticket'
const SIMPLE_KIND_FOR: Record<string, SimpleKind> = { Transport: 'transport', Activity: 'activity', Food: 'food', Ticket: 'ticket' }

/** ISO date for day N of a plan starting at `startIso` (yyyy-mm-dd), or ''. */
function dayDate(startIso: string | undefined, dayN: number): string {
  if (!startIso) return ''
  const [y, mo, da] = startIso.split('-').map(Number)
  const d = new Date(y, mo - 1, da + dayN - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function MetaRow({ label, children, first }: { label: string; children: ReactNode; first?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 44,
        fontSize: 14,
        borderTop: first ? undefined : '1px solid var(--border)',
        gap: 12,
      }}
    >
      <span style={{ color: 'var(--fg2)' }}>{label}</span>
      {children}
    </div>
  )
}

function Thumb() {
  return <span style={{ width: 24, height: 30, borderRadius: 3, background: 'var(--surface-2)', border: '1px solid var(--border)' }} />
}

function AddThumb() {
  return (
    <span
      style={{
        width: 24,
        height: 30,
        borderRadius: 3,
        border: '1px dashed var(--border)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--fg3)',
        fontSize: 12,
      }}
    >
      +
    </span>
  )
}

function NotesBlock({ text }: { text: string }) {
  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
      <div style={{ fontSize: 12, color: 'var(--fg2)', marginBottom: 4 }}>Notes</div>
      <div
        style={{
          minHeight: 64,
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          fontSize: 14,
          color: 'var(--fg1)',
          lineHeight: 1.5,
        }}
      >
        {text}
      </div>
    </div>
  )
}

export interface AddItemSheetsProps {
  form: BookingForm
  dayN: number
  onSetForm: (form: BookingForm) => void
  onClose: () => void
}

export function AddItemSheets({ form, dayN, onSetForm, onClose }: AddItemSheetsProps) {
  const { id: planId } = useParams()
  const { plan, m } = usePlan(planId)
  const toast = useToast()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ---- flight fields
  const [airline, setAirline] = useState('Japan Airlines')
  const [flightNo, setFlightNo] = useState(FLIGHT.title.split(' · ')[1] ?? 'JL 5')
  const [from, setFrom] = useState(FLIGHT.a ?? '')
  const [to, setTo] = useState(FLIGHT.b ?? '')
  const [depDate, setDepDate] = useState('')
  const [depTime, setDepTime] = useState('')
  const [arrDate, setArrDate] = useState('')
  const [arrTime, setArrTime] = useState('')
  const [seats, setSeats] = useState('34A, 34B')
  const [flightConf, setFlightConf] = useState(FLIGHT.conf)

  // ---- stay fields
  const [stayName, setStayName] = useState(STAY.title)
  const [stayAddr, setStayAddr] = useState(`${STAY.addr ?? ''} 604-8093`)
  const [inDate, setInDate] = useState('')
  const [outDate, setOutDate] = useState('')
  const [stayPhone, setStayPhone] = useState(STAY.seats)
  const [stayConf, setStayConf] = useState(STAY.conf)

  // ---- minimal second step for the four kinds without a designed form
  const [simpleKind, setSimpleKind] = useState<SimpleKind | null>(null)
  const [simpleTitle, setSimpleTitle] = useState('')

  // seed the date pickers from the day being added to whenever a form opens
  useEffect(() => {
    const d = dayDate(plan.start, dayN)
    setDepDate(d)
    setDepTime('')
    setArrDate('')
    setArrTime('')
    setInDate(d)
    setOutDate('')
    setError(null)
    setSimpleKind(null)
    setSimpleTitle('')
  }, [form, dayN, plan.start])

  const run = async (create: () => Promise<unknown>, failMessage: string) => {
    if (saving) return
    setSaving(true)
    setError(null)
    try {
      await create()
      setSimpleKind(null)
      onClose()
    } catch {
      setError(failMessage)
    } finally {
      setSaving(false)
    }
  }

  const saveFlight = () =>
    run(() => {
      const start = depDate && depTime ? `${depDate}T${depTime}` : undefined
      const end = arrDate && arrTime ? `${arrDate}T${arrTime}` : undefined
      const title =
        airline.trim() && flightNo.trim()
          ? `${airline.trim()} ${flightNo.trim()}`
          : flightNo.trim() && from.trim() && to.trim()
            ? `${flightNo.trim()} · ${from.trim()} → ${to.trim()}`
            : flightNo.trim() || airline.trim() || 'Flight'
      return m.createItem({
        kind: 'flight',
        title,
        status: 'booked',
        day: dayN,
        start,
        end,
        confirmation: flightConf.trim() || undefined,
        details: {
          type: 'flight',
          airline: airline.trim() || undefined,
          flightNumber: flightNo.trim() || undefined,
          fromAirport: from.trim() || undefined,
          toAirport: to.trim() || undefined,
          depart: start,
          arrive: end,
          seats: seats.trim() || undefined,
          pnr: flightConf.trim() || undefined,
        },
      })
    }, 'Could not save the flight. Try again.')

  const saveStay = () =>
    run(() => {
      const name = stayName.trim() || 'Stay'
      return m.createItem({
        kind: 'stay',
        title: name,
        status: 'booked',
        day: dayN,
        confirmation: stayConf.trim() || undefined,
        location: { name, address: stayAddr.trim() || undefined },
        details: {
          type: 'stay',
          checkIn: inDate || undefined,
          checkOut: outDate || undefined,
          phone: stayPhone.trim() || undefined,
        },
      })
    }, 'Could not save the stay. Try again.')

  const saveSimple = () => {
    const title = simpleTitle.trim()
    if (!title) {
      setError('Give it a name first.')
      return
    }
    if (!simpleKind) return
    void run(() => m.createItem({ kind: simpleKind, title, status: 'decided', day: dayN }), 'Could not save that. Try again.')
  }

  const simpleLabel = BOOKING_KINDS.find((k) => SIMPLE_KIND_FOR[k.label] === simpleKind)?.label ?? ''

  return (
    <>
      {/* ---------------------------------------------------------- kinds */}
      <Sheet open={form === 'kinds' && simpleKind == null} onClose={onClose} gap={14} aria-label={`Add to day ${dayN}`}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24 }}>Add to day {dayN}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {BOOKING_KINDS.map((k) => (
            <button
              key={k.abbr}
              type="button"
              onClick={() => {
                if (k.form) onSetForm(k.form)
                else {
                  setError(null)
                  setSimpleTitle('')
                  setSimpleKind(SIMPLE_KIND_FOR[k.label] ?? 'activity')
                }
              }}
              style={{
                height: 64,
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--fg1)',
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fg3)' }}>{k.abbr}</span>
              {k.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onSetForm('paste')}
          style={{
            height: 48,
            borderRadius: 8,
            border: '1px dashed var(--border)',
            background: 'transparent',
            color: 'var(--fg1)',
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="8" height="4" x="8" y="2" rx="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          </svg>
          Paste a confirmation instead
        </button>
        <div style={{ fontSize: 12, color: 'var(--fg3)', textAlign: 'center' }}>Flight and Stay forms are designed in full; the others follow the same shape.</div>
      </Sheet>

      {/* ------------------------------------------- minimal second step */}
      <Sheet open={form === 'kinds' && simpleKind != null} onClose={() => setSimpleKind(null)} gap={14} aria-label={`Add ${simpleLabel.toLowerCase()} to day ${dayN}`}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24 }}>
          {simpleLabel} · day {dayN}
        </div>
        <Field label="Title">
          <Input
            value={simpleTitle}
            onChange={(e) => setSimpleTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveSimple()
            }}
            placeholder="What is it?"
            aria-label={`${simpleLabel} title`}
          />
        </Field>
        {error && <div style={ERROR_LINE}>{error}</div>}
        <Button variant="primary" size="sheet" full disabled={saving} onClick={saveSimple}>
          {saving ? 'Saving…' : `Add to day ${dayN}`}
        </Button>
      </Sheet>

      {/* --------------------------------------------------------- flight */}
      <Sheet open={form === 'flight'} onClose={onClose} variant="tall" aria-label="Flight">
        <SheetHeader title="Flight" action="Cancel" onAction={onClose} />
        <SheetBody>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 8 }}>
            <Field label="Airline" value={airline} onChange={(e) => setAirline(e.target.value)} />
            <Field label="Flight no." mono value={flightNo} onChange={(e) => setFlightNo(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'end' }}>
            <Field label="From">
              <Input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                aria-label="From"
                style={{ height: 56, fontSize: 26, fontFamily: 'var(--font-serif)', textAlign: 'center' }}
              />
            </Field>
            <span style={{ color: 'var(--fg3)', paddingBottom: 16 }}>→</span>
            <Field label="To">
              <Input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                aria-label="To"
                style={{ height: 56, fontSize: 26, fontFamily: 'var(--font-serif)', textAlign: 'center' }}
              />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field label="Departs" hint={<span style={MONO_HINT}>America/New_York</span>}>
              <PickerRow
                left={<input type="date" value={depDate} onChange={(e) => setDepDate(e.target.value)} aria-label="Departure date" style={DATE_INPUT} />}
                right={<input type="time" value={depTime} onChange={(e) => setDepTime(e.target.value)} aria-label="Departure time" style={TIME_INPUT} />}
              />
            </Field>
            <Field label="Arrives" hint={<span style={MONO_HINT}>Asia/Tokyo · +1 day</span>}>
              <PickerRow
                left={<input type="date" value={arrDate} onChange={(e) => setArrDate(e.target.value)} aria-label="Arrival date" style={DATE_INPUT} />}
                right={<input type="time" value={arrTime} onChange={(e) => setArrTime(e.target.value)} aria-label="Arrival time" style={TIME_INPUT} />}
              />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field label="Seats" mono value={seats} onChange={(e) => setSeats(e.target.value)} />
            <Field label="Confirmation">
              <Input
                mono
                value={flightConf}
                onChange={(e) => setFlightConf(e.target.value)}
                aria-label="Confirmation"
                style={{ fontSize: 16, letterSpacing: '.12em' }}
              />
            </Field>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <MetaRow label="Place" first>
              <span>Terminal 1, JFK</span>
            </MetaRow>
            <MetaRow label="Cost">
              <span style={{ fontFamily: 'var(--font-mono)' }}>
                $1,840.00 <span style={{ color: 'var(--fg3)' }}>USD</span>
              </span>
            </MetaRow>
            <MetaRow label="Links">
              <span style={{ color: 'var(--accent)' }}>jal.co.jp/manage →</span>
            </MetaRow>
            <MetaRow label="Attachments">
              <span style={{ display: 'flex', gap: 6 }}>
                <Thumb />
                <Thumb />
                <AddThumb />
              </span>
            </MetaRow>
            <NotesBlock text="Premium economy. Check-in opens 24h before." />
          </div>
        </SheetBody>
        <SheetFooter>
          {error && <div style={ERROR_LINE}>{error}</div>}
          <Button variant="primary" size="sheet" full disabled={saving} onClick={() => void saveFlight()}>
            {saving ? 'Saving…' : `Save to day ${dayN}`}
          </Button>
        </SheetFooter>
      </Sheet>

      {/* ----------------------------------------------------------- stay */}
      <Sheet open={form === 'stay'} onClose={onClose} variant="tall" aria-label="Stay">
        <SheetHeader title="Stay" action="Cancel" onAction={onClose} />
        <SheetBody>
          <Field label="Name">
            <Input value={stayName} onChange={(e) => setStayName(e.target.value)} aria-label="Name" style={{ height: 48, fontSize: 18, fontFamily: 'var(--font-serif)' }} />
          </Field>
          <Field label="Address" value={stayAddr} onChange={(e) => setStayAddr(e.target.value)} hint={<span style={HINT}>Matched on the map · Kyoto</span>} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field label="Check in">
              <PickerRow
                left={<input type="date" value={inDate} onChange={(e) => setInDate(e.target.value)} aria-label="Check-in date" style={DATE_INPUT} />}
                right="3:00 PM"
              />
            </Field>
            <Field label="Check out">
              <PickerRow
                left={<input type="date" value={outDate} onChange={(e) => setOutDate(e.target.value)} aria-label="Check-out date" style={DATE_INPUT} />}
                right="11:00 AM"
              />
            </Field>
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: -6 }}>3 nights · appears on days 10 – 13</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field label="Phone" mono value={stayPhone} onChange={(e) => setStayPhone(e.target.value)} />
            <Field label="Confirmation">
              <Input mono value={stayConf} onChange={(e) => setStayConf(e.target.value)} aria-label="Confirmation" style={{ letterSpacing: '.06em' }} />
            </Field>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <MetaRow label="Cost" first>
              <span style={{ fontFamily: 'var(--font-mono)' }}>
                ¥186,000 <span style={{ color: 'var(--fg3)' }}>≈ $1,255</span>
              </span>
            </MetaRow>
            <MetaRow label="Paid">
              <Toggle on={false} shadowKnob aria-label="Paid" />
            </MetaRow>
            <MetaRow label="Attachments">
              <span style={{ display: 'flex', gap: 6 }}>
                <Thumb />
                <AddThumb />
              </span>
            </MetaRow>
            <NotesBlock text="Kaiseki dinner included both nights. Tell them about the shellfish thing." />
          </div>
        </SheetBody>
        <SheetFooter>
          {error && <div style={ERROR_LINE}>{error}</div>}
          <Button variant="primary" size="sheet" full disabled={saving} onClick={() => void saveStay()}>
            {saving ? 'Saving…' : 'Save stay'}
          </Button>
        </SheetFooter>
      </Sheet>

      {/* ---------------------------------------------------------- paste */}
      <Sheet open={form === 'paste'} onClose={onClose} variant="tall" aria-label="Review before saving">
        <SheetHeader title="Review before saving" action="Discard" onAction={onClose}>
          <div style={{ fontSize: 12, color: 'var(--fg3)', lineHeight: 1.5 }}>
            Read from the text you pasted, on this device. Nothing was sent anywhere. Check every field — it guesses.
          </div>
        </SheetHeader>
        <SheetBody style={{ gap: 12 }}>
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--fg3)',
              lineHeight: 1.6,
              maxHeight: 72,
              overflow: 'hidden',
            }}
          >
            {PASTED_TEXT}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                color: 'var(--green)',
                border: '1px solid var(--green)',
                padding: '2px 6px',
                borderRadius: 3,
              }}
            >
              Flight
            </span>
            <span style={{ color: 'var(--fg2)' }}>detected · 7 of 8 fields</span>
          </div>
          {PASTE_FIELDS.map((pf) => (
            <div
              key={pf.k}
              style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr auto',
                gap: 10,
                alignItems: 'center',
                padding: '10px 0',
                borderTop: '1px solid var(--border)',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--fg2)' }}>{pf.k}</span>
              <span
                style={{
                  fontSize: 14,
                  fontFamily: pf.mono ? 'var(--font-mono)' : 'inherit',
                  color: pf.tag === 'add' ? 'var(--fg3)' : 'var(--fg1)',
                }}
              >
                {pf.v}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  color: pf.tag === 'ok' ? 'var(--green)' : 'var(--accent)',
                  whiteSpace: 'nowrap',
                }}
              >
                {pf.tag}
              </span>
            </div>
          ))}
        </SheetBody>
        <SheetFooter style={{ flexDirection: 'row', gap: 8 }}>
          <Button size="sheet" style={{ flex: 1 }} onClick={() => onSetForm('flight')}>
            Edit fields
          </Button>
          <Button
            variant="primary"
            size="sheet"
            style={{ flex: 1 }}
            onClick={() => {
              toast.show('Parser arrives with milestone 6')
              onClose()
            }}
          >
            Save flight
          </Button>
        </SheetFooter>
      </Sheet>
    </>
  )
}
