// desktop.md section 2 - the desktop Memories timeline: title row with inline
// filters + search, the wide "On this day" strip, and a sticky year gutter next
// to one 6-column card grid per month.

import { useNavigate } from 'react-router'
import { useMemories } from '../../data/hooks'
import type { Memory, MemoryFilter } from '../../data/types'
import { paths } from '../../paths'
import { Chip, Icon, PAPER, PHOTO_SCRIM_55 } from '../../ui'
import { onEnter, Photo } from './bits'
import { onThisDayDesktopSrc } from './media'
import { memoriesStore, setFilter } from './state'

const SIZES = {
  large: { cols: 6, dir: 'row' as const, imgW: '60%', imgH: 380, pad: '28px 28px 28px 14px', title: 40 },
  medium: { cols: 3, dir: 'column' as const, imgW: '100%', imgH: 220, pad: '14px 16px 18px', title: 26 },
  compact: { cols: 2, dir: 'column' as const, imgW: '100%', imgH: 150, pad: '14px 16px 18px', title: 20 },
}

export function TimelineDesktop() {
  const navigate = useNavigate()
  const { memories, filters, filterMemories, withShowMonth, onThisDay } = useMemories()
  const filter = memoriesStore.use((s) => s.filter)
  const open = (id: number) => navigate(paths.memory(id))

  const list = withShowMonth(filterMemories(memories, filter))
  const months: { label: string; items: Memory[] }[] = []
  for (const m of list) {
    const last = months[months.length - 1]
    if (last && last.label === m.month) last.items.push(m)
    else months.push({ label: m.month, items: [m] })
  }
  const year = list[0]?.date.match(/\d{4}/)?.[0] ?? '2026'

  return (
    <section style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 48px 64px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 56, lineHeight: 1, margin: 0, fontWeight: 400 }}>Memories</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {filters.map((f: MemoryFilter) => (
            <Chip key={f} size="md" selected={filter === f} onClick={() => setFilter(f)}>
              {f}
            </Chip>
          ))}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 32,
              padding: '0 12px',
              width: 180,
              border: '1px solid var(--border)',
              borderRadius: 4,
              color: 'var(--fg3)',
              fontSize: 13,
            }}
          >
            <Icon name="search" size={14} />
            Search
          </div>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => open(onThisDay.memId)}
        onKeyDown={onEnter(() => open(onThisDay.memId))}
        style={{
          marginTop: 28,
          display: 'grid',
          gridTemplateColumns: '120px 1fr auto',
          gap: 20,
          alignItems: 'center',
          padding: 14,
          borderRadius: 8,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          cursor: 'pointer',
        }}
      >
        <Photo src={onThisDayDesktopSrc()} style={{ width: 120, height: 80, borderRadius: 6 }} />
        <div>
          <div className="eyebrow" style={{ color: 'var(--accent)' }}>
            {onThisDay.eyebrow}
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1.1, marginTop: 4 }}>{onThisDay.title}</div>
          <div style={{ fontSize: 14, color: 'var(--fg2)', marginTop: 4 }}>{onThisDay.sub}</div>
        </div>
        <span style={{ color: 'var(--fg3)', fontSize: 20, paddingRight: 8 }}>→</span>
      </div>

      <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '120px 1fr', gap: 32 }}>
        <div style={{ position: 'sticky', top: 40, alignSelf: 'start', fontFamily: 'var(--font-serif)', fontSize: 28, lineHeight: 1, color: 'var(--fg3)' }}>
          {year}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40, minWidth: 0 }}>
          {months.map((mo) => (
            <div key={mo.label}>
              <div className="blur-paper eyebrow" style={{ position: 'sticky', top: 0, zIndex: 2, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                {mo.label}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 16, marginTop: 16, gridAutoRows: 'auto' }}>
                {mo.items.map((m) => (
                  <MemoryCard key={m.id} m={m} onOpen={open} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MemoryCard({ m, onOpen }: { m: Memory; onOpen: (id: number) => void }) {
  const s = SIZES[m.size]
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(m.id)}
      onKeyDown={onEnter(() => onOpen(m.id))}
      style={{
        gridColumn: `span ${s.cols}`,
        borderRadius: 8,
        overflow: 'hidden',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: s.dir,
        gap: 14,
        cursor: 'pointer',
        minWidth: 0,
      }}
    >
      <div style={{ position: 'relative', flex: 'none', width: s.imgW }}>
        <Photo src={m.img} style={{ width: '100%', height: s.imgH }} />
        <span
          style={{
            position: 'absolute',
            right: 10,
            bottom: 10,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: PAPER,
            background: PHOTO_SCRIM_55,
            padding: '3px 6px',
            borderRadius: 4,
          }}
        >
          {m.count}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, padding: s.pad, flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.08em', color: 'var(--fg3)' }}>
          {m.date} · {m.type}
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: s.title, lineHeight: 1.08 }}>{m.title}</div>
        <div style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.5 }}>{m.size === 'large' ? (m.exLong ?? m.ex) : m.ex}</div>
        <div style={{ marginTop: 'auto', fontSize: 12, color: 'var(--fg3)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name="map-pin" size={12} />
            {m.loc}
          </span>
          <span>{m.by}</span>
        </div>
      </div>
    </div>
  )
}
