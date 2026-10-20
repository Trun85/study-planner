import { useEffect, useState } from 'react'

type ThemeChoice = 'system' | 'light' | 'dark'

const THEME_KEY = 'study-planner:theme' // index.html đọc cùng khoá này trước khi render
const ORDER: ThemeChoice[] = ['system', 'light', 'dark']
const LABEL: Record<ThemeChoice, { icon: string; text: string }> = {
  system: { icon: '◐', text: 'Theo máy' },
  light: { icon: '☀', text: 'Sáng' },
  dark: { icon: '☾', text: 'Tối' },
}

function readChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem(THEME_KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

/** Bấm để xoay vòng: theo máy → sáng → tối. */
export function ThemeToggle() {
  const [choice, setChoice] = useState<ThemeChoice>(readChoice)

  useEffect(() => {
    const root = document.documentElement
    if (choice === 'system') delete root.dataset.theme
    else root.dataset.theme = choice
    try {
      if (choice === 'system') localStorage.removeItem(THEME_KEY)
      else localStorage.setItem(THEME_KEY, choice)
    } catch {
      // Không lưu được thì chỉ áp dụng cho phiên này
    }
  }, [choice])

  const next = ORDER[(ORDER.indexOf(choice) + 1) % ORDER.length]
  const label = `Giao diện: ${LABEL[choice].text}. Bấm để chuyển sang ${LABEL[next].text.toLowerCase()}`
  return (
    <button
      type="button"
      onClick={() => setChoice(next)}
      title={label}
      aria-label={label}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-ink-soft transition hover:bg-sunken hover:text-ink"
    >
      <span aria-hidden="true" className="text-base leading-none">
        {LABEL[choice].icon}
      </span>
      <span className="hidden font-hand text-base leading-none sm:inline">{LABEL[choice].text}</span>
    </button>
  )
}
