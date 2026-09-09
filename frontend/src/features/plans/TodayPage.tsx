// mobile-b-plans.md section 3 - Today mode: the day's timeline with past items
// dimmed, the next item enlarged with a live "in 2h 10m", big copyable
// confirmation codes, "Open in Maps" for anything with a location, a real
// clock in the plan's timezone (and the home time when it differs), the
// offline banner, and a one-tap jump to tomorrow. Any row opens the item
// sheet.

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { usePlan } from '../../data/hooks'
import type { TodayItem } from '../../data/types'
import { paths } from '../../paths'
import { Icon } from '../../ui'
import { useCopyCode } from './bits'
import { ItemSheet } from './ItemSheet'
import { hasMapTarget, openInMaps } from './maps'
import { useIsDesktop } from './useIsDesktop'

/** Re-renders every `ms` so the clock and the countdown stay honest. */
function useNow(ms: number): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}

const deviceZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return ''
  }
}

interface Clock {
  time: string
  ampm: string
  zone: string
}

/** '9:14' / 'AM' / 'JST' for `now` in `timeZone` (device zone when unknown or invalid). */
function clockIn(now: Date, timeZone?: string | null): Clock {
  const opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short' }
  let parts: Intl.DateTimeFormatPart[]
  try {
    parts = new Intl.DateTimeFormat('en-US', { ...opts, timeZone: timeZone || undefined }).formatToParts(now)
  } catch {
    parts = new Intl.DateTimeFormat('en-US', opts).formatToParts(now)
  }
  const get = (t: Intl.DateTimeFormatPart['type']) => parts.find((p) => p.type === t)?.value ?? ''
  return { time: `${get('hour')}:${get('minute')}`, ampm: get('dayPeriod').toUpperCase(), zone: get('timeZoneName') }
}

/** The destination's wall clock as a local Date, so it can be compared with an item's local start. */
function wallClockDate(now: Date, timeZone?: string | null): Date {
  const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }
  let parts: Intl.DateTimeFormatPart[]
  try {
    parts = new Intl.DateTimeFormat('en-US', { ...opts, timeZone: timeZone || undefined }).formatToParts(now)
  } catch {
    return now
  }
  const n = (t: Intl.DateTimeFormatPart['type']) => Number(parts.find((p) => p.type === t)?.value ?? 0)
  return new Date(n('year'), n('month') - 1, n('day'), n('hour') % 24, n('minute'))
}

/** 'in 4h 46m' | 'in 12m' | 'now' for an item's local start against the destination's clock. */
function untilLabel(startIso: string | undefined, wall: Date): string {
  if (!startIso) return ''
  const start = new Date(startIso)
  if (Number.isNaN(start.getTime())) return ''
  const mins = Math.round((start.getTime() - wall.getTime()) / 60_000)
  if (mins <= 0) return 'now'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h ? `in ${h}h${m ? ` ${m}m` : ''}` : `in ${m}m`
}

const MAP_BUTTON = {
  height: 32,
  padding: '0 10px',
  borderRadius: 6,
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--fg1)',
  fontSize: 12,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
} as const

export default function TodayPage() {
  const { id } = useParams()
  const { plan, serverPlan, serverItems, todayHeader, todayItems, days, tripDay, offline } = usePlan(id)
  const isDesktop = useIsDesktop()
  const copy = useCopyCode()
  const now = useNow(30_000)

  const [openItem, setOpenItem] = useState<string | null>(null)
  const [dayOffset, setDayOffset] = useState<0 | 1>(0)

  const tz = serverPlan?.timezone || undefined
  const local = clockIn(now, tz)
  const home = clockIn(now, undefined)
  const differentZone = !!tz && tz !== deviceZone()
  const wall = wallClockDate(now, tz)

  const travelling = tripDay != null
  const tomorrow = travelling ? days.find((d) => d.n === tripDay + 1) : undefined
  const showingTomorrow = dayOffset === 1 && !!tomorrow

  const rows: TodayItem[] = showingTomorrow
    ? tomorrow!.items.map((it) => ({ id: it.id, time: it.time, kind: it.kind, title: it.title, place: it.place, conf: it.conf }))
    : todayItems

  const city = showingTomorrow ? tomorrow!.city || todayHeader.sub : todayHeader.sub
  const dateLine = showingTomorrow ? `Tomorrow · Day ${tomorrow!.n} · ${tomorrow!.dow} ${tomorrow!.date}` : travelling ? todayHeader.title : plan.dates

  const locationOf = (itemId?: string) => (itemId ? serverItems.find((i) => i.id === itemId)?.location : undefined)

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
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--fg3)' }}>
          {showingTomorrow ? 'Tomorrow' : todayHeader.eyebrow}
        </span>
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
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 40, lineHeight: 1 }}>{city || plan.name}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4, gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, color: 'var(--fg2)' }}>{dateLine}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22 }}>
            {local.time}{' '}
            <span style={{ fontSize: 12, color: 'var(--fg3)' }}>
              {local.ampm} {local.zone}
              {differentZone ? ` · ${home.time} ${home.ampm} at home` : ''}
            </span>
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
        {!travelling && (
          <div style={{ fontSize: 13, color: 'var(--fg3)', padding: '8px 0 18px', lineHeight: 1.5 }}>
            This plan isn't underway today. Today mode wakes up on the first day.
          </div>
        )}
        {travelling && rows.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--fg3)', padding: '8px 0 18px' }}>
            {showingTomorrow ? 'Nothing planned for tomorrow yet. A free day is allowed.' : 'Nothing scheduled today. A free day is allowed.'}
          </div>
        )}
        {rows.map((t) => {
          const dot = t.past ? 'var(--fg3)' : t.next ? 'var(--accent)' : 'var(--bg)'
          const dotBorder = t.past ? 'var(--fg3)' : t.next ? 'var(--accent)' : 'var(--fg3)'
          const loc = locationOf(t.id)
          const canMap = hasMapTarget(loc)
          const until = t.next ? untilLabel(t.start, wall) : ''
          const openThis = () => t.id && setOpenItem(t.id)
          return (
            <div key={t.id ?? t.title} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ width: 10, height: 10, borderRadius: 999, background: dot, border: `1px solid ${dotBorder}`, marginTop: 6, flex: 'none' }} />
                <span style={{ flex: 1, width: 1, background: 'var(--border)' }} />
              </div>
              <div style={{ padding: '0 0 18px', display: 'flex', flexDirection: 'column', gap: 6, opacity: t.past ? 0.45 : 1 }}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={openThis}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openThis()
                    }
                  }}
                  aria-label={`Open ${t.title}`}
                  style={{ display: 'flex', flexDirection: 'column', gap: 6, cursor: t.id ? 'pointer' : undefined }}
                >
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
                        next{until ? ` · ${until}` : ''}
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: t.next ? 26 : 20, lineHeight: 1.1 }}>{t.title}</div>
                  {t.place && <div style={{ fontSize: 13, color: 'var(--fg2)' }}>{t.place}</div>}
                </div>
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
                    {canMap && (
                      <button type="button" onClick={() => openInMaps(loc)} style={{ ...MAP_BUTTON, height: 36, padding: '0 12px' }}>
                        Open in Maps
                      </button>
                    )}
                  </div>
                ) : (
                  canMap && (
                    <button type="button" onClick={() => openInMaps(loc)} style={{ ...MAP_BUTTON, alignSelf: 'flex-start' }}>
                      Open in Maps
                    </button>
                  )
                )}
              </div>
            </div>
          )
        })}

        {tomorrow && (
          <button
            type="button"
            onClick={() => setDayOffset(showingTomorrow ? 0 : 1)}
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
            {showingTomorrow ? (
              <>
                <span>← Back to today</span>
                <span style={{ color: 'var(--fg3)', fontSize: 13 }}>{todayItems.length ? `${todayItems.length} on the day` : 'Nothing planned'}</span>
              </>
            ) : (
              <>
                <span>
                  Tomorrow · {tomorrow.dow} {tomorrow.date}
                </span>
                <span style={{ color: 'var(--fg3)', fontSize: 13 }}>
                  {tomorrow.items.length > 0 ? `${tomorrow.items.length} on the day →` : 'Nothing planned yet →'}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <ItemSheet itemId={openItem} onClose={() => setOpenItem(null)} />
    </section>
  )
}
