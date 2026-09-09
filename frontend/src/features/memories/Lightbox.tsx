// mobile-d-sheets.md section 11 - the full-screen lightbox over a memory
// detail. Always dark (literal colors), tap the image for the next tile,
// "Share to chat" drops the photo into the conversation.

import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useChat } from '../../data/hooks'
import type { GalleryTile, Memory } from '../../data/types'
import { paths } from '../../paths'
import { Icon, INK, PAPER, PHOTO_FILTER, SIGNIN_BORDER, SIGNIN_MUTED } from '../../ui'
import { Dots } from './bits'
import { lightboxSrc, type Variant } from './media'

export interface LightboxProps {
  memory: Memory
  gallery: GalleryTile[]
  caps: string[]
  index: number
  variant: Variant
  favs: number[]
  onToggleFav: (i: number) => void
  onNext: () => void
  onClose: () => void
}

export function Lightbox({ memory, gallery, caps, index, variant, favs, onToggleFav, onNext, onClose }: LightboxProps) {
  const navigate = useNavigate()
  const { sharePhoto } = useChat()
  const fav = favs.includes(index)
  const tile = gallery[index]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNext()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, onNext])

  const share = () => {
    sharePhoto(tile.src)
    onClose()
    navigate(paths.chat)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo"
      style={{ position: 'fixed', inset: 0, background: INK, zIndex: 30, display: 'flex', flexDirection: 'column', color: PAPER }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '58px 16px 0' }}>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: 'none',
            background: 'rgba(250,249,246,.1)',
            color: PAPER,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Icon name="x" size={18} />
        </button>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: SIGNIN_MUTED }}>
          {index + 1} of {gallery.length}
        </span>
        <button
          type="button"
          aria-label="More"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: 'none',
            background: 'rgba(250,249,246,.1)',
            color: PAPER,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Dots />
        </button>
      </div>

      <button
        type="button"
        aria-label="Next photo"
        onClick={onNext}
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: '16px 0',
          border: 'none',
          background: 'transparent',
        }}
      >
        <img
          src={lightboxSrc(memory, index, variant)}
          alt=""
          style={{ width: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block', filter: PHOTO_FILTER }}
        />
      </button>

      <div style={{ padding: '0 20px 44px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, lineHeight: 1.3, color: PAPER }}>{caps[index % caps.length]}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#6e6a61' }}>
          {memory.date.split('–')[0].trim()} · {memory.by} · swipe for next
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={share}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 8,
              border: `1px solid ${SIGNIN_BORDER}`,
              background: 'transparent',
              color: PAPER,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Share to chat
          </button>
          <button
            type="button"
            aria-pressed={fav}
            onClick={() => onToggleFav(index)}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 8,
              border: `1px solid ${fav ? 'var(--accent)' : SIGNIN_BORDER}`,
              background: fav ? 'var(--accent-soft)' : 'transparent',
              color: PAPER,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {fav ? 'Favorited' : 'Favorite'}
          </button>
        </div>
      </div>
    </div>
  )
}
