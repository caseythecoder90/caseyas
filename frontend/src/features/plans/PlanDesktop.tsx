// desktop.md section 7 - the plan workspace at >= md: a 200px cover band, the
// full tab strip, and the three-column itinerary (days | selected item | ideas
// tray) with the other tabs rendered under the same chrome. Column B reads the
// selected ServerItem: real notes, attachments and comments, "Open in Maps",
// "Edit" (the kind's form) and "More" (the item sheet: move, unschedule,
// delete). Tray rows and idea cards open the item sheet; the "..." button
// opens the plan menu (all plans, edit plan, delete plan).

import { useRef, useState, type DragEvent } from 'react'
import { DESKTOP_TABS, EMPTY_DAY_COPY, NO_NOTES } from '../../data/mock'
import { HER_INI, initialFor } from '../../people'
import type { usePlan } from '../../data/hooks'
import type { Idea, IdeaFilter, PlanSeg, Vote } from '../../data/types'
import { Eyebrow, Field, PAPER, PHOTO_FILTER, Toggle, segTab, stColor, useToast, voteGlyph } from '../../ui'
import { LOCK_ICON_SM, Ring, useCopyCode } from './bits'
import { hasMapTarget, openInMaps } from './maps'
import { SegBookings } from './SegBookings'
import { SegBudget } from './SegBudget'
import { SegChecklists } from './SegChecklists'
import { SegIdeas } from './SegIdeas'
import { SegLocked } from './SegLocked'
import { SegMap } from './SegMap'
import { IDEA_PREFIX, TRAY_PREFIX, type PlanBoard } from './usePlanBoard'

const TEASER_LINES = ['Passport numbers', 'Embassy and emergency contacts', 'Insurance policy']

const ACTION_BUTTON = { height: 36, padding: '0 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--fg1)', fontSize: 13, cursor: 'pointer' } as const

const fmtCommentAt = (iso: string) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export interface PlanDesktopProps {
  p: ReturnType<typeof usePlan>
  board: PlanBoard
  seg: PlanSeg
  onSeg: (seg: PlanSeg) => void
  ideas: Idea[]
  ideaFilter: IdeaFilter
  onIdeaFilter: (f: IdeaFilter) => void
  /** opens the item sheet for a server item */
  onOpenItem: (itemId: string) => void
  /** opens the kind's form in edit mode */
  onEditItem: (itemId: string) => void
  /** the cover band's "..." button: all plans, edit plan, delete plan */
  onPlanMenu: () => void
}

function parseDrag(data: string): { kind: 'tray'; index: number } | { kind: 'idea'; title: string } | null {
  if (data.startsWith(TRAY_PREFIX)) {
    const index = Number(data.slice(TRAY_PREFIX.length))
    return Number.isInteger(index) ? { kind: 'tray', index } : null
  }
  if (data.startsWith(IDEA_PREFIX)) return { kind: 'idea', title: data.slice(IDEA_PREFIX.length) }
  return null
}

/** like -> meh -> no -> none -> like */
function nextVote(v: Vote | null | undefined): Vote | null {
  return v === 'like' ? 'meh' : v === 'meh' ? 'no' : v === 'no' ? null : 'like'
}

function errMsg(e: unknown): string {
  return e instanceof Error && e.message ? e.message : 'Something went wrong.'
}

/** '$4,120' -> 4120, for the overview budget bar. */
function moneyNum(s: string): number {
  return Number(s.replace(/[^0-9.]/g, '')) || 0
}

export function PlanDesktop({ p, board, seg, onSeg, ideas, ideaFilter, onIdeaFilter, onOpenItem, onEditItem, onPlanMenu }: PlanDesktopProps) {
  const [sel, setSel] = useState('0-0')
  const [over, setOver] = useState<number | null>(null)
  const copy = useCopyCode()
  const toast = useToast()

  const [noteDraft, setNoteDraft] = useState('')
  const [noteBusy, setNoteBusy] = useState(false)
  const [noteErr, setNoteErr] = useState('')
  const [voteErr, setVoteErr] = useState('')
  const [offErr, setOffErr] = useState('')
  const [uploadBusy, setUploadBusy] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [selDay = 0, selItem = 0] = sel.split('-').map(Number)
  const day = board.days[selDay] ?? board.days[0]
  const item = day?.items[selItem] ?? board.days.flatMap((d) => d.items)[0]
  const sItem = item?.id ? p.serverItems.find((i) => i.id === item.id) : undefined
  const attachments = (sItem?.attachmentIds ?? []).map(
    (id) => p.serverMedia.find((md) => md.id === id) ?? { id, originalName: 'Attachment', urls: {} as { thumb?: string | null; original?: string | null } },
  )

  const pickItem = (key: string) => {
    setSel(key)
    setNoteDraft('')
    setNoteErr('')
  }

  const drop = (dayN: number) => (e: DragEvent) => {
    e.preventDefault()
    setOver(null)
    const parsed = parseDrag(e.dataTransfer.getData('text/plain'))
    if (!parsed) return
    if (parsed.kind === 'tray') board.scheduleUnscheduled(parsed.index, dayN)
    else {
      const idea = p.ideas.find((i) => i.title === parsed.title)
      if (idea) board.scheduleIdea(idea, dayN)
    }
  }

  const saveNote = () => {
    const text = noteDraft.trim()
    if (!text || !item?.id || noteBusy) return
    setNoteErr('')
    setNoteBusy(true)
    p.m
      .comment(item.id, text)
      .then(() => setNoteDraft(''))
      .catch((e: unknown) => setNoteErr(errMsg(e)))
      .finally(() => setNoteBusy(false))
  }

  const cycleVote = (idea: Idea) => {
    if (!idea.id) return
    setVoteErr('')
    p.m.vote(idea.id, nextVote(idea.c)).catch((e: unknown) => setVoteErr(errMsg(e)))
  }

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0 || uploadBusy) return
    setUploadErr('')
    setUploadBusy(true)
    p.m
      .upload(Array.from(files))
      .catch((e: unknown) => setUploadErr(errMsg(e)))
      .finally(() => {
        setUploadBusy(false)
        if (fileRef.current) fileRef.current.value = ''
      })
  }

  const plannedN = moneyNum(p.budget.planned)
  const committedPct = plannedN ? Math.min(100, Math.round((moneyNum(p.budget.committed) / plannedN) * 100)) : 0
  const paidPct = plannedN ? Math.min(100, Math.round((moneyNum(p.budget.paid) / plannedN) * 100)) : 0

  const bookingRows = (['Flights', 'Stays', 'Transport'] as const).map((g) => {
    const n = p.bookings.filter((b) => b.group === g).length
    return [g, n ? `${n} booked` : 'none yet'] as const
  })

  const centerNote = p.loading ? 'Loading…' : p.notFound ? 'This plan does not exist.' : null

  const coverBand = (
    <div style={{ position: 'relative', height: 200, flex: 'none', background: '#121110' }}>
      {p.plan.cover && (
        <img src={p.plan.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: PHOTO_FILTER }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,0,0,.25),rgba(18,17,16,.75))' }} />
      <div style={{ position: 'absolute', left: 40, right: 40, bottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', color: PAPER, gap: 24 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {p.plan.name && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  border: '1px solid rgba(250,249,246,.5)',
                  padding: '3px 7px',
                  borderRadius: 4,
                }}
              >
                {p.plan.status}
              </span>
            )}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.plan.countdown}</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 48, lineHeight: 1, marginTop: 8, marginBottom: 0, fontWeight: 400 }}>{p.plan.name}</h1>
          <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 13, color: '#a8a49a' }}>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{p.plan.dates}</span>
            <span>{p.plan.dest.join(' · ')}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 'none' }}>
          {offErr && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{offErr}</span>}
          <span style={{ fontSize: 12, color: '#a8a49a' }}>Available offline · {p.offline.note}</span>
          <Toggle
            on={p.offline.enabled}
            onChange={() => {
              setOffErr('')
              p.offline.toggle().catch((e: unknown) => setOffErr(errMsg(e)))
            }}
            size="compact"
            aria-label="Available offline"
            offColor="rgba(250,249,246,.25)"
          />
          <button
            type="button"
            onClick={onPlanMenu}
            aria-label="Plan menu"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: 'none',
              background: 'rgba(250,249,246,.15)',
              color: PAPER,
              marginLeft: 8,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            ···
          </button>
        </div>
      </div>
    </div>
  )

  const tabStrip = (
    <div style={{ display: 'flex', gap: 4, padding: '0 40px', borderBottom: '1px solid var(--border)', flex: 'none', overflowX: 'auto' }} className="hide-scrollbar">
      {DESKTOP_TABS.map(([label, key]) => {
        const s = segTab(seg === key)
        return (
          <button
            key={key}
            type="button"
            aria-pressed={seg === key}
            onClick={() => onSeg(key)}
            style={{
              height: 44,
              padding: '0 14px',
              border: 'none',
              borderBottom: `2px solid ${s.edge}`,
              background: 'transparent',
              color: s.color,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              marginBottom: -1,
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )

  if (centerNote) {
    return (
      <section style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {coverBand}
        {tabStrip}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--fg3)' }}>
          {centerNote}
        </div>
      </section>
    )
  }

  return (
    <section style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {coverBand}
      {tabStrip}

      {/* ---------------------------------------------------------- bodies */}
      {seg === 'overview' && (
        <div style={{ flex: 1, overflow: 'auto', padding: '32px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, alignContent: 'start' }}>
          <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'baseline', gap: 16 }}>
            {p.hero.num ? (
              <>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 96, lineHeight: 1 }}>{p.hero.num}</span>
                <span style={{ fontSize: 18, color: 'var(--fg2)' }}>{p.hero.line}</span>
              </>
            ) : (
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 28, lineHeight: 1.2, color: 'var(--fg3)' }}>
                {p.plan.countdown || p.plan.dates}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onSeg('locked')}
            style={{
              position: 'relative',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              padding: 16,
              overflow: 'hidden',
              cursor: 'pointer',
              textAlign: 'left',
              color: 'var(--fg1)',
            }}
          >
            <span style={{ display: 'block', filter: 'blur(5px)', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg2)', lineHeight: 1.7, userSelect: 'none' }}>
              {TEASER_LINES.map((l) => (
                <span key={l} style={{ display: 'block' }}>
                  {l}
                </span>
              ))}
            </span>
            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13 }}>
              {LOCK_ICON_SM}
              Locked note
            </span>
          </button>

          <div style={{ borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Eyebrow size={10}>Next up · {p.hero.kind}</Eyebrow>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, lineHeight: 1.1 }}>{p.hero.title}</div>
            <div style={{ fontSize: 13, color: 'var(--fg2)' }}>{p.hero.sub}</div>
            {p.hero.conf && (
              <button
                type="button"
                onClick={() => copy(p.hero.conf)}
                aria-label={`Copy confirmation ${p.hero.conf}`}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 18, letterSpacing: '.12em', marginTop: 8, border: 'none', background: 'transparent', color: 'var(--fg1)', padding: 0, textAlign: 'left', cursor: 'pointer' }}
              >
                {p.hero.conf}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => onSeg('bookings')}
            style={{ borderRadius: 8, border: '1px solid var(--border)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer', background: 'transparent', color: 'var(--fg1)', textAlign: 'left' }}
          >
            <Eyebrow as="span" size={10}>
              Key bookings
            </Eyebrow>
            {bookingRows.map(([k, v]) => (
              <span key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, gap: 12 }}>
                <span>{k}</span>
                <span style={{ color: 'var(--fg2)' }}>{v}</span>
              </span>
            ))}
          </button>

          <button
            type="button"
            onClick={() => onSeg('budget')}
            style={{ borderRadius: 8, border: '1px solid var(--border)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer', background: 'transparent', color: 'var(--fg1)', textAlign: 'left' }}
          >
            <Eyebrow as="span" size={10}>
              Budget
            </Eyebrow>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg2)' }}>
              {[
                ['paid', p.budget.paid],
                ['committed', p.budget.committed],
                ['planned', p.budget.planned],
              ].map(([k, v]) => (
                <span key={k} style={{ display: 'flex', justifyContent: 'space-between', whiteSpace: 'nowrap' }}>
                  <span>{k}</span>
                  <span style={{ color: 'var(--fg1)' }}>{v}</span>
                </span>
              ))}
            </span>
            <span style={{ height: 6, borderRadius: 3, background: 'var(--surface-2)', position: 'relative', overflow: 'hidden', display: 'block' }}>
              <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${committedPct}%`, background: 'var(--accent-soft)' }} />
              <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${paidPct}%`, background: 'var(--accent)' }} />
            </span>
          </button>

          <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {p.lists.map((l) => (
              <button
                key={l.name}
                type="button"
                onClick={() => onSeg('lists')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  background: 'transparent',
                  color: 'var(--fg1)',
                  textAlign: 'left',
                }}
              >
                <Ring n={`${l.doneNow}/${l.total}`} pct={l.pct} size={48} />
                <span style={{ fontSize: 13, color: 'var(--fg2)' }}>{l.name}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onSeg('ideas')}
            style={{ borderRadius: 8, border: '1px solid var(--border)', padding: '18px 20px', cursor: 'pointer', background: 'transparent', color: 'var(--fg1)', textAlign: 'left' }}
          >
            <span style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--fg3)' }}>
              <span>Newest ideas</span>
              <span>All {p.ideas.length} →</span>
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
              {p.ideas.slice(0, 3).map((i) => (
                <span key={i.title} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderTop: '1px solid var(--border)' }}>
                  <img src={i.img} alt="" style={{ width: 36, height: 36, borderRadius: 5, objectFit: 'cover', filter: PHOTO_FILTER, flex: 'none' }} />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.title}</span>
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--fg3)' }}>
                      {i.city} · {i.by}
                    </span>
                  </span>
                </span>
              ))}
            </span>
          </button>
        </div>
      )}

      {seg === 'itinerary' && (
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '380px 1fr 320px', minHeight: 0 }}>
          {/* A - days */}
          <div style={{ overflow: 'auto', borderRight: '1px solid var(--border)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20, background: 'var(--surface)' }}>
            {board.unscheduled.length > 0 && (
              <div style={{ borderRadius: 8, border: '1px dashed var(--border)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Eyebrow size={10}>Unscheduled · {board.unscheduled.length}</Eyebrow>
                {board.unscheduled.map((u) => (
                  <button
                    key={u.index}
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', `${TRAY_PREFIX}${u.index}`)
                      e.dataTransfer.effectAllowed = 'move'
                    }}
                    onClick={() => u.id && onOpenItem(u.id)}
                    aria-label={`Open ${u.title}`}
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      fontSize: 13,
                      cursor: 'grab',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--fg1)',
                      padding: 0,
                      width: '100%',
                      textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 9,
                        letterSpacing: '.1em',
                        textTransform: 'uppercase',
                        color: 'var(--fg3)',
                        border: '1px solid var(--border)',
                        padding: '2px 5px',
                        borderRadius: 3,
                      }}
                    >
                      {u.kind}
                    </span>
                    <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.title}</span>
                  </button>
                ))}
              </div>
            )}

            {board.days.map((dy, di) => (
              <div
                key={dy.n}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'move'
                  setOver(dy.n)
                }}
                onDragLeave={() => setOver((o) => (o === dy.n ? null : o))}
                onDrop={drop(dy.n)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  outline: over === dy.n ? '1px dashed var(--accent)' : undefined,
                  outlineOffset: over === dy.n ? 6 : undefined,
                  borderRadius: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1 }}>Day {dy.n}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg2)' }}>
                    {dy.dow} {dy.date}
                  </span>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontSize: 12, color: 'var(--fg3)' }}>{dy.city}</span>
                </div>
                {dy.items.map((it, ii) => {
                  const key = `${di}-${ii}`
                  const on = sel === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => pickItem(key)}
                      aria-pressed={on}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '60px 1fr',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                        background: on ? 'var(--accent-soft)' : 'var(--bg)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: 'var(--fg1)',
                      }}
                    >
                      <span>
                        <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, whiteSpace: 'nowrap' }}>{it.time}</span>
                        <span
                          style={{
                            display: 'block',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 9,
                            letterSpacing: '.1em',
                            textTransform: 'uppercase',
                            color: 'var(--fg3)',
                            marginTop: 4,
                          }}
                        >
                          {it.kind}
                        </span>
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.title}</span>
                        <span style={{ display: 'block', fontSize: 12, color: 'var(--fg2)', marginTop: 2 }}>{it.place}</span>
                      </span>
                    </button>
                  )
                })}
                {dy.items.length === 0 && (
                  <div style={{ padding: '10px 12px', borderRadius: 8, border: '1px dashed var(--border)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--fg3)' }}>
                    {EMPTY_DAY_COPY}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* B - selected item */}
          <div style={{ overflow: 'auto', padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {!item && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--fg3)' }}>
                {EMPTY_DAY_COPY}
              </div>
            )}
            {item && day && (
              <>
                <div>
                  <Eyebrow>
                    {item.kind} · Day {day.n} · {day.date}
                  </Eyebrow>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 40, lineHeight: 1.05, marginTop: 10 }}>{item.title}</div>
                  <div style={{ fontSize: 15, color: 'var(--fg2)', marginTop: 8 }}>{item.place}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                  {[
                    { l: 'Time', v: item.time, track: false },
                    { l: 'Cost', v: item.cost || '—', track: false },
                    { l: 'Confirmation', v: item.conf ?? '—', track: true },
                  ].map((s) => (
                    <div key={s.l} style={{ padding: '14px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--fg3)' }}>{s.l}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, marginTop: 6, letterSpacing: s.track ? '.12em' : undefined }}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {hasMapTarget(sItem?.location) && (
                    <button type="button" onClick={() => openInMaps(sItem?.location)} style={ACTION_BUTTON}>
                      Open in Maps
                    </button>
                  )}
                  <button type="button" onClick={() => toast.show('Sharing to chat arrives with milestone 4')} style={ACTION_BUTTON}>
                    Share to chat
                  </button>
                  {item.id && (
                    <button type="button" onClick={() => onEditItem(item.id!)} style={ACTION_BUTTON}>
                      Edit
                    </button>
                  )}
                  {item.id && (
                    <button type="button" onClick={() => onOpenItem(item.id!)} style={ACTION_BUTTON}>
                      More
                    </button>
                  )}
                </div>
                <div>
                  <Eyebrow style={{ marginBottom: 10 }}>Attachments · {attachments.length}</Eyebrow>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {attachments.map((a) => {
                      const href = a.urls?.original ?? a.urls?.thumb ?? undefined
                      const tile = (
                        <span
                          title={a.originalName}
                          style={{
                            width: 72,
                            height: 96,
                            borderRadius: 4,
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            display: 'inline-flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 9,
                            color: 'var(--fg3)',
                            paddingBottom: 6,
                            overflow: 'hidden',
                          }}
                        >
                          {a.urls?.thumb ? <img src={a.urls.thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : 'FILE'}
                        </span>
                      )
                      return href ? (
                        <a key={a.id} href={href} target="_blank" rel="noopener noreferrer">
                          {tile}
                        </a>
                      ) : (
                        <span key={a.id}>{tile}</span>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => item.id && onEditItem(item.id)}
                      aria-label="Add an attachment"
                      style={{
                        width: 72,
                        height: 96,
                        borderRadius: 4,
                        border: '1px dashed var(--border)',
                        background: 'transparent',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--fg3)',
                        fontSize: 20,
                        cursor: 'pointer',
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <Eyebrow style={{ marginBottom: 10 }}>Notes</Eyebrow>
                  <div style={{ fontSize: 15, lineHeight: 1.6, color: sItem?.notes ? 'var(--fg1)' : 'var(--fg3)', maxWidth: 560, whiteSpace: 'pre-wrap' }}>{sItem?.notes?.trim() || NO_NOTES}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 8 }}>Added by {item.by}</div>
                </div>
                <div>
                  <Eyebrow style={{ marginBottom: 10 }}>{sItem?.comments.length ? `Comments · ${sItem.comments.length}` : 'Comments'}</Eyebrow>
                  <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 560 }}>
                    {(sItem?.comments ?? []).map((c) => {
                      const person = p.who(c.authorId)
                      const mine = person === 'Casey'
                      return (
                        <div key={c.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderTop: '1px solid var(--border)' }}>
                          <span
                            title={person}
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 999,
                              background: mine ? 'var(--accent-soft)' : 'var(--green-soft)',
                              color: mine ? 'var(--accent)' : 'var(--green)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'var(--font-mono)',
                              fontSize: 9,
                              flex: 'none',
                            }}
                          >
                            {initialFor(person)}
                          </span>
                          <span style={{ minWidth: 0, flex: 1 }}>
                            <span style={{ display: 'block', fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{c.text}</span>
                            <span style={{ display: 'block', fontSize: 11, color: 'var(--fg3)', marginTop: 2 }}>
                              {person} · {fmtCommentAt(c.at)}
                            </span>
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  {item.id && (
                    <>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', maxWidth: 560, marginTop: 14 }}>
                        <Field
                          label="Add a comment"
                          wrapStyle={{ flex: 1 }}
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveNote()
                          }}
                          disabled={noteBusy}
                        />
                        <button
                          type="button"
                          onClick={saveNote}
                          disabled={noteBusy || !noteDraft.trim()}
                          style={{
                            height: 44,
                            padding: '0 14px',
                            borderRadius: 8,
                            border: '1px solid var(--border)',
                            background: 'transparent',
                            color: noteBusy || !noteDraft.trim() ? 'var(--fg3)' : 'var(--fg1)',
                            fontSize: 13,
                            cursor: noteBusy ? 'default' : 'pointer',
                            flex: 'none',
                          }}
                        >
                          {noteBusy ? 'Saving…' : 'Save'}
                        </button>
                      </div>
                      {noteErr && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>{noteErr}</div>}
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* C - ideas tray */}
          <div style={{ overflow: 'auto', borderLeft: '1px solid var(--border)', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Eyebrow as="span">Ideas · drag onto a day</Eyebrow>
              <button
                type="button"
                onClick={() => onSeg('ideas')}
                style={{ font: 'inherit', fontSize: 12, color: 'var(--accent)', cursor: 'pointer', border: 'none', background: 'transparent', padding: 0 }}
              >
                + Add
              </button>
            </div>
            {voteErr && <div style={{ fontSize: 12, color: 'var(--danger)' }}>{voteErr}</div>}
            {board.ideas.map((i) => (
              <button
                key={i.id ?? i.title}
                type="button"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', `${IDEA_PREFIX}${i.title}`)
                  e.dataTransfer.effectAllowed = 'copy'
                }}
                onClick={() => i.id && onOpenItem(i.id)}
                aria-label={`Open ${i.title}`}
                style={{
                  display: 'flex',
                  gap: 10,
                  padding: 8,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  cursor: 'grab',
                  textAlign: 'left',
                  color: 'var(--fg1)',
                }}
              >
                <img src={i.img} alt="" style={{ width: 56, height: 56, borderRadius: 6, objectFit: 'cover', filter: PHOTO_FILTER, flex: 'none' }} />
                <span style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{i.title}</span>
                  <span style={{ fontSize: 11, color: 'var(--fg3)' }}>
                    {i.city} · {i.by}
                  </span>
                  <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', gap: 6 }}>
                    <span style={{ display: 'flex', gap: 3 }}>
                      <span
                        title="Change your vote"
                        onClick={(e) => {
                          e.stopPropagation()
                          cycleVote(i)
                        }}
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 999,
                          background: 'var(--accent-soft)',
                          color: 'var(--accent)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 8,
                          cursor: i.id ? 'pointer' : undefined,
                        }}
                      >
                        C{voteGlyph(i.c)}
                      </span>
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 999,
                          background: 'var(--green-soft)',
                          color: 'var(--green)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 8,
                        }}
                      >
                        {HER_INI}
                        {voteGlyph(i.h)}
                      </span>
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: stColor(i.status) }}>{i.status}</span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {seg === 'ideas' && (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <SegIdeas ideas={ideas} filters={p.ideaFilters} filter={ideaFilter} onFilter={onIdeaFilter} onOpenItem={onOpenItem} variant="desktop" />
        </div>
      )}
      {seg === 'bookings' && (
        <div style={{ flex: 1, overflow: 'auto' }}>
          {p.bookings.length === 0 ? (
            <div style={{ padding: '64px 40px', textAlign: 'center', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--fg3)' }}>
              Nothing booked yet.
            </div>
          ) : (
            <SegBookings bookings={p.bookings} variant="desktop" onOpenItem={onOpenItem} />
          )}
        </div>
      )}
      {seg === 'lists' && (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <SegChecklists lists={p.lists} onToggle={p.toggleTick} variant="desktop" />
        </div>
      )}
      {seg === 'budget' && (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <SegBudget budget={p.budget} variant="desktop" />
        </div>
      )}
      {seg === 'docs' && (
        <div style={{ flex: 1, overflow: 'auto' }}>
          {uploadErr && <div style={{ padding: '16px 40px 0', fontSize: 12, color: 'var(--danger)' }}>{uploadErr}</div>}
          <div
            style={{
              padding: '24px 40px',
              display: 'grid',
              gridTemplateColumns: 'repeat(6,1fr)',
              gap: 16,
              alignContent: 'start',
            }}
          >
            {p.docs.map((dc) => (
              <div key={dc.id ?? dc.name} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '3 / 4',
                    borderRadius: 6,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    overflow: 'hidden',
                  }}
                >
                  {dc.thumb ? (
                    <img src={dc.thumb} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: PHOTO_FILTER }} />
                  ) : (
                    <>
                      <span style={{ height: 6, width: '70%', background: 'var(--surface-2)', borderRadius: 2 }} />
                      <span style={{ height: 4, width: '90%', background: 'var(--surface-2)', borderRadius: 2 }} />
                      <span style={{ height: 4, width: '80%', background: 'var(--surface-2)', borderRadius: 2 }} />
                      <span style={{ height: 4, width: '60%', background: 'var(--surface-2)', borderRadius: 2 }} />
                    </>
                  )}
                  <span
                    style={{
                      position: 'absolute',
                      right: 8,
                      bottom: 8,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'var(--fg2)',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      padding: '2px 6px',
                      borderRadius: 3,
                    }}
                  >
                    {dc.pages}
                  </span>
                </div>
                <div style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dc.name}</div>
                <div style={{ fontSize: 11, color: 'var(--fg3)', marginTop: -6 }}>{dc.of}</div>
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input ref={fileRef} type="file" hidden multiple accept="application/pdf,image/*" onChange={(e) => onFiles(e.target.files)} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadBusy}
                aria-label="Upload documents"
                style={{
                  aspectRatio: '3 / 4',
                  borderRadius: 6,
                  border: '1px dashed var(--border)',
                  background: 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  color: 'var(--fg3)',
                  cursor: uploadBusy ? 'default' : 'pointer',
                }}
              >
                {uploadBusy ? (
                  <span style={{ fontSize: 13 }}>Uploading…</span>
                ) : (
                  <>
                    <span style={{ fontSize: 20, lineHeight: 1 }}>+</span>
                    <span style={{ fontSize: 13 }}>Upload</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {seg === 'map' && <SegMap pins={p.pins} variant="desktop" />}
      {seg === 'locked' && (
        <div style={{ flex: 1, overflow: 'auto', display: 'flex' }}>
          <SegLocked variant="desktop" />
        </div>
      )}
    </section>
  )
}
