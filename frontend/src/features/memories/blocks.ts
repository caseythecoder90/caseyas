// The composer's body model. The design renders static blocks; the app makes
// them editable, so each block gets a stable id and lists remember whether they
// are numbered. Inline **bold** / _italic_ markers are rendered by inline.tsx.

import type { BlockType, ComposerBlock } from '../../data/types'

export interface EditorBlock {
  id: string
  type: BlockType
  text?: string
  color?: string
  items?: string[]
  src?: string
  cap?: string
  ordered?: boolean
}

let seq = 0
export function blockId(): string {
  seq += 1
  return 'b' + seq
}

export function toEditorBlocks(blocks: ComposerBlock[]): EditorBlock[] {
  return blocks.map((b) => ({ ...b, id: blockId() }))
}

export function replaceBlock(blocks: EditorBlock[], id: string, patch: Partial<EditorBlock>): EditorBlock[] {
  return blocks.map((b) => (b.id === id ? { ...b, ...patch } : b))
}

export function insertAfter(blocks: EditorBlock[], id: string | null, block: EditorBlock): EditorBlock[] {
  const i = blocks.findIndex((b) => b.id === id)
  if (i < 0) return [...blocks, block]
  return [...blocks.slice(0, i + 1), block, ...blocks.slice(i + 1)]
}

/** Toggle a block between `type` and a plain paragraph, carrying the text over. */
export function toggleType(b: EditorBlock, type: BlockType, ordered?: boolean): Partial<EditorBlock> {
  const asList = type === 'list'
  const isAlready = b.type === type && (!asList || !!b.ordered === !!ordered)
  if (isAlready) {
    return { type: 'p', text: asList ? (b.items ?? []).join(' ') : b.text, items: undefined, ordered: undefined, color: 'var(--fg1)' }
  }
  if (asList) {
    const items = b.type === 'list' ? (b.items ?? []) : (b.text ?? '').split('\n').filter(Boolean)
    return { type: 'list', items: items.length ? items : [''], ordered, text: undefined }
  }
  const text = b.type === 'list' ? (b.items ?? []).join(' ') : b.text
  return { type, text, items: undefined, ordered: undefined, color: 'var(--fg1)' }
}
