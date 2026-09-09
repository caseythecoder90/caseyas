// The Memories timeline props the prototype exposed only in the canvas props
// panel (tokens-and-components.md section 15: `timelineLayout` and
// `showOnThisDay`, both in its "Memories" section). The SPA has no props panel,
// so the three designed layouts (mobile-a-memories.md 3.5 / 3.6 / 3.7) would
// otherwise be unreachable. This is the same kind of dev-only affordance as the
// Us screen's "Simulate date" row: a header button on the mobile timeline that
// opens a bottom sheet listing the layouts and the On-this-day switch.

import { SlidersHorizontal } from 'lucide-react'
import type { TimelineLayout } from '../../data/types'
import { Icon, IconButton, Sheet, Toggle } from '../../ui'

export const LAYOUT_OPTIONS: { key: TimelineLayout; label: string }[] = [
  { key: 'editorial', label: 'Editorial stack' },
  { key: 'grid', label: 'Photo grid' },
  { key: 'journal', label: 'Journal list' },
]

export interface LayoutTweaksButtonProps {
  onClick: () => void
}

/** Third 40x40 header button, matching the gallery / search pair in 3.1. */
export function LayoutTweaksButton({ onClick }: LayoutTweaksButtonProps) {
  return (
    <IconButton label="Design tweaks" onClick={onClick} style={{ borderRadius: 8 }}>
      <SlidersHorizontal size={20} strokeWidth={1.5} />
    </IconButton>
  )
}

export interface LayoutTweaksSheetProps {
  open: boolean
  onClose: () => void
  layout: TimelineLayout
  setLayout: (l: TimelineLayout) => void
  showOnThisDay: boolean
  setShowOnThisDay: (v: boolean) => void
}

export function LayoutTweaksSheet({ open, onClose, layout, setLayout, showOnThisDay, setShowOnThisDay }: LayoutTweaksSheetProps) {
  const pick = (l: TimelineLayout) => {
    setLayout(l)
    onClose()
  }
  return (
    <Sheet open={open} onClose={onClose} gap={4} title="Design tweaks" meta="Developer" aria-label="Design tweaks">
      <div style={{ display: 'flex', flexDirection: 'column', paddingTop: 8 }}>
        {LAYOUT_OPTIONS.map((o) => {
          const on = layout === o.key
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => pick(o.key)}
              aria-pressed={on}
              style={{
                height: 52,
                border: 'none',
                borderTop: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--fg1)',
                fontSize: 16,
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                padding: 0,
                width: '100%',
                cursor: 'pointer',
              }}
            >
              <span>{o.label}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg3)' }}>{o.key}</span>
                <span style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                  {on && <Icon name="check" size={18} />}
                </span>
              </span>
            </button>
          )
        })}

        <div
          style={{
            height: 52,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            fontSize: 16,
          }}
        >
          <span id="tweak-otd">On this day</span>
          <Toggle on={showOnThisDay} onChange={setShowOnThisDay} aria-labelledby="tweak-otd" />
        </div>
      </div>
    </Sheet>
  )
}
