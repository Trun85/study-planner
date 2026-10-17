import { useState } from 'react'
import { Button, EmptyState, PageHeader, inputClass } from '../../components/ui'
import { deadlineBucket, formatHours, todayISO, type DeadlineBucket } from '../../lib/date'
import { byDeadline, sumMinutes } from '../../lib/progress'
import { useAppStore } from '../../store/context'
import type { Task } from '../../types'
import { TaskEditor } from './TaskEditor'
import { TaskItem } from './TaskItem'

type Scope = 'all' | 'personal' | 'group'

const SCOPES: { id: Scope; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'personal', label: 'Cá nhân' },
  { id: 'group', label: 'Nhóm' },
]

const SECTIONS: { bucket: DeadlineBucket; title: string; titleClass: string }[] = [
  { bucket: 'overdue', title: 'Quá hạn', titleClass: 'text-red-600' },
  { bucket: 'today', title: 'Hôm nay', titleClass: 'text-amber-700' },
  { bucket: 'week', title: '7 ngày tới', titleClass: 'text-slate-800' },
  { bucket: 'later', title: 'Sau đó', titleClass: 'text-slate-800' },
]

export function TasksPage() {
  const { data } = useAppStore()
  const today = todayISO()
  const [scope, setScope] = useState<Scope>('all')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Task | null>(null)
  const [creating, setCreating] = useState(false)

  const groupName = new Map(data.groups.map((g) => [g.id, g.name]))
  const memberName = new Map(data.members.map((m) => [m.id, m.name]))
  const q = query.trim().toLowerCase()

  const visible = data.tasks
    .filter((t) => (scope === 'all' ? true : scope === 'group' ? !!t.groupId : !t.groupId))
    .filter((t) => !q || t.title.toLowerCase().includes(q) || t.subject?.toLowerCase().includes(q))
    .sort(byDeadline)
  const doneTasks = visible.filter((t) => t.status === 'done')
  const openMinutes = sumMinutes(visible.filter((t) => t.status !== 'done'))

  const renderItem = (t: Task) => (
    <TaskItem
      key={t.id}
      task={t}
      today={today}
      groupName={t.groupId ? groupName.get(t.groupId) : undefined}
      assigneeName={t.assigneeId ? memberName.get(t.assigneeId) : undefined}
      onEdit={() => setEditing(t)}
    />
  )

  return (
    <>
      <PageHeader
        title="Việc học"
        subtitle={`${visible.length - doneTasks.length} việc chưa xong · ước lượng còn ${formatHours(openMinutes)}`}
        actions={<Button onClick={() => setCreating(true)}>+ Thêm việc</Button>}
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg bg-slate-200/70 p-1" role="group" aria-label="Lọc theo loại">
          {SCOPES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setScope(s.id)}
              aria-pressed={scope === s.id}
              className={`rounded-md px-3 py-1 text-sm font-medium transition ${scope === s.id ? 'bg-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Tìm theo tên hoặc môn…"
          aria-label="Tìm việc"
          className={`${inputClass} max-w-xs`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={q ? 'Không tìm thấy việc nào' : 'Chưa có việc nào'}
          hint={q ? 'Thử từ khoá khác.' : 'Thêm deadline đầu tiên để bắt đầu theo dõi.'}
          action={!q && <Button onClick={() => setCreating(true)}>+ Thêm việc</Button>}
        />
      ) : (
        <div className="space-y-6">
          {SECTIONS.map((section) => {
            const items = visible.filter((t) => deadlineBucket(t, today) === section.bucket)
            if (items.length === 0) return null
            return (
              <section key={section.bucket}>
                <h2 className="mb-2 flex items-baseline gap-2 text-sm font-semibold">
                  <span className={section.titleClass}>{section.title}</span>
                  <span className="font-normal text-slate-500">
                    {items.length} việc · ~{formatHours(sumMinutes(items))}
                  </span>
                </h2>
                <ul className="space-y-2">{items.map(renderItem)}</ul>
              </section>
            )
          })}
          {doneTasks.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-sm font-semibold text-slate-500">
                Đã xong ({doneTasks.length})
              </summary>
              <ul className="mt-2 space-y-2">{doneTasks.map(renderItem)}</ul>
            </details>
          )}
        </div>
      )}

      <TaskEditor
        open={creating || editing !== null}
        task={editing ?? undefined}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
      />
    </>
  )
}
