// One form for every item kind, in create and edit mode (mobile-d-sheets.md
// sections 6 and 7 for Flight and Stay; the four simple kinds follow the same
// shape with modest specifics). Every static "meta row" of the design is a
// real input here: place, cost (amount + home/local currency + paid), links
// (with the server's preview), attachments (real uploads) and notes. Nothing
// is prefilled from mock data; a new form starts empty except the day and date
// it is being added to. Saves through m.createItem or m.updateItem (PATCH).

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useParams } from 'react-router'
import type { CreateItemInput, LinkPreview, ServerDetails, ServerItem, ServerLocation, UpdateItemInput } from '../../data/api/plansApi'
import { daysBetween } from '../../data/dates'
import { usePlan } from '../../data/hooks'
import { Button, Field, Input, KIND_LABEL, PickerRow, Sheet, SheetBody, SheetFooter, SheetHeader, Toggle } from '../../ui'

export type FormKind = 'flight' | 'stay' | 'transport' | 'activity' | 'food' | 'ticket'

const FORM_KINDS: FormKind[] = ['flight', 'stay', 'transport', 'activity', 'food', 'ticket']

/** The form an existing item edits with; ideas and notes open as an activity and pick their kind in the form. */
export const formKindOf = (item: ServerItem): FormKind => (FORM_KINDS.includes(item.kind as FormKind) ? (item.kind as FormKind) : 'activity')

export interface ItemFormProps {
  open: boolean
  kind: FormKind
  /** the day being added to (create mode) */
  dayN?: number
  /** the item being edited; null / undefined creates */
  editing?: ServerItem | null
  onClose: () => void
  onSaved?: (item: ServerItem) => void
}

// ---------------------------------------------------------------- helpers

/** ISO date for day N of a plan starting at `startIso` (yyyy-mm-dd), or ''. */
export function dayDate(startIso: string | null | undefined, dayN: number): string {
  if (!startIso) return ''
  const [y, mo, da] = startIso.split('-').map(Number)
  const d = new Date(y, mo - 1, da + dayN - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const deviceZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return ''
  }
}

const datePart = (iso?: string | null) => (iso ? iso.slice(0, 10) : '')
const timePart = (iso?: string | null) => (iso && iso.length >= 16 ? iso.slice(11, 16) : '')
const joinDT = (date: string, time: string) => (date && time ? `${date}T${time}` : undefined)

const TRANSPORT_MODES = ['train', 'bus', 'car', 'ferry', 'other'] as const

interface Attachment {
  id: string
  name: string
  thumb?: string
}

interface Fields {
  title: string
  placeName: string
  placeAddress: string
  day: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  costAmount: string
  costCurrency: string
  paid: boolean
  confirmation: string
  notes: string
  links: LinkPreview[]
  attachments: Attachment[]
  booked: boolean
  // flight
  airline: string
  flightNo: string
  fromAirport: string
  toAirport: string
  seats: string
  // stay
  phone: string
  roomInfo: string
  // transport
  mode: string
  from: string
  to: string
  passInfo: string
  // food / ticket / activity
  partySize: string
  quantity: string
  duration: string
}

function blank(kind: FormKind, dayN: number | undefined, planStart: string | null | undefined, homeCurrency: string): Fields {
  const date = dayN ? dayDate(planStart, dayN) : ''
  return {
    title: '',
    placeName: '',
    placeAddress: '',
    day: dayN ? String(dayN) : '',
    startDate: date,
    startTime: kind === 'stay' ? '15:00' : '',
    endDate: '',
    endTime: kind === 'stay' ? '11:00' : '',
    costAmount: '',
    costCurrency: homeCurrency,
    paid: false,
    confirmation: '',
    notes: '',
    links: [],
    attachments: [],
    booked: kind === 'flight' || kind === 'stay',
    airline: '',
    flightNo: '',
    fromAirport: '',
    toAirport: '',
    seats: '',
    phone: '',
    roomInfo: '',
    mode: 'train',
    from: '',
    to: '',
    passInfo: '',
    partySize: '',
    quantity: '',
    duration: '',
  }
}

function fromItem(item: ServerItem, kind: FormKind, homeCurrency: string, attachmentsOf: (ids: string[]) => Attachment[]): Fields {
  const f = blank(kind, item.day ?? undefined, undefined, homeCurrency)
  const d = item.details
  f.title = item.title
  f.placeName = item.location?.name ?? ''
  f.placeAddress = item.location?.address ?? ''
  f.day = item.day != null ? String(item.day) : ''
  f.startDate = datePart(item.start)
  f.startTime = timePart(item.start)
  f.endDate = datePart(item.end)
  f.endTime = timePart(item.end)
  f.costAmount = item.cost ? String(item.cost.amount) : ''
  f.costCurrency = item.cost?.currency ?? homeCurrency
  f.paid = item.cost?.paid ?? false
  f.confirmation = item.confirmation ?? ''
  f.notes = item.notes ?? ''
  f.links = item.links ?? []
  f.attachments = attachmentsOf(item.attachmentIds ?? [])
  f.booked = item.status === 'booked' || item.status === 'done'
  if (d?.type === 'flight') {
    f.airline = d.airline ?? ''
    f.flightNo = d.flightNumber ?? ''
    f.fromAirport = d.fromAirport ?? ''
    f.toAirport = d.toAirport ?? ''
    f.seats = d.seats ?? ''
    if (d.depart) {
      f.startDate = datePart(d.depart)
      f.startTime = timePart(d.depart)
    }
    if (d.arrive) {
      f.endDate = datePart(d.arrive)
      f.endTime = timePart(d.arrive)
    }
  } else if (d?.type === 'stay') {
    f.phone = d.phone ?? ''
    f.roomInfo = d.roomInfo ?? ''
    if (d.checkIn) f.startDate = d.checkIn
    if (d.checkOut) f.endDate = d.checkOut
    if (!f.startTime) f.startTime = '15:00'
    if (!f.endTime) f.endTime = '11:00'
  } else if (d?.type === 'transport') {
    f.mode = d.mode ?? 'train'
    f.from = d.from ?? ''
    f.to = d.to ?? ''
    f.passInfo = d.passInfo ?? ''
    if (d.depart) {
      f.startDate = datePart(d.depart)
      f.startTime = timePart(d.depart)
    }
    if (d.arrive) {
      f.endDate = datePart(d.arrive)
      f.endTime = timePart(d.arrive)
    }
  } else if (d?.type === 'food') {
    f.partySize = d.partySize != null ? String(d.partySize) : ''
  } else if (d?.type === 'ticket') {
    f.quantity = d.quantity != null ? String(d.quantity) : ''
  } else if (d?.type === 'activity') {
    f.duration = d.durationMinutes != null ? String(d.durationMinutes) : ''
  }
  return f
}

// ---------------------------------------------------------------- styles

/** mobile-d-sheets.md 7: form helper lines are 11px, not the Field default 12px. */
const HINT: CSSProperties = { fontSize: 11 }
const MONO_HINT: CSSProperties = { ...HINT, fontFamily: 'var(--font-mono)' }

/** Borderless native pickers that sit inside the PickerRow shell. */
const DATE_INPUT: CSSProperties = { border: 'none', background: 'transparent', color: 'var(--fg1)', fontSize: 14, fontFamily: 'inherit', padding: 0, minWidth: 0 }
const TIME_INPUT: CSSProperties = { ...DATE_INPUT, fontFamily: 'var(--font-mono)', textAlign: 'right' }
const SELECT: CSSProperties = {
  height: 44,
  width: '100%',
  padding: '0 12px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--fg1)',
  fontSize: 14,
  fontFamily: 'inherit',
}
const ERROR_LINE: CSSProperties = { fontSize: 12, color: 'var(--danger)' }
const QUIET_LINE: CSSProperties = { fontSize: 12, color: 'var(--fg3)', lineHeight: 1.5 }
const ROUTE_INPUT: CSSProperties = { height: 56, fontSize: 26, fontFamily: 'var(--font-serif)', textAlign: 'center' }

function MetaRow({ label, children, first, tall }: { label: string; children: ReactNode; first?: boolean; tall?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 44,
        padding: tall ? '8px 0' : 0,
        fontSize: 14,
        borderTop: first ? undefined : '1px solid var(--border)',
        gap: 12,
      }}
    >
      <span style={{ color: 'var(--fg2)', flex: 'none' }}>{label}</span>
      {children}
    </div>
  )
}

function DateTimeRow({ date, time, onDate, onTime, label }: { date: string; time: string; onDate: (v: string) => void; onTime: (v: string) => void; label: string }) {
  return (
    <PickerRow
      left={<input type="date" value={date} onChange={(e) => onDate(e.target.value)} aria-label={`${label} date`} style={DATE_INPUT} />}
      right={<input type="time" value={time} onChange={(e) => onTime(e.target.value)} aria-label={`${label} time`} style={TIME_INPUT} />}
    />
  )
}

// ---------------------------------------------------------------- the form

export function ItemForm({ open, kind, dayN, editing, onClose, onSaved }: ItemFormProps) {
  const { id: planId } = useParams()
  const { serverPlan, days, docs, m } = usePlan(planId)
  const homeCurrency = serverPlan?.currency?.home ?? 'USD'
  const localCurrency = serverPlan?.currency?.local
  const currencies = [...new Set([homeCurrency, localCurrency].filter((c): c is string => !!c))]
  const tz = editing?.timezone ?? serverPlan?.timezone ?? deviceZone()
  const isEdit = !!editing
  // an idea or note being edited picks the kind it becomes (architecture 7: "its kind changes")
  const [k, setK] = useState<FormKind>(kind)
  const label = KIND_LABEL[k]
  const kindChoice = editing?.kind === 'idea' || editing?.kind === 'note'

  const attachmentsOf = (ids: string[]): Attachment[] =>
    ids.map((id) => {
      const doc = docs.find((d) => d.id === id)
      return { id, name: doc?.name ?? 'Attachment', thumb: doc?.thumb }
    })

  const [f, setF] = useState<Fields>(() => blank(kind, dayN, serverPlan?.dateStart, homeCurrency))
  const set = (patch: Partial<Fields>) => setF((prev) => ({ ...prev, ...patch }))

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [linkDraft, setLinkDraft] = useState('')
  const [linkBusy, setLinkBusy] = useState(false)
  const [uploadBusy, setUploadBusy] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // (re)seed whenever the sheet opens for a target
  useEffect(() => {
    if (!open) return
    setK(kind)
    setF(editing ? fromItem(editing, kind, homeCurrency, attachmentsOf) : blank(kind, dayN, serverPlan?.dateStart, homeCurrency))
    setError(null)
    setUploadError(null)
    setLinkDraft('')
    setSaving(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing?.id, kind, dayN])

  // ---- links
  const addLink = async () => {
    const url = linkDraft.trim()
    if (!url || linkBusy) return
    setLinkBusy(true)
    let preview: LinkPreview = { url }
    try {
      preview = await m.linkPreview(url)
    } catch {
      // the bare url is still worth keeping
    } finally {
      setLinkBusy(false)
    }
    setF((prev) => (prev.links.some((l) => l.url === preview.url) ? prev : { ...prev, links: [...prev.links, preview] }))
    setLinkDraft('')
  }
  const removeLink = (url: string) => set({ links: f.links.filter((l) => l.url !== url) })

  // ---- attachments
  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || uploadBusy) return
    setUploadBusy(true)
    setUploadError(null)
    try {
      const uploaded = await m.upload(files)
      setF((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...uploaded.map((u) => ({ id: u.id, name: u.originalName, thumb: u.urls?.thumb ?? undefined }))],
      }))
    } catch {
      setUploadError("That upload didn't make it. The file store may not be set up yet; everything else still saves.")
    } finally {
      setUploadBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }
  const removeAttachment = (id: string) => set({ attachments: f.attachments.filter((a) => a.id !== id) })

  // ---- derived
  const nightsLine = (() => {
    if (k !== 'stay' || !f.startDate || !f.endDate) return ''
    const nights = daysBetween(f.startDate, f.endDate)
    if (nights <= 0) return ''
    const text = `${nights} night${nights === 1 ? '' : 's'}`
    if (!serverPlan?.dateStart || days.length === 0) return text
    const x = daysBetween(serverPlan.dateStart, f.startDate) + 1
    const y = x + nights
    if (x < 1 || y > days.length) return text
    return `${text} · days ${x} – ${y}`
  })()

  // ---- save
  const build = (): { create: CreateItemInput; patch: UpdateItemInput } | null => {
    const t = (s: string) => s.trim()
    let title = t(f.title)
    if (k === 'flight') {
      const airline = t(f.airline)
      const no = t(f.flightNo)
      title =
        airline && no
          ? `${airline} ${no}`
          : no && t(f.fromAirport) && t(f.toAirport)
            ? `${no} · ${t(f.fromAirport)} → ${t(f.toAirport)}`
            : no || airline || editing?.title || 'Flight'
    } else if (k === 'stay') {
      title = t(f.placeName) || editing?.title || 'Stay'
    }
    if (!title) {
      setError('Give it a name first.')
      return null
    }

    const start = joinDT(f.startDate, f.startTime)
    const end = joinDT(f.endDate, f.endTime)
    const amount = f.costAmount.trim() === '' ? null : Number(f.costAmount.replace(/[^0-9.]/g, ''))
    if (amount != null && !Number.isFinite(amount)) {
      setError('The cost needs to be a number.')
      return null
    }
    const cost = amount != null ? { amount, currency: f.costCurrency || homeCurrency, paid: f.paid } : undefined

    const hasPlace = !!(t(f.placeName) || t(f.placeAddress))
    const location: ServerLocation | undefined = hasPlace
      ? { ...(editing?.location ?? {}), name: t(f.placeName) || undefined, address: t(f.placeAddress) || undefined }
      : editing?.location
        ? {}
        : undefined

    let details: ServerDetails | undefined
    switch (k) {
      case 'flight':
        details = {
          type: 'flight',
          airline: t(f.airline) || undefined,
          flightNumber: t(f.flightNo) || undefined,
          fromAirport: t(f.fromAirport) || undefined,
          toAirport: t(f.toAirport) || undefined,
          depart: start,
          arrive: end,
          seats: t(f.seats) || undefined,
          pnr: t(f.confirmation) || undefined,
        }
        break
      case 'stay':
        details = { type: 'stay', checkIn: f.startDate || undefined, checkOut: f.endDate || undefined, phone: t(f.phone) || undefined, roomInfo: t(f.roomInfo) || undefined }
        break
      case 'transport':
        details = { type: 'transport', mode: f.mode || undefined, from: t(f.from) || undefined, to: t(f.to) || undefined, depart: start, arrive: end, passInfo: t(f.passInfo) || undefined }
        break
      case 'food': {
        const n = Number(f.partySize)
        details = { type: 'food', reservationAt: start, partySize: f.partySize && Number.isInteger(n) && n > 0 ? n : undefined }
        break
      }
      case 'ticket': {
        const n = Number(f.quantity)
        details = { type: 'ticket', validFrom: f.startDate || undefined, validTo: f.endDate || undefined, quantity: f.quantity && Number.isInteger(n) && n > 0 ? n : undefined }
        break
      }
      case 'activity': {
        const n = Number(f.duration)
        details = { type: 'activity', durationMinutes: f.duration && Number.isFinite(n) && n > 0 ? Math.round(n) : undefined }
        break
      }
    }

    const dayNum = f.day === '' ? undefined : Number(f.day)
    const status = f.booked ? 'booked' : editing && editing.status !== 'booked' && editing.status !== 'done' ? editing.status : 'decided'

    const create: CreateItemInput = {
      kind: k,
      title,
      status,
      day: dayNum,
      start,
      end,
      timezone: tz || undefined,
      location,
      details,
      cost,
      confirmation: t(f.confirmation) || undefined,
      notes: t(f.notes) || undefined,
      links: f.links.length ? f.links : undefined,
      attachmentIds: f.attachments.length ? f.attachments.map((a) => a.id) : undefined,
    }
    const patch: UpdateItemInput = {
      kind: editing && editing.kind !== k ? k : undefined,
      title,
      status,
      day: dayNum,
      clearDay: dayNum == null && editing?.day != null ? true : undefined,
      start,
      clearStart: !start && !!editing?.start ? true : undefined,
      end,
      clearEnd: !end && !!editing?.end ? true : undefined,
      location,
      details,
      cost,
      clearCost: !cost && !!editing?.cost ? true : undefined,
      confirmation: t(f.confirmation),
      notes: t(f.notes),
      links: f.links,
      attachmentIds: f.attachments.map((a) => a.id),
    }
    return { create, patch }
  }

  const save = async () => {
    if (saving) return
    const built = build()
    if (!built) return
    setSaving(true)
    setError(null)
    try {
      const item = editing ? await m.updateItem(editing.id, built.patch) : await m.createItem(built.create)
      onSaved?.(item)
      onClose()
    } catch {
      setError(editing ? 'Could not save the changes. Try again.' : `Could not save the ${label.toLowerCase()}. Try again.`)
    } finally {
      setSaving(false)
    }
  }

  // ---- shared blocks
  const dayPicker = (
    <Field label="Day">
      <select value={f.day} onChange={(e) => set({ day: e.target.value })} aria-label="Day" style={SELECT}>
        <option value="">Unscheduled</option>
        {days.map((d) => (
          <option key={d.n} value={String(d.n)}>
            Day {d.n}
            {d.dow ? ` · ${d.dow} ${d.date}` : ''}
            {d.city ? ` · ${d.city}` : ''}
          </option>
        ))}
      </select>
    </Field>
  )

  const whenPair = (startLabel: string, endLabel: string, endHint?: string) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      <Field label={startLabel} hint={tz ? <span style={MONO_HINT}>{tz}</span> : undefined}>
        <DateTimeRow label={startLabel} date={f.startDate} time={f.startTime} onDate={(v) => set({ startDate: v })} onTime={(v) => set({ startTime: v })} />
      </Field>
      <Field label={endLabel} hint={<span style={MONO_HINT}>{endHint ?? (tz || 'optional')}</span>}>
        <DateTimeRow label={endLabel} date={f.endDate} time={f.endTime} onDate={(v) => set({ endDate: v })} onTime={(v) => set({ endTime: v })} />
      </Field>
    </div>
  )

  const placeBlock = (withAddress: boolean) => (
    <>
      <Field label="Place" value={f.placeName} onChange={(e) => set({ placeName: e.target.value })} placeholder="Where is it?" />
      {withAddress && <Field label="Address" value={f.placeAddress} onChange={(e) => set({ placeAddress: e.target.value })} placeholder="Street, city" />}
    </>
  )

  const confirmationField = (letterSpacing = '.12em', fontSize = 16) => (
    <Field label="Confirmation">
      <Input
        mono
        value={f.confirmation}
        onChange={(e) => set({ confirmation: e.target.value })}
        aria-label="Confirmation"
        style={{ fontSize, letterSpacing }}
        autoCapitalize="characters"
      />
    </Field>
  )

  const metaBlock = (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <MetaRow label="Cost" first>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <input
            value={f.costAmount}
            onChange={(e) => set({ costAmount: e.target.value })}
            inputMode="decimal"
            placeholder="0"
            aria-label="Cost amount"
            style={{
              width: 96,
              height: 36,
              padding: '0 10px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--fg1)',
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              textAlign: 'right',
            }}
          />
          {currencies.length > 1 ? (
            <span style={{ display: 'flex', gap: 4 }} role="radiogroup" aria-label="Currency">
              {currencies.map((c) => {
                const on = f.costCurrency === c
                return (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => set({ costCurrency: c })}
                    style={{
                      height: 30,
                      padding: '0 10px',
                      borderRadius: 4,
                      border: `1px solid ${on ? 'var(--fg1)' : 'var(--border)'}`,
                      background: on ? 'var(--fg1)' : 'transparent',
                      color: on ? 'var(--bg)' : 'var(--fg2)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    {c}
                  </button>
                )
              })}
            </span>
          ) : (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg3)' }}>{homeCurrency}</span>
          )}
        </span>
      </MetaRow>
      <MetaRow label="Paid">
        <Toggle on={f.paid} onChange={(on) => set({ paid: on })} shadowKnob aria-label="Paid" />
      </MetaRow>
      {k !== 'flight' && k !== 'stay' && (
        <MetaRow label="Booked">
          <Toggle on={f.booked} onChange={(on) => set({ booked: on })} aria-label="Booked" />
        </MetaRow>
      )}

      <MetaRow label="Links" tall>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch' }}>
          {f.links.map((l) => (
            <div key={l.url} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ flex: 1, minWidth: 0, color: 'var(--accent)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {l.title || l.site || l.url.replace(/^https?:\/\//, '')}
                {l.title && l.site ? <span style={{ color: 'var(--fg3)' }}> · {l.site}</span> : null}
              </a>
              <button
                type="button"
                onClick={() => removeLink(l.url)}
                aria-label={`Remove link ${l.title || l.url}`}
                style={{ border: 'none', background: 'transparent', color: 'var(--fg3)', cursor: 'pointer', padding: '0 4px', fontSize: 14 }}
              >
                ×
              </button>
            </div>
          ))}
          <input
            value={linkDraft}
            onChange={(e) => setLinkDraft(e.target.value)}
            onBlur={() => void addLink()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void addLink()
              }
            }}
            placeholder={linkBusy ? 'Reading the link…' : 'Paste a link'}
            aria-label="Add a link"
            inputMode="url"
            disabled={linkBusy}
            style={{
              height: 36,
              padding: '0 10px',
              borderRadius: 8,
              border: '1px dashed var(--border)',
              background: 'transparent',
              color: 'var(--fg1)',
              fontSize: 13,
              width: '100%',
            }}
          />
        </div>
      </MetaRow>

      <MetaRow label="Attachments" tall>
        <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
          {f.attachments.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => removeAttachment(a.id)}
              title={`${a.name} · tap to remove`}
              aria-label={`Remove attachment ${a.name}`}
              style={{
                width: 24,
                height: 30,
                borderRadius: 3,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                padding: 0,
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              {a.thumb && <img src={a.thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
            </button>
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadBusy}
            aria-label="Add an attachment"
            style={{
              width: 24,
              height: 30,
              borderRadius: 3,
              border: '1px dashed var(--border)',
              background: 'transparent',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--fg3)',
              fontSize: 12,
              cursor: uploadBusy ? 'default' : 'pointer',
              padding: 0,
            }}
          >
            {uploadBusy ? '…' : '+'}
          </button>
          <input ref={fileRef} type="file" multiple accept="application/pdf,image/*" hidden onChange={(e) => void onFiles(e.target.files)} />
        </span>
      </MetaRow>
      {uploadError && <div style={QUIET_LINE}>{uploadError}</div>}

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
        <label htmlFor="item-notes" style={{ display: 'block', fontSize: 12, color: 'var(--fg2)', marginBottom: 4 }}>
          Notes
        </label>
        <textarea
          id="item-notes"
          value={f.notes}
          onChange={(e) => set({ notes: e.target.value })}
          placeholder="Anything worth remembering."
          rows={3}
          style={{
            minHeight: 64,
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            fontSize: 14,
            color: 'var(--fg1)',
            lineHeight: 1.5,
            fontFamily: 'var(--font-sans)',
            resize: 'vertical',
          }}
        />
      </div>
    </div>
  )

  // ---- kind bodies
  const kindPicker = kindChoice ? (
    <Field label="Becomes a">
      <select value={k} onChange={(e) => setK(e.target.value as FormKind)} aria-label="Kind" style={SELECT}>
        {(['activity', 'food', 'ticket', 'transport'] as FormKind[]).map((opt) => (
          <option key={opt} value={opt}>
            {KIND_LABEL[opt]}
          </option>
        ))}
      </select>
    </Field>
  ) : null

  let body: ReactNode
  if (k === 'flight') {
    body = (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 8 }}>
          <Field label="Airline" value={f.airline} onChange={(e) => set({ airline: e.target.value })} />
          <Field label="Flight no." mono value={f.flightNo} onChange={(e) => set({ flightNo: e.target.value })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'end' }}>
          <Field label="From">
            <Input value={f.fromAirport} onChange={(e) => set({ fromAirport: e.target.value.toUpperCase() })} aria-label="From" style={ROUTE_INPUT} maxLength={4} />
          </Field>
          <span style={{ color: 'var(--fg3)', paddingBottom: 16 }}>→</span>
          <Field label="To">
            <Input value={f.toAirport} onChange={(e) => set({ toAirport: e.target.value.toUpperCase() })} aria-label="To" style={ROUTE_INPUT} maxLength={4} />
          </Field>
        </div>
        {dayPicker}
        {whenPair('Departs', 'Arrives')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Field label="Seats" mono value={f.seats} onChange={(e) => set({ seats: e.target.value })} />
          {confirmationField()}
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>{placeBlock(false)}</div>
        {metaBlock}
      </>
    )
  } else if (k === 'stay') {
    body = (
      <>
        <Field label="Name">
          <Input
            value={f.placeName}
            onChange={(e) => set({ placeName: e.target.value })}
            aria-label="Name"
            placeholder="Where are we staying?"
            style={{ height: 48, fontSize: 18, fontFamily: 'var(--font-serif)' }}
          />
        </Field>
        <Field label="Address" value={f.placeAddress} onChange={(e) => set({ placeAddress: e.target.value })} placeholder="Street, city" />
        {dayPicker}
        {whenPair('Check in', 'Check out', tz || undefined)}
        {nightsLine && <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: -6 }}>{nightsLine}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Field label="Phone" mono value={f.phone} onChange={(e) => set({ phone: e.target.value })} inputMode="tel" />
          {confirmationField('.06em', 14)}
        </div>
        <Field label="Room" value={f.roomInfo} onChange={(e) => set({ roomInfo: e.target.value })} placeholder="Room type, floor, anything they promised" />
        {metaBlock}
      </>
    )
  } else {
    body = (
      <>
        {kindPicker}
        <Field label="Title">
          <Input
            value={f.title}
            onChange={(e) => set({ title: e.target.value })}
            aria-label={`${label} title`}
            placeholder="What is it?"
            style={{ height: 48, fontSize: 18, fontFamily: 'var(--font-serif)' }}
          />
        </Field>
        {k === 'transport' && (
          <>
            <Field label="Mode">
              <select value={f.mode} onChange={(e) => set({ mode: e.target.value })} aria-label="Mode" style={SELECT}>
                {TRANSPORT_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode[0].toUpperCase() + mode.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'end' }}>
              <Field label="From" value={f.from} onChange={(e) => set({ from: e.target.value })} />
              <span style={{ color: 'var(--fg3)', paddingBottom: 14 }}>→</span>
              <Field label="To" value={f.to} onChange={(e) => set({ to: e.target.value })} />
            </div>
          </>
        )}
        {placeBlock(true)}
        {dayPicker}
        {k === 'transport' && whenPair('Departs', 'Arrives')}
        {k === 'food' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 8 }}>
            <Field label="Reservation" hint={tz ? <span style={MONO_HINT}>{tz}</span> : undefined}>
              <DateTimeRow label="Reservation" date={f.startDate} time={f.startTime} onDate={(v) => set({ startDate: v })} onTime={(v) => set({ startTime: v })} />
            </Field>
            <Field label="Party size" mono value={f.partySize} onChange={(e) => set({ partySize: e.target.value })} inputMode="numeric" placeholder="2" />
          </div>
        )}
        {k === 'ticket' && (
          <>
            {whenPair('Valid from', 'Valid to')}
            <Field label="Quantity" mono value={f.quantity} onChange={(e) => set({ quantity: e.target.value })} inputMode="numeric" placeholder="2" wrapStyle={{ maxWidth: 140 }} />
          </>
        )}
        {k === 'activity' && (
          <>
            {whenPair('Starts', 'Ends')}
            <Field label="Duration (minutes)" mono value={f.duration} onChange={(e) => set({ duration: e.target.value })} inputMode="numeric" placeholder="90" wrapStyle={{ maxWidth: 180 }} />
          </>
        )}
        {k === 'transport' && <Field label="Pass / seats" mono value={f.passInfo} onChange={(e) => set({ passInfo: e.target.value })} placeholder="Car 7 · 12D, 12E" />}
        {confirmationField('.08em', 14)}
        {metaBlock}
      </>
    )
  }

  const cta = saving ? 'Saving…' : isEdit ? 'Save changes' : k === 'stay' ? 'Save stay' : f.day ? `Save to day ${f.day}` : `Save ${label.toLowerCase()}`
  const title = isEdit ? (kindChoice ? 'Edit idea' : `Edit ${label.toLowerCase()}`) : label

  return (
    <Sheet open={open} onClose={onClose} variant="tall" aria-label={title}>
      <SheetHeader title={title} action="Cancel" onAction={onClose} />
      <SheetBody>{body}</SheetBody>
      <SheetFooter>
        {error && <div style={ERROR_LINE}>{error}</div>}
        <Button variant="primary" size="sheet" full disabled={saving} onClick={() => void save()}>
          {cta}
        </Button>
      </SheetFooter>
    </Sheet>
  )
}
