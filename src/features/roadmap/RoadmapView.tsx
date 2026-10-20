import { Badge, Button, Card, PageHeader, ProgressBar } from '../../components/ui'
import { daysBetween, formatDate, todayISO } from '../../lib/date'
import { newId } from '../../lib/id'
import { LEVEL_LABEL } from '../../lib/labels'
import { stepProgress } from '../../lib/progress'
import { behindSteps, currentWeek, stepDueDate } from '../../lib/roadmapGenerator'
import { useAppStore } from '../../store/context'
import type { RoadmapPlan, RoadmapStep } from '../../types'

export function RoadmapView({ plan, onBack }: { plan: RoadmapPlan; onBack: () => void }) {
  const { data, dispatch } = useAppStore()
  const today = todayISO()
  const progress = stepProgress(plan.steps)
  const week = currentWeek(plan, today)
  const behind = new Set(behindSteps(plan, today).map((s) => s.id))
  const linkedStepIds = new Set(data.tasks.map((t) => t.roadmapStepId).filter(Boolean))

  // Gom các bước theo tuần bắt đầu
  const weeks = new Map<number, RoadmapStep[]>()
  for (const s of plan.steps) weeks.set(s.week, [...(weeks.get(s.week) ?? []), s])

  function addToTasks(step: RoadmapStep) {
    dispatch({
      type: 'task/add',
      task: {
        id: newId(),
        title: step.title,
        subject: plan.topic,
        description: step.description,
        dueDate: stepDueDate(plan, step),
        estimatedMinutes: step.estimatedHours * 60,
        priority: 'medium',
        status: step.done ? 'done' : 'todo',
        roadmapStepId: step.id,
        createdAt: new Date().toISOString(),
      },
    })
  }

  function handleDelete() {
    if (confirm(`Xoá lộ trình "${plan.topic}"? Các việc đã đưa sang tab Việc học vẫn được giữ lại.`)) {
      dispatch({ type: 'roadmap/delete', id: plan.id })
      onBack()
    }
  }

  const status =
    week < 1
      ? { tone: 'neutral' as const, text: `Bắt đầu sau ${daysBetween(today, plan.startDate)} ngày` }
      : progress.done === progress.total
        ? { tone: 'moss' as const, text: 'Đã hoàn thành lộ trình' }
        : behind.size > 0
          ? { tone: 'ochre' as const, text: `Chậm ${behind.size} bước so với kế hoạch` }
          : { tone: 'moss' as const, text: 'Đúng tiến độ' }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-3 -ml-2">
        ← Tất cả lộ trình
      </Button>
      <PageHeader
        title={plan.topic}
        subtitle={`${LEVEL_LABEL[plan.level]} · ${plan.hoursPerWeek} giờ/tuần · bắt đầu ${formatDate(plan.startDate)}`}
        actions={
          <Button variant="danger" onClick={handleDelete}>
            Xoá lộ trình
          </Button>
        }
      />

      <Card className="mb-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm">
            <span className="font-semibold">
              {progress.done}/{progress.total} bước
            </span>
            <span className="text-muted">
              {' '}
              · {week >= 1 ? `tuần ${Math.min(week, plan.totalWeeks)}/${plan.totalWeeks}` : `${plan.totalWeeks} tuần`}
            </span>
          </p>
          <Badge tone={status.tone}>{status.text}</Badge>
        </div>
        <ProgressBar value={progress.ratio} label={`Tiến độ lộ trình ${plan.topic}`} />
      </Card>

      <ol className="space-y-6">
        {[...weeks.entries()].map(([w, steps]) => (
          <li key={w}>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              Tuần {w}
              {w === week && <Badge tone="accent">Tuần này</Badge>}
            </h2>
            <ul className="space-y-2">
              {steps.map((s) => (
                <li
                  key={s.id}
                  className={`flex items-start gap-3 rounded-lg bg-card p-3 ring-1 ${behind.has(s.id) ? 'ring-ochre' : 'ring-line'}`}
                >
                  <input
                    type="checkbox"
                    checked={s.done}
                    onChange={() => dispatch({ type: 'roadmap/toggleStep', planId: plan.id, stepId: s.id })}
                    aria-label={`Đánh dấu "${s.title}" là ${s.done ? 'chưa xong' : 'đã xong'}`}
                    className="check"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium ${s.done ? 'struck' : ''}`}>{s.title}</p>
                    <p className="mt-0.5 text-sm text-ink-soft">{s.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                      <span>
                        {s.endWeek > s.week ? `Tuần ${s.week}–${s.endWeek} · ` : ''}~{s.estimatedHours} giờ · hạn{' '}
                        {formatDate(stepDueDate(plan, s))}
                      </span>
                      {behind.has(s.id) && <Badge tone="ochre">Chậm tiến độ</Badge>}
                      {s.resources.map((r) => (
                        <a
                          key={r.url}
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent underline-offset-2 hover:underline"
                        >
                          {r.title} ↗
                        </a>
                      ))}
                    </div>
                  </div>
                  {linkedStepIds.has(s.id) ? (
                    <Badge tone="moss">Đã có trong Việc học</Badge>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => addToTasks(s)}>
                      + Việc học
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </>
  )
}
