import { useState } from 'react'
import { DataMenu } from './components/DataMenu'
import { ThemeToggle } from './components/ThemeToggle'
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
      <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 pt-4 sm:px-8">
          <p className="font-display text-xl font-semibold tracking-tight">
            <span className="italic text-accent">Study</span> Planner
            <span aria-hidden="true" className="ml-1.5 inline-block -rotate-12 font-hand text-lg text-faint">
              ✎
            </span>
          </p>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <DataMenu />
          </div>
        </div>
        {/* Các tab như mép giấy phân trang trong sổ: tab đang mở nối liền với trang */}
        <nav className="mx-auto mt-3 flex max-w-5xl gap-1 overflow-x-auto px-4 sm:px-8" aria-label="Điều hướng chính">
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={active ? 'page' : undefined}
                className={`relative -mb-px shrink-0 rounded-t-md border border-b-0 px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? 'border-line bg-paper text-ink'
                    : 'border-transparent text-muted hover:bg-sunken/60 hover:text-ink'
                }`}
              >
                {active && <span aria-hidden="true" className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-accent" />}
                {t.label}
              </button>
            )
          })}
        </nav>
      </header>

      {/* key={tab}: đổi tab thì nội dung mount lại để chạy hiệu ứng xuất hiện */}
      <main key={tab} className="notebook-margin mx-auto max-w-5xl px-4 py-8 sm:px-8">
        {tab === 'dashboard' && <Dashboard onNavigate={setTab} />}
        {tab === 'tasks' && <TasksPage />}
        {tab === 'groups' && <GroupsPage />}
        {tab === 'roadmap' && <RoadmapPage />}
      </main>
    </div>
  )
}
