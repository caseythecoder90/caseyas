// Desktop sidebar (desktop.md section 1.1): wordmark, New button + menu, nav
// rows with badges, the Upcoming widget with the Next trip card, couple footer.

import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { JAPAN_START, LAKE_START, countdown, daysUntil } from '../data/dates'
import { useChat, useToday } from '../data/hooks'
import { NEW_MENU, SIDEBAR_NEXT_TRIP, SIDEBAR_UPCOMING } from '../data/mock/us'
import { HER } from '../people'
import { paths, tabFor } from '../paths'
import { useSession } from '../session'
import { AvatarPair, Eyebrow, Icon, navRow } from '../ui'

export function Sidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { meName } = useSession()
  const { chatUnread, notesUnread } = useChat()
  const today = useToday()
  const [newOpen, setNewOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!newOpen) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setNewOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNewOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [newOpen])

  const tab = tabFor(pathname)
  const isNotes = pathname.startsWith('/notes')
  const rows = [
    { label: 'Memories', to: paths.timeline, on: tab === 'memories', badge: '' },
    { label: 'Plans', to: paths.plans, on: tab === 'plans', badge: '' },
    { label: 'Calendar', to: paths.calendar, on: tab === 'calendar', badge: '' },
    { label: 'Chat', to: paths.chat, on: tab === 'chat' && !isNotes, badge: String(chatUnread) },
    { label: 'Notes', to: paths.notes, on: isNotes, badge: notesUnread ? String(notesUnread) : '' },
    { label: 'Us', to: paths.us, on: tab === 'us', badge: '' },
  ]

  const japanDays = Math.max(0, daysUntil(JAPAN_START, today))
  const lakeIn = countdown(LAKE_START, today)

  return (
    <aside className="sidebar" aria-label="Sidebar">
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30, lineHeight: 1, padding: '0 8px' }}>ours</div>

      <div ref={menuRef} style={{ position: 'relative' }}>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={newOpen}
          onClick={() => setNewOpen((v) => !v)}
          style={{
            width: '100%',
            height: 44,
            borderRadius: 8,
            border: 'none',
            background: 'var(--accent)',
            color: '#faf9f6',
            fontWeight: 500,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Icon name="plus" size={16} />
          New
        </button>
        {newOpen && (
          <div
            role="menu"
            style={{
              position: 'absolute',
              top: 50,
              left: 0,
              right: 0,
              zIndex: 20,
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              boxShadow: 'var(--shadow-md)',
              padding: 6,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {NEW_MENU.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setNewOpen(false)
                  navigate(item.to)
                }}
                style={{
                  height: 40,
                  padding: '0 10px',
                  border: 'none',
                  borderRadius: 6,
                  background: 'transparent',
                  color: 'var(--fg1)',
                  fontSize: 14,
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{item.label}</span>
                <span style={{ fontSize: 12, color: 'var(--fg3)' }}>{item.hint}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <nav aria-label="Primary" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {rows.map((r) => {
          const s = navRow(r.on)
          return (
            <Link
              key={r.label}
              to={r.to}
              aria-current={r.on ? 'page' : undefined}
              onClick={() => setNewOpen(false)}
              style={{
                height: 40,
                padding: '0 10px',
                borderRadius: 6,
                borderLeft: `1px solid ${s.edge}`,
                background: s.bg,
                color: s.color,
                fontSize: 14,
                fontWeight: 500,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{r.label}</span>
              {r.badge && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)' }}>{r.badge}</span>}
            </Link>
          )
        })}
      </nav>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Eyebrow size={10} style={{ padding: '0 10px' }}>
          Upcoming
        </Eyebrow>
        {SIDEBAR_UPCOMING.map((row) => (
          <div key={row.title} style={{ padding: '0 10px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: row.dot, marginTop: 7, flex: 'none' }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14 }}>{row.title}</div>
              <div style={{ fontSize: 12, color: 'var(--fg3)' }}>{row.title === 'Lake weekend' ? `Sat · ${lakeIn}` : row.sub}</div>
            </div>
          </div>
        ))}
        <Link
          to={paths.plan(SIDEBAR_NEXT_TRIP.planId)}
          style={{
            margin: '4px 10px 0',
            padding: 12,
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--fg1)',
            display: 'block',
          }}
        >
          <Eyebrow size={10} color="var(--accent)">
            {SIDEBAR_NEXT_TRIP.eyebrow}
          </Eyebrow>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 32, lineHeight: 1 }}>{japanDays}</span>
            <span style={{ fontSize: 13, color: 'var(--fg2)' }}>{SIDEBAR_NEXT_TRIP.line}</span>
          </div>
        </Link>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', gap: 10, padding: '0 8px', alignItems: 'center' }}>
        <AvatarPair size={28} overlap={-8} border="var(--surface)" />
        <span style={{ fontSize: 13, color: 'var(--fg2)' }}>
          {meName} & {HER}
        </span>
      </div>
    </aside>
  )
}
