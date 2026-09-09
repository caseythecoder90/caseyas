// Chat, desktop (desktop.md section 5): two panes - the thread (1fr) and a
// 340px panel with the pinned messages and the chat media grid.

import { useEffect, useRef } from 'react'
import { mockImage } from '../../data/mockImage'
import { paths } from '../../paths'
import { AVATAR_SEED, HER } from '../../people'
import { useNavigate } from 'react-router'
import {
  CHAT_PLACEHOLDER,
  CHAT_SEARCH,
  CHAT_STATUS,
  CHAT_TYPING,
  MEDIA_ALL,
  MEDIA_EYEBROW,
  PINNED_EYEBROW,
  SEP_TODAY,
  SEP_YESTERDAY,
} from './copy'
import { MessageBubble } from './MessageBubble'
import { useChatThread } from './useChatThread'

function Separator({ label, top }: { label: string; top?: number }) {
  return (
    <div
      style={{
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '.1em',
        color: 'var(--fg3)',
        textTransform: 'uppercase',
        marginTop: top,
      }}
    >
      {label}
    </div>
  )
}

export function ChatDesktop() {
  const t = useChatThread('desktop')
  const navigate = useNavigate()
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [t.messages.length, t.typing])

  return (
    <section style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 340px' }} aria-label="Chat">
      <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', minWidth: 0, minHeight: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 32px',
            borderBottom: '1px solid var(--border)',
            flex: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src={mockImage(AVATAR_SEED.her, 80, 80)}
              alt=""
              style={{ width: 40, height: 40, borderRadius: 999, objectFit: 'cover', filter: 'sepia(.2) saturate(.6)' }}
            />
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1 }}>{HER}</div>
              <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 2 }}>{CHAT_STATUS}</div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 36,
              padding: '0 12px',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--fg3)',
              fontSize: 13,
              width: 240,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            {CHAT_SEARCH}
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Separator label={SEP_YESTERDAY} />
          <div
            style={{
              alignSelf: 'flex-start',
              maxWidth: '60%',
              padding: '10px 14px',
              borderRadius: 12,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            {t.yesterday.text}
          </div>
          <Separator label={SEP_TODAY} top={12} />
          {t.messages.map((m) => (
            <MessageBubble
              key={m.id}
              m={m}
              variant="desktop"
              wave={t.wave}
              wavePlayed={t.wavePlayed}
              onOpenMemory={t.openMemory}
              onOpenPlan={t.openPlan}
              onSaveToMemories={t.saveToMemories}
              onSaveToPlan={t.saveToPlan}
            />
          ))}
          {t.typing && (
            <div
              style={{
                alignSelf: 'flex-start',
                padding: '10px 14px',
                borderRadius: 12,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                fontSize: 14,
                color: 'var(--fg3)',
                fontStyle: 'italic',
                fontFamily: 'var(--font-serif)',
              }}
            >
              {CHAT_TYPING(t.her)}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div style={{ flex: 'none', borderTop: '1px solid var(--border)' }}>
          <div style={{ padding: '16px 32px 24px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              type="button"
              aria-label="Add a photo"
              style={{
                width: 40,
                height: 40,
                border: 'none',
                background: 'transparent',
                color: 'var(--fg2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flex: 'none',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </button>
            <input
              value={t.draft}
              onChange={(e) => t.setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') t.send()
              }}
              placeholder={CHAT_PLACEHOLDER(t.her)}
              aria-label={CHAT_PLACEHOLDER(t.her)}
              style={{
                flex: 1,
                minWidth: 0,
                height: 44,
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                padding: '0 14px',
                color: 'var(--fg1)',
                fontSize: 15,
              }}
            />
            <button
              type="button"
              onClick={t.send}
              style={{
                height: 44,
                padding: '0 16px',
                borderRadius: 8,
                border: 'none',
                background: t.draft ? 'var(--accent)' : 'var(--surface-2)',
                color: t.draft ? '#faf9f6' : 'var(--fg3)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                flex: 'none',
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <aside style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 28, overflow: 'auto', background: 'var(--surface)', minHeight: 0 }}>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: 'var(--fg3)',
              marginBottom: 12,
            }}
          >
            {PINNED_EYEBROW}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {t.pinned.map((p) => (
              <div
                key={p.text}
                style={{
                  padding: '12px 14px',
                  borderRadius: 8,
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  fontSize: 14,
                  lineHeight: 1.45,
                }}
              >
                {p.text}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg3)', marginTop: 6 }}>
                  {p.by} · {p.when}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: 'var(--fg3)',
              }}
            >
              {MEDIA_EYEBROW}
            </span>
            <button
              type="button"
              onClick={() => navigate(paths.gallery)}
              style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                font: 'inherit',
                fontSize: 12,
                color: 'var(--accent)',
                cursor: 'pointer',
              }}
            >
              {MEDIA_ALL}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4 }}>
            {t.media.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 4, display: 'block', filter: 'sepia(.08) saturate(.88)' }}
              />
            ))}
          </div>
        </div>
      </aside>
    </section>
  )
}
