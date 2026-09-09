// mobile-b-plans.md 2.6 / desktop.md 7.2 - the Ideas board: chip filters, a
// card grid with both votes and the status pill, and (mobile) the vote legend.

import { useState } from 'react'
import { useParams } from 'react-router'
import { HER, HER_INI } from '../../people'
import { IDEA_PASTE_PLACEHOLDER } from '../../data/mock'
import { usePlan, type LinkPreview } from '../../data/hooks'
import type { Idea, IdeaFilter, Vote as VoteValue } from '../../data/types'
import { Button, Field, Input, PHOTO_FILTER, Sheet, filterChip, stColor, voteGlyph } from '../../ui'

/** like → meh → no → none → like … */
const VOTE_CYCLE: (VoteValue | null)[] = ['like', 'meh', 'no', null]
function nextVote(cur: VoteValue | null | undefined): VoteValue | null {
  return VOTE_CYCLE[(VOTE_CYCLE.indexOf(cur ?? null) + 1) % VOTE_CYCLE.length]
}

function Vote({ who, glyph }: { who: 'c' | 'h'; glyph: string }) {
  const casey = who === 'c'
  return (
    <span
      title={casey ? 'Casey' : HER}
      style={{
        width: 22,
        height: 22,
        borderRadius: 999,
        background: casey ? 'var(--accent-soft)' : 'var(--green-soft)',
        color: casey ? 'var(--accent)' : 'var(--green)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
      }}
    >
      {glyph}
    </span>
  )
}

export interface SegIdeasProps {
  ideas: Idea[]
  filters: IdeaFilter[]
  filter: IdeaFilter
  onFilter: (f: IdeaFilter) => void
  onPickIdea: (idea: Idea) => void
  variant?: 'mobile' | 'desktop'
}

export function SegIdeas({ ideas, filters, filter, onFilter, onPickIdea, variant = 'mobile' }: SegIdeasProps) {
  const desktop = variant === 'desktop'
  const { id: planId } = useParams()
  const { m } = usePlan(planId)

  // my vote as last sent this session, per item; the server knows who I am.
  const [sentVotes, setSentVotes] = useState<Record<string, VoteValue | null>>({})
  const [voteError, setVoteError] = useState<string | null>(null)

  const castVote = (idea: Idea) => {
    if (!idea.id) return
    const itemId = idea.id
    const next = nextVote(sentVotes[itemId])
    setSentVotes((s) => ({ ...s, [itemId]: next }))
    setVoteError(null)
    m.vote(itemId, next).catch(() => setVoteError('Could not save the vote. Try again.'))
  }

  // ---- "add idea" sheet
  const [addOpen, setAddOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [fetching, setFetching] = useState(false)
  const [preview, setPreview] = useState<LinkPreview | null>(null)
  const [title, setTitle] = useState('')
  const [city, setCity] = useState('')
  const [saving, setSaving] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const closeAdd = () => {
    setAddOpen(false)
    setUrl('')
    setPreview(null)
    setTitle('')
    setCity('')
    setAddError(null)
    setFetching(false)
  }

  const fetchPreview = async (raw: string) => {
    const u = raw.trim()
    if (!u || fetching) return
    setFetching(true)
    setAddError(null)
    try {
      const p = await m.linkPreview(u)
      setPreview(p)
      setTitle((t) => t || p.title || '')
    } catch {
      setAddError('Could not read that link. You can still name the idea yourself.')
    } finally {
      setFetching(false)
    }
  }

  const saveIdea = async () => {
    const t = title.trim()
    if (!t) {
      setAddError('Give the idea a title.')
      return
    }
    setSaving(true)
    setAddError(null)
    try {
      const links = preview ? [preview] : url.trim() ? [{ url: url.trim() }] : undefined
      await m.createItem({ kind: 'idea', title: t, links, tags: city.trim() ? [city.trim()] : undefined })
      closeAdd()
    } catch {
      setAddError('Could not save the idea. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        padding: desktop ? '24px 40px' : '16px 20px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: desktop ? 16 : 14,
      }}
    >
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }} className="hide-scrollbar">
        {filters.map((f) => {
          const s = filterChip(f === filter)
          return (
            <button
              key={f}
              type="button"
              aria-pressed={f === filter}
              onClick={() => onFilter(f)}
              style={{
                flex: 'none',
                height: 30,
                padding: '0 12px',
                borderRadius: 4,
                border: `1px solid ${s.borderColor}`,
                background: s.background,
                color: s.color,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {f}
            </button>
          )
        })}
        {!desktop && (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            style={{
              flex: 'none',
              height: 30,
              padding: '0 12px',
              borderRadius: 4,
              border: '1px dashed var(--border)',
              background: 'transparent',
              color: 'var(--fg3)',
              fontSize: 13,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            + Add idea
          </button>
        )}
        {desktop && (
          <>
            <span style={{ flex: 1 }} />
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                height: 30,
                padding: '0 12px',
                border: '1px dashed var(--border)',
                borderRadius: 4,
                background: 'transparent',
                color: 'var(--fg3)',
                fontSize: 13,
                width: 320,
                flex: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {IDEA_PASTE_PLACEHOLDER}
            </button>
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: desktop ? 'repeat(4,1fr)' : '1fr 1fr', gap: desktop ? 14 : 12 }}>
        {ideas.map((i) => (
          <button
            key={i.title}
            type="button"
            onClick={() => onPickIdea(i)}
            aria-label={`Put ${i.title} on a day`}
            style={{
              borderRadius: 8,
              overflow: 'hidden',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              color: 'var(--fg1)',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <img src={i.img} alt="" style={{ width: '100%', height: desktop ? 130 : 100, objectFit: 'cover', display: 'block', filter: PHOTO_FILTER }} />
            <div
              style={{
                padding: desktop ? '12px 14px 14px' : '10px 12px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                flex: 1,
                width: '100%',
              }}
            >
              <div style={{ fontSize: 14, lineHeight: 1.3, fontWeight: 500 }}>{i.title}</div>
              <div style={{ fontSize: desktop ? 12 : 11, color: 'var(--fg3)' }}>
                {i.city} · {desktop ? `added by ${i.by}` : i.by}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', gap: 8 }}>
                <span
                  title="Tap to vote: like, meh, no, none"
                  onClick={(e) => {
                    e.stopPropagation()
                    castVote(i)
                  }}
                  style={{ display: 'flex', gap: 4, cursor: 'pointer' }}
                >
                  <Vote who="c" glyph={`C${voteGlyph(i.c)}`} />
                  <Vote who="h" glyph={`${HER_INI}${voteGlyph(i.h)}`} />
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    color: stColor(i.status),
                    border: `1px solid ${stColor(i.status)}`,
                    padding: '2px 5px',
                    borderRadius: 3,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {i.status}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {voteError && <div style={{ fontSize: 12, color: 'var(--danger)' }}>{voteError}</div>}

      {!desktop && (
        <div style={{ fontSize: 12, color: 'var(--fg3)', lineHeight: 1.5 }}>
          Votes: C = Casey, Y = {HER} · ↑ like, ~ meh, ✕ no. Long-press a card for "Put it on a day".
        </div>
      )}

      <Sheet open={addOpen} onClose={closeAdd} title="Add an idea" aria-label="Add an idea">
        <Field label="Link" hint={fetching ? 'fetching…' : undefined}>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData('text')
              if (pasted.trim()) void fetchPreview(pasted)
            }}
            onBlur={() => {
              if (!preview) void fetchPreview(url)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void fetchPreview(url)
            }}
            placeholder={IDEA_PASTE_PLACEHOLDER}
            aria-label="Idea link"
            inputMode="url"
          />
        </Field>
        {preview?.image && (
          <img
            src={preview.image}
            alt=""
            style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', filter: PHOTO_FILTER }}
          />
        )}
        <Field label="Title">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What is it?" aria-label="Idea title" />
        </Field>
        <Field label="City (optional)">
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Tokyo, Kyoto…" aria-label="Idea city" />
        </Field>
        {addError && <div style={{ fontSize: 12, color: 'var(--danger)' }}>{addError}</div>}
        <Button variant="primary" size="sheet" full disabled={saving} onClick={() => void saveIdea()}>
          {saving ? 'Saving…' : 'Save idea'}
        </Button>
      </Sheet>
    </div>
  )
}
