// Theme: light | dark | system, persisted under 'ours.theme' and applied as
// data-theme on <html>. 'system' removes the attribute so the
// prefers-color-scheme block in index.css decides. data-font is fixed to
// "newsreader" (the alternates are not shipped).

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type ThemeChoice = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'ours.theme'
const PAPER = '#faf9f6'
const INK = '#121110'

function readStored(): ThemeChoice {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {
    /* storage unavailable */
  }
  return 'system'
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false
}

export function resolveTheme(choice: ThemeChoice): ResolvedTheme {
  return choice === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : choice
}

/** Stamp the choice on <html> and keep the theme-color meta in step. */
export function applyTheme(choice: ThemeChoice): ResolvedTheme {
  const root = document.documentElement
  if (choice === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', choice)
  root.setAttribute('data-font', 'newsreader')
  const resolved = resolveTheme(choice)
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (meta) meta.content = resolved === 'dark' ? INK : PAPER
  return resolved
}

/** Call before the first render so the stored theme applies without a flash. */
export function applyStoredTheme(): void {
  applyTheme(readStored())
}

export interface ThemeContextValue {
  theme: ThemeChoice
  resolved: ResolvedTheme
  isDark: boolean
  setTheme: (choice: ThemeChoice) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>(readStored)
  const [systemDark, setSystemDark] = useState<boolean>(systemPrefersDark)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    applyTheme(theme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      /* storage unavailable */
    }
  }, [theme, systemDark])

  const setTheme = useCallback((choice: ThemeChoice) => setThemeState(choice), [])
  const resolved: ResolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolved, isDark: resolved === 'dark', setTheme }),
    [theme, resolved, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
