import { Badge, Button } from '../../components/ui'
import { deadlineBucket, formatDate, formatHours, relativeLabel } from '../../lib/date'
import { PRIORITY_LABEL } from '../../lib/labels'
import { useAppStore } from '../../store/context'
import type { Priority, Task } from '../../types'

interface Props {
  task: Task
  today: string
  groupName?: string
  assigneeName?: string
  compact?: boolean
  onEdit?: () => void
}

// Vạch màu ở mép trái thể hiện độ ưu tiên, như đánh dấu bằng bút màu bên lề
const PRIORITY_EDGE: Record<Priority, string> = {
  high: 'border-l-danger',
  medium: 'border-l-ochre',
  low: 'border-l-line',
}

export function TaskItem({ task, today, groupName, assigneeName, compact, onEdit }: Props) {
  const { dispatch } = useAppStore()
  const done = task.status === 'done'
  const bucket = deadlineBucket(task, today)

  return (
    <li
      className={`group flex items-start gap-3 rounded-md border-l-[3px] bg-card py-3 pr-2 pl-3.5 shadow-paper ring-1 ring-line transition hover:-translate-y-px ${done ? 'border-l-line opacity-75' : PRIORITY_EDGE[task.priority]}`}
    >
      <input
        type="checkbox"
        checked={done}
        onChange={() => dispatch({ type: 'task/update', id: task.id, patch: { status: done ? 'todo' : 'done' } })}
        aria-label={`Đánh dấu "${task.title}" là ${done ? 'chưa xong' : 'đã xong'}`}
        className="check"
      />
      <div className="min-w-0 flex-1">
        <p className={`font-medium break-words ${done ? 'struck' : ''}`}>{task.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          {done ? (
            <span>{formatDate(task.dueDate)} · đã xong</span>
          ) : bucket === 'overdue' || bucket === 'today' ? (
            <span className={`font-semibold ${bucket === 'overdue' ? 'text-danger' : 'text-ochre'}`}>
              {relativeLabel(task.dueDate, today).toLowerCase()}!
            </span>
          ) : (
            <span>
              {formatDate(task.dueDate)} · {relativeLabel(task.dueDate, today).toLowerCase()}
            </span>
          )}
          {task.estimatedMinutes ? <span>⏱ {formatHours(task.estimatedMinutes)}</span> : null}
          {!compact && !done && task.priority === 'high' && <Badge tone="danger">Ưu tiên {PRIORITY_LABEL.high.toLowerCase()}</Badge>}
          {task.status === 'in_progress' && <Badge tone="blue">Đang làm</Badge>}
          {!compact && task.subject && <Badge>{task.subject}</Badge>}
          {groupName && (
            <Badge tone="accent">
              {groupName}
              {assigneeName ? ` · ${assigneeName}` : ''}
            </Badge>
          )}
          {task.roadmapStepId && <Badge tone="moss">Lộ trình</Badge>}
        </div>
      </div>
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          aria-label={`Sửa "${task.title}"`}
        >
          Sửa
        </Button>
      )}
    </li>
  )
}
