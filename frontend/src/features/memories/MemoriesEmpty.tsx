// What the Memories tab shows until milestone 3 (unless the design preview is
// on): the title and the design's empty state, with the milestone line and no
// CTA - there is no composer to send anyone to yet. Same on both viewports.

import { EmptyState } from '../../ui'
import { MEMORIES_ARRIVE } from '../shared/milestones'
import { useIsDesktop } from './useIsDesktop'

export function MemoriesEmpty() {
  const isDesktop = useIsDesktop()
  return (
    <section
      style={
        isDesktop
          ? { maxWidth: 1120, margin: '0 auto', padding: '40px 48px 64px', width: '100%' }
          : { display: 'flex', flexDirection: 'column', flex: 1, padding: '8px 20px 110px' }
      }
    >
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: isDesktop ? 56 : 36, lineHeight: 1, margin: 0, fontWeight: 400 }}>Memories</h1>
      <EmptyState style={{ marginTop: isDesktop ? 28 : 20, maxWidth: isDesktop ? 520 : undefined }}>
        <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 14 }}>{MEMORIES_ARRIVE}</div>
      </EmptyState>
    </section>
  )
}
