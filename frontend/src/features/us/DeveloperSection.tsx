// The Developer card at the bottom of Us: the Simulate date select (dev builds
// only) and the "Design preview data" switch that flips the designPreview
// flag, so the design's placeholder content on the unbuilt tabs is one tap
// away and off by default.

import { useDesignPreview } from '../../data/hooks'
import type { SimDateOption } from '../../data/types'
import { DEV_PREVIEW_HINT, DEV_PREVIEW_TITLE } from './copy'
import { Section, ToggleRow } from './SettingsRows'
import { SimulateDateRow } from './SimulateDate'

export interface DeveloperSectionProps {
  simDate: string | null
  setSimDate: (iso: string | null) => void
  simOptions: SimDateOption[]
}

export function DeveloperSection({ simDate, setSimDate, simOptions }: DeveloperSectionProps) {
  const [preview, setPreview] = useDesignPreview()
  const showSim = import.meta.env.DEV
  return (
    <Section eyebrow="Developer">
      {showSim && <SimulateDateRow simDate={simDate} setSimDate={setSimDate} simOptions={simOptions} />}
      <ToggleRow divider={showSim} title={DEV_PREVIEW_TITLE} sub={DEV_PREVIEW_HINT} gap={12} subLineHeight={1.4} on={preview} onToggle={() => setPreview(!preview)} />
    </Section>
  )
}
