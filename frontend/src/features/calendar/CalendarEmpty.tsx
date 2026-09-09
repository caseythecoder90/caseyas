// The month with nothing on it: one warm line plus the quiet truth about what
// the calendar cannot show yet. Shared by the mobile Upcoming list and the
// desktop month board.

import { Eyebrow } from '../../ui'

export const EMPTY_TITLE = 'Nothing on the calendar this month.'
export const EMPTY_NOTE = 'Your own events, reminders and recurring things arrive with milestone 5.'

export function CalendarEmpty({ eyebrow, style }: { eyebrow?: string; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {eyebrow && <Eyebrow style={{ marginBottom: 4 }}>{eyebrow}</Eyebrow>}
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, lineHeight: 1.2, color: 'var(--fg1)' }}>{EMPTY_TITLE}</div>
      <div style={{ fontSize: 12, color: 'var(--fg3)' }}>{EMPTY_NOTE}</div>
    </div>
  )
}
