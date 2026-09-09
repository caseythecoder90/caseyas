// Us (mobile-c spec section 5, prototype lines 634-682): profiles, Together
// since, stats, Security, Preferences (theme / currency / timezone),
// Notifications (three switches + the per-plan checkboxes), the off-by-default
// opt-ins, the Developer card (Simulate date in dev builds, the Design preview
// switch) and "Lock now" — the real POST /logout.
//
// Honest by default: everything shown is real (session name, theme, local
// preferences, the account-console link, plan counts and days together from
// usePlans / the clock). With the design preview on, the mock stats, the five
// Security status rows and the Storage / Export card render as designed,
// behind the "Design preview" banner.
//
// Layout: the prototype's `padding:8px 20px 110px; gap:28px` column below md.
// At >= md, desktop.md section 8 ("Notes / Us placeholder", and line 42) asks
// for the isOther placeholder instead, so that is what renders there.

import { useMemo, type CSSProperties, type KeyboardEvent } from 'react'
import { daysBetween } from '../../data/dates'
import { useDesignPreview, usePlans, usePreferences } from '../../data/hooks'
import { OPT_INS_HEADER, PLAN_NOTIF_HEADER, US_STATIC } from '../../data/mock/us'
import type { Stat } from '../../data/types'
import { SignOutButton } from '../../session'
import { useTheme, type ResolvedTheme, type ThemeChoice } from '../../theme'
import { PUSH_ARRIVES } from '../shared/milestones'
import { PreviewBanner } from '../shared/PreviewBanner'
import { DESKTOP_PLACEHOLDER, TOGETHER_SINCE_ISO } from './copy'
import { DeveloperSection } from './DeveloperSection'
import { Profiles } from './Profiles'
import { SecurityCard } from './SecurityCard'
import { CheckRow, HAIRLINE, MonoValue, Row, Section, ToggleRow } from './SettingsRows'
import { useIsDesktop } from './useIsDesktop'

const NO_ROWS: never[] = []

/** desktop.md section 8: centered full-height column, gap 12, serif 40px title. */
function DesktopPlaceholder() {
  return (
    <section
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        color: 'var(--fg3)',
      }}
    >
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 40, lineHeight: 1, color: 'var(--fg1)' }}>Us</div>
      <div style={{ fontSize: 14 }}>{DESKTOP_PLACEHOLDER}</div>
    </section>
  )
}

/**
 * Light / Late night: 28px segments in a surface-2 track; the live theme shows
 * the page bg (`lightBtnBg` / `darkBtnBg` in the spec). The two are mutually
 * exclusive, so they are radios rather than a pair of independent toggles —
 * picking the option that already matches the resolved theme still moves the
 * stored choice off 'system', and aria-checked reports the result either way.
 */
function ThemeSwitch({ resolved, setTheme }: { resolved: ResolvedTheme; setTheme: (choice: ThemeChoice) => void }) {
  const seg = (on: boolean): CSSProperties => ({
    height: 28,
    padding: '0 10px',
    borderRadius: 4,
    border: 'none',
    background: on ? 'var(--bg)' : 'transparent',
    color: 'var(--fg1)',
    cursor: 'pointer',
    transition: 'background 150ms var(--ease)',
  })
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      setTheme('light')
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      setTheme('dark')
    }
  }
  return (
    <div
      role="radiogroup"
      aria-label={US_STATIC.themeLabel}
      onKeyDown={onKeyDown}
      style={{ display: 'flex', gap: 2, padding: 2, borderRadius: 6, background: 'var(--surface-2)', fontSize: 12, flex: 'none' }}
    >
      <button type="button" role="radio" aria-checked={resolved === 'light'} onClick={() => setTheme('light')} style={seg(resolved === 'light')}>
        {US_STATIC.themeLight}
      </button>
      <button type="button" role="radio" aria-checked={resolved === 'dark'} onClick={() => setTheme('dark')} style={seg(resolved === 'dark')}>
        {US_STATIC.themeDark}
      </button>
    </div>
  )
}

/** Mono 10px eyebrow inside the Notifications card, above the per-plan checkboxes. */
const PLAN_HEADER_STYLE: CSSProperties = {
  padding: '12px 16px 6px',
  borderTop: HAIRLINE,
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  color: 'var(--fg3)',
}

export default function UsPage() {
  const isDesktop = useIsDesktop()
  const { prefs, toggleNotif, togglePlanNotif, toggleOptIn, notifRows, planNotifChips, optIns, stats, security, simDate, setSimDate, simOptions } =
    usePreferences()
  const { resolved, setTheme } = useTheme()
  const [preview] = useDesignPreview()
  const { plans, today, loading } = usePlans()

  // The numbers the app can actually stand behind: plans, trips, days together.
  const realStats = useMemo<Stat[]>(() => {
    if (loading) return []
    const trips = plans.filter((p) => p.type === 'Trip').length
    return [
      { n: String(plans.length), l: plans.length === 1 ? 'plan' : 'plans' },
      { n: String(trips), l: trips === 1 ? 'trip' : 'trips' },
      { n: String(Math.max(0, daysBetween(TOGETHER_SINCE_ISO, today))), l: 'days' },
    ]
  }, [plans, today, loading])

  if (isDesktop) return <DesktopPlaceholder />

  return (
    <div className="pt-2 px-5 pb-[110px]" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <PreviewBanner style={{ padding: 0 }} />
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, lineHeight: 1, fontWeight: 400, margin: 0 }}>Us</h1>

      <Profiles stats={preview ? stats : realStats} preview={preview} />

      <SecurityCard rows={preview ? security : NO_ROWS} />

      <Section eyebrow="Preferences">
        <Row divider={false} gap={12} label={US_STATIC.themeLabel} right={<ThemeSwitch resolved={resolved} setTheme={setTheme} />} />
        <Row label={US_STATIC.currency.label} right={<MonoValue>{US_STATIC.currency.value}</MonoValue>} />
        <Row label={US_STATIC.timezone.label} right={<MonoValue>{US_STATIC.timezone.value}</MonoValue>} />
      </Section>

      <Section eyebrow="Notifications">
        {notifRows.map((n) => (
          <ToggleRow key={n.key} title={n.t} sub={n.d} on={prefs.notif[n.key]} onToggle={() => toggleNotif(n.key)} />
        ))}
        <div style={PLAN_HEADER_STYLE}>{PLAN_NOTIF_HEADER}</div>
        <div
          role="group"
          aria-label={PLAN_NOTIF_HEADER}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px', padding: '4px 16px 12px' }}
        >
          {planNotifChips.map(([key, label]) => (
            <CheckRow key={key} label={label} on={prefs.planNotif[key]} onToggle={() => togglePlanNotif(key)} />
          ))}
        </div>
        <div style={{ padding: '10px 16px 12px', borderTop: HAIRLINE, fontSize: 12, color: 'var(--fg3)' }}>{PUSH_ARRIVES}</div>
      </Section>

      <Section eyebrow={OPT_INS_HEADER}>
        {optIns.map((o) => (
          <ToggleRow key={o.key} title={o.t} sub={o.d} gap={12} subLineHeight={1.4} on={prefs.optIn[o.key]} onToggle={() => toggleOptIn(o.key)} />
        ))}
      </Section>

      {preview && (
        <Section>
          <Row
            divider={false}
            label={US_STATIC.storage.label}
            right={
              <MonoValue size={11} color="var(--fg3)">
                {US_STATIC.storage.value}
              </MonoValue>
            }
          />
          <Row label={US_STATIC.export.label} right={<span style={{ color: 'var(--fg3)' }}>→</span>} />
        </Section>
      )}

      <DeveloperSection simDate={simDate} setSimDate={setSimDate} simOptions={simOptions} />

      <SignOutButton label={US_STATIC.lockNow} />
    </div>
  )
}
