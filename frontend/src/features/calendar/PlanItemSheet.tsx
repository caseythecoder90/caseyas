// A booked plan item tapped on the calendar: the event sheet's read-only card
// style (mobile-d-sheets.md section 10 look) - kind eyebrow with the plan
// badge, serif title, the when line, location / confirmation - plus the
// "Open in plan" link into the plan's itinerary.

import { useEffect, useRef } from 'react'
import { Button, Sheet } from '../../ui'
import type { CalendarItem } from './planCalendar'

export interface PlanItemSheetProps {
  item: CalendarItem | null
  onClose: () => void
  /** navigates to /plans/{planId}?seg=itinerary */
  onOpenPlan: () => void
}

export function PlanItemSheet({ item, onClose, onOpenPlan }: PlanItemSheetProps) {
  // keep the last item on screen while the sheet plays its 200ms close
  const last = useRef<CalendarItem | null>(null)
  useEffect(() => {
    if (item) last.current = item
  }, [item])
  const shown = item ?? last.current
  return (
    <Sheet open={!!item} onClose={onClose} gap={14} aria-label={shown ? shown.title : 'Booking'}>
      {shown && (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: 'var(--fg3)',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 999, background: shown.planColor }} />
            {shown.kind}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: shown.planColor,
                border: `1px solid ${shown.planColor}`,
                padding: '1px 5px',
                borderRadius: 3,
              }}
            >
              {shown.planName}
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30, lineHeight: 1.05 }}>{shown.title}</div>
          <div style={{ fontSize: 15, color: 'var(--fg1)' }}>{shown.when}</div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontSize: 14,
              color: 'var(--fg2)',
              paddingTop: 8,
              borderTop: '1px solid var(--border)',
            }}
          >
            <div>{shown.loc || 'No location'}</div>
            {shown.conf && (
              <div>
                Confirmation <span style={{ fontFamily: 'var(--font-mono)' }}>{shown.conf}</span>
              </div>
            )}
          </div>
          <Button variant="secondary" size="sheet" full onClick={onOpenPlan}>
            Open in plan →
          </Button>
        </>
      )}
    </Sheet>
  )
}
