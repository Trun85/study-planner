import { describe, expect, it } from 'vitest'
import { ROADMAP_TEMPLATES } from '../data/roadmapTemplates'
import { behindSteps, currentWeek, generateRoadmap, stepDueDate } from './roadmapGenerator'

const base = { templateId: 'react-frontend', level: 'beginner' as const, startDate: '2026-10-19' }

describe('generateRoadmap', () => {
  it('học ít giờ mỗi tuần thì lộ trình dài hơn', () => {
    const slow = generateRoadmap({ ...base, hoursPerWeek: 5 })
    const fast = generateRoadmap({ ...base, hoursPerWeek: 10 })
    expect(slow.totalWeeks).toBeGreaterThan(fast.totalWeeks)
  })

  it('trình độ intermediate bỏ qua các bước nền tảng', () => {
    const template = ROADMAP_TEMPLATES.find((t) => t.id === 'react-frontend')!
    const beginner = generateRoadmap({ ...base, hoursPerWeek: 8 })
    const intermediate = generateRoadmap({ ...base, level: 'intermediate', hoursPerWeek: 8 })
    expect(beginner.steps).toHaveLength(template.steps.length)
    expect(intermediate.steps).toHaveLength(template.steps.filter((s) => !s.beginnerOnly).length)
  })

  it('xếp tuần theo thứ tự và không tuần nào bắt đầu quá quỹ giờ', () => {
    for (const template of ROADMAP_TEMPLATES) {
      const plan = generateRoadmap({ ...base, templateId: template.id, hoursPerWeek: 6 })
      plan.steps.forEach((s, i) => {
        expect(s.endWeek).toBeGreaterThanOrEqual(s.week)
        if (i > 0) expect(s.week).toBeGreaterThanOrEqual(plan.steps[i - 1].week)
      })
      // Tổng giờ của các bước chỉ nằm gọn trong một tuần không vượt quá quỹ giờ tuần đó
      const perWeek = new Map<number, number>()
      plan.steps
        .filter((s) => s.week === s.endWeek && s.estimatedHours <= 6)
        .forEach((s) => perWeek.set(s.week, (perWeek.get(s.week) ?? 0) + s.estimatedHours))
      perWeek.forEach((hours) => expect(hours).toBeLessThanOrEqual(6))
    }
  })

  it('bước dài kéo qua nhiều tuần', () => {
    // Bước đầu 8 giờ, quỹ 4 giờ/tuần → tuần 1 đến 2
    const plan = generateRoadmap({ ...base, hoursPerWeek: 4 })
    expect(plan.steps[0]).toMatchObject({ week: 1, endWeek: 2 })
    expect(plan.steps[1].week).toBe(3)
  })

  it('hạn của bước là ngày cuối tuần kết thúc', () => {
    expect(stepDueDate({ startDate: '2026-10-19' }, { endWeek: 1 })).toBe('2026-10-25')
    expect(stepDueDate({ startDate: '2026-10-19' }, { endWeek: 2 })).toBe('2026-11-01')
  })

  it('tính tuần hiện tại và các bước bị chậm', () => {
    const plan = generateRoadmap({ ...base, hoursPerWeek: 8 }) // bắt đầu 19/10
    expect(currentWeek(plan, '2026-10-18')).toBe(0) // chưa bắt đầu
    expect(currentWeek(plan, '2026-10-19')).toBe(1)
    expect(currentWeek(plan, '2026-10-26')).toBe(2)
    expect(behindSteps(plan, '2026-10-19')).toHaveLength(0)
    // Sang tuần 2 mà bước tuần 1 chưa xong → bị chậm
    expect(behindSteps(plan, '2026-10-26').map((s) => s.endWeek)).toEqual([1])
  })

  it('báo lỗi khi input không hợp lệ', () => {
    expect(() => generateRoadmap({ ...base, templateId: 'khong-co', hoursPerWeek: 5 })).toThrow()
    expect(() => generateRoadmap({ ...base, hoursPerWeek: 0 })).toThrow()
  })
})
