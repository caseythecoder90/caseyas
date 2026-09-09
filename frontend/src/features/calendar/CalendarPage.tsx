// /calendar - the month of today (real or simulated), stepping across years.
// Mobile: month grid + Upcoming agenda (mobile-c-chat-calendar-notes-us.md
// section 4). Desktop (>= md): the full-height month / week board (desktop.md
// section 6). Everything shown is derived from the real plans: spanning bars,
// booked items (tap for the read-only PlanItemSheet) and the anniversary. The
// calendar's own events arrive with milestone 5; EventSheet.tsx waits for
// them and nothing opens it until then.

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'
import { useToast } from '../../ui'
import { DesktopCalendar } from './DesktopCalendar'
import { MobileCalendar } from './MobileCalendar'
import { PlanItemSheet } from './PlanItemSheet'
import { QUICK_ADD_DISABLED_PLACEHOLDER } from './QuickAdd'
import { useCalendar } from './calendarModel'
import { useIsDesktop } from './useIsDesktop'

export default function CalendarPage() {
  const cal = useCalendar()
  const isDesktop = useIsDesktop()
  const toast = useToast()
  const quickAdd = useRef<HTMLInputElement>(null)
  const [params, setParams] = useSearchParams()

  // The sidebar's New > Event lands here as /calendar?new=1. The quick-add
  // field cannot save yet, so say so instead of focusing a dead input.
  const wantsNew = params.get('new') === '1'
  useEffect(() => {
    if (!wantsNew) return
    toast.show(`${QUICK_ADD_DISABLED_PLACEHOLDER}.`)
    const next = new URLSearchParams(params)
    next.delete('new')
    setParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantsNew])

  return (
    <>
      {isDesktop ? <DesktopCalendar cal={cal} quickAddRef={quickAdd} /> : <MobileCalendar cal={cal} quickAddRef={quickAdd} />}
      <PlanItemSheet item={cal.openItem} onClose={cal.closeItem} onOpenPlan={cal.openItemPlan} />
    </>
  )
}
