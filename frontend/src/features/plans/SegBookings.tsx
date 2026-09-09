// mobile-b-plans.md 2.7 / desktop.md 7.2 - Bookings grouped by kind. Route,
// stay and ticket layouts; the confirmation code copies on tap, "Open in Maps"
// opens the item's location, and the card itself opens the item sheet.

import { useParams } from 'react-router'
import { ROUTE_KINDS } from '../../data/mock'
import { usePlan } from '../../data/hooks'
import type { Booking } from '../../data/types'
import { Eyebrow } from '../../ui'
import { DocThumb, useCopyCode } from './bits'
import { hasMapTarget, openInMaps } from './maps'

export function SegBookings({
  bookings,
  variant = 'mobile',
  onOpenItem,
}: {
  bookings: Booking[]
  variant?: 'mobile' | 'desktop'
  onOpenItem?: (itemId: string) => void
}) {
  const desktop = variant === 'desktop'
  const copy = useCopyCode()
  const endpoint = desktop ? 38 : 34
  const { id: planId } = useParams()
  const { serverItems } = usePlan(planId)
  const locationOf = (itemId?: string) => (itemId ? serverItems.find((i) => i.id === itemId)?.location : undefined)

  if (bookings.length === 0) {
    return (
      <div style={{ padding: desktop ? '24px 40px' : '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Eyebrow>Nothing booked yet</Eyebrow>
        <div style={{ fontSize: 13, color: 'var(--fg2)' }}>The flight and the stay land here once they are booked.</div>
      </div>
    )
  }

  return (
    <div
      style={
        desktop
          ? { padding: '24px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignContent: 'start' }
          : { padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 20 }
      }
    >
      {bookings.map((b, bi) => {
        const isRoute = ROUTE_KINDS.includes(b.kind)
        const isStay = b.kind === 'stay'
        const isTicket = b.kind === 'ticket'
        const loc = locationOf(b.id)
        const open = () => b.id && onOpenItem?.(b.id)
        return (
          <div key={b.id ?? `${b.title}-${bi}`} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Eyebrow>{b.group}</Eyebrow>
            <div
              role={b.id && onOpenItem ? 'button' : undefined}
              tabIndex={b.id && onOpenItem ? 0 : undefined}
              aria-label={b.id && onOpenItem ? `Open ${b.title}` : undefined}
              onClick={open}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  open()
                }
              }}
              style={{
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                padding: desktop ? '18px 20px' : 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                cursor: b.id && onOpenItem ? 'pointer' : undefined,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontSize: 16, fontWeight: 500 }}>{b.title}</span>
                <span style={{ fontSize: 12, color: 'var(--fg3)', textAlign: 'right' }}>{b.sub}</span>
              </div>

              {isRoute && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: endpoint, lineHeight: 1 }}>{b.a}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg2)', marginTop: 4 }}>{b.dep}</div>
                  </div>
                  <span style={{ color: 'var(--fg3)' }}>→</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: endpoint, lineHeight: 1 }}>{b.b}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg2)', marginTop: 4 }}>{b.arr}</div>
                  </div>
                </div>
              )}

              {isStay && (
                <>
                  <div style={{ fontSize: 13, color: 'var(--fg2)' }}>{b.addr}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                    <div>{b.dep}</div>
                    <div>{b.arr}</div>
                  </div>
                </>
              )}

              {isTicket && (
                <div style={{ fontSize: 13, color: 'var(--fg2)' }}>
                  {b.dep} · {b.a}
                </div>
              )}

              <div style={{ fontSize: 13, color: 'var(--fg2)' }}>{b.seats}</div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border)', gap: 12 }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    copy(b.conf)
                  }}
                  aria-label={b.conf === '—' ? 'No confirmation code' : `Copy confirmation ${b.conf}`}
                  style={{ border: 'none', background: 'transparent', padding: 0, textAlign: 'left', color: 'var(--fg1)', cursor: b.conf === '—' ? 'default' : 'pointer' }}
                >
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--fg3)' }}>Confirmation</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, letterSpacing: '.14em', marginTop: 2 }}>{b.conf}</div>
                </button>
                <div style={{ display: 'flex', gap: desktop ? 8 : 6, alignItems: 'center' }}>
                  {Array.from({ length: b.docs }, (_, i) => (
                    <DocThumb key={i} />
                  ))}
                  {hasMapTarget(loc) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        openInMaps(loc)
                      }}
                      style={{
                        height: 32,
                        padding: '0 10px',
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                        background: 'transparent',
                        color: 'var(--fg1)',
                        fontSize: 12,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Open in Maps
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
