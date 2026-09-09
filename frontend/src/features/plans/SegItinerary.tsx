// mobile-b-plans.md 2.5 - Itinerary (Schedule for an event): the unscheduled
// tray, sticky day headers, item cards and the dashed "+ Add to day N" button.
// Every card is a tap target that opens the item sheet (edit, move, delete,
// maps). Tray rows are also draggable onto a day; "Put it on a day" lives in
// the sheet's actions so the interaction works without a pointer.

import { useState } from 'react'
import type { ItineraryDay } from '../../data/types'
import { Eyebrow, Kind } from '../../ui'
import { KindTag } from './bits'
import { TRAY_PREFIX, type TrayItem } from './usePlanBoard'

const EMPTY_DAY = 'Nothing yet. A free day is allowed.'

export interface SegItineraryProps {
  days: ItineraryDay[]
  unscheduled: TrayItem[]
  onAddToDay: (dayN: number) => void
  onDropOnDay: (trayIndex: number, dayN: number) => void
  onOpenItem: (itemId: string) => void
}

export function SegItinerary({ days, unscheduled, onAddToDay, onDropOnDay, onOpenItem }: SegItineraryProps) {
  const [over, setOver] = useState<number | null>(null)

  return (
    <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {unscheduled.length > 0 && (
        <div style={{ borderRadius: 8, border: '1px dashed var(--border)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Eyebrow size={10}>Unscheduled · {unscheduled.length} · drag onto a day, or tap</Eyebrow>
          {unscheduled.map((u) => (
            <button
              key={u.id ?? u.index}
              type="button"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', `${TRAY_PREFIX}${u.index}`)
                e.dataTransfer.effectAllowed = 'move'
              }}
              onClick={() => u.id && onOpenItem(u.id)}
              aria-label={`Open ${u.title}`}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                fontSize: 14,
                border: 'none',
                background: 'transparent',
                color: 'var(--fg1)',
                padding: 0,
                textAlign: 'left',
                cursor: 'grab',
                width: '100%',
              }}
            >
              <KindTag>{u.kind}</KindTag>
              <span style={{ flex: 1, minWidth: 0 }}>{u.title}</span>
              <span style={{ fontSize: 12, color: 'var(--fg3)' }}>{u.place}</span>
            </button>
          ))}
        </div>
      )}

      {days.map((dy) => (
        <div
          key={dy.n}
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
            setOver(dy.n)
          }}
          onDragLeave={() => setOver((o) => (o === dy.n ? null : o))}
          onDrop={(e) => {
            e.preventDefault()
            setOver(null)
            const raw = e.dataTransfer.getData('text/plain')
            if (!raw.startsWith(TRAY_PREFIX)) return
            const idx = Number(raw.slice(TRAY_PREFIX.length))
            if (Number.isInteger(idx)) onDropOnDay(idx, dy.n)
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            outline: over === dy.n ? '1px dashed var(--accent)' : undefined,
            outlineOffset: over === dy.n ? 6 : undefined,
            borderRadius: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, position: 'sticky', top: 0, background: 'var(--bg)', padding: '6px 0', zIndex: 2 }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 30, lineHeight: 1 }}>Day {dy.n}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg2)' }}>
              {dy.dow} {dy.date}
            </span>
            <span style={{ flex: 1 }} />
            <span style={{ fontSize: 12, color: 'var(--fg3)' }}>{dy.city}</span>
          </div>

          {dy.items.map((it, i) => (
            <div
              key={it.id ?? `${dy.n}-${i}-${it.title}`}
              role="button"
              tabIndex={0}
              aria-label={`Open ${it.title}`}
              onClick={() => it.id && onOpenItem(it.id)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && it.id) {
                  e.preventDefault()
                  onOpenItem(it.id)
                }
              }}
              style={{
                display: 'grid',
                gridTemplateColumns: '64px 1fr',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.2 }}>{it.time}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg3)', marginTop: 6 }}>
                  {it.kind}
                </div>
              </div>
              <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ fontSize: 15, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {it.title}
                  {it.booked && <Kind status="booked">booked</Kind>}
                </div>
                <div style={{ fontSize: 13, color: 'var(--fg2)' }}>{it.place}</div>
                <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--fg3)', fontFamily: 'var(--font-mono)' }}>
                  <span>{it.cost}</span>
                  <span>{it.docs ? `${it.docs} file${it.docs > 1 ? 's' : ''}` : ''}</span>
                  <span style={{ marginLeft: 'auto' }}>{it.by}</span>
                </div>
              </div>
            </div>
          ))}

          {dy.items.length === 0 && (
            <div style={{ padding: 14, color: 'var(--fg3)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 17 }}>{EMPTY_DAY}</div>
          )}

          <button
            type="button"
            onClick={() => onAddToDay(dy.n)}
            style={{
              height: 36,
              borderRadius: 8,
              border: '1px dashed var(--border)',
              background: 'transparent',
              color: 'var(--fg2)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            + Add to day {dy.n}
          </button>
        </div>
      ))}
    </div>
  )
}
