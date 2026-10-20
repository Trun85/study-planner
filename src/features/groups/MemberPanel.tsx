import { useState, type FormEvent } from 'react'
import { Button, Card, ProgressBar, inputClass } from '../../components/ui'
import { newId } from '../../lib/id'
import { taskProgress } from '../../lib/progress'
import { useAppStore } from '../../store/context'
import type { Group, Member, Task } from '../../types'
import { Avatar } from './Avatar'

interface Props {
  group: Group
  members: Member[]
  tasks: Task[]
}

/** Danh sách thành viên kèm tiến độ từng người, và form thêm thành viên. */
export function MemberPanel({ group, members, tasks }: Props) {
  const { dispatch } = useAppStore()
  const [name, setName] = useState('')
  const unassigned = tasks.filter((t) => !t.assigneeId && t.status !== 'done').length

  function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim()) return
    dispatch({ type: 'member/add', member: { id: newId(), groupId: group.id, name: name.trim() } })
    setName('')
  }

  function handleRemove(member: Member) {
    if (confirm(`Xoá ${member.name} khỏi nhóm? Các việc của họ sẽ chuyển thành "Chưa giao".`)) {
      dispatch({ type: 'member/delete', id: member.id })
    }
  }

  return (
    <Card>
      <h2 className="mb-3 font-semibold">Thành viên ({members.length})</h2>
      <ul className="space-y-3">
        {members.map((m) => {
          const p = taskProgress(tasks.filter((t) => t.assigneeId === m.id))
          return (
            <li key={m.id} className="flex items-center gap-3">
              <Avatar name={m.name} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-medium">
                    {m.name}
                    {m.isMe && <span className="ml-1 text-xs font-normal text-muted">(bạn)</span>}
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {p.done}/{p.total} việc
                  </span>
                </div>
                <ProgressBar value={p.ratio} label={`Tiến độ của ${m.name}`} />
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleRemove(m)} aria-label={`Xoá ${m.name}`}>
                ✕
              </Button>
            </li>
          )
        })}
      </ul>
      {unassigned > 0 && <p className="mt-3 text-xs text-ochre">{unassigned} việc chưa giao cho ai.</p>}
      <form onSubmit={handleAdd} className="mt-4 flex gap-2">
        <input
          className={inputClass}
          placeholder="Tên thành viên mới"
          aria-label="Tên thành viên mới"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit" variant="secondary" disabled={!name.trim()}>
          Thêm
        </Button>
      </form>
    </Card>
  )
}
