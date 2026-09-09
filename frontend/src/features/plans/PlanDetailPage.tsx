// mobile-b-plans.md section 2 (mobile) and desktop.md section 7 (>= md).
// Cover + title block + segmented row on mobile; a 200px cover band, a full tab
// strip and the three-column itinerary workspace on desktop.

import { useCallback, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { MORE_LABELS } from '../../data/mock'
import { usePlan } from '../../data/hooks'
import { paramFromSeg, paths, segFromParam } from '../../paths'
import type { BookingForm, Idea, IdeaFilter, PlanSeg } from '../../data/types'
import { Icon, PAPER, PHOTO_SCRIM_5, segTab } from '../../ui'
import { AddItemSheets } from './AddItemSheets'
import { CoverImage, DestChip, PlanAvatars } from './bits'
import { MoreSheet, PutOnADaySheet } from './MoreSheet'
import { PlanDesktop } from './PlanDesktop'
import { SegBookings } from './SegBookings'
import { SegBudget } from './SegBudget'
import { SegChecklists } from './SegChecklists'
import { SegDocs } from './SegDocs'
import { SegIdeas } from './SegIdeas'
import { SegItinerary } from './SegItinerary'
import { SegLocked } from './SegLocked'
import { SegMap } from './SegMap'
import { SegOverview } from './SegOverview'
import { usePlanBoard } from './usePlanBoard'
import { useIsDesktop } from './useIsDesktop'

type PutTarget = { kind: 'tray'; index: number } | { kind: 'idea'; idea: Idea }

export default function PlanDetailPage() {
  const { id } = useParams()
  const isDesktop = useIsDesktop()
  const [params, setParams] = useSearchParams()
  const p = usePlan(id)
  const board = usePlanBoard(p.plan.id, p.days, p.unscheduled, p.ideas)

  const [offlineBusy, setOfflineBusy] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [form, setForm] = useState<BookingForm>(null)
  const [formDay, setFormDay] = useState(1)
  const [ideaFilter, setIdeaFilter] = useState<IdeaFilter>('All')
  const [put, setPut] = useState<PutTarget | null>(null)

  const segParam = params.get('seg')
  const seg: PlanSeg = segParam ? segFromParam(segParam) : isDesktop ? 'itinerary' : 'overview'

  const setSeg = useCallback(
    (s: PlanSeg) => {
      const next = new URLSearchParams(params)
      if (s === 'overview' && !isDesktop) next.delete('seg')
      else next.set('seg', paramFromSeg(s))
      setParams(next, { replace: true })
    },
    [params, setParams, isDesktop],
  )

  const ideas = useMemo(() => p.filterIdeas(p.ideas, ideaFilter), [p, ideaFilter])

  const openKinds = useCallback((dayN: number) => {
    setFormDay(dayN)
    setForm('kinds')
  }, [])

  const confirmPut = useCallback(
    (dayN: number) => {
      if (!put) return
      if (put.kind === 'tray') board.scheduleUnscheduled(put.index, dayN)
      else board.scheduleIdea(put.idea, dayN)
      setPut(null)
      setSeg('itinerary')
    },
    [put, board, setSeg],
  )

  const toggleOffline = useCallback(async () => {
    if (offlineBusy) return
    setOfflineBusy(true)
    try {
      await p.offline.toggle()
    } catch {
      // the caption keeps showing the last saved state
    } finally {
      setOfflineBusy(false)
    }
  }, [offlineBusy, p.offline])

  const sheets = (
    <>
      <AddItemSheets form={form} dayN={formDay} onSetForm={setForm} onClose={() => setForm(null)} />
      <PutOnADaySheet open={!!put} onClose={() => setPut(null)} days={board.days} onPick={confirmPut} />
    </>
  )

  if (p.loading || p.notFound) {
    return (
      <section style={{ display: 'flex', flexDirection: 'column', flex: 'none', paddingBottom: 110 }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 12px 0' }}>
          <Link
            to={paths.plans}
            aria-label="Back to plans"
            style={{ width: 36, height: 36, borderRadius: 8, background: 'transparent', color: 'var(--fg2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="chevron-left" size={18} />
          </Link>
        </div>
        <div style={{ padding: '48px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
          {p.loading ? (
            <div style={{ fontSize: 13, color: 'var(--fg3)' }}>Loading…</div>
          ) : (
            <>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, lineHeight: 1.1 }}>This plan does not exist.</div>
              <Link to={paths.plans} style={{ fontSize: 13, color: 'var(--accent)' }}>
                Back to plans →
              </Link>
            </>
          )}
        </div>
      </section>
    )
  }

  const segmentBody = (
    <>
      {seg === 'overview' && (
        <SegOverview
          plan={p.plan}
          hero={p.hero}
          heroIsFallback={p.heroIsFallback}
          afterTrip={p.afterTrip}
          lists={p.lists}
          ideas={p.ideas}
          bookings={p.bookings}
          budget={p.budget}
          tripDays={p.days.length}
          onSeg={setSeg}
        />
      )}
      {seg === 'itinerary' && (
        <SegItinerary
          days={board.days}
          unscheduled={board.unscheduled}
          onAddToDay={openKinds}
          onDropOnDay={(i, n) => board.scheduleUnscheduled(i, n)}
          onPickTrayItem={(index) => setPut({ kind: 'tray', index })}
        />
      )}
      {seg === 'ideas' && (
        <SegIdeas
          ideas={ideas}
          filters={p.ideaFilters}
          filter={ideaFilter}
          onFilter={setIdeaFilter}
          onPickIdea={(idea) => setPut({ kind: 'idea', idea })}
        />
      )}
      {seg === 'bookings' && <SegBookings bookings={p.bookings} />}
      {seg === 'lists' && <SegChecklists lists={p.lists} onToggle={p.toggleTick} />}
      {seg === 'budget' && <SegBudget budget={p.budget} />}
      {seg === 'docs' && <SegDocs docs={p.docs} onUpload={p.m.upload} />}
      {seg === 'map' && <SegMap pins={p.pins} cities={p.plan.dest} />}
      {seg === 'locked' && <SegLocked />}
    </>
  )

  if (isDesktop) {
    return (
      <>
        <PlanDesktop
          p={p}
          board={board}
          seg={seg}
          onSeg={setSeg}
          ideas={ideas}
          ideaFilter={ideaFilter}
          onIdeaFilter={setIdeaFilter}
          offline={p.offline.enabled}
          onOffline={() => void toggleOffline()}
          onPickIdea={(idea) => setPut({ kind: 'idea', idea })}
          onPickTrayItem={(index) => setPut({ kind: 'tray', index })}
        />
        {sheets}
      </>
    )
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', flex: 'none', paddingBottom: 110 }}>
      <div style={{ height: 220, position: 'relative', flex: 'none' }}>
        <CoverImage src={p.plan.cover} style={{ width: '100%', height: '100%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,0,0,.35),transparent 40%)' }} />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 54,
            zIndex: 3,
            display: 'flex',
            alignItems: 'flex-end',
            padding: '0 12px 6px',
            justifyContent: 'space-between',
          }}
        >
          <Link
            to={paths.plans}
            aria-label="Back to plans"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: PHOTO_SCRIM_5,
              color: PAPER,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="chevron-left" size={18} />
          </Link>
          <button
            type="button"
            aria-label="Plan sections"
            onClick={() => setMoreOpen(true)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: 'none',
              background: PHOTO_SCRIM_5,
              color: PAPER,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ padding: '18px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: 'var(--fg1)',
              border: '1px solid var(--border)',
              padding: '3px 7px',
              borderRadius: 4,
            }}
          >
            {p.plan.status}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{p.plan.countdown}</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, lineHeight: 1, margin: 0, fontWeight: 400 }}>{p.plan.name}</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg2)' }}>{p.plan.dates}</div>
          <PlanAvatars border="var(--bg)" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {p.plan.dest.map((d) => (
            <DestChip key={d}>{d}</DestChip>
          ))}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={p.offline.enabled}
          disabled={offlineBusy}
          onClick={() => void toggleOffline()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderRadius: 8,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            cursor: offlineBusy ? 'default' : 'pointer',
            color: 'var(--fg1)',
            gap: 12,
            opacity: offlineBusy ? 0.6 : 1,
          }}
        >
          <span style={{ fontSize: 13 }}>
            Available offline<span style={{ color: 'var(--fg3)' }}> · {offlineBusy ? 'saving…' : p.offline.note}</span>
          </span>
          <span
            style={{
              width: 36,
              height: 22,
              borderRadius: 999,
              background: p.offline.enabled ? 'var(--accent)' : 'var(--surface-2)',
              position: 'relative',
              flex: 'none',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 3,
                left: p.offline.enabled ? 17 : 3,
                width: 16,
                height: 16,
                borderRadius: 999,
                background: PAPER,
                transition: 'left 150ms',
              }}
            />
          </span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: 4, padding: '18px 20px 0', overflowX: 'auto', borderBottom: '1px solid var(--border)' }} className="hide-scrollbar">
        {p.segs.map(([label, key]) => {
          const on = key === 'more' ? p.moreKeys.includes(seg) : seg === key
          const s = segTab(on)
          const text = key === 'more' && p.moreKeys.includes(seg) ? `${MORE_LABELS[seg]} ▾` : label
          return (
            <button
              key={key}
              type="button"
              aria-pressed={on}
              onClick={() => (key === 'more' ? setMoreOpen(true) : setSeg(key as PlanSeg))}
              style={{
                flex: 'none',
                height: 38,
                padding: '0 12px',
                border: 'none',
                borderBottom: `2px solid ${s.edge}`,
                background: 'transparent',
                color: s.color,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                marginBottom: -1,
              }}
            >
              {text}
            </button>
          )
        })}
      </div>

      {segmentBody}

      <MoreSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        items={p.moreItems}
        onPick={(s) => {
          setSeg(s)
          setMoreOpen(false)
        }}
      />
      {sheets}
    </section>
  )
}
