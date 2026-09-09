// mobile-d-sheets.md section 1 / mobile-a-memories.md 3.9 - the New memory
// sheet the Memories FAB opens. "Keep writing →" hands off to the composer.

import { useNavigate } from 'react-router'
import { mockImage } from '../../data/mockImage'
import { COMPOSER_DEFAULT, COMPOSER_DESKTOP } from '../../data/mock'
import { paths } from '../../paths'
import { Button, Chip, Icon, PHOTO_FILTER, Sheet, Toggle } from '../../ui'
import { memoriesStore, patchDraft } from './state'

export function NewMemorySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const draft = memoriesStore.use((s) => s.drafts.default)

  const addPhoto = () => {
    patchDraft('default', (d) => {
      const seed = 'new' + (d.media.length + 1)
      return { media: [...d.media, { seed, src: mockImage(seed, 200, 200), cover: false, uploading: false }] }
    })
  }

  return (
    <Sheet open={open} onClose={onClose} title="New memory" meta="Draft · saved just now" aria-label="New memory">
      <input
        value={draft.title}
        onChange={(e) => patchDraft('default', { title: e.target.value })}
        placeholder="Title"
        aria-label="Title"
        style={{
          height: 48,
          border: 'none',
          borderBottom: '1px solid var(--border)',
          background: 'transparent',
          fontFamily: 'var(--font-serif)',
          fontSize: 28,
          color: 'var(--fg1)',
          padding: 0,
          borderRadius: 0,
          width: '100%',
        }}
      />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Chip asSpan size="md" style={{ fontWeight: 400 }}>
          {COMPOSER_DEFAULT.dates}
        </Chip>
        <Chip asSpan size="md" style={{ fontWeight: 400 }}>
          {COMPOSER_DEFAULT.loc}
        </Chip>
        <Chip asSpan size="md" tone="accent" selected style={{ fontWeight: 400 }}>
          {draft.type}
        </Chip>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
        <button
          type="button"
          aria-label="Add photos"
          onClick={addPhoto}
          style={{
            aspectRatio: '1',
            borderRadius: 8,
            border: '1px dashed var(--border)',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--fg3)',
            cursor: 'pointer',
          }}
        >
          <Icon name="camera" size={20} />
        </button>
        {draft.media.slice(0, 2).map((m, i) => (
          <div key={m.seed} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden' }}>
            <img src={m.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: PHOTO_FILTER }} />
            {i === 1 && (
              <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: 'var(--surface-2)' }}>
                <span style={{ display: 'block', width: '62%', height: '100%', background: 'var(--accent)' }} />
              </span>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, color: 'var(--fg2)' }}>
        <span id="new-memory-priv">{COMPOSER_DESKTOP.privacyLabel}</span>
        <Toggle on={draft.priv} onChange={(on) => patchDraft('default', { priv: on })} aria-labelledby="new-memory-priv" />
      </div>

      <Button
        variant="ink"
        size="sheet"
        full
        onClick={() => {
          onClose()
          navigate(paths.compose)
        }}
      >
        Keep writing →
      </Button>
    </Sheet>
  )
}
