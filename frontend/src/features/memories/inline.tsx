// Tiny inline markup for the composer's textarea-based editor: **bold** and
// _italic_ render as <strong> / <em> in the read view (the desktop seed draft
// has "the **third** rock"). A block renders through renderInline() whenever it
// is not the focused block; the focused one is a raw textarea showing markers.

import { Fragment, type ReactNode } from 'react'

const TOKEN = /(\*\*[^*]+\*\*|_[^_]+_)/g

/** The marker width of a token part (0 when the part is plain text). */
function markerLen(part: string): number {
  if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return 2
  if (part.startsWith('_') && part.endsWith('_') && part.length > 2) return 1
  return 0
}

export function renderInline(text: string): ReactNode {
  const parts = text.split(TOKEN)
  if (parts.length === 1) return text
  return parts.map((part, i) => {
    const m = markerLen(part)
    if (m === 2) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (m === 1) return <em key={i}>{part.slice(1, -1)}</em>
    return <Fragment key={i}>{part}</Fragment>
  })
}

/** Map an offset in the rendered (marker-free) text back to an offset in the raw text. */
export function toRawOffset(text: string, visible: number): number {
  const parts = text.split(TOKEN)
  let vis = 0
  let raw = 0
  for (const part of parts) {
    const m = markerLen(part)
    const inner = part.length - 2 * m
    if (visible <= vis + inner) return raw + m + (visible - vis)
    vis += inner
    raw += part.length
  }
  return text.length
}

/** Wrap a selection of `text` with a marker pair (toggles it off when already wrapped). */
export function wrapSelection(text: string, start: number, end: number, marker: string): { text: string; start: number; end: number } {
  if (start === end) return { text, start, end }
  const before = text.slice(0, start)
  const mid = text.slice(start, end)
  const after = text.slice(end)
  const m = marker.length
  if (mid.startsWith(marker) && mid.endsWith(marker) && mid.length >= 2 * m) {
    const inner = mid.slice(m, -m)
    return { text: before + inner + after, start, end: start + inner.length }
  }
  if (before.endsWith(marker) && after.startsWith(marker)) {
    return { text: before.slice(0, -m) + mid + after.slice(m), start: start - m, end: end - m }
  }
  return { text: before + marker + mid + marker + after, start: start + m, end: end + m }
}
