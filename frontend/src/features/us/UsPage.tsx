// Us (mobile-c spec section 5, prototype lines 634-682): profiles, Together
// since, stats, Security (the five static rows plus the account-console
// hand-off), Preferences (theme / currency / timezone), Notifications (three
// switches + the per-plan checkboxes), the off-by-default opt-ins, Storage /
// Export, a dev-only Simulate date row, and "Lock now" — the real POST /logout.
//
// Layout: the prototype's `padding:8px 20px 110px; gap:28px` column below md.
// At >= md, desktop.md section 8 ("Notes / Us placeholder", and line 42) asks
// for the isOther placeholder instead, so that is what renders there.

import type { CSSProperties, KeyboardEvent } from 'react'
import { usePreferences } from '../../data/hooks'
import { OPT_INS_HEADER, PLAN_NOTIF_HEADER, US_STATIC } from '../../data/mock/us'
import { SignOutButton } from '../../session'
import { useTheme, type ResolvedTheme, type ThemeChoice } from '../../theme'
import { DESKTOP_PLACEHOLDER } from './copy'
import { Profiles } from './Profiles'
import { SecurityCard } from './SecurityCard'
import { CheckRow, HAIRLINE, MonoValue, Row, Section, ToggleRow } from './SettingsRows'
import { SimulateDate } from './SimulateDate'
import { useIsDesktop } from './useIsDesktop'

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

  if (isDesktop) return <DesktopPlaceholder />

  return (
    <div className="pt-2 px-5 pb-[110px]" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, lineHeight: 1, fontWeight: 400, margin: 0 }}>Us</h1>

      <Profiles stats={stats} />

      <SecurityCard rows={security} />

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
      </Section>

      <Section eyebrow={OPT_INS_HEADER}>
        {optIns.map((o) => (
          <ToggleRow key={o.key} title={o.t} sub={o.d} gap={12} subLineHeight={1.4} on={prefs.optIn[o.key]} onToggle={() => toggleOptIn(o.key)} />
        ))}
      </Section>

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

      {import.meta.env.DEV && <SimulateDate simDate={simDate} setSimDate={setSimDate} simOptions={simOptions} />}

      <SignOutButton label={US_STATIC.lockNow} />
    </div>
  )
}
