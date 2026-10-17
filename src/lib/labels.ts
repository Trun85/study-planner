import type { Level, Priority, TaskStatus } from '../types'

export type Tab = 'dashboard' | 'tasks' | 'groups' | 'roadmap'
export type Tone = 'slate' | 'indigo' | 'sky' | 'emerald' | 'amber' | 'red'

export const PRIORITY_LABEL: Record<Priority, string> = { low: 'Thấp', medium: 'Vừa', high: 'Cao' }
export const PRIORITY_TONE: Record<Priority, Tone> = { low: 'slate', medium: 'amber', high: 'red' }
export const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

export const STATUS_LABEL: Record<TaskStatus, string> = { todo: 'Cần làm', in_progress: 'Đang làm', done: 'Xong' }

export const LEVEL_LABEL: Record<Level, string> = { beginner: 'Mới bắt đầu', intermediate: 'Đã có nền tảng' }
