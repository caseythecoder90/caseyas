// Placeholder a feature entry file renders until its screen is built.
// Reserves the 110px the tab bar needs at the bottom.

import { EmptyState } from '../../ui'

export function StubScreen({ title, sub = 'This screen is on its way.' }: { title: string; sub?: string }) {
  return (
    <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px 110px' }}>
      <EmptyState title={title} sub={sub} style={{ width: '100%', maxWidth: 420 }} />
    </section>
  )
}
