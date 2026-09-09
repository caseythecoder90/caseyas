// desktop.md section 4 - the desktop composer: a sticky top bar with the
// privacy toggle and Publish, then the writing column beside a 400px media tray.

import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router'
import { COMPOSER_DESKTOP, COMPOSER_TYPES } from '../../data/mock'
import type { MemoryType } from '../../data/types'
import { paths } from '../../paths'
import { Icon, PAPER, PHOTO_FILTER, PHOTO_SCRIM_5, PHOTO_SCRIM_6, Toggle } from '../../ui'
import { BodyEditor } from './BodyEditor'
import { useComposer } from './useComposer'

const CHIP: CSSProperties = {
  height: 34,
  padding: '0 12px',
  borderRadius: 4,
  fontSize: 13,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--fg1)',
  whiteSpace: 'nowrap',
}

export function ComposerDesktop({ fromPlan }: { fromPlan: boolean }) {
  const navigate = useNavigate()
  const c = useComposer(fromPlan, true)
  const { draft } = c
  const showBanner = fromPlan && !draft.cleared

  return (
    <section style={{ width: '100%' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 3,
          padding: '20px 48px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            type="button"
            onClick={() => navigate(paths.timeline)}
            style={{
              height: 36,
              padding: '0 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--fg1)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            ← Back
          </button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg3)' }}>{c.stateLabel}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span id="composer-priv-d" style={{ fontSize: 14, color: 'var(--fg2)' }}>
              {COMPOSER_DESKTOP.privacyLabel}
            </span>
            <Toggle on={draft.priv} onChange={c.setPriv} aria-labelledby="composer-priv-d" />
          </div>
          <button
            type="button"
            onClick={() => {
              c.publish()
              navigate(paths.timeline)
            }}
            style={{
              height: 36,
              padding: '0 16px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--accent)',
              color: PAPER,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Publish
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 48, padding: '40px 48px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          {showBanner && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: 'var(--accent-soft)',
                border: '1px solid var(--accent)',
                fontSize: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span>{c.copy.banner}</span>
              <button
                type="button"
                onClick={c.clearPrefill}
                style={{ flex: 'none', border: 'none', background: 'transparent', color: 'var(--accent)', fontSize: 12, cursor: 'pointer', padding: 0 }}
              >
                Clear
              </button>
            </div>
          )}

          <input
            value={draft.title}
            onChange={(e) => c.setTitle(e.target.value)}
            placeholder="Give it a title"
            aria-label="Title"
            style={{
              height: 64,
              border: 'none',
              borderBottom: '1px solid var(--border)',
              background: 'transparent',
              borderRadius: 0,
              padding: 0,
              width: '100%',
              fontFamily: 'var(--font-serif)',
              fontSize: 48,
              color: 'var(--fg1)',
            }}
          />

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={CHIP}>
              <Icon name="calendar" size={14} />
              {c.copy.dates}
            </span>
            <span style={CHIP}>
              <Icon name="map-pin" size={14} />
              {c.copy.loc}
            </span>
            {COMPOSER_TYPES.map((t: MemoryType) => (
              <button
                key={t}
                type="button"
                aria-pressed={draft.type === t}
                onClick={() => c.setType(t)}
                style={{
                  ...CHIP,
                  cursor: 'pointer',
                  background: draft.type === t ? 'var(--accent-soft)' : 'transparent',
                  border: `1px solid ${draft.type === t ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {t}
              </button>
            ))}
            <span style={{ ...CHIP, borderStyle: 'dashed', color: 'var(--fg3)' }}>+ tag</span>
          </div>

          <BodyEditor blocks={draft.blocks} onChange={c.setBlocks} scale="desktop" />
        </div>

        <div style={{ position: 'sticky', top: 100, alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="eyebrow">Media · {c.mediaLabel}</span>
            <span style={{ fontSize: 12, color: 'var(--fg3)' }}>Drag to reorder</span>
          </div>
          <button
            type="button"
            onClick={c.addMedia}
            style={{
              border: '1px dashed var(--border)',
              borderRadius: 8,
              padding: 24,
              textAlign: 'center',
              background: 'var(--surface)',
              color: 'var(--fg2)',
              fontSize: 14,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Drop photos or videos here
            <span style={{ display: 'block', fontSize: 12, color: 'var(--fg3)', marginTop: 4 }}>or click to browse</span>
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {draft.media.map((m, i) => (
              <button
                key={m.seed}
                type="button"
                aria-label={draft.cover === i ? `Photo ${i + 1} is the cover` : `Make photo ${i + 1} the cover`}
                aria-pressed={draft.cover === i}
                onClick={() => c.setCover(i)}
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: 6,
                  overflow: 'hidden',
                  border: `1px solid ${draft.cover === i ? 'var(--accent)' : 'var(--border)'}`,
                  cursor: 'grab',
                  padding: 0,
                  background: 'transparent',
                }}
              >
                <img
                  src={m.src}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: PHOTO_FILTER, opacity: m.uploading ? 0.6 : 1 }}
                />
                {draft.cover === i && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 6,
                      left: 6,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      letterSpacing: '.1em',
                      textTransform: 'uppercase',
                      color: PAPER,
                      background: 'var(--accent)',
                      padding: '3px 6px',
                      borderRadius: 3,
                    }}
                  >
                    Cover
                  </span>
                )}
                {m.uploading && (
                  <>
                    <span
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: PAPER,
                      }}
                    >
                      {m.pct}
                    </span>
                    <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: PHOTO_SCRIM_5 }}>
                      <span style={{ display: 'block', width: '62%', height: '100%', background: 'var(--accent)' }} />
                    </span>
                  </>
                )}
                {!!m.cap && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      padding: '4px 6px',
                      fontSize: 10,
                      color: PAPER,
                      background: PHOTO_SCRIM_6,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'left',
                    }}
                  >
                    {m.cap}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg3)', lineHeight: 1.5 }}>
            Hover a tile: set cover, caption, remove. Drag a tile into the text to insert it inline.
          </div>
          {showBanner && <div style={{ fontSize: 12, color: 'var(--fg3)' }}>{c.copy.pickerNote}</div>}
        </div>
      </div>
    </section>
  )
}
