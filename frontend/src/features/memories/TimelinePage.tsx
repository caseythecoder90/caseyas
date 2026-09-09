// Route "/" - the Memories timeline. Until milestone 3 it is the honest empty
// state (MemoriesEmpty). With the designPreview dev flag on, mobile (< md)
// renders the phone feed from mobile-a-memories.md section 3 and md and up the
// desktop grid from desktop.md section 2, both on mock data behind the banner.

import { useDesignPreview } from '../../data/hooks'
import { PreviewBanner } from '../shared/PreviewBanner'
import { MemoriesEmpty } from './MemoriesEmpty'
import { TimelineDesktop } from './TimelineDesktop'
import { TimelineMobile } from './TimelineMobile'
import { useIsDesktop } from './useIsDesktop'

export default function TimelinePage() {
  const [preview] = useDesignPreview()
  const isDesktop = useIsDesktop()
  if (!preview) return <MemoriesEmpty />
  return (
    <>
      <PreviewBanner style={isDesktop ? { padding: '12px 48px 0' } : undefined} />
      {isDesktop ? <TimelineDesktop /> : <TimelineMobile />}
    </>
  )
}
