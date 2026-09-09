// mobile-a-memories.md section 5 - the full-screen composer: prefill banner,
// title, date / place / type chips, the media strip, the body editor and the
// privacy footer.

import { useNavigate } from 'react-router'
import { COMPOSER_DESKTOP, COMPOSER_TYPES, privNote } from '../../data/mock'
import type { MemoryType } from '../../data/types'
import { HER } from '../../people'
import { paths } from '../../paths'
import { Chip, Icon, PAPER, PHOTO_FILTER, PHOTO_SCRIM_5, PHOTO_SCRIM_6, Toggle } from '../../ui'
import { BodyEditor } from './BodyEditor'
import { useComposer } from './useComposer'

export function ComposerMobile({ fromPlan }: { fromPlan: boolean }) {
  const navigate = useNavigate()
  const c = useComposer(fromPlan, false)
  const { draft } = c
  const showBanner = fromPlan && !draft.cleared

  return (
    <section style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 12px 0', gap: 8 }}>
        <button
          type="button"
          onClick={() => navigate(paths.timeline)}
          style={{ height: 36, padding: '0 10px', borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--fg2)', fontSize: 14, cursor: 'pointer' }}
        >
          Close
        </button>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg3)' }}>{c.stateLabel}</span>
        <button
          type="button"
          onClick={() => {
            c.publish()
            navigate(paths.timeline)
          }}
          style={{
            height: 36,
            padding: '0 14px',
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

      <div style={{ padding: '12px 20px 120px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {showBanner && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent)',
              fontSize: 12,
              color: 'var(--fg1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{c.copy.banner}</span>
            <button
              type="button"
              onClick={c.clearPrefill}
              style={{ flex: 'none', marginLeft: 8, border: 'none', background: 'transparent', color: 'var(--accent)', fontSize: 12, cursor: 'pointer', padding: 0 }}
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
            height: 56,
            border: 'none',
            borderBottom: '1px solid var(--border)',
            background: 'transparent',
            fontFamily: 'var(--font-serif)',
            fontSize: 32,
            color: 'var(--fg1)',
            padding: 0,
            borderRadius: 0,
            width: '100%',
          }}
        />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Chip asSpan size="md" style={{ color: 'var(--fg1)', fontWeight: 400 }}>
            {c.copy.dates}
          </Chip>
          <Chip asSpan size="md" style={{ color: fromPlan ? 'var(--fg1)' : 'var(--fg3)', fontWeight: 400 }}>
            {c.copy.loc}
          </Chip>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {COMPOSER_TYPES.map((t: MemoryType) => (
            <Chip key={t} tone="accent" selected={draft.type === t} onClick={() => c.setType(t)} style={{ color: 'var(--fg1)' }}>
              {t}
            </Chip>
          ))}
          <Chip asSpan add>
            + tag
          </Chip>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span className="eyebrow">Media · {c.mediaLabel}</span>
            <span style={{ fontSize: 12, color: 'var(--fg3)' }}>hold to reorder</span>
          </div>
          <div className="hide-scrollbar" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            <button
              type="button"
              aria-label="Add media"
              onClick={c.addMedia}
              style={{
                flex: 'none',
                width: 84,
                height: 84,
                borderRadius: 8,
                border: '1px dashed var(--border)',
                background: 'transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                color: 'var(--fg3)',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              <Icon name="camera" size={18} />
              Add
            </button>
            {draft.media.map((m, i) => (
              <button
                key={m.seed}
                type="button"
                aria-label={draft.cover === i ? `Photo ${i + 1} is the cover` : `Make photo ${i + 1} the cover`}
                aria-pressed={draft.cover === i}
                onClick={() => c.setCover(i)}
                style={{
                  position: 'relative',
                  flex: 'none',
                  width: 84,
                  height: 84,
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: `1px solid ${draft.cover === i ? 'var(--accent)' : 'var(--border)'}`,
                  padding: 0,
                  background: 'transparent',
                  cursor: 'pointer',
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
                      top: 5,
                      left: 5,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 8,
                      letterSpacing: '.1em',
                      textTransform: 'uppercase',
                      color: PAPER,
                      background: 'var(--accent)',
                      padding: '2px 5px',
                      borderRadius: 3,
                    }}
                  >
                    Cover
                  </span>
                )}
                {m.uploading && (
                  <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: PHOTO_SCRIM_5 }}>
                    <span style={{ display: 'block', width: '62%', height: '100%', background: 'var(--accent)' }} />
                  </span>
                )}
                {!!m.cap && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      padding: '3px 5px',
                      fontSize: 9,
                      color: PAPER,
                      background: PHOTO_SCRIM_6,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {m.cap}
                  </span>
                )}
              </button>
            ))}
          </div>
          {showBanner && <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 6 }}>{c.copy.pickerNote}</div>}
        </div>

        <BodyEditor blocks={draft.blocks} onChange={c.setBlocks} scale="mobile" />

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
            <span id="composer-priv">{COMPOSER_DESKTOP.privacyLabel}</span>
            <Toggle on={draft.priv} onChange={c.setPriv} aria-labelledby="composer-priv" />
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg3)' }}>{privNote(draft.priv, HER)}</div>
        </div>
      </div>
    </section>
  )
}
