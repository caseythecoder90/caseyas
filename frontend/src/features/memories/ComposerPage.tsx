// Route "/compose" (with "?from=<planId>" for the prefilled-from-a-plan state).
// Until milestone 3 it is a "not yet" screen; the from-a-plan entry says so and
// links back to that plan. With the designPreview dev flag on, mobile renders
// mobile-a-memories.md section 5 and md and up desktop.md section 4.

import { useSearchParams } from 'react-router'
import { useDesignPreview } from '../../data/hooks'
import { paths } from '../../paths'
import { MEMORIES_ARRIVE, PLAN_TO_MEMORY_ARRIVES } from '../shared/milestones'
import { NotYetScreen } from '../shared/NotYetScreen'
import { PreviewBanner } from '../shared/PreviewBanner'
import { ComposerDesktop } from './ComposerDesktop'
import { ComposerMobile } from './ComposerMobile'
import { useIsDesktop } from './useIsDesktop'

export default function ComposerPage() {
  const [search] = useSearchParams()
  const [preview] = useDesignPreview()
  const isDesktop = useIsDesktop()
  const from = search.get('from')
  const fromPlan = !!from

  if (!preview) {
    return fromPlan ? (
      <NotYetScreen title="Not yet." line={PLAN_TO_MEMORY_ARRIVES} back={{ label: '← Back to the plan', to: paths.plan(from) }} />
    ) : (
      <NotYetScreen title="Not yet." line={MEMORIES_ARRIVE} back={{ label: '← Back to Memories', to: paths.timeline }} />
    )
  }
  return (
    <>
      <PreviewBanner style={isDesktop ? { padding: '12px 48px 0' } : undefined} />
      {isDesktop ? <ComposerDesktop fromPlan={fromPlan} /> : <ComposerMobile fromPlan={fromPlan} />}
    </>
  )
}
