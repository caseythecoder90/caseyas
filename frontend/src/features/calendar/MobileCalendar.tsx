// mobile-c-chat-calendar-notes-us.md section 4 (lines 578-604 of the mobile
// prototype): month title + Month/Agenda toggle, quick-add row, weekday header,
// the 7-column month grid, the legend, then Upcoming. Everything drawn is real:
// plan spanning bars and booked items from the plans api, the anniversary as
// a yearly all-day dot. The quick-add field is disabled until milestone 5.

import type { Ref } from 'react'
import { Eyebrow, PAPER } from '../../ui'
import { CalendarEmpty } from './CalendarEmpty'
import { QUICK_ADD_DISABLED_PLACEHOLDER, QuickAdd } from './QuickAdd'
import type { CalendarAgendaRow, CalendarModel, DayCell } from './calendarModel'

const WEEKDAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']

export function MobileCalendar({ cal, quickAddRef }: { cal: CalendarModel; quickAddRef?: Ref<HTMLInputElement> }) {
  const { info, view, setView, legend } = cal
  const cells = cal.cells(false)
  const monthView = view === 'month'

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <div>
            <Eyebrow>{info.year}</Eyebrow>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, lineHeight: 1 }}>{info.name}</div>
          </div>
          <div style={{ display: 'flex', gap: 4, paddingBottom: 2 }}>
            <StepButton label="Previous month" onClick={cal.prevMonth}>
              ‹
            </StepButton>
            <StepButton label="Next month" onClick={cal.nextMonth}>
              ›
            </StepButton>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, fontSize: 12, color: 'var(--fg2)' }}>
          {(['month', 'agenda'] as const).map((k) => {
            const on = view === k
            return (
              <button
                key={k}
                type="button"
                onClick={() => setView(k)}
                aria-pressed={on}
                style={{
                  padding: '6px 10px',
                  borderRadius: 4,
                  border: 'none',
                  background: on ? 'var(--surface-2)' : 'transparent',
                  color: on ? 'var(--fg1)' : 'var(--fg2)',
                  fontWeight: on ? 500 : 400,
                  fontSize: 12,
                }}
              >
                {k === 'month' ? 'Month' : 'Agenda'}
              </button>
            )
          })}
        </div>
      </div>

      <QuickAdd placeholder={QUICK_ADD_DISABLED_PLACEHOLDER} disabled inputRef={quickAddRef} style={{ margin: '16px 20px 0' }} />

      {monthView && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7,1fr)',
              padding: '16px 14px 0',
              textAlign: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '.1em',
              color: 'var(--fg3)',
            }}
          >
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, padding: '6px 14px 0' }}>
            {cells.map((cell) => (
              <MonthCell key={cell.key} cell={cell} monthName={info.name} onPick={cal.pickDay} />
            ))}
          </div>

          {legend.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px 14px',
                padding: '12px 20px 0',
                fontSize: 11,
                color: 'var(--fg3)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {legend.map((entry) => (
                <span key={entry.key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: entry.color, flex: 'none' }} />
                  {entry.label}
                </span>
              ))}
            </div>
          )}
        </>
      )}

      <div style={{ padding: '20px 20px 110px', display: 'flex', flexDirection: 'column' }}>
        {cal.rows.length === 0 ? (
          <CalendarEmpty eyebrow="Upcoming" />
        ) : (
          <>
            <Eyebrow style={{ marginBottom: 8 }}>Upcoming</Eyebrow>
            {cal.rows.map((row) => (
              <AgendaRowView key={row.key} row={row} onPick={cal.pickRow} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function StepButton({ label, onClick, children }: { label: string; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        border: '1px solid var(--border)',
        background: 'transparent',
        color: 'var(--fg2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </button>
  )
}

function MonthCell({ cell, monthName, onPick }: { cell: DayCell; monthName: string; onPick: (c: DayCell) => void }) {
  const base = {
    height: 54,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '4px 0 0',
    gap: 3,
    borderRadius: 8,
    position: 'relative' as const,
  }
  if (cell.blank) return <div style={base} />

  const item = cell.items[0]
  const yearly = cell.recurring
  // the design's event dot slot: a booked item in its plan's color, the
  // anniversary in the "both" color, otherwise nothing
  const dot1 = item ? item.planColor : yearly ? yearly.dot : 'transparent'
  const dot2 = item && cell.items.length > 1 ? cell.items[1].planColor : 'transparent'
  const selectable = !item && !cell.bar?.planId
  const parts = [`${monthName} ${cell.n}`]
  if (cell.today) parts.push('today')
  if (item) parts.push(cell.items.length > 1 ? `${item.title} and ${cell.items.length - 1} more` : item.title)
  if (yearly) parts.push(yearly.title)
  if (!item && cell.bar) parts.push(cell.bar.name ?? cell.bar.label)

  return (
    <button
      type="button"
      onClick={() => onPick(cell)}
      aria-label={parts.join(', ')}
      aria-pressed={selectable ? cell.selected : undefined}
      style={{
        ...base,
        border: 'none',
        background: item || yearly ? 'var(--surface)' : 'transparent',
        color: 'inherit',
        boxShadow: cell.selected && selectable ? 'inset 0 0 0 1px var(--accent)' : undefined,
      }}
    >
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          color: cell.today ? PAPER : 'var(--fg1)',
          background: cell.today ? 'var(--accent)' : 'transparent',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {cell.n}
      </span>
      <span style={{ display: 'flex', gap: 3, height: 4 }}>
        <span style={{ width: 4, height: 4, borderRadius: 999, background: dot1 }} />
        <span style={{ width: 4, height: 4, borderRadius: 999, background: dot2 }} />
      </span>
      {cell.bar && (
        <span
          style={{
            position: 'absolute',
            left: cell.bar.l,
            right: cell.bar.r,
            bottom: 2,
            height: 12,
            background: cell.bar.bg,
            borderRadius: cell.bar.rad,
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            color: PAPER,
            lineHeight: '12px',
            paddingLeft: 4,
            whiteSpace: 'nowrap',
            overflow: 'visible',
            textAlign: 'left',
            zIndex: cell.bar.label ? 2 : 1,
          }}
        >
          {cell.bar.label}
        </span>
      )}
    </button>
  )
}

function AgendaRowView({ row, onPick }: { row: CalendarAgendaRow; onPick: (r: CalendarAgendaRow) => void }) {
  const clickable = !!row.item || !!row.planId
  const style = {
    display: 'grid',
    gridTemplateColumns: '44px 1fr auto',
    gap: 12,
    padding: '12px 0',
    border: 'none',
    borderTop: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--fg1)',
    textAlign: 'left' as const,
    alignItems: 'center',
    width: '100%',
  }
  const inner = (
    <>
      <div style={{ fontFamily: 'var(--font-serif)', lineHeight: 1 }}>
        <div style={{ fontSize: 24 }}>{row.day}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', color: 'var(--fg3)', textTransform: 'uppercase' }}>
          {row.dow}
        </div>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: row.dot, flex: 'none' }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.title}</span>
          {row.plan && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: row.dot,
                border: `1px solid ${row.dot}`,
                padding: '1px 5px',
                borderRadius: 3,
                flex: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {row.plan}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--fg2)', marginTop: 2 }}>{row.sub}</div>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: row.rightColor, textAlign: 'right' }}>{row.right}</div>
    </>
  )

  if (!clickable) return <div style={style}>{inner}</div>
  return (
    <button type="button" onClick={() => onPick(row)} style={style}>
      {inner}
    </button>
  )
}
