import { useState } from 'react'
import { DataMenu } from './components/DataMenu'
import { Dashboard } from './features/dashboard/Dashboard'
import { GroupsPage } from './features/groups/GroupsPage'
import { RoadmapPage } from './features/roadmap/RoadmapPage'
import { TasksPage } from './features/tasks/TasksPage'
import type { Tab } from './lib/labels'
import { AppStoreProvider } from './store/AppStore'

// Chỉ có 4 màn hình nên dùng state thay cho thư viện router
const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Tổng quan' },
  { id: 'tasks', label: 'Việc học' },
  { id: 'groups', label: 'Nhóm' },
  { id: 'roadmap', label: 'Lộ trình' },
]

export default function App() {
  return (
    <AppStoreProvider>
      <Shell />
    </AppStoreProvider>
  )
}

function Shell() {
  const [tab, setTab] = useState<Tab>('dashboard')

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 pt-3">
          <p className="font-bold tracking-tight">
            <span className="text-indigo-600">Study</span> Planner
          </p>
          <DataMenu />
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4" aria-label="Điều hướng chính">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition ${tab === t.id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {tab === 'dashboard' && <Dashboard onNavigate={setTab} />}
        {tab === 'tasks' && <TasksPage />}
        {tab === 'groups' && <GroupsPage />}
        {tab === 'roadmap' && <RoadmapPage />}
      </main>
    </div>
  )
}
