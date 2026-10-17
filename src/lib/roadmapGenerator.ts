import { ROADMAP_TEMPLATES, type RoadmapTemplate } from '../data/roadmapTemplates'
import type { Level, RoadmapPlan, RoadmapStep } from '../types'
import { addDays, daysBetween } from './date'
import { newId } from './id'

export interface RoadmapInput {
  templateId: string
  level: Level
  hoursPerWeek: number
  startDate: string
}

/**
 * Cá nhân hoá bằng quy tắc:
 * 1. Trình độ "intermediate" bỏ qua các bước nền tảng (beginnerOnly).
 * 2. Xếp các bước lần lượt vào từng tuần sao cho mỗi tuần không vượt quá hoursPerWeek.
 *    Bước dài hơn quỹ giờ một tuần sẽ kéo dài qua nhiều tuần (week → endWeek).
 */
export function generateRoadmap(
  input: RoadmapInput,
  templates: RoadmapTemplate[] = ROADMAP_TEMPLATES,
): RoadmapPlan {
  const template = templates.find((t) => t.id === input.templateId)
  if (!template) throw new Error(`Không tìm thấy template: ${input.templateId}`)
  const hpw = input.hoursPerWeek
  if (!(hpw > 0)) throw new Error('Số giờ mỗi tuần phải lớn hơn 0')

  const picked = template.steps.filter((s) => input.level === 'beginner' || !s.beginnerOnly)

  let week = 1 // tuần đang xếp
  let used = 0 // số giờ đã dùng trong tuần đó
  const steps: RoadmapStep[] = picked.map((s) => {
    // Tuần hiện tại không còn đủ chỗ thì chuyển bước này sang tuần sau
    if (used > 0 && used + s.hours > hpw) {
      week++
      used = 0
    }
    const startWeek = week
    used += s.hours
    const endWeek = startWeek + Math.ceil(used / hpw) - 1
    week = startWeek + Math.floor(used / hpw)
    used = used % hpw
    return {
      id: newId(),
      title: s.title,
      description: s.description,
      week: startWeek,
      endWeek,
      estimatedHours: s.hours,
      resources: s.resources,
      done: false,
    }
  })

  return {
    id: newId(),
    templateId: template.id,
    topic: template.topic,
    level: input.level,
    hoursPerWeek: hpw,
    startDate: input.startDate,
    totalWeeks: steps.length ? Math.max(...steps.map((s) => s.endWeek)) : 0,
    steps,
    createdAt: new Date().toISOString(),
  }
}

/** Hôm nay là tuần thứ mấy của lộ trình (≤ 0 nghĩa là chưa bắt đầu). */
export function currentWeek(plan: Pick<RoadmapPlan, 'startDate'>, today: string): number {
  return Math.floor(daysBetween(plan.startDate, today) / 7) + 1
}

/** Các bước chưa xong mà lẽ ra phải xong trước tuần hiện tại. */
export function behindSteps(plan: RoadmapPlan, today: string): RoadmapStep[] {
  const week = currentWeek(plan, today)
  return plan.steps.filter((s) => !s.done && s.endWeek < week)
}

/** Hạn của một bước = ngày cuối của tuần kết thúc. */
export function stepDueDate(plan: Pick<RoadmapPlan, 'startDate'>, step: Pick<RoadmapStep, 'endWeek'>): string {
  return addDays(plan.startDate, step.endWeek * 7 - 1)
}
