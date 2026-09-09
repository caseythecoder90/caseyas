// desktop.md section 3 - the desktop memory detail: a 440px hero band, then a
// 680px reading measure beside a sticky media panel.

import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router'
import { HER } from '../../people'
import { paths } from '../../paths'
import { Icon, PAPER, PHOTO_SCRIM_5, PHOTO_SCRIM_6, whoStyle } from '../../ui'
import { onEnter, Photo } from './bits'
import type { DetailViewProps } from './DetailMobile'
import { heroSrc } from './media'

export function DetailDesktop(p: DetailViewProps & { inlineDesktop: string }) {
  const navigate = useNavigate()
  const { memory: d, detail } = p

  return (
    <section style={{ width: '100%' }}>
      <div style={{ height: 440, position: 'relative' }}>
        <Photo src={heroSrc(d)} style={{ width: '100%', height: '100%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,0,0,.35),transparent 35%)' }} />
        <button
          type="button"
          onClick={() => navigate(paths.timeline)}
          style={{
            position: 'absolute',
            top: 24,
            left: 48,
            height: 36,
            padding: '0 12px 0 8px',
            borderRadius: 8,
            border: 'none',
            background: PHOTO_SCRIM_5,
            color: PAPER,
            fontSize: 13,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
          }}
        >
          <Icon name="chevron-left" size={16} />
          Memories
        </button>
        <div style={{ position: 'absolute', top: 24, right: 48, display: 'flex', gap: 8 }}>
          <button
            type="button"
            style={{ height: 36, padding: '0 14px', borderRadius: 8, border: 'none', background: PHOTO_SCRIM_5, color: PAPER, fontSize: 13, cursor: 'pointer' }}
          >
            Edit
          </button>
          <button
            type="button"
            style={{ height: 36, padding: '0 14px', borderRadius: 8, border: 'none', background: PHOTO_SCRIM_5, color: PAPER, fontSize: 13, cursor: 'pointer' }}
          >
            Add to album
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 48px 80px', display: 'grid', gridTemplateColumns: 'minmax(0, 680px) minmax(240px, 1fr)', gap: 64 }}>
        <div style={{ minWidth: 0 }}>
          <div className="eyebrow" style={{ color: 'var(--accent)' }}>
            {d.type}
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 56, lineHeight: 1, marginTop: 10, marginBottom: 0, fontWeight: 400 }}>{d.title}</h1>
          <div style={{ marginTop: 16, fontSize: 14, color: 'var(--fg2)', display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{d.date}</span>
            <span>·</span>
            <span>{d.loc}</span>
            <span>·</span>
            <span>{d.by} · added 3 days ago</span>
          </div>

          <Rule label="Casey's take" style={{ marginTop: 40 }} />
          <p style={{ margin: '18px 0 0', fontSize: 17, lineHeight: 1.65 }}>{detail.take1a}</p>
          <blockquote
            style={{ margin: '24px 0', paddingLeft: 20, borderLeft: '1px solid var(--accent)', fontFamily: 'var(--font-serif)', fontSize: 28, lineHeight: 1.25 }}
          >
            {detail.quote}
          </blockquote>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.65 }}>{detail.take1b}</p>
          <Photo src={p.inlineDesktop} style={{ width: '100%', height: 380, borderRadius: 8, marginTop: 24 }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg3)', marginTop: 8 }}>{detail.inlineCap}</div>

          <Rule label={`${HER}'s take`} style={{ marginTop: 48 }} />
          <p style={{ margin: '18px 0 0', fontSize: 17, lineHeight: 1.65 }}>{detail.take2}</p>

          <div style={{ marginTop: 36, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                {r.label}
                <span style={{ fontFamily: 'var(--font-mono)', fontStyle: 'normal', fontSize: 11, color: 'var(--fg3)' }}>{r.n}</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                  <div style={{ fontSize: 15, lineHeight: 1.5 }}>{c.text}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg3)', marginTop: 3 }}>
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
                fontSize: 14,
                color: 'var(--fg1)',
              }}
            />
          </div>
        </div>

        <div style={{ position: 'sticky', top: 24, alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
          <div className="eyebrow" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8 }}>
            <span>Media</span>
            <span>{d.count}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {p.gallery.map((g, i) => (
              <div
                key={i}
                role="button"
                tabIndex={0}
                aria-label={`Open photo ${i + 1}`}
                onClick={() => p.onOpenTile(i)}
                onKeyDown={onEnter(() => p.onOpenTile(i))}
                style={{ position: 'relative', aspectRatio: '1', borderRadius: 6, overflow: 'hidden', gridColumn: `span ${g.span}`, cursor: 'pointer' }}
              >
                <Photo src={g.src} style={{ width: '100%', height: '100%' }} />
                {g.video && (
                  <span
                    style={{
                      position: 'absolute',
                      right: 8,
                      bottom: 8,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: PAPER,
                      background: PHOTO_SCRIM_6,
                      padding: '2px 6px',
                      borderRadius: 4,
                    }}
                  >
                    ▶ {g.dur}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg3)' }}>Click any tile to open the lightbox</div>
        </div>
      </div>
    </section>
  )
}

function Rule({ label, style }: { label: string; style?: CSSProperties }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, ...style }}>
      <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 26 }}>{label}</span>
      <span style={{ flex: 1, borderTop: '1px solid var(--border)' }} />
    </div>
  )
}
