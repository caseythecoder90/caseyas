// mobile-d-sheets.md section 2 - the plan detail "More" menu sheet.
// Fixed list of five destinations regardless of plan type; picking one sets the
// segment and closes.

import { Sheet, SheetRow } from '../../ui'
import type { MoreItem, PlanSeg } from '../../data/types'

export function MoreSheet({
  open,
  onClose,
  items,
  onPick,
}: {
  open: boolean
  onClose: () => void
  items: MoreItem[]
  onPick: (seg: PlanSeg) => void
}) {
  return (
    <Sheet open={open} onClose={onClose} gap={4} aria-label="More">
      {items.map((mi) => (
        <SheetRow key={mi.key} label={mi.label} meta={mi.meta} onClick={() => onPick(mi.key)} />
      ))}
    </Sheet>
  )
}

/** The day chooser used by "drag onto a day" / "Put it on a day" on touch. */
export function PutOnADaySheet({
  open,
  onClose,
  days,
  onPick,
}: {
  open: boolean
  onClose: () => void
  days: { n: number; dow: string; date: string; city: string }[]
  onPick: (dayN: number) => void
}) {
  return (
    <Sheet open={open} onClose={onClose} gap={4} title="Put it on a day" aria-label="Put it on a day">
      {days.map((d) => (
        <SheetRow key={d.n} label={`Day ${d.n} · ${d.dow} ${d.date}`} meta={d.city} onClick={() => onPick(d.n)} />
      ))}
    </Sheet>
  )
}
