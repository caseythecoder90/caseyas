// Route "/memories/:id" - the memory detail plus its lightbox. Until milestone 3
// it is a "not yet" screen; with the designPreview dev flag on, the mobile and
// desktop bodies beside this file render the mock memory behind the banner and
// both feed the same lightbox.

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { useDesignPreview, useMemory } from '../../data/hooks'
import { paths } from '../../paths'
import { MEMORIES_ARRIVE } from '../shared/milestones'
import { NotYetScreen } from '../shared/NotYetScreen'
import { PreviewBanner } from '../shared/PreviewBanner'
import { DetailDesktop } from './DetailDesktop'
import { DetailMobile } from './DetailMobile'
import { Lightbox } from './Lightbox'
import { useIsDesktop } from './useIsDesktop'

export default function MemoryDetailPage() {
  const [preview] = useDesignPreview()
  const isDesktop = useIsDesktop()
  if (!preview) return <NotYetScreen title="Not yet." line={MEMORIES_ARRIVE} back={{ label: '← Back to Memories', to: paths.timeline }} />
  return (
    <>
      <PreviewBanner style={isDesktop ? { padding: '12px 48px 0' } : undefined} />
      <MemoryDetailPreview />
    </>
  )
}

/** The designed detail screen on mock data (design preview only). */
function MemoryDetailPreview() {
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
