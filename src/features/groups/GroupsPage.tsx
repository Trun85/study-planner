import { useState } from 'react'
import { Button, EmptyState, PageHeader, ProgressBar } from '../../components/ui'
import { formatDate, relativeLabel, todayISO } from '../../lib/date'
import { taskProgress } from '../../lib/progress'
import { useAppStore } from '../../store/context'
import type { ID } from '../../types'
import { Avatar } from './Avatar'
import { GroupDetail } from './GroupDetail'
import { GroupForm } from './GroupForm'

export function GroupsPage() {
  const { data } = useAppStore()
  const today = todayISO()
  const [selectedId, setSelectedId] = useState<ID | null>(null)
  const [creating, setCreating] = useState(false)

  const selected = data.groups.find((g) => g.id === selectedId)
  if (selected) return <GroupDetail group={selected} onBack={() => setSelectedId(null)} />

  return (
    <>
      <PageHeader
        eyebrow="Làm việc nhóm"
        title="Bài tập nhóm"
        subtitle="Giao việc cho từng thành viên và theo dõi tiến độ trên bảng Kanban."
        actions={<Button onClick={() => setCreating(true)}>+ Tạo nhóm</Button>}
      />

      {data.groups.length === 0 ? (
        <EmptyState
          title="Chưa có nhóm nào"
          hint="Tạo nhóm cho đồ án hoặc bài tập lớn để chia việc."
          action={<Button onClick={() => setCreating(true)}>+ Tạo nhóm</Button>}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {data.groups.map((g) => {
            const members = data.members.filter((m) => m.groupId === g.id)
            const p = taskProgress(data.tasks.filter((t) => t.groupId === g.id))
            return (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(g.id)}
                  className="w-full rounded-lg bg-card p-5 text-left shadow-paper ring-1 ring-line transition hover:-translate-y-0.5 hover:ring-accent focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <p className="font-display text-lg font-semibold">{g.name}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {[g.subject, g.deadline && `Hạn ${formatDate(g.deadline)} · ${p.total > 0 && p.done === p.total ? 'đã hoàn thành' : relativeLabel(g.deadline, today).toLowerCase()}`]
                      .filter(Boolean)
                      .join(' · ') || 'Chưa có hạn nộp'}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                      {members.slice(0, 5).map((m) => (
                        <span key={m.id} className="rounded-full ring-2 ring-card">
                          <Avatar name={m.name} size="md" />
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-muted">
                      {p.done}/{p.total} việc xong
                    </span>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={p.ratio} label={`Tiến độ nhóm ${g.name}`} />
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <GroupForm open={creating} onClose={() => setCreating(false)} onCreated={setSelectedId} />
    </>
  )
}
