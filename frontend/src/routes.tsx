// Route table. Each route renders a feature entry file; screen agents replace
// the contents of those files and never need to edit this one.
//
//   /                  memories/TimelinePage
//   /memories/:id      memories/MemoryDetailPage
//   /gallery           memories/GalleryPage
//   /compose           memories/ComposerPage            (?from=<planId> prefills from a plan)
//   /plans             plans/PlansListPage
//   /plans/:id         plans/PlanDetailPage             (?seg=overview|itinerary|ideas|bookings|checklists|budget|documents|map|locked)
//   /plans/:id/today   plans/TodayPage
//   /calendar          calendar/CalendarPage
//   /chat              chat/ChatPage                    (segment messages)
//   /notes             chat/NotesPage                   (segment notes; second segment of the Chat tab on mobile)
//   /us                us/UsPage
//   /session-expired   handled in App.tsx, outside the shell

import { Route, Routes } from 'react-router'
import CalendarPage from './features/calendar/CalendarPage'
import ChatPage from './features/chat/ChatPage'
import NotesPage from './features/chat/NotesPage'
import ComposerPage from './features/memories/ComposerPage'
import GalleryPage from './features/memories/GalleryPage'
import MemoryDetailPage from './features/memories/MemoryDetailPage'
import TimelinePage from './features/memories/TimelinePage'
import PlanDetailPage from './features/plans/PlanDetailPage'
import PlansListPage from './features/plans/PlansListPage'
import TodayPage from './features/plans/TodayPage'
import { StubScreen } from './features/shared/StubScreen'
import UsPage from './features/us/UsPage'

export { paramFromSeg, paths, segFromParam, tabFor } from './paths'
export type { PlanSegParam, TabKey } from './paths'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TimelinePage />} />
      <Route path="/memories/:id" element={<MemoryDetailPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/compose" element={<ComposerPage />} />
      <Route path="/plans" element={<PlansListPage />} />
      <Route path="/plans/:id" element={<PlanDetailPage />} />
      <Route path="/plans/:id/today" element={<TodayPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/notes" element={<NotesPage />} />
      <Route path="/us" element={<UsPage />} />
      <Route path="*" element={<StubScreen title="Not here" sub="That page does not exist." />} />
    </Routes>
  )
}
