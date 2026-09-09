// mobile-b-plans.md section 1 - the Plans list: the Today card while a trip is
// underway, the Up next / Dreaming / Past groups (one large card for the next
// trip, compact rows for the rest), the FAB and the New plan sheet.

import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { mockImage } from '../../data/mockImage'
import { usePlans } from '../../data/hooks'
import { paths } from '../../paths'
import { Eyebrow, Icon, IconButton, PAPER, PHOTO_FILTER, PHOTO_SCRIM_55 } from '../../ui'
import { CoverImage, DestChip, PlanAvatars } from './bits'
import { NewPlanSheet } from './NewPlanSheet'
import { useIsDesktop } from './useIsDesktop'

export default function PlansListPage() {
  const { groups, activeTrip, loading, error } = usePlans()
  const [params, setParams] = useSearchParams()
  const [sheet, setSheet] = useState(false)
  const isDesktop = useIsDesktop()

  // the sidebar's New > Plan menu row lands here as /plans?new=1
  useEffect(() => {
    if (params.get('new') === '1') {
      setSheet(true)
      const next = new URLSearchParams(params)
      next.delete('new')
      setParams(next, { replace: true })
    }
  }, [params, setParams])

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
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '8px 20px 0' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, lineHeight: 1, margin: 0, fontWeight: 400 }}>Plans</h1>
        <IconButton label="Search plans">
          <Icon name="search" size={20} />
        </IconButton>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: isDesktop ? '20px 20px 48px' : '20px 20px 110px' }}>
        {loading && <div style={{ fontSize: 13, color: 'var(--fg3)', textAlign: 'center', padding: '32px 0' }}>Loading…</div>}
        {error && !loading && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ border: 'none', background: 'transparent', padding: '32px 0', fontSize: 13, color: 'var(--fg3)', cursor: 'pointer', textAlign: 'center' }}
          >
            Plans didn't load. Tap to retry.
          </button>
        )}
        {activeTrip && (
          <Link
            to={paths.today(activeTrip.id)}
            style={{
              borderRadius: 8,
              overflow: 'hidden',
              border: '1px solid var(--accent)',
              background: 'var(--surface)',
              display: 'grid',
              gridTemplateColumns: '1fr 120px',
              color: 'var(--fg1)',
            }}
          >
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Eyebrow size={10} color="var(--accent)">
                Today · Day {activeTrip.day} of {activeTrip.length}
              </Eyebrow>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1.05 }}>{activeTrip.name}</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Open today's timeline →</div>
            </div>
            <img src={mockImage(activeTrip.name, 300, 300)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: PHOTO_FILTER }} />
          </Link>
        )}

        {groups.filter((g) => g.items.length > 0).map((g) => (
          <div key={g.key} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Eyebrow>{g.label}</Eyebrow>
            {g.items.map((pl) =>
              pl.large ? (
                <Link
                  key={pl.id}
                  to={pl.openPath}
                  style={{ borderRadius: 8, overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg1)', display: 'block' }}
                >
                  <div style={{ position: 'relative', height: 200 }}>
                    <CoverImage src={pl.cover} style={{ width: '100%', height: '100%' }} />
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        letterSpacing: '.12em',
                        textTransform: 'uppercase',
                        color: PAPER,
                        background: PHOTO_SCRIM_55,
                        padding: '4px 8px',
                        borderRadius: 4,
                      }}
                    >
                      {pl.status}
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 12,
                        right: 12,
                        fontFamily: 'var(--font-serif)',
                        fontSize: 20,
                        color: PAPER,
                        background: PHOTO_SCRIM_55,
                        padding: '4px 10px',
                        borderRadius: 4,
                      }}
                    >
                      {pl.countdown}
                    </div>
                  </div>
                  <div style={{ padding: '16px 16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, lineHeight: 1.05 }}>{pl.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg2)' }}>{pl.dates}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {pl.dest.map((d) => (
                        <DestChip key={d}>{d}</DestChip>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, gap: 12 }}>
                      <span style={{ fontSize: 12, color: 'var(--fg3)' }}>{pl.hints}</span>
                      <PlanAvatars />
                    </div>
                  </div>
                </Link>
              ) : (
                <Link key={pl.id} to={pl.openPath} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '6px 0', color: 'var(--fg1)' }}>
                  <CoverImage src={pl.cover} style={{ width: 64, height: 64, borderRadius: 8, flex: 'none' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 6, height: 6, borderRadius: 999, background: pl.color }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg3)' }}>{pl.dates}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 21, lineHeight: 1.1, marginTop: 3 }}>{pl.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 3 }}>{pl.hints}</div>
                  </div>
                  <div style={{ textAlign: 'right', flex: 'none' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        letterSpacing: '.1em',
                        textTransform: 'uppercase',
                        color: 'var(--fg2)',
                        border: '1px solid var(--border)',
                        padding: '3px 6px',
                        borderRadius: 4,
                      }}
                    >
                      {pl.status}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 6 }}>{pl.countdown}</div>
                  </div>
                </Link>
              ),
            )}
          </div>
        ))}
      </div>

      {!isDesktop && (
        <button
          type="button"
          aria-label="New plan"
          onClick={() => setSheet(true)}
          style={{
            position: 'fixed',
            right: 20,
            bottom: 104,
            width: 52,
            height: 52,
            borderRadius: 12,
            border: 'none',
            background: 'var(--accent)',
            color: PAPER,
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 5,
          }}
        >
          <Icon name="plus" size={22} />
        </button>
      )}

      <NewPlanSheet open={sheet} onClose={() => setSheet(false)} />
    </section>
  )
}
