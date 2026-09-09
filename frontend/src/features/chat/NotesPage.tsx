// /notes - the Chat tab's second segment on mobile (mobile-c section 3). Until
// milestone 6 it is an empty fridge (NotesEmpty); with the designPreview dev
// flag on it is the designed board on mock data: the intro row, the Unopened
// sealed note, the two-column board and the note composer sheet. At >= md
// desktop.md section 8 asks for the "not in this round" placeholder instead.

import { useState } from 'react'
import { useDesignPreview, useNotes } from '../../data/hooks'
import type { NoteColor } from '../../data/types'
import { HER } from '../../people'
import { useSession } from '../../session'
import { EmptyState } from '../../ui'
import { NOTES_ARRIVE } from '../shared/milestones'
import { PreviewBanner } from '../shared/PreviewBanner'
import { ChatHeader } from './ChatHeader'
import {
  DESKTOP_PLACEHOLDER,
  LEAVE_A_NOTE,
  NOTES_INTRO,
  SEALED_CARD_SUB,
  SEALED_CARD_TITLE,
  UNOPENED_EYEBROW,
} from './copy'
import { NoteCard } from './NoteCard'
import { NoteComposerSheet } from './NoteComposerSheet'
import { SealedNoteDialog } from './SealedNoteDialog'
import { useIsDesktop } from './useIsDesktop'

function DesktopPlaceholder() {
  return (
    <section
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        color: 'var(--fg3)',
      }}
    >
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 40, lineHeight: 1, color: 'var(--fg1)' }}>Notes</div>
      <div style={{ fontSize: 14 }}>{DESKTOP_PLACEHOLDER}</div>
    </section>
  )
}

/** The honest fridge before milestone 6: header, intro line, one dashed empty state. */
function NotesEmpty() {
  return (
    <section style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }} aria-label="Notes">
      <ChatHeader seg="notes" hasUnopened={false} status={null} />
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '16px 20px 110px' }}>
        <div style={{ fontSize: 13, color: 'var(--fg2)' }}>{NOTES_INTRO}</div>
        <EmptyState title="No notes yet." sub="The fridge is bare." style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 14 }}>{NOTES_ARRIVE}.</div>
        </EmptyState>
      </div>
    </section>
  )
}

export default function NotesPage() {
  const isDesktop = useIsDesktop()
  const [preview] = useDesignPreview()
  if (isDesktop) return <DesktopPlaceholder />
  if (!preview) return <NotesEmpty />
  return (
    <>
      <PreviewBanner style={{ padding: '4px 20px 0' }} />
      <NotesPreview />
    </>
  )
}

/** The designed board on mock data (design preview only, mobile). */
function NotesPreview() {
  const notes = useNotes()
  const { meName } = useSession()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [color, setColor] = useState<NoteColor>('n1')
  const [sched, setSched] = useState(false)
  const [seal, setSeal] = useState(false)
  const [sealedOpen, setSealedOpen] = useState(false)

  const leave = () => {
    if (!notes.leaveNote({ body: draft, color, sched, seal })) return
    setDraft('')
    setSheetOpen(false)
  }

  return (
    <section style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }} aria-label="Notes">
      <ChatHeader seg="notes" hasUnopened={notes.hasUnopened} />

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--fg2)' }}>{NOTES_INTRO}</div>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            style={{
              height: 36,
              padding: '0 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--fg1)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flex: 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            {LEAVE_A_NOTE}
          </button>
        </div>

        {notes.hasUnopened && (
          <div style={{ padding: '20px 20px 0' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                marginBottom: 10,
              }}
            >
              {UNOPENED_EYEBROW}
            </div>
            <button
              type="button"
              onClick={() => setSealedOpen(true)}
              style={{
                width: '100%',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                padding: '22px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                textAlign: 'center',
                color: 'var(--fg1)',
              }}
            >
              <span style={{ color: 'var(--accent)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, lineHeight: 1.1 }}>{SEALED_CARD_TITLE(HER)}</span>
              <span style={{ fontSize: 13, color: 'var(--fg2)' }}>{SEALED_CARD_SUB}</span>
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '20px 20px 110px', alignItems: 'start' }}>
          {notes.notes.map((n, i) => (
            <NoteCard key={`${i}-${n.time}`} note={n} />
          ))}
        </div>
      </div>

      <NoteComposerSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        her={HER}
        me={meName}
        colors={notes.colors}
        draft={draft}
        onDraft={setDraft}
        color={color}
        onColor={setColor}
        sched={sched}
        onSched={setSched}
        seal={seal}
        onSeal={setSeal}
        onLeave={leave}
      />

      <SealedNoteDialog
        open={sealedOpen}
        onClose={() => {
          setSealedOpen(false)
          notes.openSealed()
        }}
        her={HER}
      />
    </section>
  )
}
