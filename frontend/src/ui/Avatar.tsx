// tokens-and-components.md section 10. 32px round, sepia(.2) saturate(.6),
// 2px paper border. Pair overlaps the second by -10px (desktop sidebar: 28px,
// -8px, surface border; desktop chat header: 40px, no border).

import { mockImage } from '../data/mockImage'
import { AVATAR_SEED } from '../people'
import type { CSSProperties } from 'react'
import { cx } from './cx'

export interface AvatarProps {
  who?: 'me' | 'her'
  /** override the mock-image seed */
  seed?: string
  /** override the image entirely */
  src?: string
  size?: number
  /** border color; null for none */
  border?: string | null
  alt?: string
  style?: CSSProperties
  className?: string
}

export function Avatar({ who = 'me', seed, src, size = 32, border = 'var(--bg)', alt = '', style, className }: AvatarProps) {
  const source = src ?? mockImage(seed ?? AVATAR_SEED[who], 128, 128)
  return (
    <img
      src={source}
      alt={alt}
      className={cx('avatar-photo', className)}
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        objectFit: 'cover',
        border: border ? `2px solid ${border}` : undefined,
        display: 'block',
        flex: 'none',
        ...style,
      }}
    />
  )
}

export interface AvatarPairProps {
  size?: number
  /** negative margin on the second avatar */
  overlap?: number
  border?: string | null
  style?: CSSProperties
  className?: string
}

export function AvatarPair({ size = 32, overlap = -10, border = 'var(--bg)', style, className }: AvatarPairProps) {
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', flex: 'none', ...style }}>
      <Avatar who="me" size={size} border={border} />
      <Avatar who="her" size={size} border={border} style={{ marginLeft: overlap }} />
    </span>
  )
}
