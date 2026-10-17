import { useState, type DragEvent } from 'react'
import { deadlineBucket, formatHours, relativeLabel } from '../../lib/date'
import { STATUS_LABEL } from '../../lib/labels'
import { useAppStore } from '../../store/context'
import type { ID, Member, Task, TaskStatus } from '../../types'
import { Avatar } from './Avatar'

const COLUMNS: { status: TaskStatus; dot: string }[] = [
  { status: 'todo', dot: 'bg-slate-400' },
  { status: 'in_progress', dot: 'bg-sky-500' },
  { status: 'done', dot: 'bg-emerald-500' },
]

interface Props {
  tasks: Task[]
  members: Member[]
  today: string
  onEdit: (task: Task) => void
  onAdd: (status: TaskStatus) => void
}

/**
 * Kéo thả bằng HTML5 Drag and Drop có sẵn của trình duyệt (không cần thư viện):
 * thẻ đặt id vào dataTransfer khi bắt đầu kéo, cột đọc id đó khi thả rồi đổi status.
 * HTML5 DnD không chạy trên màn hình cảm ứng và không dùng được bằng bàn phím,
 * nên mỗi thẻ có thêm ô chọn trạng thái.
 */
export function KanbanBoard({ tasks, members, today, onEdit, onAdd }: Props) {
  const { dispatch } = useAppStore()
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null)
  const [draggingId, setDraggingId] = useState<ID | null>(null)
  const memberById = new Map(members.map((m) => [m.id, m]))

  const move = (id: ID, status: TaskStatus) => dispatch({ type: 'task/update', id, patch: { status } })

  function handleDrop(e: DragEvent<HTMLElement>, status: TaskStatus) {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    setDragOver(null)
    setDraggingId(null)
    if (id) move(id, status)
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {COLUMNS.map((col) => {
        const items = tasks.filter((t) => t.status === col.status)
        const active = dragOver === col.status
        return (
          <section
            key={col.status}
            aria-label={STATUS_LABEL[col.status]}
            onDragOver={(e) => {
              e.preventDefault() // bắt buộc, nếu không trình duyệt không cho thả
              e.dataTransfer.dropEffect = 'move'
              if (!active) setDragOver(col.status)
            }}
            onDragLeave={(e) => {
              // Chỉ tắt highlight khi rời hẳn cột, không phải khi đi qua thẻ con
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragOver(null)
            }}
            onDrop={(e) => handleDrop(e, col.status)}
            className={`flex min-h-48 flex-col rounded-xl p-3 transition ${active ? 'bg-indigo-50 ring-2 ring-indigo-400' : 'bg-slate-100'}`}
          >
            <header className="mb-3 flex items-center gap-2">
              <span className={`size-2 rounded-full ${col.dot}`} />
              <h3 className="text-sm font-semibold">{STATUS_LABEL[col.status]}</h3>
              <span className="text-xs text-slate-500">{items.length}</span>
              <button
                type="button"
                onClick={() => onAdd(col.status)}
                className="ml-auto rounded px-1.5 text-lg leading-none text-slate-500 hover:bg-white hover:text-slate-800"
                aria-label={`Thêm việc vào cột ${STATUS_LABEL[col.status]}`}
              >
                +
              </button>
            </header>

            <ul className="flex flex-1 flex-col gap-2">
              {items.map((t) => {
                const assignee = t.assigneeId ? memberById.get(t.assigneeId) : undefined
                const overdue = deadlineBucket(t, today) === 'overdue'
                return (
                  <li
                    key={t.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', t.id)
                      e.dataTransfer.effectAllowed = 'move'
                      setDraggingId(t.id)
                    }}
                    onDragEnd={() => {
                      setDraggingId(null)
                      setDragOver(null)
                    }}
                    className={`cursor-grab rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200 active:cursor-grabbing ${draggingId === t.id ? 'opacity-40' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => onEdit(t)}
                      className={`text-left text-sm font-medium break-words hover:text-indigo-700 ${t.status === 'done' ? 'text-slate-400 line-through' : ''}`}
                    >
                      {t.title}
                    </button>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        {assignee ? <Avatar name={assignee.name} /> : null}
                        {assignee?.name ?? 'Chưa giao'}
                      </span>
                      <span className={overdue ? 'font-medium text-red-600' : ''}>
                        {t.status === 'done' ? 'Đã xong' : relativeLabel(t.dueDate, today)}
                      </span>
                      {t.estimatedMinutes ? <span>~{formatHours(t.estimatedMinutes)}</span> : null}
                    </div>
                    <select
                      value={t.status}
                      onChange={(e) => move(t.id, e.target.value as TaskStatus)}
                      aria-label={`Chuyển trạng thái "${t.title}"`}
                      className="mt-2 w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600"
                    >
                      {COLUMNS.map((c) => (
                        <option key={c.status} value={c.status}>
                          {STATUS_LABEL[c.status]}
                        </option>
                      ))}
                    </select>
                  </li>
                )
              })}
              {items.length === 0 && (
                <li className="rounded-lg border-2 border-dashed border-slate-300 p-4 text-center text-xs text-slate-400">
                  Kéo thẻ vào đây
                </li>
              )}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
