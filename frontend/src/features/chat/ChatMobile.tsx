// Chat, mobile (mobile-c-chat-calendar-notes-us.md section 2): header, pinned
// bar, the "Today" separator, every message kind, the typing indicator and the
// composer that sits above the tab bar.

import { useEffect, useRef } from 'react'
import { ChatHeader } from './ChatHeader'
import { CHAT_PLACEHOLDER, CHAT_TYPING, PINNED_BAR, PINNED_BAR_COUNT, SEP_TODAY } from './copy'
import { MessageBubble } from './MessageBubble'
import { useChatThread } from './useChatThread'

const TABBAR_H = 88

export function ChatMobile() {
  const t = useChatThread('mobile')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [t.messages.length, t.typing])

  return (
    <section style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }} aria-label="Chat">
      <ChatHeader seg="msgs" hasUnopened={!t.sealedDone} />

      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          padding: '8px 20px',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          fontSize: 13,
          color: 'var(--fg2)',
          flex: 'none',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 17v5" />
          <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
        </svg>
        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{PINNED_BAR}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg3)' }}>{PINNED_BAR_COUNT}</span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '16px 16px 12px' }}>
        <div
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '.1em',
            color: 'var(--fg3)',
            textTransform: 'uppercase',
            margin: '4px 0 8px',
          }}
        >
          {SEP_TODAY}
        </div>
        {t.messages.map((m) => (
          <MessageBubble
            key={m.id}
            m={m}
            variant="mobile"
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
              fontSize: 13,
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

      <div style={{ flex: 'none', marginBottom: TABBAR_H, background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
        <div style={{ padding: '10px 12px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
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
              height: 40,
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
            aria-label="Send message"
            aria-disabled={!t.draft.trim()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              border: 'none',
              background: t.draft ? 'var(--accent)' : 'transparent',
              color: t.draft ? '#faf9f6' : 'var(--fg2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flex: 'none',
            }}
          >
            {t.draft ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <path d="M12 19v3" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </section>
  )
}
