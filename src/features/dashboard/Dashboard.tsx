import type { CSSProperties } from 'react'
import { Button, Card, PageHeader, ProgressBar } from '../../components/ui'
import { addDays, deadlineBucket, formatHours, todayISO } from '../../lib/date'
import type { Tab } from '../../lib/labels'
import { byDeadline, stepProgress, sumMinutes, taskProgress } from '../../lib/progress'
import { behindSteps } from '../../lib/roadmapGenerator'
import { useAppStore } from '../../store/context'
import { TaskItem } from '../tasks/TaskItem'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 11) return 'Chào buổi sáng!'
  if (h < 14) return 'Chào buổi trưa!'
  if (h < 18) return 'Chào buổi chiều!'
  return 'Chào buổi tối!'
}

const parseISO = (iso: string) => new Date(`${iso}T00:00:00`)

export function Dashboard({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { data } = useAppStore()
  const today = todayISO()
  const open = data.tasks.filter((t) => t.status !== 'done').sort(byDeadline)
  const overdue = open.filter((t) => deadlineBucket(t, today) === 'overdue')
  const dueToday = open.filter((t) => deadlineBucket(t, today) === 'today')
  const dueWeek = open.filter((t) => deadlineBucket(t, today) === 'week')
  const upcoming = [...overdue, ...dueToday, ...dueWeek]
  const weekHours = sumMinutes(upcoming) / 60
  const groupName = new Map(data.groups.map((g) => [g.id, g.name]))
  const memberName = new Map(data.members.map((m) => [m.id, m.name]))

  // Khối lượng 7 ngày tới, theo tổng giờ ước lượng của các việc đến hạn mỗi ngày
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i)
    return { date, minutes: sumMinutes(open.filter((t) => t.dueDate === date)) }
  })
  const maxMinutes = Math.max(60, ...days.map((d) => d.minutes))

  const notes = [
    { label: 'quá hạn', count: overdue.length, minutes: sumMinutes(overdue), color: overdue.length ? 'text-danger' : 'text-faint' },
    { label: 'hôm nay', count: dueToday.length, minutes: sumMinutes(dueToday), color: dueToday.length ? 'text-ochre' : 'text-faint' },
    { label: 'sắp tới', count: dueWeek.length, minutes: sumMinutes(dueWeek), color: 'text-ink' },
  ]

  return (
    <>
      <PageHeader
        eyebrow={greeting()}
        title={parseISO(today).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
      />

      {/* Khối chính: số giờ cần học tuần này + biểu đồ 7 ngày */}
      <Card tape index={1} className="mb-10 grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_auto]">
        <div>
          <p className="text-sm text-muted">Tuần này bạn cần khoảng</p>
          <p className="mt-2 font-display text-6xl leading-none font-semibold tracking-tight sm:text-7xl">
            <span className="highlight tabular-nums">{Number.isInteger(weekHours) ? weekHours : weekHours.toFixed(1)}</span>
            <span className="ml-2 text-3xl font-normal text-muted italic sm:text-4xl">giờ</span>
          </p>
          <ul className="mt-7 flex flex-wrap gap-x-8 gap-y-3">
            {notes.map((n) => (
              <li key={n.label}>
                <span className={`font-display text-3xl font-semibold tabular-nums ${n.color}`}>{n.count}</span>
                <span className="ml-1.5 font-hand text-lg text-ink-soft">{n.label}</span>
                <p className="text-xs text-muted">{n.minutes ? `~${formatHours(n.minutes)}` : '—'}</p>
              </li>
            ))}
          </ul>
        </div>

        <figure className="md:w-72">
          <figcaption className="mb-3 font-hand text-lg text-muted">Khối lượng bảy ngày tới</figcaption>
          <ol className="flex h-36 items-end gap-2" aria-label="Số giờ cần học mỗi ngày trong 7 ngày tới">
            {days.map((d, i) => {
              const isToday = i === 0
              const label = parseISO(d.date).toLocaleDateString('vi-VN', { weekday: 'short' })
              return (
                <li
                  key={d.date}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                  aria-label={`${isToday ? 'Hôm nay' : label}: ${d.minutes ? formatHours(d.minutes) : 'không có việc'}`}
                >
                  <span className="text-[11px] font-semibold leading-none text-ink-soft tabular-nums">{d.minutes ? d.minutes / 60 : ''}</span>
                  <div
                    className={`w-full rounded-t-sm transition-[height] duration-700 ${isToday ? 'bg-accent' : 'bg-accent/35'}`}
                    style={{ height: `${Math.max(d.minutes ? 8 : 2, (d.minutes / maxMinutes) * 100)}%` }}
                  />
                  <span className={`text-[11px] whitespace-nowrap ${isToday ? 'font-bold text-accent' : 'text-muted'}`}>
                    {isToday ? 'Nay' : label}
                  </span>
                </li>
              )
            })}
          </ol>
        </figure>
      </Card>

      <div className="grid gap-8 lg:grid-cols-5">
        <section className="rise lg:col-span-3" style={{ '--i': 2 } as CSSProperties}>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold">Cần làm sớm</h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('tasks')}>
              Xem tất cả →
            </Button>
          </div>
          {upcoming.length === 0 ? (
            <p className="font-hand text-lg text-muted">Tuần này rảnh rang, không có deadline nào.</p>
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
        </section>

        <div className="space-y-6 lg:col-span-2">
          <Card index={3}>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">Bài tập nhóm</h2>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('groups')}>
                Mở →
              </Button>
            </div>
            {data.groups.length === 0 ? (
              <p className="font-hand text-lg text-muted">Chưa có nhóm nào.</p>
            ) : (
              <ul className="space-y-4">
                {data.groups.map((g) => {
                  const p = taskProgress(data.tasks.filter((t) => t.groupId === g.id))
                  return (
                    <li key={g.id}>
                      <div className="mb-1.5 flex justify-between gap-2 text-sm">
                        <span className="truncate font-medium">{g.name}</span>
                        <span className="shrink-0 text-xs text-muted">
                          {p.done}/{p.total} việc
                        </span>
                      </div>
                      <ProgressBar value={p.ratio} label={`Tiến độ nhóm ${g.name}`} />
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          <Card index={4}>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">Lộ trình tự học</h2>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('roadmap')}>
                Mở →
              </Button>
            </div>
            {data.roadmaps.length === 0 ? (
              <p className="font-hand text-lg text-muted">Chưa có lộ trình nào.</p>
            ) : (
              <ul className="space-y-4">
                {data.roadmaps.map((plan) => {
                  const behind = behindSteps(plan, today).length
                  return (
                    <li key={plan.id}>
                      <div className="mb-1.5 flex justify-between gap-2 text-sm">
                        <span className="truncate font-medium">{plan.topic}</span>
                        {behind > 0 && <span className="shrink-0 text-xs font-semibold text-ochre">chậm {behind} bước</span>}
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
