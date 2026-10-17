import type { RoadmapStep, Task } from '../types'
import { PRIORITY_ORDER } from './labels'

export interface Progress {
  done: number
  total: number
  ratio: number // 0..1
}

const make = (done: number, total: number): Progress => ({ done, total, ratio: total ? done / total : 0 })

export const taskProgress = (tasks: Pick<Task, 'status'>[]): Progress =>
  make(tasks.filter((t) => t.status === 'done').length, tasks.length)

export const stepProgress = (steps: Pick<RoadmapStep, 'done'>[]): Progress =>
  make(steps.filter((s) => s.done).length, steps.length)

export const sumMinutes = (tasks: Pick<Task, 'estimatedMinutes'>[]): number =>
  tasks.reduce((sum, t) => sum + (t.estimatedMinutes ?? 0), 0)

/** Hạn sớm trước; cùng hạn thì ưu tiên cao trước. */
export const byDeadline = (a: Task, b: Task): number =>
  a.dueDate.localeCompare(b.dueDate) || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
