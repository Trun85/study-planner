import type { Task } from '../types'

// Ngày được lưu dạng "YYYY-MM-DD" theo giờ địa phương, tránh lệch múi giờ của toISOString().
const pad = (n: number) => String(n).padStart(2, '0')

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

function parse(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso: string, days: number): string {
  const d = parse(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function daysBetween(from: string, to: string): number {
  // Math.round bù cho ngày chuyển giờ mùa hè (23h hoặc 25h)
  return Math.round((parse(to).getTime() - parse(from).getTime()) / 86_400_000)
}

export type DeadlineBucket = 'overdue' | 'today' | 'week' | 'later' | 'done'

export function deadlineBucket(task: Pick<Task, 'dueDate' | 'status'>, today: string): DeadlineBucket {
  if (task.status === 'done') return 'done'
  const diff = daysBetween(today, task.dueDate)
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'today'
  if (diff <= 7) return 'week'
  return 'later'
}

export function formatDate(iso: string): string {
  return parse(iso).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

export function relativeLabel(iso: string, today: string): string {
  const diff = daysBetween(today, iso)
  if (diff === 0) return 'Hôm nay'
  if (diff === 1) return 'Ngày mai'
  if (diff < 0) return `Quá hạn ${-diff} ngày`
  return `Còn ${diff} ngày`
}

export function formatHours(minutes: number): string {
  const h = minutes / 60
  return `${Number.isInteger(h) ? h : h.toFixed(1)} giờ`
}
