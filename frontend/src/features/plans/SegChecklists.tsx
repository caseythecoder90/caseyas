// mobile-b-plans.md 2.8 / desktop.md 7.2 - Checklists (Guests for an event).
// Ticking writes to the session store, so the progress bars here and the rings
// on Overview move together.

import { useState } from 'react'
import { useParams } from 'react-router'
import { HER_INI } from '../../people'
import { usePlan, type ChecklistView } from '../../data/hooks'
import { Field, Input, checkStyle, whoStyle } from '../../ui'
import { Bar, CheckBox } from './bits'

export interface SegChecklistsProps {
  lists: ChecklistView[]
  onToggle: (key: string, currentlyDone: boolean) => void
  variant?: 'mobile' | 'desktop'
}

export function SegChecklists({ lists, onToggle, variant = 'mobile' }: SegChecklistsProps) {
  const desktop = variant === 'desktop'
  const { id } = useParams()
  const { m } = usePlan(id)
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const saveItem = async (listId: string) => {
    const t = text.trim()
    if (!t || saving) return
    setSaving(true)
    setAddError(null)
    try {
      await m.addListItem(listId, t)
      setText('')
      setAddingTo(null)
    } catch {
      setAddError('Could not add that. Try again.')
    } finally {
      setSaving(false)
    }
  }
  return (
    <div
      style={
        desktop
          ? { padding: '24px 40px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, alignContent: 'start' }
          : { padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 24 }
      }
    >
      {lists.map((l) => (
        <div key={l.name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: desktop ? 24 : 22 }}>{l.name}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg3)', whiteSpace: 'nowrap', flex: 'none' }}>
              {l.doneNow} / {l.total}
            </span>
          </div>
          <Bar pct={l.pct} />
          {l.items.map((it) => {
            const s = checkStyle(it.done)
            const who = whoStyle(it.who)
            return (
              <button
                key={it.key}
                type="button"
                onClick={() => onToggle(it.key, it.done)}
                aria-pressed={it.done}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 0',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  borderRadius: 0,
                  background: 'transparent',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  color: 'var(--fg1)',
                }}
              >
                <CheckBox done={it.done} />
                <span style={{ flex: 1, fontSize: 14, color: s.color, textDecoration: s.deco }}>{it.t}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg3)' }}>{it.due}</span>
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 999,
                    background: who.background,
                    color: who.color,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    flex: 'none',
                  }}
                >
                  {it.who === 'C' ? 'C' : HER_INI}
                </span>
              </button>
            )
          })}
          {addingTo === l.id ? (
            <div style={{ padding: '10px 0' }}>
              <Field label="New item">
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void saveItem(l.id)
                    if (e.key === 'Escape') {
                      setAddingTo(null)
                      setText('')
                    }
                  }}
                  autoFocus
                  disabled={saving}
                  placeholder="What needs doing?"
                  aria-label={`New ${l.name} item`}
                />
              </Field>
              {addError && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{addError}</div>}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAddingTo(l.id)
                setText('')
                setAddError(null)
              }}
              style={{
                padding: '10px 0',
                fontSize: 14,
                color: 'var(--fg3)',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              + Add item
            </button>
          )}
        </div>
      ))}
      {!desktop && <div style={{ fontSize: 12, color: 'var(--fg3)' }}>Drag the handle to reorder. Ticking shows who ticked and when.</div>}
    </div>
  )
}
