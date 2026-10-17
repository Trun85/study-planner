import { describe, expect, it } from 'vitest'
import { addDays, daysBetween, deadlineBucket, formatHours } from './date'

describe('date', () => {
  it('cộng ngày qua ranh giới tháng và năm', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('đếm số ngày giữa hai mốc', () => {
    expect(daysBetween('2026-10-18', '2026-10-25')).toBe(7)
    expect(daysBetween('2026-10-18', '2026-10-17')).toBe(-1)
  })

  it('phân nhóm deadline', () => {
    const today = '2026-10-18'
    expect(deadlineBucket({ dueDate: '2026-10-17', status: 'todo' }, today)).toBe('overdue')
    expect(deadlineBucket({ dueDate: '2026-10-18', status: 'in_progress' }, today)).toBe('today')
    expect(deadlineBucket({ dueDate: '2026-10-25', status: 'todo' }, today)).toBe('week')
    expect(deadlineBucket({ dueDate: '2026-10-26', status: 'todo' }, today)).toBe('later')
    expect(deadlineBucket({ dueDate: '2026-10-01', status: 'done' }, today)).toBe('done')
  })

  it('hiển thị số giờ', () => {
    expect(formatHours(120)).toBe('2 giờ')
    expect(formatHours(90)).toBe('1.5 giờ')
  })
})
