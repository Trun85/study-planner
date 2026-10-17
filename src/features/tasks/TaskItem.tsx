import { Badge, Button } from '../../components/ui'
import { deadlineBucket, formatDate, formatHours, relativeLabel } from '../../lib/date'
import { PRIORITY_LABEL, PRIORITY_TONE } from '../../lib/labels'
import { useAppStore } from '../../store/context'
import type { Task } from '../../types'

interface Props {
  task: Task
  today: string
  groupName?: string
  assigneeName?: string
  compact?: boolean
  onEdit?: () => void
}

export function TaskItem({ task, today, groupName, assigneeName, compact, onEdit }: Props) {
  const { dispatch } = useAppStore()
  const done = task.status === 'done'
  const bucket = deadlineBucket(task, today)
  const dueClass =
    bucket === 'overdue' ? 'font-medium text-red-600' : bucket === 'today' ? 'font-medium text-amber-700' : 'text-slate-500'

  return (
    <li className="flex items-start gap-3 rounded-lg bg-white p-3 ring-1 ring-slate-200">
      <input
        type="checkbox"
        checked={done}
        onChange={() => dispatch({ type: 'task/update', id: task.id, patch: { status: done ? 'todo' : 'done' } })}
        aria-label={`Đánh dấu "${task.title}" là ${done ? 'chưa xong' : 'đã xong'}`}
        className="mt-1 size-4 shrink-0 accent-indigo-600"
      />
      <div className="min-w-0 flex-1">
        <p className={`font-medium break-words ${done ? 'text-slate-400 line-through' : ''}`}>{task.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className={dueClass}>
            {formatDate(task.dueDate)} · {done ? 'Đã xong' : relativeLabel(task.dueDate, today)}
          </span>
          {task.estimatedMinutes ? <span className="text-slate-500">~{formatHours(task.estimatedMinutes)}</span> : null}
          {!compact && !done && <Badge tone={PRIORITY_TONE[task.priority]}>Ưu tiên {PRIORITY_LABEL[task.priority].toLowerCase()}</Badge>}
          {task.status === 'in_progress' && <Badge tone="sky">Đang làm</Badge>}
          {!compact && task.subject && <Badge>{task.subject}</Badge>}
          {groupName && (
            <Badge tone="indigo">
              {groupName}
              {assigneeName ? ` · ${assigneeName}` : ''}
            </Badge>
          )}
          {task.roadmapStepId && <Badge tone="emerald">Lộ trình</Badge>}
        </div>
      </div>
      {onEdit && (
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Sửa
        </Button>
      )}
    </li>
  )
}
