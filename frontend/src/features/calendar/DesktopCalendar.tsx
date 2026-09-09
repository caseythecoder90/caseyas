// desktop.md section 6 (lines 238-269 of the desktop prototype): a full-height
// page with the 56px serif month title, prev/next, quick-add, a Month/Week
// segmented control, then either the 7-column month grid or the 56px-per-hour
// week board, with the legend at the bottom. Everything drawn is real: plan
// spans as bottom bars, booked items as chips (month) or timed blocks placed
// by their time (week), the anniversary as an all-day chip. The quick-add
// field is disabled until the events collection lands in milestone 5.

import type { Ref } from 'react'
import { Eyebrow, PAPER, Segmented } from '../../ui'
import { CalendarEmpty } from './CalendarEmpty'
import { QUICK_ADD_DISABLED_PLACEHOLDER, QuickAdd } from './QuickAdd'
import { fmtHour, type CalendarModel, type DayCell, type DesktopView } from './calendarModel'
import type { CalendarItem } from './planCalendar'

const VIEW_OPTIONS: { key: DesktopView; label: string }[] = [
  { key: 'month', label: 'Month' },
  { key: 'week', label: 'Week' },
]

export function DesktopCalendar({ cal, quickAddRef }: { cal: CalendarModel; quickAddRef?: Ref<HTMLInputElement> }) {
  const { info, desktopView, setDesktopView, legend, emptyMonth } = cal

  return (
    <div style={{ padding: '40px 48px 48px', display: 'flex', flexDirection: 'column', gap: 24, flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', flex: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20 }}>
          <div>
            <Eyebrow>{info.year}</Eyebrow>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 56, lineHeight: 1 }}>{info.name}</div>
          </div>
          <div style={{ display: 'flex', gap: 4, paddingBottom: 6 }}>
            <StepButton label="Previous month" onClick={cal.prevMonth}>
              ‹
            </StepButton>
            <StepButton label="Next month" onClick={cal.nextMonth}>
              ›
            </StepButton>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <QuickAdd placeholder={QUICK_ADD_DISABLED_PLACEHOLDER} disabled variant="desktop" inputRef={quickAddRef} style={{ maxWidth: '100%' }} />
          <Segmented options={VIEW_OPTIONS} value={desktopView} onChange={setDesktopView} variant="calendar" aria-label="Calendar view" />
        </div>
      </div>

      {desktopView === 'month' ? <MonthBoard cal={cal} /> : <WeekBoard cal={cal} />}

      {emptyMonth && desktopView === 'month' && <CalendarEmpty style={{ flex: 'none' }} />}

      {legend.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', fontSize: 12, color: 'var(--fg3)', fontFamily: 'var(--font-mono)', flex: 'none' }}>
          {legend.map((entry) => (
            <span key={entry.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: entry.color, flex: 'none' }} />
              {entry.label}
            </span>
          ))}
        </div>
      )}
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
        width: 32,
        height: 32,
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

// ------------------------------------------------------------------- month

function MonthBoard({ cal }: { cal: CalendarModel }) {
  const cells = cal.cells(true)
  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7,1fr)',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '.14em',
          color: 'var(--fg3)',
          textTransform: 'uppercase',
          padding: '0 0 8px',
          borderBottom: '1px solid var(--border)',
          flex: 'none',
        }}
      >
        {cal.weekdays.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(7,1fr)',
          // 1fr rows per the design; the floor keeps the chips readable on short viewports
          gridAutoRows: 'minmax(96px,1fr)',
          borderLeft: '1px solid var(--border)',
          borderTop: '1px solid var(--border)',
        }}
      >
        {cells.map((cell) => (
          <MonthDay key={cell.key} cell={cell} cal={cal} />
        ))}
      </div>
    </>
  )
}

function MonthDay({ cell, cal }: { cell: DayCell; cal: CalendarModel }) {
  const bar = cell.bar
  return (
    <div
      style={{
        borderRight: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: 8,
        paddingBottom: bar ? 22 : 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        minHeight: 0,
        overflow: 'hidden',
        position: 'relative',
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
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          flex: 'none',
          color: cell.today ? PAPER : cell.trailing ? 'var(--fg3)' : 'var(--fg1)',
          background: cell.today ? 'var(--accent)' : 'transparent',
        }}
      >
        {cell.n}
      </span>
      {cell.recurring && (
        <div style={{ ...chipStyle, background: 'var(--surface-2)' }} aria-label={`${cell.recurring.title}, all day`}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: cell.recurring.dot, flex: 'none' }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{cell.recurring.title}</span>
        </div>
      )}
      {cell.items.map((it) => (
        <ItemChip key={it.id} item={it} cal={cal} />
      ))}
      {bar && (
        <button
          type="button"
          aria-label={bar.name ?? 'Plan'}
          onClick={() => bar.planId && cal.openPlan(bar.planId)}
          style={{
            position: 'absolute',
            left: bar.l,
            right: bar.r,
            bottom: 4,
            height: 14,
            border: 'none',
            background: bar.bg,
            borderRadius: bar.rad,
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: PAPER,
            lineHeight: '14px',
            padding: '0 0 0 6px',
            whiteSpace: 'nowrap',
            overflow: 'visible',
            textAlign: 'left',
            zIndex: bar.label ? 2 : 1,
          }}
        >
          {bar.label}
        </button>
      )}
    </div>
  )
}

const chipStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 12,
  padding: '3px 6px',
  borderRadius: 4,
  background: 'var(--surface-2)',
  color: 'var(--fg1)',
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  border: 'none',
  width: '100%',
  textAlign: 'left' as const,
  flex: 'none',
}

/** A real booked plan item as a month-cell chip: plan-colored dot, time, title, plan badge. */
function ItemChip({ item, cal }: { item: CalendarItem; cal: CalendarModel }) {
  return (
    <button type="button" aria-label={`${item.title}, ${item.planName}`} title={item.planName} onClick={() => cal.openItemCard(item)} style={chipStyle}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: item.planColor, flex: 'none' }} />
      {item.time && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg2)', flex: 'none' }}>{item.time}</span>}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>{item.title}</span>
      <PlanBadge name={item.planName} color={item.planColor} />
    </button>
  )
}

function PlanBadge({ name, color }: { name: string; color: string }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color,
        border: `1px solid ${color}`,
        padding: '0 4px',
        borderRadius: 3,
        flex: 'none',
        maxWidth: 72,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        lineHeight: '14px',
      }}
    >
      {name}
    </span>
  )
}

// -------------------------------------------------------------------- week

function WeekBoard({ cal }: { cal: CalendarModel }) {
  const { weekDays, weekItems, hours, rowHeight } = cal
  const firstHour = hours[0]?.h ?? 7
  return (
    <div
      style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: `56px repeat(7,1fr)`,
        gridTemplateRows: 'auto 1fr',
        borderTop: '1px solid var(--border)',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <div />
      {weekDays.map((w) => (
        <div key={w.key} style={{ padding: '10px 8px', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--fg3)' }}>
            {w.dow}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 24,
              lineHeight: 1,
              color: w.today ? 'var(--accent)' : w.inMonth ? 'var(--fg1)' : 'var(--fg3)',
            }}
          >
            {w.n}
          </span>
        </div>
      ))}
      <div
        style={{
          gridColumn: '1 / -1',
          display: 'grid',
          gridTemplateColumns: `56px repeat(7,1fr)`,
          position: 'relative',
          minHeight: 0,
          overflow: 'auto',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {hours.map((h) => (
            <div
              key={h.h}
              style={{
                height: rowHeight,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--fg3)',
                padding: '0 8px',
                textAlign: 'right',
                borderTop: '1px solid var(--border)',
                marginTop: -1,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                flex: 'none',
              }}
            >
              {h.label}
            </div>
          ))}
        </div>
        {weekDays.map((w) => (
          <div
            key={w.key}
            style={{
              position: 'relative',
              borderLeft: '1px solid var(--border)',
              backgroundImage: `repeating-linear-gradient(to bottom,var(--border) 0 1px,transparent 1px ${rowHeight}px)`,
            }}
          >
            {(weekItems[w.key] ?? []).map((it) => (
              <WeekBlock key={it.id} item={it} firstHour={firstHour} rowHeight={rowHeight} onOpen={cal.openItemCard} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** A timed booking on the week rail, placed by its start and sized by its end (an hour when it has none). */
function WeekBlock({ item, firstHour, rowHeight, onOpen }: { item: CalendarItem; firstHour: number; rowHeight: number; onOpen: (it: CalendarItem) => void }) {
  const start = item.startHour ?? firstHour
  const end = item.endHour !== undefined && item.endHour > start ? item.endHour : start + 1
  return (
    <button
      type="button"
      aria-label={`${item.title}, ${item.planName}, ${item.when}`}
      onClick={() => onOpen(item)}
      style={{
        position: 'absolute',
        left: 4,
        right: 4,
        top: (start - firstHour) * rowHeight,
        height: Math.max(28, (end - start) * rowHeight - 4),
        borderRadius: 6,
        background: 'var(--surface-2)',
        border: 'none',
        borderLeft: `2px solid ${item.planColor}`,
        padding: '6px 8px',
        fontSize: 12,
        lineHeight: 1.3,
        overflow: 'hidden',
        color: 'var(--fg1)',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg2)', whiteSpace: 'nowrap' }}>
        {item.endHour !== undefined && item.endHour > start ? `${fmtHour(start)} – ${fmtHour(item.endHour)}` : fmtHour(start)}
      </div>
      <div style={{ display: 'flex' }}>
        <PlanBadge name={item.planName} color={item.planColor} />
      </div>
    </button>
  )
}
