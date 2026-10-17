import { useMemo, useState, type FormEvent } from 'react'
import { Button, Card, Field, PageHeader, inputClass } from '../../components/ui'
import { ROADMAP_TEMPLATES } from '../../data/roadmapTemplates'
import { addDays, formatDate, todayISO } from '../../lib/date'
import { LEVEL_LABEL } from '../../lib/labels'
import { generateRoadmap } from '../../lib/roadmapGenerator'
import { useAppStore } from '../../store/context'
import type { ID, Level } from '../../types'

interface Props {
  onCancel: () => void
  onCreated: (id: ID) => void
}

export function RoadmapForm({ onCancel, onCreated }: Props) {
  const { dispatch } = useAppStore()
  const [templateId, setTemplateId] = useState(ROADMAP_TEMPLATES[0].id)
  const [level, setLevel] = useState<Level>('beginner')
  const [hoursPerWeek, setHoursPerWeek] = useState('6')
  const [startDate, setStartDate] = useState(todayISO())

  const hpw = Number(hoursPerWeek)
  const valid = hpw > 0 && hpw <= 60 && !!startDate
  const template = ROADMAP_TEMPLATES.find((t) => t.id === templateId)!
  const skipped = template.steps.filter((s) => s.beginnerOnly).length

  // Xem trước kết quả mỗi khi đổi lựa chọn; khi bấm tạo thì lưu đúng bản xem trước này
  const preview = useMemo(
    () => (valid ? generateRoadmap({ templateId, level, hoursPerWeek: hpw, startDate }) : null),
    [valid, templateId, level, hpw, startDate],
  )
  const totalHours = preview?.steps.reduce((sum, s) => sum + s.estimatedHours, 0) ?? 0

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!preview) return
    dispatch({ type: 'roadmap/add', plan: preview })
    onCreated(preview.id)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Button variant="ghost" size="sm" onClick={onCancel} className="mb-3 -ml-2">
        ← Quay lại
      </Button>
      <PageHeader title="Tạo lộ trình học" subtitle="Chọn chủ đề và cho biết bạn có bao nhiêu thời gian, app sẽ chia thành kế hoạch theo tuần." />

      <fieldset className="mb-6">
        <legend className="mb-2 text-sm font-semibold">1. Chủ đề</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {ROADMAP_TEMPLATES.map((t) => (
            <label
              key={t.id}
              className={`cursor-pointer rounded-xl bg-white p-4 ring-1 transition has-focus-visible:outline-2 has-focus-visible:outline-indigo-500 ${templateId === t.id ? 'ring-2 ring-indigo-500' : 'ring-slate-200 hover:ring-slate-300'}`}
            >
              <input
                type="radio"
                name="template"
                value={t.id}
                checked={templateId === t.id}
                onChange={() => setTemplateId(t.id)}
                className="sr-only"
              />
              <p className="font-semibold">{t.topic}</p>
              <p className="mt-1 text-sm text-slate-500">{t.summary}</p>
              <p className="mt-2 text-xs text-slate-400">{t.steps.length} bước</p>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="mb-2 text-sm font-semibold">2. Trình độ hiện tại</legend>
        <div className="inline-flex flex-wrap rounded-lg bg-slate-200/70 p-1">
          {(Object.keys(LEVEL_LABEL) as Level[]).map((l) => (
            <label
              key={l}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition has-focus-visible:outline-2 has-focus-visible:outline-indigo-500 ${level === l ? 'bg-white shadow-sm' : 'text-slate-600'}`}
            >
              <input type="radio" name="level" value={l} checked={level === l} onChange={() => setLevel(l)} className="sr-only" />
              {LEVEL_LABEL[l]}
            </label>
          ))}
        </div>
        {level === 'intermediate' && skipped > 0 && (
          <p className="mt-2 text-xs text-slate-500">Bỏ qua {skipped} bước nền tảng của chủ đề này.</p>
        )}
      </fieldset>

      <fieldset className="mb-6">
        <legend className="mb-2 text-sm font-semibold">3. Thời gian</legend>
        <div className="grid max-w-md grid-cols-2 gap-3">
          <Field label="Số giờ mỗi tuần">
            <input
              type="number"
              min="1"
              max="60"
              className={inputClass}
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(e.target.value)}
              required
            />
          </Field>
          <Field label="Ngày bắt đầu">
            <input type="date" className={inputClass} value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </Field>
        </div>
      </fieldset>

      <Card className="mb-6 bg-indigo-50/50">
        {preview ? (
          <>
            <p className="font-semibold">
              {preview.steps.length} bước · {totalHours} giờ · khoảng {preview.totalWeeks} tuần
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Dự kiến hoàn thành: {formatDate(addDays(startDate, preview.totalWeeks * 7 - 1))}
            </p>
            <ol className="mt-3 space-y-1 text-sm">
              {preview.steps.map((s) => (
                <li key={s.id} className="flex gap-2">
                  <span className="w-20 shrink-0 text-slate-500 tabular-nums">
                    Tuần {s.week}
                    {s.endWeek > s.week ? `–${s.endWeek}` : ''}
                  </span>
                  <span>{s.title}</span>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p className="text-sm text-slate-500">Nhập số giờ mỗi tuần từ 1 đến 60 để xem trước lộ trình.</p>
        )}
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Huỷ
        </Button>
        <Button type="submit" disabled={!preview}>
          Tạo lộ trình
        </Button>
      </div>
    </form>
  )
}
