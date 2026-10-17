import { useState, type FormEvent } from 'react'
import { Button, Field, Modal, inputClass } from '../../components/ui'
import { newId } from '../../lib/id'
import { useAppStore } from '../../store/context'
import type { Group, ID } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  group?: Group // có → sửa, không có → tạo mới
  onCreated?: (id: ID) => void
}

export function GroupForm({ open, onClose, group, onCreated }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={group ? 'Sửa nhóm' : 'Tạo nhóm mới'}>
      <GroupFormBody group={group} onClose={onClose} onCreated={onCreated} />
    </Modal>
  )
}

function GroupFormBody({ group, onClose, onCreated }: Omit<Props, 'open'>) {
  const { dispatch } = useAppStore()
  const [name, setName] = useState(group?.name ?? '')
  const [subject, setSubject] = useState(group?.subject ?? '')
  const [deadline, setDeadline] = useState(group?.deadline ?? '')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim()) return
    const fields = { name: name.trim(), subject: subject.trim() || undefined, deadline: deadline || undefined }
    if (group) {
      dispatch({ type: 'group/update', id: group.id, patch: fields })
    } else {
      const id = newId()
      dispatch({ type: 'group/add', group: { id, createdAt: new Date().toISOString(), ...fields } })
      // Người dùng luôn là một thành viên của nhóm mình tạo
      dispatch({ type: 'member/add', member: { id: newId(), groupId: id, name: 'Bạn', isMe: true } })
      onCreated?.(id)
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Tên nhóm *">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="vd: Đồ án CSDL – Nhóm 3" required autoFocus />
      </Field>
      <Field label="Môn học">
        <input className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} />
      </Field>
      <Field label="Hạn nộp cuối">
        <input type="date" className={inputClass} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          Huỷ
        </Button>
        <Button type="submit">{group ? 'Lưu' : 'Tạo nhóm'}</Button>
      </div>
    </form>
  )
}
