import { describe, expect, it } from 'vitest'
import { deadlineBucket } from '../lib/date'
import { taskProgress } from '../lib/progress'
import { behindSteps, currentWeek } from '../lib/roadmapGenerator'
import { createSeedData } from './seed'

// Thử với vài ngày khác nhau: dữ liệu mẫu phải "trông thật" bất kể hôm nay là ngày nào
const DAYS = ['2026-10-19', '2026-12-31', '2027-03-01']

describe.each(DAYS)('dữ liệu mẫu ngày %s', (today) => {
  const data = createSeedData(today)
  const now = new Date(`${today}T23:59:59`).getTime()

  it('có việc ở mọi nhóm deadline và có lịch sử việc đã xong', () => {
    const buckets = new Set(data.tasks.map((t) => deadlineBucket(t, today)))
    expect([...buckets].sort()).toEqual(['done', 'later', 'overdue', 'today', 'week'])
  })

  it('không có việc nào hoàn thành ở tương lai, việc chưa xong thì không có completedAt', () => {
    for (const t of data.tasks) {
      if (t.status === 'done') expect(new Date(t.completedAt!).getTime()).toBeLessThanOrEqual(now)
      else expect(t.completedAt).toBeUndefined()
      expect(new Date(t.createdAt).getTime()).toBeLessThanOrEqual(now)
    }
  })

  it('mọi liên kết đều hợp lệ', () => {
    const groupIds = new Set(data.groups.map((g) => g.id))
    const memberIds = new Set(data.members.map((m) => m.id))
    const stepIds = new Set(data.roadmaps.flatMap((p) => p.steps.map((s) => s.id)))
    for (const t of data.tasks) {
      if (t.groupId) expect(groupIds.has(t.groupId)).toBe(true)
      if (t.assigneeId) expect(memberIds.has(t.assigneeId)).toBe(true)
      if (t.roadmapStepId) expect(stepIds.has(t.roadmapStepId)).toBe(true)
    }
    // Mỗi nhóm có đúng một thành viên là người dùng
    for (const g of data.groups) expect(data.members.filter((m) => m.groupId === g.id && m.isMe)).toHaveLength(1)
  })

  it('các nhóm ở giai đoạn khác nhau, có một nhóm đã xong hết', () => {
    const ratios = data.groups.map((g) => taskProgress(data.tasks.filter((t) => t.groupId === g.id)).ratio)
    expect(ratios).toContain(1)
    expect(ratios.some((r) => r > 0 && r < 1)).toBe(true)
  })

  it('lộ trình: một đúng tiến độ, một chậm 1 bước, một chưa bắt đầu', () => {
    const [react, git, python] = data.roadmaps
    expect(behindSteps(react, today)).toHaveLength(0)
    expect(react.steps.some((s) => s.done)).toBe(true)
    expect(behindSteps(git, today)).toHaveLength(1)
    expect(currentWeek(python, today)).toBeLessThan(1)
  })
})
