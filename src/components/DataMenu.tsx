import { useRef, type ChangeEvent } from 'react'
import { createSeedData } from '../data/seed'
import { todayISO } from '../lib/date'
import { DATA_VERSION, isAppData } from '../lib/storage'
import { useAppStore } from '../store/context'

const itemClass = 'block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-sunken'

/** Sao lưu / khôi phục dữ liệu, vì localStorage chỉ nằm trong trình duyệt này. */
export function DataMenu() {
  const { data, dispatch } = useAppStore()
  const menuRef = useRef<HTMLDetailsElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const close = () => menuRef.current?.removeAttribute('open')

  function handleExport() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `study-planner-${todayISO()}.json`
    a.click()
    URL.revokeObjectURL(url)
    close()
  }

  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // cho phép chọn lại cùng một file
    close()
    if (!file) return
    try {
      const parsed: unknown = JSON.parse(await file.text())
      if (!isAppData(parsed)) throw new Error('invalid')
      if (confirm('Thay toàn bộ dữ liệu hiện tại bằng dữ liệu trong file?')) dispatch({ type: 'data/replace', data: parsed })
    } catch {
      alert('File không hợp lệ. Hãy chọn file JSON được xuất từ Study Planner.')
    }
  }

  function handleSeed() {
    close()
    if (confirm('Nạp lại dữ liệu mẫu? Dữ liệu hiện tại sẽ bị thay thế.')) dispatch({ type: 'data/replace', data: createSeedData() })
  }

  function handleClear() {
    close()
    if (confirm('Xoá toàn bộ dữ liệu? Không thể hoàn tác.')) {
      dispatch({ type: 'data/replace', data: { version: DATA_VERSION, tasks: [], groups: [], members: [], roadmaps: [] } })
    }
  }

  return (
    <details ref={menuRef} className="relative">
      <summary className="cursor-pointer list-none rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-sunken [&::-webkit-details-marker]:hidden">
        Dữ liệu ▾
      </summary>
      <div className="absolute right-0 z-40 mt-1 w-56 rounded-lg bg-card p-1 shadow-lg ring-1 ring-line">
        <button type="button" className={itemClass} onClick={handleExport}>
          Xuất file JSON (sao lưu)
        </button>
        <button type="button" className={itemClass} onClick={() => fileRef.current?.click()}>
          Nhập từ file JSON…
        </button>
        <button type="button" className={itemClass} onClick={handleSeed}>
          Nạp lại dữ liệu mẫu
        </button>
        <button type="button" className={`${itemClass} text-danger`} onClick={handleClear}>
          Xoá toàn bộ dữ liệu
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImport} />
      </div>
    </details>
  )
}
