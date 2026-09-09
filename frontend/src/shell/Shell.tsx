// The app frame: sidebar (>= md) | scrolling main | tab bar (< md).
// Layout classes live in index.css (.ours-shell, .ours-main, .sidebar, .tabbar).

import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { TabBar } from './TabBar'

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="ours ours-shell">
      <Sidebar />
      <main className="ours-main">{children}</main>
      <TabBar />
    </div>
  )
}
