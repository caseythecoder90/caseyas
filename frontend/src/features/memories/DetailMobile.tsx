// mobile-c-chat-calendar-notes-us.md section 1 - the memory detail: floating
// header over a 360px hero, the media grid, the two takes (never merged),
// reactions, comments and the linked-plan strip.

import { useNavigate } from 'react-router'
import { HER } from '../../people'
import type { GalleryTile, Memory, MemoryComment, MemoryDetail } from '../../data/types'
import { paths } from '../../paths'
import { Button, Icon, PAPER, PHOTO_SCRIM_6, whoStyle } from '../../ui'
import { Dots, OverPhotoButton, Photo, onEnter } from './bits'

export interface DetailViewProps {
  memory: Memory
  detail: MemoryDetail
  gallery: GalleryTile[]
  comments: MemoryComment[]
  reactions: { label: string; n: number; on: boolean }[]
  onReact: (label: string) => void
  onOpenTile: (i: number) => void
  hasPlan: boolean
  planId?: string
  planName?: string
  ini: string
}

export function DetailMobile(p: DetailViewProps) {
  const navigate = useNavigate()
  const { memory: d, detail } = p

  return (
    <section style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 3,
          height: 'calc(54px + env(safe-area-inset-top, 0px))',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          padding: '0 12px 6px',
        }}
      >
        <OverPhotoButton label="Back to Memories" onClick={() => navigate(paths.timeline)}>
          <Icon name="chevron-left" size={18} />
        </OverPhotoButton>
        <OverPhotoButton label="More">
          <Dots />
        </OverPhotoButton>
      </div>

      <div style={{ paddingBottom: 110 }}>
        <div style={{ height: 360, position: 'relative' }}>
          <Photo src={d.img} style={{ width: '100%', height: '100%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,0,0,.3),transparent 30%)' }} />
        </div>

        <div style={{ padding: '20px 20px 0' }}>
          <div className="eyebrow" style={{ color: 'var(--accent)' }}>
            {d.type}
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 38, lineHeight: 1, marginTop: 8, marginBottom: 0, fontWeight: 400 }}>{d.title}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', marginTop: 12, fontSize: 13, color: 'var(--fg2)', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{d.date}</span>
            <span>·</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon name="map-pin" size={13} />
              {d.loc}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 13, color: 'var(--fg3)' }}>
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 999,
                background: 'var(--surface-2)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--fg1)',
              }}
            >
              {p.ini}
            </span>
            {d.by} · added 3 days ago
          </div>

          {p.hasPlan && p.planId && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate(paths.plan(p.planId!))}
              onKeyDown={onEnter(() => navigate(paths.plan(p.planId!)))}
              style={{
                marginTop: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 8,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="map" size={14} />
                Planned in <span style={{ fontWeight: 500 }}>{p.planName}</span>
              </span>
              <span style={{ color: 'var(--accent)' }}>Open →</span>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 3, marginTop: 20 }}>
          {p.gallery.map((g, i) => (
            <div
              key={i}
              role="button"
              tabIndex={0}
              aria-label={`Open photo ${i + 1}`}
              onClick={() => p.onOpenTile(i)}
              onKeyDown={onEnter(() => p.onOpenTile(i))}
              style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', gridColumn: `span ${g.span}`, cursor: 'pointer' }}
            >
              <Photo src={g.src} style={{ width: '100%', height: '100%' }} />
              {g.video && (
                <>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 999,
                        background: PHOTO_SCRIM_6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: PAPER,
                      }}
                    >
                      <Icon name="play" size={16} fill="currentColor" strokeWidth={0} />
                    </span>
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      right: 6,
                      bottom: 6,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: PAPER,
                      background: PHOTO_SCRIM_6,
                      padding: '2px 5px',
                      borderRadius: 4,
                    }}
                  >
                    {g.dur}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div style={{ padding: '6px 20px 0', fontSize: 12, color: 'var(--fg3)', textAlign: 'right' }}>{d.count} · tap to open lightbox</div>

        <div style={{ padding: '28px 20px 0' }}>
          <TakeRule label="Casey's take" />
          <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.6, color: 'var(--fg1)' }}>{detail.take1a}</p>
          <blockquote
            style={{
              margin: '18px 0',
              padding: '0 0 0 16px',
              borderLeft: '1px solid var(--accent)',
              fontFamily: 'var(--font-serif)',
              fontSize: 22,
              lineHeight: 1.25,
              color: 'var(--fg1)',
            }}
          >
            {detail.quote}
          </blockquote>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: 'var(--fg1)' }}>{detail.take1b}</p>
          <Photo src={detail.inline} style={{ width: '100%', height: 220, borderRadius: 8, marginTop: 18 }} />
          <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>{detail.inlineCap}</div>
        </div>

        <div style={{ padding: '32px 20px 0' }}>
          <TakeRule label={`${HER}'s take`} />
          <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.6 }}>{detail.take2}</p>
        </div>

        <div style={{ margin: '28px 20px 0', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {p.reactions.map((r) => (
            <button
              key={r.label}
              type="button"
              aria-pressed={r.on}
              onClick={() => p.onReact(r.label)}
              style={{
                height: 34,
                padding: '0 12px',
                borderRadius: 4,
                border: `1px solid ${r.on ? 'var(--accent)' : 'var(--border)'}`,
                background: r.on ? 'var(--accent-soft)' : 'transparent',
                color: 'var(--fg1)',
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                gap: 6,
                alignItems: 'center',
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
              }}
            >
              {r.label}
              <span style={{ fontFamily: 'var(--font-mono)', fontStyle: 'normal', fontSize: 11, color: 'var(--fg3)' }}>{r.n}</span>
            </button>
          ))}
        </div>

        <div style={{ margin: '24px 20px 0', paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {p.comments.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 10 }}>
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  flex: 'none',
                  ...whoStyle(c.by === HER ? 'her' : 'me'),
                }}
              >
                {c.by[0]}
              </span>
              <div>
                <div style={{ fontSize: 14, lineHeight: 1.5 }}>{c.text}</div>
                <div style={{ fontSize: 11, color: 'var(--fg3)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>
                  {c.by} · {c.when}
                </div>
              </div>
            </div>
          ))}
          <input
            placeholder="Say something…"
            aria-label="Say something"
            style={{
              height: 44,
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              padding: '0 14px',
              color: 'var(--fg1)',
              fontSize: 14,
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, margin: '24px 20px 0' }}>
          <Button variant="secondary" style={{ flex: 1 }}>
            Edit
          </Button>
          <Button variant="secondary" style={{ flex: 1 }}>
            Add to album
          </Button>
        </div>
      </div>
    </section>
  )
}

function TakeRule({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
      <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22 }}>{label}</span>
      <span style={{ flex: 1, borderTop: '1px solid var(--border)' }} />
    </div>
  )
}
