// Top of the Us screen (mobile-c section 5): the two person cards side by
// side, "Together since" and the five-up stats row. The signed-in name comes
// from the session; her name is the shared HER constant.

import { PERSON_CARDS, US_STATIC } from '../../data/mock/us'
import type { Stat } from '../../data/types'
import { HER, TOGETHER_SINCE } from '../../people'
import { useSession } from '../../session'
import { Avatar, Eyebrow } from '../../ui'

function PersonCard({ who, name, memories }: { who: 'me' | 'her'; name: string; memories: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '20px 12px',
        borderRadius: 8,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      <Avatar who={who} size={64} border={null} />
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22 }}>{name}</div>
      <div style={{ fontSize: 12, color: 'var(--fg3)' }}>{memories}</div>
    </div>
  )
}

export function Profiles({ stats }: { stats: Stat[] }) {
  const { meName } = useSession()
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <PersonCard who="me" name={meName} memories={PERSON_CARDS.me.memories} />
        <PersonCard who="her" name={HER} memories={PERSON_CARDS.her.memories} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <Eyebrow>{US_STATIC.togetherSince}</Eyebrow>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30, lineHeight: 1.1, marginTop: 4 }}>{TOGETHER_SINCE}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, textAlign: 'center' }}>
        {stats.map((s) => (
          <div key={s.l}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, lineHeight: 1 }}>{s.n}</div>
            <div style={{ fontSize: 11, color: 'var(--fg3)', marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </>
  )
}
