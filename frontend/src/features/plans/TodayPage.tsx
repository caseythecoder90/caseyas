// mobile-b-plans.md section 3 - Today mode: the day's timeline with past items
// dimmed, the next item enlarged, big confirmation codes and the simulated
// connectivity banner.

import { Link, useParams } from 'react-router'
import { usePlan } from '../../data/hooks'
import { paths } from '../../paths'
import { Icon } from '../../ui'
import { useCopyCode } from './bits'
import { useIsDesktop } from './useIsDesktop'

export default function TodayPage() {
  const { id } = useParams()
  const { plan, todayHeader, todayItems, days, tripDay, offline } = usePlan(id)
  const isDesktop = useIsDesktop()
  const copy = useCopyCode()

  const [city = '', extra = ''] = todayHeader.sub.split(' · ')
  const date = extra || todayHeader.title
  const tomorrow = tripDay != null ? days.find((d) => d.n === tripDay + 1) : undefined

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 'none',
        width: '100%',
        maxWidth: isDesktop ? 760 : undefined,
        margin: isDesktop ? '0 auto' : undefined,
        paddingTop: isDesktop ? 32 : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 12px 0 12px' }}>
        <Link
          to={paths.plans}
          aria-label="Back to plans"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'transparent',
            color: 'var(--fg2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="chevron-left" size={18} />
        </Link>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--fg3)' }}>{todayHeader.eyebrow}</span>
        <Link
          to={paths.plan(plan.id)}
          style={{
            height: 32,
            padding: '0 10px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--fg2)',
            fontSize: 12,
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Full plan
        </Link>
      </div>

      <div style={{ padding: '8px 20px 0' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 40, lineHeight: 1 }}>{city}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4, gap: 12 }}>
          <span style={{ fontSize: 14, color: 'var(--fg2)' }}>{date}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22 }}>
            9:14 <span style={{ fontSize: 12, color: 'var(--fg3)' }}>AM JST · 8:14 PM at home</span>
          </span>
        </div>
      </div>

      {offline.enabled ? (
        <div
          style={{
            margin: '14px 20px 0',
            padding: '8px 12px',
            borderRadius: 6,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            fontSize: 12,
            color: 'var(--fg2)',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            textAlign: 'left',
          }}
        >
          <span>Available offline · {offline.note}</span>
        </div>
      ) : (
        <div
          style={{
            margin: '14px 20px 0',
            padding: '8px 12px',
            borderRadius: 6,
            background: 'transparent',
            fontSize: 12,
            color: 'var(--fg3)',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            textAlign: 'left',
          }}
        >
          <span>Offline copy is off · turn it on from the plan page</span>
        </div>
      )}

      <div style={{ padding: isDesktop ? '16px 20px 48px' : '16px 20px 110px', display: 'flex', flexDirection: 'column' }}>
        {todayItems.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--fg3)', padding: '8px 0 18px' }}>Nothing scheduled today. A free day is allowed.</div>
        )}
        {todayItems.map((t) => {
          const dot = t.past ? 'var(--fg3)' : t.next ? 'var(--accent)' : 'var(--bg)'
          const dotBorder = t.past ? 'var(--fg3)' : t.next ? 'var(--accent)' : 'var(--fg3)'
          return (
            <div key={t.title} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ width: 10, height: 10, borderRadius: 999, background: dot, border: `1px solid ${dotBorder}`, marginTop: 6, flex: 'none' }} />
                <span style={{ flex: 1, width: 1, background: 'var(--border)' }} />
              </div>
              <div style={{ padding: '0 0 18px', display: 'flex', flexDirection: 'column', gap: 6, opacity: t.past ? 0.45 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: t.next ? 'var(--accent)' : 'var(--fg2)' }}>{t.time}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg3)' }}>{t.kind}</span>
                  {t.next && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 9,
                        letterSpacing: '.1em',
                        textTransform: 'uppercase',
                        color: 'var(--accent)',
                        marginLeft: 'auto',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      next · in 4h 46m
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: t.next ? 26 : 20, lineHeight: 1.1 }}>{t.title}</div>
                <div style={{ fontSize: 13, color: 'var(--fg2)' }}>{t.place}</div>
                {t.conf ? (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: 8,
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      marginTop: 4,
                      gap: 12,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => copy(t.conf ?? '')}
                      aria-label={`Copy confirmation ${t.conf}`}
                      style={{ border: 'none', background: 'transparent', padding: 0, textAlign: 'left', color: 'var(--fg1)', cursor: 'pointer' }}
                    >
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--fg3)' }}>Confirmation</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, letterSpacing: '.16em', marginTop: 2 }}>{t.conf}</div>
                    </button>
                    <button
                      type="button"
                      style={{
                        height: 36,
                        padding: '0 12px',
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                        background: 'transparent',
                        color: 'var(--fg1)',
                        fontSize: 12,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Open in Maps
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    style={{
                      alignSelf: 'flex-start',
                      height: 32,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--fg1)',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    Open in Maps
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {tomorrow && (
          <button
            type="button"
            style={{
              height: 48,
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--fg1)',
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
            }}
          >
            <span>
              Tomorrow · {tomorrow.dow} {tomorrow.date}
            </span>
            <span style={{ color: 'var(--fg3)', fontSize: 13 }}>
              {tomorrow.items.length > 0 ? `${tomorrow.items.length} on the day →` : 'Nothing planned yet →'}
            </span>
          </button>
        )}
      </div>
    </section>
  )
}
