// Route "/gallery" - mobile-a-memories.md section 4: every photo by month, or
// albums; Select enters multi-select, Delete opens the confirm dialog and the
// removed tiles stay gone for the session.

import { useNavigate } from 'react-router'
import { useGallery } from '../../data/hooks'
import type { GalleryFilter, PhotoTile } from '../../data/types'
import { HER } from '../../people'
import { paths } from '../../paths'
import { Button, Chip, DANGER_LITERAL, Icon, PAPER, PHOTO_SCRIM_6, Segmented, Sheet } from '../../ui'
import { onEnter, Photo } from './bits'
import { exitSelecting, memoriesStore, setGalFilter, setGalSeg, toggleSelected, toggleSelecting } from './state'
import { useIsDesktop } from './useIsDesktop'
import { useState } from 'react'

const SEGMENTS = [
  { key: 'photos' as const, label: 'Photos' },
  { key: 'albums' as const, label: 'Albums' },
]

export default function GalleryPage() {
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const { monthsFor, deleteTiles, filters, customAlbums, autoAlbums } = useGallery()
  const galSeg = memoriesStore.use((s) => s.galSeg)
  const galFilter = memoriesStore.use((s) => s.galFilter)
  const selecting = memoriesStore.use((s) => s.selecting)
  const sel = memoriesStore.use((s) => s.sel)
  const [del, setDel] = useState(false)

  const months = monthsFor(galFilter)
  const cols = isDesktop ? 6 : 3

  const pickTile = (t: PhotoTile) => {
    if (selecting) toggleSelected(t.id)
    else navigate(`${paths.memory(3)}?lb=1`)
  }

  const doDelete = () => {
    deleteTiles(sel)
    exitSelecting()
    setDel(false)
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%', maxWidth: isDesktop ? 1120 : undefined, margin: isDesktop ? '0 auto' : undefined }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isDesktop ? '32px 48px 0' : '4px 12px 0', gap: 12 }}>
        {isDesktop ? (
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, lineHeight: 1, margin: 0, fontWeight: 400 }}>Gallery</h1>
        ) : (
          <button
            type="button"
            aria-label="Back to Memories"
            onClick={() => navigate(paths.timeline)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              color: 'var(--fg2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Icon name="chevron-left" size={18} />
          </button>
        )}
        <Segmented options={SEGMENTS} value={galSeg} onChange={setGalSeg} aria-label="Gallery segment" />
        <button
          type="button"
          onClick={toggleSelecting}
          style={{
            height: 32,
            padding: '0 10px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: selecting ? 'var(--surface-2)' : 'transparent',
            color: 'var(--fg1)',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          {selecting ? 'Done' : 'Select'}
        </button>
      </div>

      {galSeg === 'photos' ? (
        <>
          <div
            className="hide-scrollbar"
            style={{ display: 'flex', gap: 6, padding: isDesktop ? '18px 48px 0' : '14px 20px 0', overflowX: 'auto' }}
          >
            {filters.map((f: GalleryFilter) => (
              <Chip key={f} selected={galFilter === f} onClick={() => setGalFilter(f)} style={{ flex: 'none' }}>
                {f}
              </Chip>
            ))}
          </div>

          <div style={{ padding: isDesktop ? '8px 48px 64px' : '8px 0 120px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {months.map((gm) => (
              <div key={gm.key}>
                <div
                  className="blur-paper"
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    padding: isDesktop ? '10px 0 6px' : '10px 20px 6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20 }}>{gm.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg3)' }}>{gm.countLabel}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 2, padding: isDesktop ? 0 : '0 2px' }}>
                  {gm.tiles.map((t) => {
                    const on = sel.includes(t.id)
                    return (
                      <div
                        key={t.id}
                        role="button"
                        tabIndex={0}
                        aria-label={selecting ? (on ? 'Deselect photo' : 'Select photo') : 'Open photo'}
                        aria-pressed={selecting ? on : undefined}
                        onClick={() => pickTile(t)}
                        onKeyDown={onEnter(() => pickTile(t))}
                        style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', cursor: 'pointer' }}
                      >
                        <Photo src={t.src} style={{ width: '100%', height: '100%', opacity: selecting && !on ? 0.7 : 1 }} />
                        {t.video && (
                          <span
                            style={{
                              position: 'absolute',
                              right: 5,
                              bottom: 5,
                              fontFamily: 'var(--font-mono)',
                              fontSize: 9,
                              color: PAPER,
                              background: PHOTO_SCRIM_6,
                              padding: '1px 4px',
                              borderRadius: 3,
                            }}
                          >
                            ▶ {t.dur}
                          </span>
                        )}
                        {t.fav && (
                          <span style={{ position: 'absolute', left: 5, bottom: 5, color: PAPER, display: 'flex' }}>
                            <Icon name="heart" size={12} fill="currentColor" />
                          </span>
                        )}
                        {selecting &&
                          (on ? (
                            <span
                              style={{
                                position: 'absolute',
                                top: 6,
                                right: 6,
                                width: 20,
                                height: 20,
                                borderRadius: 999,
                                background: 'var(--accent)',
                                border: `2px solid ${PAPER}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: PAPER,
                              }}
                            >
                              <Icon name="check" size={11} strokeWidth={2.5} />
                            </span>
                          ) : (
                            <span
                              style={{
                                position: 'absolute',
                                top: 6,
                                right: 6,
                                width: 20,
                                height: 20,
                                borderRadius: 999,
                                border: `2px solid ${PAPER}`,
                                background: 'rgba(18,17,16,.3)',
                              }}
                            />
                          ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ padding: isDesktop ? '20px 48px 64px' : '20px 20px 120px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Yours
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4,1fr)' : '1fr 1fr', gap: 12 }}>
              {customAlbums.map((a) => (
                <div key={a.name} style={{ cursor: 'pointer' }}>
                  <div style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden' }}>
                    <Photo src={a.src} style={{ width: '100%', height: '100%' }} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 19, lineHeight: 1.1, marginTop: 8 }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg3)' }}>{a.count}</div>
                </div>
              ))}
              <button
                type="button"
                style={{
                  aspectRatio: '1',
                  borderRadius: 8,
                  border: '1px dashed var(--border)',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--fg3)',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                + New album
              </button>
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              One per memory
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {autoAlbums.map((a) => (
                <div
                  key={a.name}
                  role="button"
                  tabIndex={0}
                  onClick={() => a.memId && navigate(paths.memory(a.memId))}
                  onKeyDown={onEnter(() => a.memId && navigate(paths.memory(a.memId)))}
                  style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderTop: '1px solid var(--border)', cursor: 'pointer' }}
                >
                  <Photo src={a.src} style={{ width: 48, height: 48, borderRadius: 6, flex: 'none' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg3)' }}>{a.count}</div>
                  </div>
                  <span style={{ color: 'var(--fg3)' }}>→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selecting && (
        <div
          style={{
            position: 'fixed',
            left: isDesktop ? 252 : 12,
            right: 12,
            bottom: isDesktop ? 24 : 100,
            zIndex: 7,
            background: 'var(--fg1)',
            color: 'var(--bg)',
            borderRadius: 8,
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: 'var(--shadow-md)',
            maxWidth: isDesktop ? 640 : undefined,
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '0 6px', flex: 'none' }}>{sel.length} selected</span>
          <span style={{ flex: 1 }} />
          <div className="hide-scrollbar" style={{ display: 'flex', gap: 6, overflowX: 'auto', minWidth: 0 }}>
            <BarButton>To memory</BarButton>
            <BarButton>To album</BarButton>
            <BarButton>Save</BarButton>
            <BarButton color={DANGER_LITERAL} onClick={() => sel.length && setDel(true)}>
              Delete
            </BarButton>
          </div>
        </div>
      )}

      <Sheet open={del} onClose={() => setDel(false)} variant="dialog" aria-label="Delete photos">
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, lineHeight: 1.1 }}>Delete {sel.length} photos?</div>
        <div style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.5 }}>
          They'll leave every memory and album they're in. {HER} will see they're gone. This can't be undone.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" style={{ flex: 1 }} onClick={() => setDel(false)}>
            Keep them
          </Button>
          <button
            type="button"
            onClick={doDelete}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 8,
              border: 'none',
              background: '#b33e26',
              color: PAPER,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>
      </Sheet>
    </section>
  )
}

function BarButton({ children, color, onClick }: { children: string; color?: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 32,
        padding: '0 10px',
        borderRadius: 6,
        border: 'none',
        background: 'transparent',
        color: color ?? 'var(--bg)',
        fontSize: 12,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}
