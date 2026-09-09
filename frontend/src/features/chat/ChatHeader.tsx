// Mobile chat header (mobile-c section 2): 36px avatar, her name in serif 22,
// "Active now" in green, and the Messages / Notes segmented control. The
// segments are routes on mobile: /chat and /notes. `status` is the presence
// line; the honest (pre-milestone 4) header passes null since there is no
// presence to report yet.

import { useNavigate } from 'react-router'
import { mockImage } from '../../data/mockImage'
import { paths } from '../../paths'
import { AVATAR_SEED, HER } from '../../people'
import { CHAT_STATUS } from './copy'

export type ChatSegKey = 'msgs' | 'notes'

export function ChatHeader({ seg, hasUnopened, status = CHAT_STATUS }: { seg: ChatSegKey; hasUnopened: boolean; status?: string | null }) {
  const navigate = useNavigate()
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 20px 12px',
        borderBottom: '1px solid var(--border)',
        flex: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 36, height: 36, borderRadius: 999, overflow: 'hidden', flex: 'none' }}>
          <img
            src={mockImage(AVATAR_SEED.her, 80, 80)}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(.2) saturate(.6)' }}
          />
        </span>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, lineHeight: 1 }}>{HER}</div>
          {status && <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 2 }}>{status}</div>}
        </div>
      </div>
      <nav aria-label="Chat sections" style={{ display: 'flex', gap: 2, padding: 2, borderRadius: 6, background: 'var(--surface-2)', fontSize: 13 }}>
        <button
          type="button"
          aria-current={seg === 'msgs' ? 'page' : undefined}
          onClick={() => navigate(paths.chat)}
          style={{
            height: 30,
            padding: '0 12px',
            borderRadius: 4,
            border: 'none',
            background: seg === 'msgs' ? 'var(--bg)' : 'transparent',
            color: 'var(--fg1)',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'background var(--dur-sheet) var(--ease)',
          }}
        >
          Messages
        </button>
        <button
          type="button"
          aria-current={seg === 'notes' ? 'page' : undefined}
          onClick={() => navigate(paths.notes)}
          style={{
            height: 30,
            padding: '0 12px',
            borderRadius: 4,
            border: 'none',
            background: seg === 'notes' ? 'var(--bg)' : 'transparent',
            color: 'var(--fg1)',
            cursor: 'pointer',
            fontWeight: 500,
            position: 'relative',
            transition: 'background var(--dur-sheet) var(--ease)',
          }}
        >
          Notes
          {hasUnopened && (
            <span style={{ position: 'absolute', top: 4, right: 2, width: 6, height: 6, borderRadius: 999, background: 'var(--accent)' }} />
          )}
        </button>
      </nav>
    </div>
  )
}
