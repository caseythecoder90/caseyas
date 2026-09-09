// tokens-and-components.md section 11: dashed 8px panel, serif 24px title,
// 14px fg2 sub, secondary 40px CTA.

import type { CSSProperties, ReactNode } from 'react'
import { Button } from './Button'

export interface EmptyStateProps {
  title?: ReactNode
  sub?: ReactNode
  cta?: { label: string; onClick?: () => void }
  style?: CSSProperties
  className?: string
  children?: ReactNode
}

export function EmptyState({ title = 'Nothing here yet.', sub = 'Start with how you met.', cta, style, className, children }: EmptyStateProps) {
  return (
    <div className={className} style={{ padding: 28, borderRadius: 8, border: '1px dashed var(--border)', textAlign: 'center', ...style }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, lineHeight: 1.1 }}>{title}</div>
      {sub !== undefined && sub !== null && sub !== '' && <div style={{ fontSize: 14, color: 'var(--fg2)', marginTop: 6 }}>{sub}</div>}
      {cta && (
        <Button variant="secondary" size="dense-lg" style={{ marginTop: 14 }} onClick={cta.onClick}>
          {cta.label}
        </Button>
      )}
      {children}
    </div>
  )
}
