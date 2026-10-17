import { addDays, todayISO } from '../lib/date'
import { newId } from '../lib/id'
import { generateRoadmap } from '../lib/roadmapGenerator'
import type { AppData, Group, Member, Task } from '../types'

/** Dữ liệu mẫu cho demo. Ngày tính theo hôm nay để lúc nào mở cũng có việc quá hạn / sắp tới. */
export function createSeedData(today: string = todayISO()): AppData {
  const now = new Date().toISOString()
  const d = (offset: number) => addDays(today, offset)

  const task = (t: Omit<Task, 'id' | 'createdAt'>): Task => ({
    id: newId(),
    createdAt: now,
    completedAt: t.status === 'done' ? now : undefined,
    ...t,
  })

  const personal: Task[] = [
    task({ title: 'Nộp báo cáo thực hành Mạng máy tính', subject: 'Mạng máy tính', dueDate: d(-1), estimatedMinutes: 120, priority: 'high', status: 'todo' }),
    task({ title: 'Ôn tập giữa kỳ Giải tích 2', subject: 'Giải tích 2', dueDate: d(0), estimatedMinutes: 180, priority: 'high', status: 'in_progress' }),
    task({ title: 'Đọc chương 4 Kinh tế vi mô', subject: 'Kinh tế vi mô', dueDate: d(2), estimatedMinutes: 60, priority: 'medium', status: 'todo' }),
    task({ title: 'Bài tập lớn Lập trình hướng đối tượng', subject: 'OOP', dueDate: d(6), estimatedMinutes: 300, priority: 'high', status: 'todo' }),
    task({ title: 'Đăng ký học phần kỳ sau', dueDate: d(12), estimatedMinutes: 30, priority: 'low', status: 'todo' }),
    task({ title: 'Làm quiz tiếng Anh online', subject: 'Tiếng Anh', dueDate: d(-3), estimatedMinutes: 20, priority: 'low', status: 'done' }),
  ]

  const group: Group = {
    id: newId(),
    name: 'Đồ án CSDL – Nhóm 3',
    subject: 'Cơ sở dữ liệu',
    deadline: d(14),
    createdAt: now,
  }
  const member = (name: string, isMe = false): Member => ({ id: newId(), groupId: group.id, name, isMe })
  const [me, an, binh, chi] = [member('Bạn', true), member('An'), member('Bình'), member('Chi')]

  const groupTasks: Task[] = [
    task({ title: 'Thiết kế ERD', groupId: group.id, assigneeId: an.id, dueDate: d(-2), estimatedMinutes: 180, priority: 'high', status: 'done' }),
    task({ title: 'Viết script tạo bảng', groupId: group.id, assigneeId: binh.id, dueDate: d(3), estimatedMinutes: 120, priority: 'high', status: 'in_progress' }),
    task({ title: 'Nhập dữ liệu mẫu', groupId: group.id, assigneeId: chi.id, dueDate: d(5), estimatedMinutes: 90, priority: 'medium', status: 'todo' }),
    task({ title: 'Viết truy vấn báo cáo', groupId: group.id, assigneeId: me.id, dueDate: d(8), estimatedMinutes: 240, priority: 'medium', status: 'todo' }),
    task({ title: 'Làm slide thuyết trình', groupId: group.id, dueDate: d(12), estimatedMinutes: 120, priority: 'low', status: 'todo' }),
  ].map((t) => ({ ...t, subject: group.subject }))

  const roadmap = generateRoadmap({ templateId: 'react-frontend', level: 'beginner', hoursPerWeek: 8, startDate: d(-7) })
  roadmap.steps[0].done = true

  return {
    version: 1,
    tasks: [...personal, ...groupTasks],
    groups: [group],
    members: [me, an, binh, chi],
    roadmaps: [roadmap],
  }
}
