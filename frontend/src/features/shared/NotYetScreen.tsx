// A calm "not yet" screen for routes whose milestone has not landed (memory
// detail, gallery, composer): the dashed EmptyState with the milestone line
// and one link back. Reserves the 110px the tab bar needs at the bottom.

import { Link } from 'react-router'
import { EmptyState } from '../../ui'

export interface NotYetScreenProps {
  title: string
  /** e.g. "Memories arrive with milestone 3." */
  line: string
  back: { label: string; to: string }
}

export function NotYetScreen({ title, line, back }: NotYetScreenProps) {
  return (
    <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px 110px' }}>
      <EmptyState title={title} sub={line} style={{ width: '100%', maxWidth: 420 }}>
        <Link to={back.to} style={{ display: 'inline-block', marginTop: 14, fontSize: 14, color: 'var(--accent)', textDecoration: 'none' }}>
          {back.label}
        </Link>
      </EmptyState>
    </section>
  )
}
