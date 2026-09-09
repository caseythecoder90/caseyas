// One message group: the bubble (seven kinds) and its meta line (timestamp /
// "Seen 9:42 PM" / "Delivered"). Nothing else - mobile-c section 2 and
// desktop.md section 5 both define the group as bubble + meta line only.
// Mobile sizes: mobile-c-chat-calendar-notes-us.md section 2.
// Desktop sizes: desktop.md section 5.

import type { CSSProperties, ReactNode } from 'react'
import type { ChatMessage } from '../../data/types'
import { OPEN_IN_PLAN, PUT_ON_A_DAY, SAVE_TO_MEMORIES } from './copy'
import { PlayCircle, Waveform } from './Waveform'

export interface MessageBubbleProps {
  m: ChatMessage
  variant: 'mobile' | 'desktop'
  wave: number[]
  wavePlayed: number
  onOpenMemory: (memId: number) => void
  onOpenPlan: () => void
  onSaveToMemories: () => void
  onSaveToPlan: () => void
}

const PHOTO_FILTER = 'sepia(.08) saturate(.88)'

function bubbleShell(bg: string): CSSProperties {
  return {
    padding: '10px 14px',
    borderRadius: 12,
    background: bg,
    color: 'var(--fg1)',
    fontSize: 15,
    lineHeight: 1.45,
    border: '1px solid var(--border)',
  }
}

function SmallButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 28,
        padding: '0 10px',
        borderRadius: 6,
        border: '1px solid var(--border)',
        background: 'transparent',
        color: 'var(--fg1)',
        fontSize: 12,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

export function MessageBubble({
  m,
  variant,
  wave,
  wavePlayed,
  onOpenMemory,
  onOpenPlan,
  onSaveToMemories,
  onSaveToPlan,
}: MessageBubbleProps) {
  const desktop = variant === 'desktop'
  const mine = m.from === 'me'
  const side = mine ? 'flex-end' : 'flex-start'
  const bg = mine ? 'var(--surface-2)' : 'var(--surface)'
  const cardW = desktop ? 320 : 260

  let body: ReactNode = null

  if (m.type === 'text') {
    body = (
      <div style={bubbleShell(bg)}>{m.text}</div>
    )
  } else if (m.type === 'photo') {
    const photo = (
      <img
        src={m.img}
        alt=""
        style={{
          width: desktop ? 320 : 240,
          height: desktop ? 240 : 180,
          objectFit: 'cover',
          borderRadius: 12,
          display: 'block',
          filter: PHOTO_FILTER,
        }}
      />
    )
    body = desktop ? (
      <div style={{ position: 'relative' }}>
        {photo}
        <button
          type="button"
          onClick={onSaveToMemories}
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            height: 28,
            padding: '0 10px',
            borderRadius: 6,
            border: 'none',
            background: 'rgba(18,17,16,.65)',
            color: '#faf9f6',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          {SAVE_TO_MEMORIES}
        </button>
      </div>
    ) : (
      photo
    )
  } else if (m.type === 'photos') {
    body = (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 3,
          width: desktop ? 320 : 240,
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {(m.imgs ?? []).map((p, i) => (
          <img
            key={i}
            src={p.src}
            alt=""
            style={{ width: '100%', aspectRatio: desktop ? '4 / 3' : '1', objectFit: 'cover', display: 'block', filter: PHOTO_FILTER }}
          />
        ))}
      </div>
    )
  } else if (m.type === 'voice') {
    body = (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          borderRadius: 12,
          background: bg,
          border: '1px solid var(--border)',
          width: desktop ? 300 : 240,
        }}
      >
        <PlayCircle />
        <Waveform wave={wave} played={wavePlayed} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg2)' }}>{m.dur}</span>
      </div>
    )
  } else if (m.type === 'memory') {
    body = (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpenMemory(m.memId ?? 3)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpenMemory(m.memId ?? 3)
          }
        }}
        style={{
          width: cardW,
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          cursor: 'pointer',
          display: desktop ? 'grid' : undefined,
          gridTemplateColumns: desktop ? '120px 1fr' : undefined,
          textAlign: 'left',
        }}
      >
        <img
          src={m.img}
          alt=""
          style={{ width: '100%', height: desktop ? '100%' : 120, objectFit: 'cover', display: 'block', filter: PHOTO_FILTER }}
        />
        <div style={{ padding: desktop ? '12px 14px' : '10px 12px 12px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--accent)' }}>
            Memory
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, lineHeight: 1.1, marginTop: desktop ? 4 : 3 }}>{m.title}</div>
          <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: desktop ? 4 : 3 }}>{m.sub}</div>
        </div>
      </div>
    )
  } else if (m.type === 'planitem') {
    body = (
      <div
        role="button"
        tabIndex={0}
        onClick={onOpenPlan}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpenPlan()
          }
        }}
        style={{
          width: cardW,
          borderRadius: 12,
          border: '1px solid var(--border)',
          borderLeft: '2px solid var(--accent)',
          background: 'var(--surface)',
          cursor: 'pointer',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          textAlign: 'left',
        }}
      >
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--accent)' }}>
          Plan item · {m.kind}
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, lineHeight: 1.1 }}>{m.title}</div>
        <div style={{ fontSize: 12, color: 'var(--fg3)' }}>{m.sub}</div>
        {desktop && (
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }} onClick={(e) => e.stopPropagation()}>
            <SmallButton onClick={onOpenPlan}>{OPEN_IN_PLAN}</SmallButton>
            <SmallButton onClick={onSaveToPlan}>{PUT_ON_A_DAY}</SmallButton>
          </div>
        )}
      </div>
    )
  } else if (m.type === 'link') {
    body = (
      <div style={{ width: cardW, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: bg }}>
        <div style={{ padding: '10px 14px', fontSize: 15, color: 'var(--accent)' }}>{m.url}</div>
        <div style={{ borderTop: '1px solid var(--border)', padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--surface-2)', flex: 'none' }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</div>
            <div style={{ fontSize: 12, color: 'var(--fg3)' }}>{m.domain}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignSelf: side,
        maxWidth: desktop ? '60%' : '78%',
        gap: 4,
        alignItems: side,
      }}
    >
      {body}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg3)', padding: '0 4px' }}>{m.time}</div>
    </div>
  )
}
