// Composer state: which draft is open (default / from-plan / desktop), the
// autosave indicator and the setters the two layouts share.

import { useEffect, useRef, useState } from 'react'
import { COMPOSER_DEFAULT, COMPOSER_DESKTOP, COMPOSER_PREFILL } from '../../data/mock'
import { mockImage } from '../../data/mockImage'
import type { MemoryType } from '../../data/types'
import type { EditorBlock } from './blocks'
import { clearPrefill, memoriesStore, patchDraft, resetDraft, type DraftKey } from './state'

const SAVE_MS = 700

export interface ComposerCopy {
  dates: string
  loc: string
  mediaCount: string
  banner?: string
  pickerNote?: string
}

export function useComposer(fromPlan: boolean, isDesktop: boolean) {
  const key: DraftKey = fromPlan ? 'plan' : isDesktop ? 'desktop' : 'default'
  const draft = memoriesStore.use((s) => s.drafts[key])
  const [saving, setSaving] = useState(false)
  const firstTouch = useRef(draft.touched)

  useEffect(() => {
    if (draft.touched === 0 || draft.touched === firstTouch.current) return
    setSaving(true)
    const t = setTimeout(() => setSaving(false), SAVE_MS)
    return () => clearTimeout(t)
  }, [draft.touched])

  const copy: ComposerCopy = fromPlan
    ? { dates: COMPOSER_PREFILL.dates, loc: COMPOSER_PREFILL.loc, mediaCount: COMPOSER_PREFILL.mediaCount, banner: COMPOSER_PREFILL.banner, pickerNote: COMPOSER_PREFILL.pickerNote }
    : isDesktop
      ? { dates: COMPOSER_DESKTOP.dates, loc: COMPOSER_DESKTOP.loc, mediaCount: '7' }
      : { dates: COMPOSER_DEFAULT.dates, loc: COMPOSER_DEFAULT.loc, mediaCount: COMPOSER_DEFAULT.mediaCount }

  const mediaLabel = draft.media.length === (fromPlan ? 6 : isDesktop ? 7 : 3) ? copy.mediaCount : String(draft.media.length)

  return {
    key,
    draft,
    copy,
    /** the design's "Draft · saved just now" line (desktop: "Draft · Saved just now"), live while typing */
    stateLabel: saving ? 'Draft · saving…' : isDesktop ? COMPOSER_DESKTOP.savedLabel : `Draft · ${COMPOSER_DEFAULT.savedLabel}`,
    mediaLabel,
    setTitle: (title: string) => patchDraft(key, { title }),
    setType: (type: MemoryType) => patchDraft(key, { type }),
    setPriv: (priv: boolean) => patchDraft(key, { priv }),
    setBlocks: (blocks: EditorBlock[]) => patchDraft(key, { blocks }),
    setCover: (cover: number) => patchDraft(key, { cover }),
    /** mobile-a-memories.md 5.3: Publish returns to the timeline; the draft starts fresh. */
    publish: () => resetDraft(key),
    addMedia: () =>
      patchDraft(key, (d) => {
        const seed = (fromPlan ? 'jp' : isDesktop ? 'lake' : 'new') + (d.media.length + 1)
        return { media: [...d.media, { seed, src: mockImage(seed, isDesktop ? 300 : 200, isDesktop ? 300 : 200), cover: false, uploading: false }] }
      }),
    clearPrefill,
  }
}
