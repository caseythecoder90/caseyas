// Mobile tab bar (tokens-and-components.md section 13): 88px incl. home
// indicator, blurred paper, hairline top border. Active = ink, inactive = fg3.
// One badge, on Chat, covering messages and notes; hidden while on Chat/Notes
// and whenever the count is 0 (which it is until milestone 4 unless the design
// preview is on).

import { Link, useLocation } from 'react-router'
import { useChat } from '../data/hooks'
import { paths, tabFor, type TabKey } from '../paths'
import { Icon, tabColor, type IconName } from '../ui'

const TABS: { key: TabKey; label: string; icon: IconName; to: string }[] = [
  { key: 'memories', label: 'Memories', icon: 'image', to: paths.timeline },
  { key: 'plans', label: 'Plans', icon: 'map', to: paths.plans },
  { key: 'calendar', label: 'Calendar', icon: 'calendar', to: paths.calendar },
  { key: 'chat', label: 'Chat', icon: 'message-circle', to: paths.chat },
  { key: 'us', label: 'Us', icon: 'users', to: paths.us },
]

export function TabBar() {
  const { pathname } = useLocation()
  const active = tabFor(pathname)
  const { badge } = useChat()
  const showBadge = active !== 'chat' && badge > 0

  return (
    <nav aria-label="Primary" className="tabbar">
      {TABS.map((t) => {
        const on = active === t.key
        return (
          <Link
            key={t.key}
            to={t.to}
            aria-current={on ? 'page' : undefined}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              color: tabColor(on),
              fontSize: 10,
              paddingTop: 6,
              position: 'relative',
            }}
          >
            <Icon name={t.icon} size={22} />
            {t.label}
            {t.key === 'chat' && showBadge && (
              <span
                aria-label={`${badge} unread`}
                style={{
                  position: 'absolute',
                  top: 4,
                  left: 'calc(50% + 6px)',
                  minWidth: 16,
                  height: 16,
                  padding: '0 4px',
                  borderRadius: 999,
                  background: 'var(--accent)',
                  color: '#faf9f6',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
