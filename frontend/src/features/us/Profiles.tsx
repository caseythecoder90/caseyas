// Top of the Us screen (mobile-c section 5): the two person cards side by
// side, "Together since" and the stats row. The signed-in name comes from the
// session; her name is the shared HER constant. Honest by default: the cards
// carry no invented memory counts and the stats are the numbers the app can
// actually compute (UsPage passes them in). With the design preview on the
// designed five-up mock stats and per-person counts render instead.

import { PERSON_CARDS, US_STATIC } from '../../data/mock/us'
import type { Stat } from '../../data/types'
import { HER, TOGETHER_SINCE } from '../../people'
import { useSession } from '../../session'
import { Avatar, Eyebrow } from '../../ui'

function PersonCard({ who, name, sub }: { who: 'me' | 'her'; name: string; sub?: string }) {
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
      {sub && <div style={{ fontSize: 12, color: 'var(--fg3)' }}>{sub}</div>}
    </div>
  )
}

export function Profiles({ stats, preview }: { stats: Stat[]; preview: boolean }) {
  const { meName } = useSession()
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <PersonCard who="me" name={meName} sub={preview ? PERSON_CARDS.me.memories : undefined} />
        <PersonCard who="her" name={HER} sub={preview ? PERSON_CARDS.her.memories : undefined} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <Eyebrow>{US_STATIC.togetherSince}</Eyebrow>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30, lineHeight: 1.1, marginTop: 4 }}>{TOGETHER_SINCE}</div>
      </div>

      {stats.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 6, textAlign: 'center' }}>
          {stats.map((s) => (
            <div key={s.l}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 11, color: 'var(--fg3)', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
