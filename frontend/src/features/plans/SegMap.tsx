// mobile-b-plans.md 2.11 / desktop.md 7.2 - the placeholder map: city chips,
// teardrop pins coloured by kind, and the pin card (mobile) or pin rail
// (desktop).

import { useState } from 'react'
import type { MapPin } from '../../data/types'
import { Eyebrow, filterChip, kindColor } from '../../ui'

const LEGEND: { kind: string; label: string }[] = [
  { kind: 'food', label: 'food' },
  { kind: 'activity', label: 'activity' },
  { kind: 'stay', label: 'stay' },
  { kind: 'ticket', label: 'ticket' },
  { kind: 'transport', label: 'transport' },
]

export function SegMap({
  pins,
  cities,
  variant = 'mobile',
}: {
  pins: Record<string, MapPin[]>
  cities?: string[]
  variant?: 'mobile' | 'desktop'
}) {
  const desktop = variant === 'desktop'
  const cityList = cities && cities.length > 0 ? cities : Object.keys(pins)
  const [picked, setCity] = useState<string | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const city = picked && cityList.includes(picked) ? picked : (cityList[0] ?? '')
  const list = pins[city] ?? []
  const open = selected !== null && !!list[selected]
  const pin = open ? list[selected] : undefined

  const emptyNote = (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
        fontSize: 13,
        color: 'var(--fg3)',
      }}
    >
      No places pinned yet. Items with a location show up here.
    </div>
  )

  const pinButtons = list.map((p, i) => {
    const size = selected === i ? (desktop ? 24 : 22) : 16
    return (
      <button
        key={`${p.title}-${i}`}
        type="button"
        aria-label={`${p.title}, ${p.place}`}
        aria-pressed={selected === i}
        onClick={() => setSelected((s) => (s === i ? null : i))}
        style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: `${p.y}%`,
          transform: 'translate(-50%,-100%)',
          width: size,
          height: size,
          borderRadius: '999px 999px 999px 0',
          background: kindColor(p.kind),
          border: '2px solid var(--bg)',
          cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(0,0,0,.2)',
          transition: 'width 150ms, height 150ms',
          padding: 0,
        }}
      />
    )
  })

  const backdrop = (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)',
          backgroundSize: desktop ? '64px 64px' : '48px 48px',
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: desktop ? '46%' : '44%',
          height: desktop ? 30 : 26,
          background: 'var(--surface-2)',
          transform: `rotate(${desktop ? -6 : -8}deg)`,
          opacity: desktop ? 1 : 0.9,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: desktop ? '58%' : '62%',
          width: desktop ? 22 : 18,
          background: 'var(--surface-2)',
          transform: `rotate(${desktop ? 10 : 12}deg)`,
        }}
      />
      <div style={{ position: 'absolute', left: desktop ? 16 : 12, bottom: desktop ? 12 : 10, fontFamily: 'var(--font-mono)', fontSize: desktop ? 11 : 10, color: 'var(--fg3)' }}>
        {city} · muted tiles · placeholder
      </div>
    </>
  )

  if (desktop) {
    return (
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', minHeight: 0 }}>
        <div style={{ position: 'relative', background: 'var(--surface)', overflow: 'hidden' }}>
          {backdrop}
          {pinButtons}
          {list.length === 0 && emptyNote}
        </div>
        <div style={{ borderLeft: '1px solid var(--border)', padding: 20, display: 'flex', flexDirection: 'column', gap: 4, overflow: 'auto' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {cityList.map((c) => {
              const s = filterChip(c === city)
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={c === city}
                  onClick={() => {
                    setCity(c)
                    setSelected(null)
                  }}
                  style={{
                    height: 30,
                    padding: '0 12px',
                    borderRadius: 4,
                    border: `1px solid ${s.borderColor}`,
                    background: s.background,
                    color: s.color,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {c}
                </button>
              )
            })}
          </div>
          <Eyebrow style={{ marginBottom: 8 }}>Pins · {city}</Eyebrow>
          {list.map((p, i) => (
            <button
              key={`${p.title}-${i}`}
              type="button"
              onClick={() => setSelected((s) => (s === i ? null : i))}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                padding: '10px 8px',
                borderRadius: 6,
                background: selected === i ? 'var(--surface)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'var(--fg1)',
                width: '100%',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 999, background: kindColor(p.kind), flex: 'none' }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 14 }}>{p.title}</span>
                <span style={{ display: 'block', fontSize: 11, color: 'var(--fg3)' }}>
                  {p.kind} · {p.place} · {p.when}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }} className="hide-scrollbar">
        {cityList.map((c) => {
          const s = filterChip(c === city)
          return (
            <button
              key={c}
              type="button"
              aria-pressed={c === city}
              onClick={() => {
                setCity(c)
                setSelected(null)
              }}
              style={{
                flex: 'none',
                height: 30,
                padding: '0 12px',
                borderRadius: 4,
                border: `1px solid ${s.borderColor}`,
                background: s.background,
                color: s.color,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {c}
            </button>
          )
        })}
      </div>

      <div style={{ position: 'relative', height: 380, borderRadius: 8, overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {backdrop}
        {pinButtons}
        {list.length === 0 && emptyNote}
        {pin && (
          <div
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              bottom: 32,
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '12px 14px',
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: kindColor(pin.kind) }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg3)' }}>
                  {pin.kind} · {pin.when}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 19, lineHeight: 1.1, marginTop: 3 }}>{pin.title}</div>
              <div style={{ fontSize: 12, color: 'var(--fg2)' }}>{pin.place}</div>
            </div>
            <button
              type="button"
              style={{
                height: 32,
                padding: '0 10px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--fg1)',
                fontSize: 12,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Directions
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 11, color: 'var(--fg3)', fontFamily: 'var(--font-mono)' }}>
        {LEGEND.map((l) => (
          <span key={l.kind} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: kindColor(l.kind) }} />
            {l.label}
          </span>
        ))}
      </div>
      <div style={{ fontSize: 12, color: 'var(--fg3)' }}>Map view is an opt-in switch in Us → Preferences (off by default). Tap a pin for its card.</div>
    </div>
  )
}
