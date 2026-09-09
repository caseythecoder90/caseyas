// mobile-b-plans.md 2.4 - the Overview segment: post-trip banner, the big
// number + Next up card (tap opens the item sheet), Flights/Stays tiles, the
// budget strip, checklist rings, newest ideas and the locked-note teaser.

import { Link } from 'react-router'
import { AFTER_TRIP } from '../../data/mock'
import { paths } from '../../paths'
import type { Booking, Budget, Idea, OverviewHero, PlanSeg } from '../../data/types'
import type { ChecklistView, PlanView } from '../../data/hooks'
import { Eyebrow, PAPER, PHOTO_FILTER } from '../../ui'
import { LOCK_ICON_SM, Ring, useCopyCode } from './bits'

const TEASER_LINES = ['Passport numbers and expiry dates', 'Embassy and emergency contacts', 'Insurance policy']

function Tile({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '12px 14px',
        borderRadius: 8,
        border: '1px solid var(--border)',
        background: 'transparent',
        color: 'var(--fg1)',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <Eyebrow as="span" size={10} style={{ display: 'block' }}>
        {label}
      </Eyebrow>
      <span style={{ display: 'block', fontSize: 15, marginTop: 4 }}>{value}</span>
    </button>
  )
}

export interface SegOverviewProps {
  plan: PlanView
  hero: OverviewHero
  heroIsFallback: boolean
  afterTrip: boolean
  lists: ChecklistView[]
  ideas: Idea[]
  bookings: Booking[]
  budget: Budget
  tripDays: number
  onSeg: (seg: PlanSeg) => void
  onOpenItem?: (itemId: string) => void
}

function countOf(bookings: Booking[], group: Booking['group']): string {
  const n = bookings.filter((b) => b.group === group).length
  return n ? `${n} booked` : 'none yet'
}

/** '$3,860' -> 3860 (for the budget bar widths). */
function moneyNum(s: string): number {
  return Number(s.replace(/[^0-9.]/g, '')) || 0
}

export function SegOverview({ plan, hero, heroIsFallback, afterTrip, lists, ideas, bookings, budget, tripDays, onSeg, onOpenItem }: SegOverviewProps) {
  const copy = useCopyCode()
  const rings = lists.map((l) => ({ name: l.name, n: `${l.doneNow}/${l.total}`, pct: l.pct }))
  const range = plan.dates.replace(/,\s*\d{4}$/, '')
  const plannedNum = moneyNum(budget.planned)
  const committedPct = plannedNum ? Math.min(100, Math.round((moneyNum(budget.committed) / plannedNum) * 100)) : 0
  const paidPct = plannedNum ? Math.min(100, Math.round((moneyNum(budget.paid) / plannedNum) * 100)) : 0

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {afterTrip && (
        <div
          style={{
            borderRadius: 8,
            border: '1px solid var(--accent)',
            background: 'var(--accent-soft)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <Eyebrow size={10} color="var(--accent)">
            {AFTER_TRIP.title}
          </Eyebrow>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1.1 }}>Turn this trip into a memory</div>
          <div style={{ fontSize: 13, color: 'var(--fg2)', lineHeight: 1.5 }}>
            It'll start you off with a heading per day ({tripDays}), the day's items as a list, and the photos taken {range} ready to pick from.
          </div>
          <Link
            to={paths.composeFromPlan(plan.id)}
            style={{
              height: 44,
              borderRadius: 8,
              background: 'var(--accent)',
              color: PAPER,
              fontWeight: 500,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Start the memory →
          </Link>
        </div>
      )}

      {hero.num !== '' && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 64, lineHeight: 1 }}>{hero.num}</span>
          <span style={{ fontSize: 15, color: 'var(--fg2)' }}>{hero.line}</span>
        </div>
      )}

      <div
        role={hero.id && onOpenItem ? 'button' : undefined}
        tabIndex={hero.id && onOpenItem ? 0 : undefined}
        aria-label={hero.id && onOpenItem ? `Open ${hero.title}` : undefined}
        onClick={() => hero.id && onOpenItem?.(hero.id)}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && hero.id && onOpenItem) {
            e.preventDefault()
            onOpenItem(hero.id)
          }
        }}
        style={{
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          cursor: hero.id && onOpenItem ? 'pointer' : undefined,
        }}
      >
        <Eyebrow size={10}>{heroIsFallback ? 'Next up' : `Next up · ${hero.kind}`}</Eyebrow>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, lineHeight: 1.1 }}>{hero.title}</div>
        <div style={{ fontSize: 13, color: 'var(--fg2)' }}>{hero.sub}</div>
        {!heroIsFallback && hero.conf !== '' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              copy(hero.conf)
            }}
            aria-label={`Copy confirmation ${hero.conf}`}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 4,
              border: 'none',
              background: 'transparent',
              color: 'var(--fg1)',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, letterSpacing: '.12em' }}>{hero.conf}</span>
            <span style={{ fontSize: 12, color: 'var(--fg3)' }}>tap to copy</span>
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Tile label="Flights" value={countOf(bookings, 'Flights')} onClick={() => onSeg('bookings')} />
        <Tile label="Stays" value={countOf(bookings, 'Stays')} onClick={() => onSeg('bookings')} />
      </div>

      <button
        type="button"
        onClick={() => onSeg('budget')}
        style={{ cursor: 'pointer', border: 'none', background: 'transparent', padding: 0, color: 'var(--fg1)', textAlign: 'left' }}
      >
        <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--fg2)', gap: 12 }}>
          <span>Budget</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            {budget.paid} paid · {budget.committed} committed · {budget.planned} planned
          </span>
        </span>
        <span style={{ display: 'block', height: 6, borderRadius: 3, background: 'var(--surface-2)', marginTop: 8, position: 'relative', overflow: 'hidden' }}>
          <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${committedPct}%`, background: 'var(--accent-soft)' }} />
          <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${paidPct}%`, background: 'var(--accent)' }} />
        </span>
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        {rings.map((r) => (
          <button
            key={r.name}
            type="button"
            onClick={() => onSeg('lists')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              padding: '12px 8px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--fg1)',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <Ring n={r.n} pct={r.pct} />
            <span style={{ fontSize: 11, color: 'var(--fg2)', lineHeight: 1.3 }}>{r.name}</span>
          </button>
        ))}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Eyebrow as="span">Newest ideas</Eyebrow>
          <button
            type="button"
            onClick={() => onSeg('ideas')}
            style={{ font: 'inherit', fontSize: 12, color: 'var(--accent)', cursor: 'pointer', border: 'none', background: 'transparent', padding: 0 }}
          >
            All {ideas.length} →
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
          {ideas.slice(0, 3).map((i) => (
            <div key={i.title} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderTop: '1px solid var(--border)' }}>
              <img src={i.img} alt="" style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', filter: PHOTO_FILTER, flex: 'none' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.title}</div>
                <div style={{ fontSize: 12, color: 'var(--fg3)' }}>
                  {i.city} · added by {i.by}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSeg('locked')}
        style={{
          position: 'relative',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          padding: '14px 16px',
          overflow: 'hidden',
          cursor: 'pointer',
          textAlign: 'left',
          color: 'var(--fg1)',
        }}
      >
        <span style={{ display: 'block', filter: 'blur(5px)', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg2)', lineHeight: 1.6, userSelect: 'none' }}>
          {TEASER_LINES.map((l) => (
            <span key={l} style={{ display: 'block' }}>
              {l}
            </span>
          ))}
        </span>
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: 13,
            color: 'var(--fg1)',
          }}
        >
          {LOCK_ICON_SM}
          Locked note · tap to reveal
        </span>
      </button>
    </div>
  )
}
