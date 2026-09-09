// Route "/compose" (with "?from=<planId>" for the prefilled-from-a-plan state).
// Mobile renders mobile-a-memories.md section 5, md and up desktop.md section 4.

import { useSearchParams } from 'react-router'
import { ComposerDesktop } from './ComposerDesktop'
import { ComposerMobile } from './ComposerMobile'
import { useIsDesktop } from './useIsDesktop'

export default function ComposerPage() {
  const [search] = useSearchParams()
  const fromPlan = !!search.get('from')
  return useIsDesktop() ? <ComposerDesktop fromPlan={fromPlan} /> : <ComposerMobile fromPlan={fromPlan} />
}
