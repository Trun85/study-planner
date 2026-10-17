import { useState } from 'react'
import { Button, EmptyState, PageHeader, ProgressBar } from '../../components/ui'
import { todayISO } from '../../lib/date'
import { LEVEL_LABEL } from '../../lib/labels'
import { stepProgress } from '../../lib/progress'
import { behindSteps, currentWeek } from '../../lib/roadmapGenerator'
import { useAppStore } from '../../store/context'
import type { ID } from '../../types'
import { RoadmapForm } from './RoadmapForm'
import { RoadmapView } from './RoadmapView'

export function RoadmapPage() {
  const { data } = useAppStore()
  const today = todayISO()
  const [selectedId, setSelectedId] = useState<ID | null>(null)
  const [creating, setCreating] = useState(false)

  if (creating) {
    return (
      <RoadmapForm
        onCancel={() => setCreating(false)}
        onCreated={(id) => {
          setCreating(false)
          setSelectedId(id)
        }}
      />
    )
  }

  const selected = data.roadmaps.find((p) => p.id === selectedId)
  if (selected) return <RoadmapView plan={selected} onBack={() => setSelectedId(null)} />

  return (
    <>
      <PageHeader
        title="Lộ trình tự học"
        subtitle="Kế hoạch theo tuần, tính theo trình độ và quỹ thời gian của bạn."
        actions={<Button onClick={() => setCreating(true)}>+ Tạo lộ trình</Button>}
      />
      {data.roadmaps.length === 0 ? (
        <EmptyState
          title="Chưa có lộ trình nào"
          hint="Chọn một chủ đề công nghệ muốn học, app sẽ lên kế hoạch theo tuần cho bạn."
          action={<Button onClick={() => setCreating(true)}>+ Tạo lộ trình</Button>}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {data.roadmaps.map((plan) => {
            const p = stepProgress(plan.steps)
            const week = currentWeek(plan, today)
            const behind = behindSteps(plan, today).length
            return (
              <li key={plan.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(plan.id)}
                  className="w-full rounded-xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 transition hover:ring-indigo-300 focus-visible:outline-2 focus-visible:outline-indigo-500"
                >
                  <p className="font-semibold">{plan.topic}</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {LEVEL_LABEL[plan.level]} · {plan.hoursPerWeek} giờ/tuần ·{' '}
                    {week >= 1 ? `tuần ${Math.min(week, plan.totalWeeks)}/${plan.totalWeeks}` : 'chưa bắt đầu'}
                  </p>
                  <div className="mt-3">
                    <ProgressBar value={p.ratio} label={`Tiến độ ${plan.topic}`} />
                  </div>
                  {behind > 0 && <p className="mt-2 text-xs text-amber-700">Chậm {behind} bước so với kế hoạch</p>}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
