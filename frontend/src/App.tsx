import { useQuery } from '@tanstack/react-query'
import { NavLink, Route, Routes } from 'react-router'
import { api, csrfToken, type Me } from './api'

const tabs = [
  { to: '/', label: 'Memories' },
  { to: '/plans', label: 'Plans' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/chat', label: 'Chat' },
  { to: '/us', label: 'Us' },
] as const

function useMe() {
  return useQuery({ queryKey: ['me'], queryFn: () => api<Me>('/api/me') })
}

function Empty({ title, line }: { title: string; line: string }) {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="font-display text-3xl">{title}</h1>
      <p className="max-w-sm text-ink-soft dark:text-paper-deep">{line}</p>
    </section>
  )
}

function Us({ me }: { me: Me }) {
  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 px-6 py-10">
      <h1 className="font-display text-3xl">Us</h1>
      <p>
        Signed in as <span className="font-medium">{me.displayName}</span>
        <span className="text-ink-soft dark:text-paper-deep"> ({me.username})</span>.
      </p>
      {/* A real form POST so the browser follows the api's redirect to Keycloak's
          end-session endpoint and back. fetch() could not follow that cross-site hop. */}
      <form method="post" action="/logout">
        <input type="hidden" name="_csrf" value={csrfToken() ?? ''} />
        <button
          type="submit"
          className="rounded-lg border border-ink/20 px-4 py-2 text-sm hover:bg-paper-deep dark:border-paper/20 dark:hover:bg-night-raised"
        >
          Sign out
        </button>
      </form>
    </section>
  )
}

export default function App() {
  const me = useMe()

  if (me.isPending || me.isError) {
    // isError with a 401 means api.ts is already redirecting to Keycloak
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="font-display text-2xl">{me.isError ? 'Signing you in…' : 'Ours'}</p>
      </main>
    )
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-paper-deep font-medium dark:bg-night-raised' : 'text-ink-soft dark:text-paper-deep'}`

  return (
    <div className="flex min-h-screen">
      <nav className="hidden w-56 shrink-0 flex-col gap-1 border-r border-ink/10 p-4 md:flex dark:border-paper/10">
        <span className="mb-4 px-3 font-display text-2xl">Ours</span>
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.to === '/'} className={linkClass}>
            {t.label}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 pb-20 md:pb-0">
        <Routes>
          <Route path="/" element={<Empty title="Memories" line="Nothing here yet. Start with how you met." />} />
          <Route path="/plans" element={<Empty title="Plans" line="Where to first?" />} />
          <Route path="/calendar" element={<Empty title="Calendar" line="Nothing on the calendar yet." />} />
          <Route path="/chat" element={<Empty title="Chat" line="Say something." />} />
          <Route path="/us" element={<Us me={me.data} />} />
          <Route path="*" element={<Empty title="Not here" line="That page does not exist." />} />
        </Routes>
      </main>

      <nav className="fixed inset-x-0 bottom-0 flex justify-around border-t border-ink/10 bg-paper pb-[env(safe-area-inset-bottom)] md:hidden dark:border-paper/10 dark:bg-night">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.to === '/'} className={linkClass}>
            {t.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
