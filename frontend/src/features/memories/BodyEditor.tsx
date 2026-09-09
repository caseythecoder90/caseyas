// The composer body: the design's blocks (heading, paragraph, pull-quote,
// list, inline photo) plus the formatting toolbar from mobile-a-memories.md
// 5.2 step 6 / desktop.md section 4.
//
// A block reads as the design draws it - static text with **bold** / _italic_
// rendered by inline.tsx and grey placeholder lines ("Keep writing…") shown as
// placeholders, not as content. Clicking a block swaps just that one line to an
// auto-growing textarea with the caret where the click landed, so the markers
// are only ever visible in the line being edited. H and " quote retype the
// focused block; B and I wrap its selection.

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { COMPOSER_TOOLS } from '../../data/mock'
import { mockImage } from '../../data/mockImage'
import { PAPER, PHOTO_SCRIM_6 } from '../../ui'
import { blockId, insertAfter, replaceBlock, toggleType, type EditorBlock } from './blocks'
import { Photo } from './bits'
import { renderInline, toRawOffset, wrapSelection } from './inline'

export interface BodyEditorProps {
  blocks: EditorBlock[]
  onChange: (blocks: EditorBlock[]) => void
  scale: 'mobile' | 'desktop'
}

const SCALE = {
  mobile: { gap: 14, body: 16, line: 1.65, h: 24, quote: 22, quotePad: 16, listPad: 20, listGap: 4, imgH: 200, toolPad: 4, toolMin: 32 },
  desktop: { gap: 18, body: 17, line: 1.7, h: 28, quote: 26, quotePad: 20, listPad: 22, listGap: 6, imgH: 300, toolPad: 6, toolMin: 30 },
}

/** The mock marks prototype placeholder lines by colouring them fg3. */
const PLACEHOLDER = 'var(--fg3)'
const isPlaceholder = (b: EditorBlock) => b.color === PLACEHOLDER

/** Which textarea is live: a block id, plus the item index inside a list block. */
interface Focus {
  id: string
  index: number | null
}

const sameFocus = (a: Focus | null, b: Focus | null) => !!a && !!b && a.id === b.id && a.index === b.index

export function BodyEditor({ blocks, onChange, scale }: BodyEditorProps) {
  const s = SCALE[scale]
  /** The single mounted textarea (only the focused line is editable). */
  const area = useRef<HTMLTextAreaElement | null>(null)
  /** Where to put the caret once that textarea mounts. */
  const caret = useRef<[number, number] | null>(null)
  const [focus, setFocus] = useState<Focus | null>(null)

  const current = blocks.find((b) => b.id === focus?.id) ?? blocks[blocks.length - 1]

  useEffect(() => {
    const el = area.current
    if (!focus || !el) return
    el.focus()
    const [a, b] = caret.current ?? [el.value.length, el.value.length]
    el.setSelectionRange(a, b)
    caret.current = null
  }, [focus])

  const patch = (id: string, p: Partial<EditorBlock>) => onChange(replaceBlock(blocks, id, p))

  /** Move the caret into `next`, opening its editor if it is not already open. */
  const goTo = (next: Focus, at: number) => {
    caret.current = [at, at]
    if (sameFocus(focus, next)) {
      const el = area.current
      if (el) {
        el.focus()
        el.setSelectionRange(at, at)
      }
      caret.current = null
      return
    }
    setFocus(next)
  }

  const wrap = (marker: string) => {
    const el = area.current
    if (!current || !el || !focus || current.type === 'img') return
    const next = wrapSelection(el.value, el.selectionStart, el.selectionEnd, marker)
    if (current.type === 'list') {
      const items = current.items ?? ['']
      if (focus.index == null) return
      patch(current.id, { items: items.map((x, j) => (j === focus.index ? next.text : x)) })
    } else {
      patch(current.id, { text: next.text, color: isPlaceholder(current) ? 'var(--fg1)' : current.color })
    }
    requestAnimationFrame(() => {
      const again = area.current
      if (again) {
        again.focus()
        again.setSelectionRange(next.start, next.end)
      }
    })
  }

  const tool = (label: string) => {
    if (!current) return
    if (label === 'H') patch(current.id, toggleType(current, 'h'))
    else if (label === 'B') wrap('**')
    else if (label === 'I') wrap('_')
    else if (label === '• list') patch(current.id, toggleType(current, 'list', false))
    else if (label === '1. list') patch(current.id, toggleType(current, 'list', true))
    else if (label === '“ quote') patch(current.id, toggleType(current, 'q'))
    else if (label === '+ photo') {
      const seed = 'inline' + (blocks.length + 1)
      onChange(
        insertAfter(blocks, current.id, { id: blockId(), type: 'img', src: mockImage(seed, 1200, 600), cap: '' }),
      )
    }
  }

  return (
    <>
      <div
        role="toolbar"
        aria-label="Formatting"
        className="hide-scrollbar"
        style={{
          display: 'flex',
          gap: 2,
          padding: s.toolPad,
          borderRadius: 8,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          fontSize: 13,
          color: 'var(--fg2)',
          overflowX: 'auto',
          width: scale === 'desktop' ? 'fit-content' : undefined,
        }}
      >
        {COMPOSER_TOOLS.map((t) => {
          const on =
            !!current &&
            ((t.label === 'H' && current.type === 'h') ||
              (t.label === '“ quote' && current.type === 'q') ||
              (t.label === '• list' && current.type === 'list' && !current.ordered) ||
              (t.label === '1. list' && current.type === 'list' && !!current.ordered))
          return (
            <button
              key={t.label}
              type="button"
              aria-pressed={on}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => tool(t.label)}
              style={{
                flex: 'none',
                height: 30,
                minWidth: s.toolMin,
                padding: '0 10px',
                borderRadius: 4,
                border: 'none',
                background: on ? 'var(--bg)' : 'transparent',
                color: on ? 'var(--fg1)' : 'inherit',
                fontFamily: t.font,
                fontWeight: t.weight,
                fontStyle: t.style,
                fontSize: 13,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: s.gap,
          fontSize: s.body,
          lineHeight: s.line,
          maxWidth: scale === 'desktop' ? 680 : undefined,
        }}
      >
        {blocks.map((b) => {
          if (b.type === 'img') {
            return (
              <div
                key={b.id}
                style={{
                  position: 'relative',
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: scale === 'desktop' ? '1px solid var(--accent)' : undefined,
                }}
              >
                <Photo src={b.src ?? ''} style={{ width: '100%', height: s.imgH }} />
                <input
                  value={b.cap ?? ''}
                  onChange={(e) => patch(b.id, { cap: e.target.value })}
                  placeholder="Caption"
                  aria-label="Photo caption"
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: scale === 'desktop' ? 40 : 32,
                    border: 'none',
                    background: scale === 'desktop' ? 'rgba(18,17,16,.7)' : PHOTO_SCRIM_6,
                    color: PAPER,
                    fontSize: scale === 'desktop' ? 13 : 12,
                    fontFamily: 'var(--font-mono)',
                    padding: scale === 'desktop' ? '0 14px' : '0 10px',
                  }}
                />
              </div>
            )
          }
          if (b.type === 'list') {
            const items = b.items ?? ['']
            return (
              <div key={b.id} style={{ display: 'flex', flexDirection: 'column', gap: s.listGap, paddingLeft: s.listPad, color: 'var(--fg2)' }}>
                {items.map((it, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ flex: 'none', color: 'var(--fg3)', fontFamily: b.ordered ? 'var(--font-mono)' : undefined, fontSize: b.ordered ? 13 : undefined }}>
                      {b.ordered ? `${i + 1}.` : '•'}
                    </span>
                    <Line
                      editing={focus?.id === b.id && focus.index === i}
                      areaRef={area}
                      text={it}
                      ariaLabel={`List item ${i + 1}`}
                      onPick={(at) => goTo({ id: b.id, index: i }, at)}
                      onChange={(v) => patch(b.id, { items: items.map((x, j) => (j === i ? v : x)) })}
                      onEnter={() => {
                        patch(b.id, { items: [...items.slice(0, i + 1), '', ...items.slice(i + 1)] })
                        goTo({ id: b.id, index: i + 1 }, 0)
                      }}
                      style={{ color: 'var(--fg2)' }}
                    />
                  </div>
                ))}
              </div>
            )
          }
          const style: CSSProperties =
            b.type === 'h'
              ? { fontFamily: 'var(--font-serif)', fontSize: s.h, lineHeight: 1.2, marginTop: scale === 'mobile' ? 6 : 0 }
              : b.type === 'q'
                ? {
                    fontFamily: 'var(--font-serif)',
                    fontSize: s.quote,
                    lineHeight: 1.3,
                    paddingLeft: s.quotePad,
                    borderLeft: '1px solid var(--accent)',
                  }
                : { color: b.color ?? 'var(--fg1)' }
          const holder = isPlaceholder(b)
          return (
            <Line
              key={b.id}
              editing={focus?.id === b.id && focus.index === null}
              areaRef={area}
              text={holder ? '' : (b.text ?? '')}
              placeholder={holder ? b.text : undefined}
              ariaLabel={b.type === 'h' ? 'Heading' : b.type === 'q' ? 'Pull quote' : 'Paragraph'}
              onPick={(at) => goTo({ id: b.id, index: null }, holder ? 0 : at)}
              onChange={(v) => patch(b.id, { text: v, color: holder ? 'var(--fg1)' : b.color })}
              onEnter={() => {
                const nb: EditorBlock = { id: blockId(), type: 'p', text: '', color: 'var(--fg1)' }
                onChange(insertAfter(blocks, b.id, nb))
                goTo({ id: nb.id, index: null }, 0)
              }}
              style={style}
            />
          )
        })}
      </div>
    </>
  )
}

interface LineProps {
  /** true when this is the one line the user is editing */
  editing: boolean
  areaRef: RefObject<HTMLTextAreaElement | null>
  text: string
  placeholder?: string
  onChange: (v: string) => void
  onEnter: () => void
  /** the reader clicked at this offset in the raw text */
  onPick: (at: number) => void
  style?: CSSProperties
  ariaLabel: string
}

/**
 * One body line: rendered markup when it is resting, an auto-growing textarea
 * while it is being edited.
 */
function Line({ editing, areaRef, text, placeholder, onChange, onEnter, onPick, style, ariaLabel }: LineProps) {
  const local = useRef<HTMLTextAreaElement | null>(null)

  useLayoutEffect(() => {
    const el = local.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [text, style, editing])

  if (!editing) {
    let body: ReactNode = placeholder ?? (text ? renderInline(text) : ' ')
    if (!placeholder && !text) body = ' '
    return (
      <div
        role="textbox"
        tabIndex={0}
        aria-label={ariaLabel}
        onMouseDown={(e) => {
          e.preventDefault()
          onPick(toRawOffset(text, visibleOffset(e.currentTarget, e.clientX, e.clientY) ?? text.length))
        }}
        onFocus={() => onPick(text.length)}
        style={{
          width: '100%',
          minHeight: '1em',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
          cursor: 'text',
          outline: 'none',
          color: placeholder ? 'var(--fg3)' : undefined,
          ...style,
        }}
      >
        {body}
      </div>
    )
  }

  return (
    <textarea
      ref={(el) => {
        local.current = el
        areaRef.current = el
      }}
      value={text}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          onEnter()
        }
      }}
      rows={1}
      style={{
        width: '100%',
        border: 'none',
        background: 'transparent',
        resize: 'none',
        padding: 0,
        margin: 0,
        color: 'var(--fg1)',
        font: 'inherit',
        lineHeight: 'inherit',
        overflow: 'hidden',
        display: 'block',
        ...style,
      }}
    />
  )
}

/** How many rendered characters precede the point (x, y) inside `root`. */
function visibleOffset(root: HTMLElement, x: number, y: number): number | null {
  const doc = root.ownerDocument
  const from = doc.caretRangeFromPoint?.(x, y)
  if (!from || !root.contains(from.startContainer)) return null
  const range = doc.createRange()
  range.selectNodeContents(root)
  range.setEnd(from.startContainer, from.startOffset)
  return range.toString().length
}
