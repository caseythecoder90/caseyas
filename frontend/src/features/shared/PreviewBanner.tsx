// The one-line "Design preview · placeholder data" banner. Renders nothing
// unless the designPreview dev flag is on; every screen that falls back to the
// design's mock data puts one at its top, so a screen full of invented
// memories or messages always says so.

import type { CSSProperties } from 'react'
import { useDesignPreview } from '../../data/hooks'
import { PREVIEW_BANNER } from './milestones'

export function PreviewBanner({ style }: { style?: CSSProperties }) {
  const [on] = useDesignPreview()
  if (!on) return null
  return (
    <div
      role="note"
      style={{
        flex: 'none',
        padding: '6px 20px 0',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '.08em',
        color: 'var(--fg3)',
        ...style,
      }}
    >
      {PREVIEW_BANNER}
    </div>
  )
}
