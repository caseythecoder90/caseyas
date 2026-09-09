// Route "/memories/:id" - the memory detail plus its lightbox. The mobile and
// desktop bodies live beside this file; both feed the same lightbox.

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { useMemory } from '../../data/hooks'
import { DetailDesktop } from './DetailDesktop'
import { DetailMobile } from './DetailMobile'
import { Lightbox } from './Lightbox'
import { useIsDesktop } from './useIsDesktop'

export default function MemoryDetailPage() {
  const { id } = useParams()
  const isDesktop = useIsDesktop()
  const variant = isDesktop ? 'desktop' : 'mobile'
  const m = useMemory(id, variant)
  const [search, setSearch] = useSearchParams()
  const [lb, setLb] = useState<number | null>(null)

  // The gallery hands over "?lb=1" (its tiles open the Asheville detail with
  // the lightbox already on tile 2).
  const lbParam = search.get('lb')
  useEffect(() => {
    if (lbParam === null) return
    const i = Number(lbParam)
    setLb(Number.isFinite(i) ? i : 0)
    const next = new URLSearchParams(search)
    next.delete('lb')
    setSearch(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lbParam])

  // Switching viewports changes the tile count; keep the index in range.
  useEffect(() => {
    setLb((cur) => (cur !== null && cur >= m.gallery.length ? 0 : cur))
  }, [m.gallery.length])

  const view = {
    memory: m.memory,
    detail: m.detail,
    gallery: m.gallery,
    comments: m.comments,
    reactions: m.reactions,
    onReact: m.setReacted,
    onOpenTile: (i: number) => setLb(i),
    hasPlan: m.hasPlan,
    planId: m.planId,
    planName: m.planName,
    ini: m.ini,
  }

  return (
    <>
      {isDesktop ? <DetailDesktop {...view} inlineDesktop={m.inlineDesktop} /> : <DetailMobile {...view} />}
      {lb !== null && (
        <Lightbox
          memory={m.memory}
          gallery={m.gallery}
          caps={m.caps}
          index={lb}
          variant={variant}
          favs={m.favs}
          onToggleFav={m.toggleFav}
          onNext={() => setLb((i) => ((i ?? 0) + 1) % m.gallery.length)}
          onClose={() => setLb(null)}
        />
      )}
    </>
  )
}
