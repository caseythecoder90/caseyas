// mobile-d-sheets.md section 10 (EVENT SHEET, lines 836-848): the day / agenda
// tap opens a bottom sheet with the owner dot + kind eyebrow, the title, the
// when line, then recurrence, the reminder line and the location. Past events
// get the accent "Add a memory from this" CTA, future ones the outline "Edit".

import { useEffect, useRef } from 'react'
import { Button, Sheet, dotFor } from '../../ui'
import type { CalendarEvent } from '../../data/types'

export interface EventSheetProps {
  event: CalendarEvent | null
  onClose: () => void
  onAddMemory: () => void
}

export function EventSheet({ event, onClose, onAddMemory }: EventSheetProps) {
  // keep the last event on screen while the sheet plays its 200ms close
  const last = useRef<CalendarEvent | null>(null)
  useEffect(() => {
    if (event) last.current = event
  }, [event])
  const shown = event ?? last.current
  const past = !!shown?.past
  return (
    <Sheet open={!!event} onClose={onClose} gap={14} aria-label={shown ? shown.title : 'Event'}>
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
            <span style={{ width: 8, height: 8, borderRadius: 999, background: dotFor(shown.owner) }} />
            {shown.kind}
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
            <div>{shown.rule}</div>
            <div>Remind: push 1 hour before · email the morning of</div>
            <div>{shown.loc || 'No location'}</div>
          </div>
          {past ? (
            <Button variant="primary" size="sheet" full onClick={onAddMemory}>
              Add a memory from this →
            </Button>
          ) : (
            <Button variant="secondary" size="sheet" full onClick={onClose}>
              Edit
            </Button>
          )}
        </>
      )}
    </Sheet>
  )
}
