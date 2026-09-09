// What /chat shows until milestone 4 (unless the design preview is on): the
// header without a presence line, an empty thread with a warm empty state, and
// the composer visibly disabled. Desktop keeps the two-pane frame from
// desktop.md section 5 with the pinned / media panel saying "not yet".

import { EmptyState } from '../../ui'
import { HER } from '../../people'
import { CHAT_ARRIVES } from '../shared/milestones'
import { ChatHeader } from './ChatHeader'
import { MEDIA_EYEBROW, PINNED_EYEBROW_PLAIN } from './copy'

const TABBAR_H = 88

function DisabledComposer({ variant }: { variant: 'mobile' | 'desktop' }) {
  const desktop = variant === 'desktop'
  return (
    <div style={{ flex: 'none', marginBottom: desktop ? 0 : TABBAR_H, background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
      <div style={{ padding: desktop ? '16px 32px 24px' : '10px 12px 12px', display: 'flex', gap: desktop ? 10 : 8, alignItems: 'center' }}>
        <input
          disabled
          placeholder={CHAT_ARRIVES}
          aria-label={CHAT_ARRIVES}
          style={{
            flex: 1,
            minWidth: 0,
            height: desktop ? 44 : 40,
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--surface-2)',
            padding: '0 14px',
            color: 'var(--fg3)',
            fontSize: 15,
          }}
        />
        <button
          type="button"
          disabled
          aria-label="Send message"
          style={{
            height: desktop ? 44 : 40,
            padding: desktop ? '0 16px' : 0,
            width: desktop ? undefined : 40,
            borderRadius: 8,
            border: 'none',
            background: desktop ? 'var(--surface-2)' : 'transparent',
            color: 'var(--fg3)',
            fontSize: 14,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none',
            cursor: 'not-allowed',
          }}
        >
          {desktop ? (
            'Send'
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

function EmptyThread({ desktop }: { desktop: boolean }) {
  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: desktop ? '24px 32px' : '16px 20px' }}>
      <EmptyState title="Nothing said yet." sub={`Whatever you and ${HER} say here stays here.`} style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 14 }}>{CHAT_ARRIVES}.</div>
      </EmptyState>
    </div>
  )
}

export function ChatEmptyMobile() {
  return (
    <section style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }} aria-label="Chat">
      <ChatHeader seg="msgs" hasUnopened={false} status={null} />
      <EmptyThread desktop={false} />
      <DisabledComposer variant="mobile" />
    </section>
  )
}

const EYEBROW = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  color: 'var(--fg3)',
  marginBottom: 8,
} as const

export function ChatEmptyDesktop() {
  return (
    <section style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 340px' }} aria-label="Chat">
      <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', minWidth: 0, minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px 32px', borderBottom: '1px solid var(--border)', flex: 'none' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1 }}>{HER}</div>
        </div>
        <EmptyThread desktop />
        <DisabledComposer variant="desktop" />
      </div>
      <aside style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 28, overflow: 'auto', background: 'var(--surface)', minHeight: 0 }}>
        <div>
          <div style={EYEBROW}>{PINNED_EYEBROW_PLAIN}</div>
          <div style={{ fontSize: 13, color: 'var(--fg3)' }}>Nothing pinned yet.</div>
        </div>
        <div>
          <div style={EYEBROW}>{MEDIA_EYEBROW}</div>
          <div style={{ fontSize: 13, color: 'var(--fg3)' }}>No photos yet.</div>
        </div>
      </aside>
    </section>
  )
}
