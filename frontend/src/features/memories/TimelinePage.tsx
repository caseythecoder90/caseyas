// Route "/" - the Memories timeline. Mobile (< md) renders the phone feed from
// mobile-a-memories.md section 3; md and up renders the desktop grid from
// desktop.md section 2.

import { TimelineDesktop } from './TimelineDesktop'
import { TimelineMobile } from './TimelineMobile'
import { useIsDesktop } from './useIsDesktop'

export default function TimelinePage() {
  return useIsDesktop() ? <TimelineDesktop /> : <TimelineMobile />
}
