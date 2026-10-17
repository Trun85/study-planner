import { Button, Card, PageHeader, ProgressBar } from '../../components/ui'
import { addDays, deadlineBucket, formatDate, formatHours, todayISO } from '../../lib/date'
import type { Tab } from '../../lib/labels'
import { byDeadline, stepProgress, sumMinutes, taskProgress } from '../../lib/progress'
import { behindSteps } from '../../lib/roadmapGenerator'
import { useAppStore } from '../../store/context'
import { TaskItem } from '../tasks/TaskItem'

export function Dashboard({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { data } = useAppStore()
  const today = todayISO()
  const open = data.tasks.filter((t) => t.status !== 'done').sort(byDeadline)
  const overdue = open.filter((t) => deadlineBucket(t, today) === 'overdue')
  const dueToday = open.filter((t) => deadlineBucket(t, today) === 'today')
  const dueWeek = open.filter((t) => deadlineBucket(t, today) === 'week')
  const upcoming = [...overdue, ...dueToday, ...dueWeek]
  const groupName = new Map(data.groups.map((g) => [g.id, g.name]))
  const memberName = new Map(data.members.map((m) => [m.id, m.name]))

  // Khối lượng 7 ngày tới, theo tổng giờ ước lượng của các việc đến hạn mỗi ngày
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i)
    return { date, minutes: sumMinutes(open.filter((t) => t.dueDate === date)) }
  })
  const maxMinutes = Math.max(60, ...days.map((d) => d.minutes))

  const stats = [
    { label: 'Quá hạn', value: overdue.length, sub: formatHours(sumMinutes(overdue)), accent: overdue.length ? 'text-red-600' : '' },
    { label: 'Hôm nay', value: dueToday.length, sub: formatHours(sumMinutes(dueToday)), accent: dueToday.length ? 'text-amber-700' : '' },
    { label: '7 ngày tới', value: dueWeek.length, sub: formatHours(sumMinutes(dueWeek)), accent: '' },
    { label: 'Cần học tuần này', value: formatHours(sumMinutes(upcoming)), sub: 'gồm cả việc quá hạn', accent: 'text-indigo-700' },
  ]

  return (
    <>
      <PageHeader title="Tổng quan" subtitle={`Hôm nay, ${formatDate(today)}`} />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-xs font-medium text-slate-500">{s.label}</p>
            <p className={`mt-1 text-2xl font-bold tabular-nums ${s.accent}`}>{s.value}</p>
            <p className="text-xs text-slate-500">{s.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Cần làm sớm</h2>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('tasks')}>
                Xem tất cả →
              </Button>
            </div>
            {upcoming.length === 0 ? (
              <p className="text-sm text-slate-500">Không có việc nào đến hạn trong 7 ngày tới.</p>
            ) : (
              <ul className="space-y-2">
                {upcoming.slice(0, 6).map((t) => (
                  <TaskItem
                    key={t.id}
                    task={t}
                    today={today}
                    compact
                    groupName={t.groupId ? groupName.get(t.groupId) : undefined}
                    assigneeName={t.assigneeId ? memberName.get(t.assigneeId) : undefined}
                  />
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="mb-3 font-semibold">Khối lượng 7 ngày tới</h2>
            <ul className="space-y-2">
              {days.map((d) => (
                <li key={d.date} className="flex items-center gap-3 text-sm">
                  <span className="w-24 shrink-0 whitespace-nowrap text-slate-500">{d.date === today ? 'Hôm nay' : formatDate(d.date)}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded bg-slate-100">
                    <div className="h-full rounded bg-indigo-400" style={{ width: `${(d.minutes / maxMinutes) * 100}%` }} />
                  </div>
                  <span className="w-14 shrink-0 text-right text-xs text-slate-600 tabular-nums">
                    {d.minutes ? formatHours(d.minutes) : '–'}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Bài tập nhóm</h2>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('groups')}>
                Mở →
              </Button>
            </div>
            {data.groups.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có nhóm nào.</p>
            ) : (
              <ul className="space-y-3">
                {data.groups.map((g) => {
                  const p = taskProgress(data.tasks.filter((t) => t.groupId === g.id))
                  return (
                    <li key={g.id}>
                      <div className="mb-1 flex justify-between gap-2 text-sm">
                        <span className="truncate font-medium">{g.name}</span>
                        <span className="shrink-0 text-xs text-slate-500">
                          {p.done}/{p.total}
                        </span>
                      </div>
                      <ProgressBar value={p.ratio} label={`Tiến độ nhóm ${g.name}`} />
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Lộ trình tự học</h2>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('roadmap')}>
                Mở →
              </Button>
            </div>
            {data.roadmaps.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có lộ trình nào.</p>
            ) : (
              <ul className="space-y-3">
                {data.roadmaps.map((plan) => {
                  const behind = behindSteps(plan, today).length
                  return (
                    <li key={plan.id}>
                      <div className="mb-1 flex justify-between gap-2 text-sm">
                        <span className="truncate font-medium">{plan.topic}</span>
                        {behind > 0 && <span className="shrink-0 text-xs text-amber-700">chậm {behind} bước</span>}
                      </div>
                      <ProgressBar value={stepProgress(plan.steps).ratio} label={`Tiến độ ${plan.topic}`} />
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
