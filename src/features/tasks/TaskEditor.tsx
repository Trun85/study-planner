import { useState, type FormEvent } from 'react'
import { Button, Field, Modal, inputClass } from '../../components/ui'
import { todayISO } from '../../lib/date'
import { newId } from '../../lib/id'
import { PRIORITY_LABEL, STATUS_LABEL } from '../../lib/labels'
import { useAppStore } from '../../store/context'
import type { ID, Priority, Task, TaskStatus } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  task?: Task // có → sửa, không có → thêm mới
  groupId?: ID // thêm việc vào nhóm này
  defaultStatus?: TaskStatus
}

export function TaskEditor({ open, onClose, task, groupId, defaultStatus }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={task ? 'Sửa việc' : 'Thêm việc'}>
      {/* Modal đóng thì form bị unmount, nên mỗi lần mở form có state mới */}
      <TaskForm task={task} groupId={groupId} defaultStatus={defaultStatus} onClose={onClose} />
    </Modal>
  )
}

function TaskForm({ task, groupId, defaultStatus, onClose }: Omit<Props, 'open'>) {
  const { data, dispatch } = useAppStore()
  const gid = task?.groupId ?? groupId
  const group = data.groups.find((g) => g.id === gid)
  const members = data.members.filter((m) => m.groupId === gid)

  const [title, setTitle] = useState(task?.title ?? '')
  const [subject, setSubject] = useState(task?.subject ?? group?.subject ?? '')
  const [dueDate, setDueDate] = useState(task?.dueDate ?? todayISO())
  const [hours, setHours] = useState(task?.estimatedMinutes ? String(task.estimatedMinutes / 60) : '')
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium')
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? defaultStatus ?? 'todo')
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId ?? '')
  const [description, setDescription] = useState(task?.description ?? '')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!title.trim()) return
    const h = Number(hours)
    const fields = {
      title: title.trim(),
      subject: subject.trim() || undefined,
      dueDate,
      estimatedMinutes: h > 0 ? Math.round(h * 60) : undefined,
      priority,
      status,
      assigneeId: assigneeId || undefined,
      description: description.trim() || undefined,
    }
    if (task) {
      dispatch({ type: 'task/update', id: task.id, patch: fields })
    } else {
      const now = new Date().toISOString()
      dispatch({
        type: 'task/add',
        task: { id: newId(), createdAt: now, groupId: gid, completedAt: status === 'done' ? now : undefined, ...fields },
      })
    }
    onClose()
  }

  function handleDelete() {
    if (task && confirm(`Xoá việc "${task.title}"?`)) {
      dispatch({ type: 'task/delete', id: task.id })
      onClose()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {group && <p className="text-sm text-muted">Nhóm: {group.name}</p>}
      <Field label="Tên việc *">
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Hạn chót *">
          <input type="date" className={inputClass} value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </Field>
        <Field label="Ước lượng (giờ)">
          <input
            type="number"
            min="0"
            step="0.5"
            inputMode="decimal"
            placeholder="vd: 1.5"
            className={inputClass}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
        </Field>
        <Field label="Ưu tiên">
          <select className={inputClass} value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Trạng thái">
          <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
            {(Object.keys(STATUS_LABEL) as TaskStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Môn học">
        <input className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="vd: Giải tích 2" />
      </Field>
      {gid && (
        <Field label="Giao cho">
          <select className={inputClass} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            <option value="">Chưa giao</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field label="Ghi chú">
        <textarea className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <div className="flex items-center gap-2 pt-2">
        {task && (
          <Button variant="danger" onClick={handleDelete}>
            Xoá
          </Button>
        )}
        <div className="flex-1" />
        <Button variant="secondary" onClick={onClose}>
          Huỷ
        </Button>
        <Button type="submit">{task ? 'Lưu' : 'Thêm'}</Button>
      </div>
    </form>
  )
}
