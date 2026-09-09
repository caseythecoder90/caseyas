// /calendar - September 2026. Mobile: month grid + Upcoming agenda
// (mobile-c-chat-calendar-notes-us.md section 4). Desktop (>= md): the
// full-height month / week board (desktop.md section 6). The event sheet is
// shared by both (mobile-d-sheets.md section 10).

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'
import { DesktopCalendar } from './DesktopCalendar'
import { EventSheet } from './EventSheet'
import { MobileCalendar } from './MobileCalendar'
import { PlanItemSheet } from './PlanItemSheet'
import { useCalendar } from './calendarModel'
import { useIsDesktop } from './useIsDesktop'

export default function CalendarPage() {
  const cal = useCalendar()
  const isDesktop = useIsDesktop()
  const quickAdd = useRef<HTMLInputElement>(null)
  const [params, setParams] = useSearchParams()

  // The sidebar's New > Event lands here as /calendar?new=1: focus the quick-add field.
  const wantsNew = params.get('new') === '1'
  useEffect(() => {
    if (!wantsNew) return
    quickAdd.current?.focus()
    const next = new URLSearchParams(params)
    next.delete('new')
    setParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantsNew])

  return (
    <>
      {isDesktop ? <DesktopCalendar cal={cal} quickAddRef={quickAdd} /> : <MobileCalendar cal={cal} quickAddRef={quickAdd} />}
      <EventSheet event={cal.openEvent} onClose={cal.closeEvent} onAddMemory={cal.addMemoryFromEvent} />
      <PlanItemSheet item={cal.openItem} onClose={cal.closeItem} onOpenPlan={cal.openItemPlan} />
    </>
  )
}
