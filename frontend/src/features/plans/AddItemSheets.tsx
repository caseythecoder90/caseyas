// mobile-d-sheets.md sections 5-8: the "+ Add to day" flow.
//   kinds  -> the kind tiles (Flight and Stay hidden on event plans, architecture
//             section 7) + "Paste a confirmation instead"
//   flight / stay / the four simple kinds -> ItemForm (real inputs, saves through
//             the api; the same component edits an existing item from ItemSheet)
//   paste  -> "Review before saving" (the parser arrives with milestone 6; the
//             sheet says so instead of pretending)
// Exactly one is visible at a time.

import { useState } from 'react'
import { BOOKING_KINDS, PASTE_FIELDS } from '../../data/mock'
import type { BookingForm } from '../../data/types'
import { Button, Sheet, SheetBody, SheetFooter, SheetHeader, useToast } from '../../ui'
import { ItemForm, type FormKind } from './ItemForm'

const DEFERRED = 'The parser arrives with milestone 6 · the forms are real today'

const SIMPLE_KIND_FOR: Record<string, FormKind> = { Transport: 'transport', Activity: 'activity', Food: 'food', Ticket: 'ticket' }

export interface AddItemSheetsProps {
  form: BookingForm
  dayN: number
  onSetForm: (form: BookingForm) => void
  onClose: () => void
  /** event plans hide Flight and Stay from the picker */
  isEvent?: boolean
}

export function AddItemSheets({ form, dayN, onSetForm, onClose, isEvent }: AddItemSheetsProps) {
  const toast = useToast()
  const [simpleKind, setSimpleKind] = useState<FormKind | null>(null)

  const kinds = isEvent ? BOOKING_KINDS.filter((k) => k.form === null) : BOOKING_KINDS

  const closeAll = () => {
    setSimpleKind(null)
    onClose()
  }

  return (
    <>
      {/* ---------------------------------------------------------- kinds */}
      <Sheet open={form === 'kinds' && simpleKind == null} onClose={onClose} gap={14} aria-label={`Add to day ${dayN}`}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24 }}>Add to day {dayN}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {kinds.map((k) => (
            <button
              key={k.abbr}
              type="button"
              onClick={() => {
                if (k.form) onSetForm(k.form)
                else setSimpleKind(SIMPLE_KIND_FOR[k.label] ?? 'activity')
              }}
              style={{
                height: 64,
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--fg1)',
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fg3)' }}>{k.abbr}</span>
              {k.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onSetForm('paste')}
          style={{
            height: 48,
            borderRadius: 8,
            border: '1px dashed var(--border)',
            background: 'transparent',
            color: 'var(--fg1)',
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="8" height="4" x="8" y="2" rx="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          </svg>
          Paste a confirmation instead
        </button>
        <div style={{ fontSize: 12, color: 'var(--fg3)', textAlign: 'center' }}>
          {isEvent ? 'One day, one schedule. Flights and stays live on trips.' : 'Pick a kind; the form is short.'}
        </div>
      </Sheet>

      {/* ---------------------------------------------------- the forms */}
      <ItemForm open={form === 'flight'} kind="flight" dayN={dayN} onClose={closeAll} />
      <ItemForm open={form === 'stay'} kind="stay" dayN={dayN} onClose={closeAll} />
      <ItemForm open={form === 'kinds' && simpleKind != null} kind={simpleKind ?? 'activity'} dayN={dayN} onClose={closeAll} />

      {/* ---------------------------------------------------------- paste */}
      <Sheet open={form === 'paste'} onClose={onClose} variant="tall" aria-label="Review before saving">
        <SheetHeader title="Review before saving" action="Discard" onAction={onClose}>
          <div style={{ fontSize: 12, color: 'var(--fg3)', lineHeight: 1.5 }}>{DEFERRED}</div>
        </SheetHeader>
        <SheetBody style={{ gap: 12 }}>
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--fg3)',
              lineHeight: 1.6,
              minHeight: 72,
            }}
          >
            Paste a confirmation email here once the parser lands. It will read the fields below and let you check every one before anything is saved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                color: 'var(--fg3)',
                border: '1px solid var(--border)',
                padding: '2px 6px',
                borderRadius: 3,
              }}
            >
              Preview
            </span>
            <span style={{ color: 'var(--fg2)' }}>the fields a flight confirmation fills</span>
          </div>
          {PASTE_FIELDS.map((pf) => (
            <div
              key={pf.k}
              style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr auto',
                gap: 10,
                alignItems: 'center',
                padding: '10px 0',
                borderTop: '1px solid var(--border)',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--fg2)' }}>{pf.k}</span>
              <span style={{ fontSize: 14, color: 'var(--fg3)' }}>—</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  color: 'var(--fg3)',
                  whiteSpace: 'nowrap',
                }}
              >
                soon
              </span>
            </div>
          ))}
        </SheetBody>
        <SheetFooter style={{ flexDirection: 'row', gap: 8 }}>
          <Button size="sheet" style={{ flex: 1 }} onClick={() => onSetForm('flight')}>
            Fill it in by hand
          </Button>
          <Button
            variant="primary"
            size="sheet"
            style={{ flex: 1 }}
            onClick={() => {
              toast.show(DEFERRED)
              onClose()
            }}
          >
            Save flight
          </Button>
        </SheetFooter>
      </Sheet>
    </>
  )
}
