// The item detail sheet: the screen the design prototype never drew
// (docs/plans-review.md, "the hole"). Opens from any item card - itinerary
// day cards, the unscheduled tray, bookings, Today rows, the overview's
// "Next up" card, idea cards and the desktop workspace. Reads the ServerItem
// straight from the bundle and offers everything the item can do: edit (the
// kind's form in edit mode), put on / move to a day, take off the schedule,
// open in Maps, copy the confirmation, follow links, open attachments, read
// the notes and keep the comment thread. Delete confirms first
// (mobile-d-sheets.md section 4). Tall sheet on mobile, centered dialog on
// desktop.

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useParams } from 'react-router'
import type { ServerItem } from '../../data/api/plansApi'
import { usePlan } from '../../data/hooks'
import { fmtDateTime, fmtTime, money } from '../../data/planViews'
import { HER, initialFor } from '../../people'
import { Button, Eyebrow, KIND_LABEL, Kind, PAPER, Sheet, SheetBody, SheetFooter, SheetHeader, useToast } from '../../ui'
import { KindTag, useCopyCode } from './bits'
import { ItemForm, formKindOf } from './ItemForm'
import { PutOnADaySheet } from './MoreSheet'
import { hasMapTarget, openInMaps } from './maps'
import { useIsDesktop } from './useIsDesktop'

export interface ItemSheetProps {
  /** the server item to show; null closes */
  itemId: string | null
  onClose: () => void
}

type Sub = null | 'edit' | 'day' | 'delete'
type Busy = null | 'day' | 'unschedule' | 'delete' | 'comment'


const MONO: CSSProperties = { fontFamily: 'var(--font-mono)' }
const ROW: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14, padding: '6px 0', borderTop: '1px solid var(--border)' }

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Eyebrow>{label}</Eyebrow>
      {children}
    </div>
  )
}

function DetailRow({ k, v, mono }: { k: string; v?: ReactNode; mono?: boolean }) {
  if (v == null || v === '') return null
  return (
    <div style={ROW}>
      <span style={{ color: 'var(--fg2)' }}>{k}</span>
      <span style={{ textAlign: 'right', ...(mono ? MONO : {}) }}>{v}</span>
    </div>
  )
}

const minutesLabel = (n: number) => (n >= 60 ? `${Math.floor(n / 60)}h${n % 60 ? ` ${n % 60}m` : ''}` : `${n} min`)

/** The kind-specific block: rows the item's details record carries. */
function Details({ item }: { item: ServerItem }) {
  const d = item.details
  if (!d) return null
  let rows: ReactNode = null
  switch (d.type) {
    case 'flight':
      rows = (
        <>
          <DetailRow k="Airline" v={[d.airline, d.flightNumber].filter(Boolean).join(' · ')} />
          {(d.fromAirport || d.toAirport) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12, padding: '8px 0', borderTop: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 34, lineHeight: 1 }}>{d.fromAirport || '—'}</div>
                <div style={{ fontSize: 12, color: 'var(--fg2)', marginTop: 4 }}>{fmtDateTime(d.depart ?? item.start)}</div>
              </div>
              <span style={{ color: 'var(--fg3)' }}>→</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 34, lineHeight: 1 }}>{d.toAirport || '—'}</div>
                <div style={{ fontSize: 12, color: 'var(--fg2)', marginTop: 4 }}>{fmtDateTime(d.arrive ?? item.end)}</div>
              </div>
            </div>
          )}
          <DetailRow k="Seats" v={d.seats} mono />
        </>
      )
      break
    case 'stay':
      rows = (
        <>
          <DetailRow k="Check in" v={d.checkIn ? fmtDateTime(item.start?.startsWith(d.checkIn) ? item.start : d.checkIn + 'T15:00') : ''} mono />
          <DetailRow k="Check out" v={d.checkOut ? fmtDateTime(item.end?.startsWith(d.checkOut) ? item.end : d.checkOut + 'T11:00') : ''} mono />
          <DetailRow k="Phone" v={d.phone ? <a href={`tel:${d.phone}`} style={{ color: 'var(--accent)' }}>{d.phone}</a> : ''} mono />
          <DetailRow k="Room" v={d.roomInfo} />
        </>
      )
      break
    case 'transport':
      rows = (
        <>
          <DetailRow k="Mode" v={d.mode ? d.mode[0].toUpperCase() + d.mode.slice(1) : ''} />
          <DetailRow k="Route" v={[d.from, d.to].filter(Boolean).join(' → ')} />
          <DetailRow k="Departs" v={fmtDateTime(d.depart ?? item.start)} mono />
          <DetailRow k="Arrives" v={fmtDateTime(d.arrive ?? item.end)} mono />
          <DetailRow k="Pass" v={d.passInfo} mono />
        </>
      )
      break
    case 'food':
      rows = (
        <>
          <DetailRow k="Cuisine" v={d.cuisine} />
          <DetailRow k="Reservation" v={fmtDateTime(d.reservationAt ?? item.start)} mono />
          <DetailRow k="Party" v={d.partySize != null ? `${d.partySize} ${d.partySize === 1 ? 'person' : 'people'}` : ''} />
        </>
      )
      break
    case 'activity':
      rows = (
        <>
          <DetailRow k="Duration" v={d.durationMinutes != null ? minutesLabel(d.durationMinutes) : ''} />
          <DetailRow k="Opening hours" v={d.openingHours} />
          <DetailRow k="Booking" v={d.bookingRequired == null ? '' : d.bookingRequired ? 'required' : 'not needed'} />
        </>
      )
      break
    case 'ticket':
      rows = (
        <>
          <DetailRow k="Valid from" v={d.validFrom ? fmtDateTime(d.validFrom + 'T00:00').split(' · ')[0] : ''} mono />
          <DetailRow k="Valid to" v={d.validTo ? fmtDateTime(d.validTo + 'T00:00').split(' · ')[0] : ''} mono />
          <DetailRow k="Quantity" v={d.quantity != null ? String(d.quantity) : ''} mono />
        </>
      )
      break
  }
  return <div style={{ display: 'flex', flexDirection: 'column' }}>{rows}</div>
}

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

const fmtCommentAt = (iso: string) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function ItemSheet({ itemId, onClose }: ItemSheetProps) {
  const { id: planId } = useParams()
  const { serverItems, serverMedia, days, who, m } = usePlan(planId)
  const isDesktop = useIsDesktop()
  const toast = useToast()
  const copy = useCopyCode()

  // keep the last item on screen while the sheet plays its close animation
  const last = useRef<ServerItem | null>(null)
  const current = itemId ? serverItems.find((i) => i.id === itemId) ?? null : null
  useEffect(() => {
    if (current) last.current = current
  }, [current])
  const item = current ?? last.current

  const [sub, setSub] = useState<Sub>(null)
  const [busy, setBusy] = useState<Busy>(null)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (!itemId) return
    setSub(null)
    setBusy(null)
    setError(null)
    setDraft('')
  }, [itemId])

  const open = !!itemId && sub === null && !!item

  const run = async (what: Exclude<Busy, null>, fn: () => Promise<unknown>, failMessage: string, after?: () => void) => {
    if (busy) return
    setBusy(what)
    setError(null)
    try {
      await fn()
      after?.()
    } catch {
      setError(failMessage)
    } finally {
      setBusy(null)
    }
  }

  if (!item) return null

  const kindLabel = KIND_LABEL[item.kind] ?? item.kind
  const day = item.day != null ? days.find((d) => d.n === item.day) : undefined
  const when =
    item.day != null
      ? `Day ${item.day}${day?.dow ? ` · ${day.dow} ${day.date}` : ''}${item.start ? ` · ${fmtTime(item.start)}` : ''}`
      : item.start
        ? `Unscheduled · ${fmtDateTime(item.start)}`
        : 'Unscheduled'
  const place = item.location?.name?.trim() ?? ''
  const address = item.location?.address?.trim() ?? ''
  const canMap = hasMapTarget(item.location)
  const attachments = (item.attachmentIds ?? []).map((id) => serverMedia.find((md) => md.id === id) ?? { id, originalName: 'Attachment', urls: {} as { thumb?: string | null; original?: string | null } })
  const conf = (item.confirmation ?? '').trim()
  const notes = (item.notes ?? '').trim()

  const putOnDay = (dayN: number) =>
    run(
      'day',
      () => m.updateItem(item.id, { day: dayN, status: item.status === 'idea' || item.status === 'shortlisted' ? 'decided' : undefined }),
      'Could not move it. Try again.',
      () => setSub(null),
    )
  const unschedule = () => run('unschedule', () => m.updateItem(item.id, { clearDay: true }), 'Could not take it off. Try again.')
  const remove = () =>
    run('delete', () => m.deleteItem(item.id), 'Could not delete it. Try again.', () => {
      setSub(null)
      onClose()
      toast.show(`Deleted · ${item.title}`)
    })
  const sendComment = () => {
    const text = draft.trim()
    if (!text) return
    void run('comment', () => m.comment(item.id, text), 'Could not post that. Try again.', () => setDraft(''))
  }

  const head = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <KindTag>{kindLabel}</KindTag>
        <Kind status={item.status}>{item.status}</Kind>
        <span style={{ fontSize: 12, color: 'var(--fg3)', marginLeft: 'auto' }}>added by {who(item.createdBy)}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: isDesktop ? 32 : 28, lineHeight: 1.1 }}>{item.title}</div>
    </>
  )

  const body = (
    <>
      <Section label="When">
        <div style={{ fontSize: 14, ...MONO }}>{when}</div>
      </Section>

      {(place || address || canMap) && (
        <Section label="Where">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              {place && <div style={{ fontSize: 15 }}>{place}</div>}
              {address && <div style={{ fontSize: 13, color: 'var(--fg2)', marginTop: 2 }}>{address}</div>}
            </div>
            {canMap && (
              <Button size="dense" onClick={() => openInMaps(item.location)} style={{ flex: 'none' }}>
                Open in Maps
              </Button>
            )}
          </div>
        </Section>
      )}

      {item.details && (
        <Section label={`${kindLabel} details`}>
          <Details item={item} />
        </Section>
      )}

      {item.cost && (
        <Section label="Cost">
          <div style={{ fontSize: 15, ...MONO }}>
            {money(item.cost.amount, item.cost.currency)} <span style={{ color: 'var(--fg3)', fontSize: 12 }}>{item.cost.currency}</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: item.cost.paid ? 'var(--green)' : 'var(--fg2)' }}> · {item.cost.paid ? 'paid' : 'not paid yet'}</span>
          </div>
        </Section>
      )}

      {conf && (
        <Section label="Confirmation">
          <button
            type="button"
            onClick={() => copy(conf)}
            aria-label={`Copy confirmation ${conf}`}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              borderRadius: 8,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--fg1)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span style={{ ...MONO, fontSize: 22, letterSpacing: '.16em' }}>{conf}</span>
            <span style={{ fontSize: 12, color: 'var(--fg3)' }}>tap to copy</span>
          </button>
        </Section>
      )}

      {item.links.length > 0 && (
        <Section label="Links">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {item.links.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid var(--border)', color: 'var(--fg1)', minWidth: 0 }}
              >
                {l.image && <img src={l.image} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', flex: 'none' }} />}
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title || l.url.replace(/^https?:\/\//, '')}</span>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--fg3)' }}>{l.site || hostOf(l.url)}</span>
                </span>
                <span style={{ color: 'var(--accent)', fontSize: 13, flex: 'none' }}>→</span>
              </a>
            ))}
          </div>
        </Section>
      )}

      {attachments.length > 0 && (
        <Section label={`Attachments · ${attachments.length}`}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {attachments.map((a) => {
              const href = a.urls?.original ?? a.urls?.thumb ?? undefined
              const inner = (
                <>
                  <span
                    style={{
                      width: 64,
                      height: 84,
                      borderRadius: 4,
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      color: 'var(--fg3)',
                      paddingBottom: 4,
                    }}
                  >
                    {a.urls?.thumb ? <img src={a.urls.thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : 'FILE'}
                  </span>
                  <span style={{ display: 'block', width: 64, fontSize: 11, color: 'var(--fg2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 4 }}>{a.originalName}</span>
                </>
              )
              return href ? (
                <a key={a.id} href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }} title={a.originalName}>
                  {inner}
                </a>
              ) : (
                <span key={a.id} title={a.originalName}>
                  {inner}
                </span>
              )
            })}
          </div>
        </Section>
      )}

      {notes && (
        <Section label="Notes">
          <div style={{ fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{notes}</div>
        </Section>
      )}

      <Section label={item.comments.length ? `Comments · ${item.comments.length}` : 'Comments'}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {item.comments.map((c) => {
            const person = who(c.authorId)
            const mine = person === 'Casey'
            return (
              <div key={c.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderTop: '1px solid var(--border)' }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    background: mine ? 'var(--accent-soft)' : 'var(--green-soft)',
                    color: mine ? 'var(--accent)' : 'var(--green)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    flex: 'none',
                  }}
                  title={person}
                >
                  {initialFor(person)}
                </span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{c.text}</span>
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--fg3)', marginTop: 2 }}>
                    {person} · {fmtCommentAt(c.at)}
                  </span>
                </span>
              </div>
            )
          })}
          {item.comments.length === 0 && <div style={{ fontSize: 13, color: 'var(--fg3)' }}>Nothing said yet. {HER} sees what you write here.</div>}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendComment()
            }}
            placeholder="Say something"
            aria-label="Add a comment"
            disabled={busy === 'comment'}
            style={{
              flex: 1,
              height: 40,
              padding: '0 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--fg1)',
              fontSize: 14,
              minWidth: 0,
            }}
          />
          <Button size="dense-lg" onClick={sendComment} disabled={busy === 'comment' || !draft.trim()}>
            {busy === 'comment' ? 'Posting…' : 'Post'}
          </Button>
        </div>
      </Section>
    </>
  )

  const foot = (
    <>
      {error && <div style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</div>}
      <Button variant="primary" size="sheet" full onClick={() => setSub('edit')} disabled={busy != null}>
        Edit
      </Button>
      <div style={{ display: 'grid', gridTemplateColumns: item.day != null ? '1fr 1fr' : '1fr', gap: 8 }}>
        <Button size="dense-lg" onClick={() => setSub('day')} disabled={busy != null}>
          {busy === 'day' ? 'Moving…' : item.day != null ? 'Move to another day' : 'Put it on a day'}
        </Button>
        {item.day != null && (
          <Button size="dense-lg" onClick={() => void unschedule()} disabled={busy != null}>
            {busy === 'unschedule' ? 'Taking it off…' : 'Take it off the schedule'}
          </Button>
        )}
      </div>
      <Button variant="quiet" size="dense-lg" onClick={() => setSub('delete')} disabled={busy != null} style={{ color: 'var(--danger)' }}>
        Delete
      </Button>
    </>
  )

  return (
    <>
      {isDesktop ? (
        <Sheet open={open} onClose={onClose} variant="dialog" aria-label={item.title} style={{ maxHeight: '86dvh', width: 'min(calc(100% - 40px), 560px)', gap: 0, padding: 0 }}>
          <div style={{ padding: '22px 24px 14px', display: 'flex', flexDirection: 'column', gap: 10, flex: 'none', borderBottom: '1px solid var(--border)' }}>{head}</div>
          <div style={{ padding: '16px 24px 20px', overflow: 'auto', minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>{body}</div>
          <div style={{ padding: '12px 24px 20px', borderTop: '1px solid var(--border)', flex: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>{foot}</div>
        </Sheet>
      ) : (
        <Sheet open={open} onClose={onClose} variant="tall" aria-label={item.title}>
          <SheetHeader>{head}</SheetHeader>
          <SheetBody style={{ gap: 18 }}>{body}</SheetBody>
          <SheetFooter style={{ gap: 8 }}>{foot}</SheetFooter>
        </Sheet>
      )}

      <ItemForm open={sub === 'edit'} kind={formKindOf(item)} editing={item} onClose={() => setSub(null)} />

      <PutOnADaySheet open={sub === 'day'} onClose={() => setSub(null)} days={days} onPick={(n) => void putOnDay(n)} />

      <Sheet open={sub === 'delete'} onClose={() => setSub(null)} variant="dialog" aria-label={`Delete ${item.title}?`}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, lineHeight: 1.1 }}>Delete this {kindLabel.toLowerCase()}?</div>
        <div style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.5 }}>
          It leaves the itinerary, the bookings and the budget. {HER} will see it's gone. This can't be undone.
        </div>
        {error && <div style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <Button style={{ flex: 1 }} onClick={() => setSub(null)} disabled={busy === 'delete'}>
            Keep it
          </Button>
          <button
            type="button"
            onClick={() => void remove()}
            disabled={busy === 'delete'}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 8,
              border: 'none',
              background: 'var(--danger)',
              color: PAPER,
              fontSize: 14,
              fontWeight: 500,
              cursor: busy === 'delete' ? 'default' : 'pointer',
              opacity: busy === 'delete' ? 0.6 : 1,
            }}
          >
            {busy === 'delete' ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Sheet>
    </>
  )
}
