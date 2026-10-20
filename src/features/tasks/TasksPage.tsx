import { useState, type CSSProperties } from 'react'
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
  { bucket: 'overdue', title: 'Quá hạn', titleClass: 'text-danger' },
  { bucket: 'today', title: 'Hôm nay', titleClass: 'text-ochre' },
  { bucket: 'week', title: '7 ngày tới', titleClass: 'text-ink' },
  { bucket: 'later', title: 'Sau đó', titleClass: 'text-ink' },
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
        eyebrow="Sổ deadline"
        title="Việc học"
        subtitle={`${visible.length - doneTasks.length} việc chưa xong · ước lượng còn ${formatHours(openMinutes)}`}
        actions={<Button onClick={() => setCreating(true)}>+ Thêm việc</Button>}
      />

      <div className="rise mb-8 flex flex-wrap items-center gap-3" style={{ '--i': 1 } as CSSProperties}>
        <div className="inline-flex gap-1" role="group" aria-label="Lọc theo loại">
          {SCOPES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setScope(s.id)}
              aria-pressed={scope === s.id}
              className={`rounded-full px-3.5 py-1 text-sm font-medium ring-1 transition ${scope === s.id ? 'bg-ink text-paper ring-ink' : 'text-ink-soft ring-line hover:bg-sunken hover:text-ink'}`}
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
        <div className="space-y-9">
          {SECTIONS.map((section, i) => {
            const items = visible.filter((t) => deadlineBucket(t, today) === section.bucket)
            if (items.length === 0) return null
            return (
              <section key={section.bucket} className="rise" style={{ '--i': i + 2 } as CSSProperties}>
                <h2 className="mb-3 flex items-baseline gap-3 border-b border-dashed border-line pb-1.5">
                  <span className={`text-xl font-semibold ${section.titleClass}`}>{section.title}</span>
                  <span className="text-sm text-muted">
                    {items.length} việc · ~{formatHours(sumMinutes(items))}
                  </span>
                </h2>
                <ul className="space-y-2">{items.map(renderItem)}</ul>
              </section>
            )
          })}
          {doneTasks.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer font-display text-lg text-muted italic hover:text-ink">
                Đã xong ({doneTasks.length}) <span className="inline-block transition group-open:rotate-90">›</span>
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
