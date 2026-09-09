// mobile-a-memories.md section 3 - the Memories timeline: header, filter chips,
// "On this day", one of three layouts (editorial / photo grid / journal) and the
// accent FAB that opens the New memory sheet.
//
// `timelineLayout` and `showOnThisDay` were canvas props with no in-app control;
// the header's third (dev-only) button opens LayoutTweaksSheet so all three
// layouts are reachable in the SPA.

import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useMemories } from '../../data/hooks'
import type { Memory, MemoryFilter } from '../../data/types'
import { paths } from '../../paths'
import { Chip, EmptyState, Icon, IconButton, PAPER, PHOTO_SCRIM_55 } from '../../ui'
import { Fab, MonthHeader, onEnter, Photo } from './bits'
import { LayoutTweaksButton, LayoutTweaksSheet } from './LayoutTweaks'
import { NewMemorySheet } from './NewMemorySheet'
import { memoriesStore, setFilter } from './state'

export function TimelineMobile() {
  const navigate = useNavigate()
  const { memories, filters, filterMemories, withShowMonth, layout, setLayout, showOnThisDay, setShowOnThisDay, onThisDay } = useMemories()
  const filter = memoriesStore.use((s) => s.filter)
  const [sheet, setSheet] = useState(false)
  const [tweaks, setTweaks] = useState(false)

  const list = withShowMonth(filterMemories(memories, filter))
  const open = (id: number) => navigate(paths.memory(id))

  return (
    <section style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '8px 20px 0' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, lineHeight: 1 }}>Memories</div>
        <div style={{ display: 'flex', gap: 2 }}>
          <IconButton label="Gallery" onClick={() => navigate(paths.gallery)} style={{ borderRadius: 8 }}>
            <Icon name="grid" size={20} />
          </IconButton>
          <IconButton label="Search memories" style={{ borderRadius: 8 }}>
            <Icon name="search" size={20} />
          </IconButton>
          <LayoutTweaksButton onClick={() => setTweaks(true)} />
        </div>
      </div>

      <div className="hide-scrollbar" style={{ display: 'flex', gap: 8, padding: '16px 20px 4px', overflowX: 'auto', flex: 'none' }}>
        {filters.map((f: MemoryFilter) => (
          <Chip key={f} size="md" selected={filter === f} onClick={() => setFilter(f)} style={{ flex: 'none' }}>
            {f}
          </Chip>
        ))}
      </div>

      {showOnThisDay && (
        <button
          type="button"
          onClick={() => open(onThisDay.memId)}
          style={{
            margin: '12px 20px 0',
            padding: 12,
            borderRadius: 8,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            cursor: 'pointer',
            textAlign: 'left',
            color: 'var(--fg1)',
          }}
        >
          <Photo src={onThisDay.img} style={{ width: 52, height: 52, borderRadius: 6, flex: 'none' }} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span className="eyebrow" style={{ display: 'block', color: 'var(--accent)' }}>
              {onThisDay.eyebrow}
            </span>
            <span style={{ display: 'block', fontFamily: 'var(--font-serif)', fontSize: 19, lineHeight: 1.15, marginTop: 2 }}>
              {onThisDay.title}
            </span>
          </span>
          <span style={{ color: 'var(--fg3)', fontSize: 18 }}>→</span>
        </button>
      )}

      {list.length === 0 ? (
        <div style={{ padding: '20px 20px 110px' }}>
          <EmptyState cta={{ label: 'Write the first one →', onClick: () => navigate(paths.compose) }} />
        </div>
      ) : layout === 'editorial' ? (
        <EditorialStack list={list} onOpen={open} />
      ) : layout === 'grid' ? (
        <PhotoGrid list={list} onOpen={open} />
      ) : (
        <JournalList list={list} onOpen={open} />
      )}

      <Fab label="New memory" onClick={() => setSheet(true)}>
        <Icon name="plus" size={22} />
      </Fab>
      <NewMemorySheet open={sheet} onClose={() => setSheet(false)} />
      <LayoutTweaksSheet
        open={tweaks}
        onClose={() => setTweaks(false)}
        layout={layout}
        setLayout={setLayout}
        showOnThisDay={showOnThisDay}
        setShowOnThisDay={setShowOnThisDay}
      />
    </section>
  )
}

interface LayoutProps {
  list: Memory[]
  onOpen: (id: number) => void
}

// ---------------------------------------------------------------- A: editorial

function EditorialStack({ list, onOpen }: LayoutProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '8px 0 110px' }}>
      {list.map((m) => (
        <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {m.showMonth && <MonthHeader>{m.month}</MonthHeader>}
          {m.size === 'large' && (
            <div role="button" tabIndex={0} onClick={() => onOpen(m.id)} onKeyDown={onEnter(() => onOpen(m.id))} style={{ cursor: 'pointer' }}>
              <div style={{ position: 'relative', height: 300, overflow: 'hidden' }}>
                <Photo src={m.img} style={{ width: '100%', height: '100%' }} />
                <div
                  className="eyebrow"
                  style={{ position: 'absolute', top: 12, left: 20, color: PAPER, background: PHOTO_SCRIM_55, padding: '4px 8px', borderRadius: 4 }}
                >
                  {m.type}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    right: 20,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: PAPER,
                    background: PHOTO_SCRIM_55,
                    padding: '4px 8px',
                    borderRadius: 4,
                  }}
                >
                  {m.count}
                </div>
              </div>
              <div style={{ padding: '14px 20px 0' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30, lineHeight: 1.05 }}>{m.title}</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8, fontSize: 13, color: 'var(--fg2)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{m.date}</span>
                  <span>·</span>
                  <span>{m.loc}</span>
                </div>
                <div style={{ marginTop: 8, color: 'var(--fg2)', fontSize: 15, lineHeight: 1.5 }}>{m.ex}</div>
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--fg3)' }}>{m.by} added this</div>
              </div>
            </div>
          )}
          {m.size === 'medium' && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => onOpen(m.id)}
              onKeyDown={onEnter(() => onOpen(m.id))}
              style={{
                margin: '0 20px',
                borderRadius: 8,
                overflow: 'hidden',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2, height: 180 }}>
                <Photo src={m.img} style={{ width: '100%', height: '100%' }} />
                <Photo src={m.img2} style={{ width: '100%', height: '100%' }} />
              </div>
              <div style={{ padding: '14px 16px 16px' }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg3)', letterSpacing: '.08em' }}
                >
                  <span>{m.date}</span>
                  <span>{m.count}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, lineHeight: 1.1, marginTop: 6 }}>{m.title}</div>
                <div style={{ marginTop: 6, color: 'var(--fg2)', fontSize: 14 }}>{m.ex}</div>
              </div>
            </div>
          )}
          {m.size === 'compact' && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => onOpen(m.id)}
              onKeyDown={onEnter(() => onOpen(m.id))}
              style={{ margin: '0 20px', display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer', padding: '4px 0' }}
            >
              <Photo src={m.img} style={{ width: 72, height: 72, borderRadius: 8, flex: 'none' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg3)', letterSpacing: '.08em' }}>
                  {m.date} · {m.type}
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 21, lineHeight: 1.1, marginTop: 3 }}>{m.title}</div>
                <div style={{ fontSize: 13, color: 'var(--fg2)', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.ex}</div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------- B: photo grid

function PhotoGrid({ list, onOpen }: LayoutProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridAutoRows: '150px',
        gridAutoFlow: 'dense',
        gap: 6,
        padding: '16px 12px 110px',
      }}
    >
      {list.map((m) => (
        <div
          key={m.id}
          role="button"
          tabIndex={0}
          onClick={() => onOpen(m.id)}
          onKeyDown={onEnter(() => onOpen(m.id))}
          style={{
            position: 'relative',
            borderRadius: 8,
            overflow: 'hidden',
            cursor: 'pointer',
            gridColumn: `span ${m.size === 'large' ? 2 : 1}`,
            gridRow: `span ${m.size === 'compact' ? 1 : 2}`,
          }}
        >
          <Photo src={m.img} style={{ width: '100%', height: '100%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(18,17,16,.8),transparent 55%)' }} />
          <div style={{ position: 'absolute', left: 12, right: 12, bottom: 10, color: PAPER }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', opacity: 0.8 }}>{m.date}</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: m.size === 'large' ? 26 : 18, lineHeight: 1.05, marginTop: 2 }}>{m.title}</div>
          </div>
          {m.size === 'large' && (
            <div
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: PAPER,
                background: PHOTO_SCRIM_55,
                padding: '3px 6px',
                borderRadius: 4,
              }}
            >
              {m.count}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------- C: journal

function JournalList({ list, onOpen }: LayoutProps) {
  return (
    <div style={{ padding: '20px 20px 110px', display: 'flex', flexDirection: 'column' }}>
      {list.map((m) => (
        <div
          key={m.id}
          role="button"
          tabIndex={0}
          onClick={() => onOpen(m.id)}
          onKeyDown={onEnter(() => onOpen(m.id))}
          style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 16, padding: '18px 0', borderTop: '1px solid var(--border)', cursor: 'pointer' }}
        >
          <div style={{ fontFamily: 'var(--font-serif)', lineHeight: 1 }}>
            <div style={{ fontSize: 32 }}>{m.day}</div>
            <div className="eyebrow eyebrow-sm" style={{ marginTop: 4 }}>
              {m.mon}
            </div>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, lineHeight: 1.1 }}>{m.title}</div>
            <div style={{ fontSize: 14, color: 'var(--fg2)', marginTop: 6, lineHeight: 1.5 }}>{m.ex}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, height: 56 }}>
              <Photo src={m.img} style={{ width: 56, height: 56, borderRadius: 6 }} />
              {!!m.img2 && (
                <>
                  <Photo src={m.img2} style={{ width: 56, height: 56, borderRadius: 6 }} />
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 6,
                      background: 'var(--surface-2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      color: 'var(--fg2)',
                    }}
                  >
                    {m.more}
                  </div>
                </>
              )}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg3)', marginTop: 10, letterSpacing: '.06em' }}>
              {m.type} · {m.loc} · {m.by}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
