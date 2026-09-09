// mobile-d-sheets.md section 2 - the plan detail "More" menu sheet: the
// segments that do not fit the segment bar, then the plan-level actions
// (Edit plan, Delete plan; "All plans" on desktop, where the sheet doubles as
// the cover band's "···" menu). Picking a segment sets it and closes.

import { Sheet, SheetRow } from '../../ui'
import type { MoreItem, PlanSeg } from '../../data/types'

export function MoreSheet({
  open,
  onClose,
  items,
  onPick,
  onEditPlan,
  onDeletePlan,
  onAllPlans,
}: {
  open: boolean
  onClose: () => void
  items: MoreItem[]
  onPick: (seg: PlanSeg) => void
  onEditPlan?: () => void
  onDeletePlan?: () => void
  onAllPlans?: () => void
}) {
  return (
    <Sheet open={open} onClose={onClose} gap={4} aria-label="More">
      {items.map((mi) => (
        <SheetRow key={mi.key} label={mi.label} meta={mi.meta} onClick={() => onPick(mi.key)} />
      ))}
      {onAllPlans && <SheetRow label="All plans" meta="←" onClick={onAllPlans} />}
      {onEditPlan && <SheetRow label="Edit plan" meta="name · dates · rate" onClick={onEditPlan} />}
      {onDeletePlan && <SheetRow label={<span style={{ color: 'var(--danger)' }}>Delete plan</span>} onClick={onDeletePlan} />}
    </Sheet>
  )
}

/** The day chooser used by "Put it on a day" / "Move to another day". */
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
