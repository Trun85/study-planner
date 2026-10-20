import { useState } from 'react'
import { Badge, Button, Card, PageHeader, ProgressBar } from '../../components/ui'
import { formatDate, formatHours, relativeLabel, todayISO } from '../../lib/date'
import { byDeadline, sumMinutes, taskProgress } from '../../lib/progress'
import { useAppStore } from '../../store/context'
import type { Group, Task, TaskStatus } from '../../types'
import { TaskEditor } from '../tasks/TaskEditor'
import { GroupForm } from './GroupForm'
import { KanbanBoard } from './KanbanBoard'
import { MemberPanel } from './MemberPanel'

export function GroupDetail({ group, onBack }: { group: Group; onBack: () => void }) {
  const { data, dispatch } = useAppStore()
  const today = todayISO()
  const members = data.members.filter((m) => m.groupId === group.id)
  const tasks = data.tasks.filter((t) => t.groupId === group.id).sort(byDeadline)
  const overall = taskProgress(tasks)
  const remaining = sumMinutes(tasks.filter((t) => t.status !== 'done'))

  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus | null>(null)
  const [editingGroup, setEditingGroup] = useState(false)

  function handleDelete() {
    if (confirm(`Xoá nhóm "${group.name}"? Toàn bộ thành viên và việc của nhóm sẽ bị xoá.`)) {
      dispatch({ type: 'group/delete', id: group.id })
      onBack()
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-3 -ml-2">
        ← Tất cả nhóm
      </Button>
      <PageHeader
        title={group.name}
        subtitle={[group.subject, group.deadline && `Hạn nộp ${formatDate(group.deadline)} (${overall.total > 0 && overall.done === overall.total ? 'đã hoàn thành' : relativeLabel(group.deadline, today).toLowerCase()})`]
          .filter(Boolean)
          .join(' · ')}
        actions={
          <>
            <Button variant="secondary" onClick={() => setEditingGroup(true)}>
              Sửa nhóm
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Xoá nhóm
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card className="self-start lg:col-span-1">
          <h2 className="mb-1 font-semibold">Tiến độ chung</h2>
          <p className="mb-3 text-sm text-muted">
            {overall.done}/{overall.total} việc xong · còn ~{formatHours(remaining)}
          </p>
          <ProgressBar value={overall.ratio} label="Tiến độ chung của nhóm" />
          {overall.total > 0 && overall.done === overall.total && (
            <div className="mt-3">
              <Badge tone="moss">Đã hoàn thành tất cả việc</Badge>
            </div>
          )}
        </Card>
        <div className="lg:col-span-2">
          <MemberPanel group={group} members={members} tasks={tasks} />
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Bảng công việc</h2>
        <Button size="sm" onClick={() => setNewTaskStatus('todo')}>
          + Thêm việc
        </Button>
      </div>
      <KanbanBoard tasks={tasks} members={members} today={today} onEdit={setEditingTask} onAdd={setNewTaskStatus} />

      <TaskEditor
        open={editingTask !== null || newTaskStatus !== null}
        task={editingTask ?? undefined}
        groupId={group.id}
        defaultStatus={newTaskStatus ?? undefined}
        onClose={() => {
          setEditingTask(null)
          setNewTaskStatus(null)
        }}
      />
      <GroupForm open={editingGroup} group={group} onClose={() => setEditingGroup(false)} />
    </>
  )
}
