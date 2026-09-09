// Dev-only tweak mirroring the prototype's simulateDate prop: pick one of the
// three design dates or the real clock. Persisted by the store under
// 'ours.simDate'; every countdown and the Japan plan's status follow it.
// Renders one row; DeveloperSection owns the card it sits in.

import { useId } from 'react'
import type { SimDateOption } from '../../data/types'
import { Row } from './SettingsRows'

export interface SimulateDateProps {
  simDate: string | null
  setSimDate: (iso: string | null) => void
  simOptions: SimDateOption[]
}

export function SimulateDateRow({ simDate, setSimDate, simOptions }: SimulateDateProps) {
  const id = useId()
  return (
    <Row
      divider={false}
      gap={12}
      label={<label htmlFor={id}>Simulate date</label>}
      right={
        <select
          id={id}
          value={simDate ?? ''}
          onChange={(e) => setSimDate(e.target.value || null)}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--fg2)',
            background: 'transparent',
            border: 'none',
            padding: 0,
            textAlign: 'right',
            maxWidth: '60%',
          }}
        >
          <option value="">Real date</option>
          {simOptions.map((o) => (
            <option key={o.key} value={o.date}>
              {o.label}
            </option>
          ))}
        </select>
      }
    />
  )
}
