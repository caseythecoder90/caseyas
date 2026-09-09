// Session state the memories screens keep between navigations - the prototype's
// `filter`, `galSeg`, `galFilter`, `selecting`, `sel`, `cTitle`, `cType`,
// `priv` and the composer's editable body. Nothing here resets on navigation
// (the explicit setters below are the only writers), mirroring the DC logic.

import {
  COMPOSER_BLOCKS_DEFAULT,
  COMPOSER_BLOCKS_FROM_PLAN,
  COMPOSER_DEFAULT,
  COMPOSER_DESKTOP,
  COMPOSER_PREFILL,
  composerMedia,
  composerTrayDesktop,
} from '../../data/mock'
import type { ComposerBlock, ComposerMediaTile, GalleryFilter, GallerySeg, MemoryFilter, MemoryType } from '../../data/types'
import { toEditorBlocks, type EditorBlock } from './blocks'
import { createStore } from './localStore'

export type DraftKey = 'default' | 'plan' | 'desktop'

export interface Draft {
  title: string
  type: MemoryType
  priv: boolean
  blocks: EditorBlock[]
  media: ComposerMediaTile[]
  cover: number
  /** the from-plan banner was dismissed with "Clear" */
  cleared: boolean
  /** Date.now() of the last edit; drives the autosave label */
  touched: number
}

/** The desktop seed paragraph has "third" in bold; the editor stores the marker. */
function desktopBlocks(): ComposerBlock[] {
  return COMPOSER_DESKTOP.blocks.map((b) =>
    b.type === 'p' && b.text?.includes(' ' + COMPOSER_DESKTOP.boldWord + ' ')
      ? { ...b, text: b.text.replace(' ' + COMPOSER_DESKTOP.boldWord + ' ', ' **' + COMPOSER_DESKTOP.boldWord + '** ') }
      : { ...b },
  )
}

export function seedDraft(key: DraftKey): Draft {
  if (key === 'plan') {
    return {
      title: COMPOSER_PREFILL.title,
      type: COMPOSER_PREFILL.type,
      priv: true,
      blocks: toEditorBlocks(COMPOSER_BLOCKS_FROM_PLAN),
      media: composerMedia(true),
      cover: 0,
      cleared: false,
      touched: 0,
    }
  }
  if (key === 'desktop') {
    return {
      title: COMPOSER_DESKTOP.title,
      type: COMPOSER_DESKTOP.type,
      priv: true,
      blocks: toEditorBlocks(desktopBlocks()),
      media: composerTrayDesktop(),
      cover: 0,
      cleared: false,
      touched: 0,
    }
  }
  return {
    title: '',
    type: COMPOSER_DEFAULT.type,
    priv: true,
    blocks: toEditorBlocks(COMPOSER_BLOCKS_DEFAULT),
    media: composerMedia(false),
    cover: 0,
    cleared: false,
    touched: 0,
  }
}

export interface MemoriesState {
  /** timeline type filter */
  filter: MemoryFilter
  galSeg: GallerySeg
  galFilter: GalleryFilter
  selecting: boolean
  sel: string[]
  drafts: Record<DraftKey, Draft>
}

export const memoriesStore = createStore<MemoriesState>({
  filter: 'All',
  galSeg: 'photos',
  galFilter: 'All',
  selecting: false,
  sel: [],
  drafts: { default: seedDraft('default'), plan: seedDraft('plan'), desktop: seedDraft('desktop') },
})

export const setFilter = (filter: MemoryFilter) => memoriesStore.set({ filter })
export const setGalSeg = (galSeg: GallerySeg) => memoriesStore.set({ galSeg })
export const setGalFilter = (galFilter: GalleryFilter) => memoriesStore.set({ galFilter })
/** Entering or leaving select mode always clears the selection. */
export const toggleSelecting = () => memoriesStore.set((s) => ({ selecting: !s.selecting, sel: [] }))
export const exitSelecting = () => memoriesStore.set({ selecting: false, sel: [] })
export const toggleSelected = (id: string) =>
  memoriesStore.set((s) => ({ sel: s.sel.includes(id) ? s.sel.filter((x) => x !== id) : [...s.sel, id] }))

export function patchDraft(key: DraftKey, patch: Partial<Draft> | ((d: Draft) => Partial<Draft>)) {
  memoriesStore.set((s) => {
    const cur = s.drafts[key]
    const next = typeof patch === 'function' ? patch(cur) : patch
    return { drafts: { ...s.drafts, [key]: { ...cur, ...next, touched: Date.now() } } }
  })
}

export function resetDraft(key: DraftKey) {
  memoriesStore.set((s) => ({ drafts: { ...s.drafts, [key]: seedDraft(key) } }))
}

/** "Clear" on the from-plan banner: drop the prefilled title and the banner. */
export function clearPrefill() {
  memoriesStore.set((s) => ({ drafts: { ...s.drafts, plan: { ...s.drafts.plan, title: '', cleared: true, touched: Date.now() } } }))
}
