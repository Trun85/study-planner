import { useEffect, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react'
import type { Tone } from '../lib/labels'

const BUTTON_VARIANT = {
  // Nút chính như con dấu mực: bóng đậm phía dưới, bấm thì lún xuống
  primary:
    'bg-accent text-card shadow-[0_2px_0_var(--accent-strong)] hover:bg-accent-strong active:translate-y-px active:shadow-[0_1px_0_var(--accent-strong)]',
  secondary: 'bg-card text-ink-soft ring-1 ring-line hover:bg-sunken hover:text-ink',
  danger: 'bg-transparent text-danger ring-1 ring-danger/40 hover:bg-danger-soft',
  ghost: 'text-ink-soft hover:bg-sunken hover:text-ink',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof BUTTON_VARIANT
  size?: 'sm' | 'md'
}

export function Button({ variant = 'primary', size = 'md', type = 'button', className = '', ...props }: ButtonProps) {
  const sizeClass = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm'
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${sizeClass} ${BUTTON_VARIANT[variant]} ${className}`}
      {...props}
    />
  )
}

const TONE: Record<Tone, string> = {
  neutral: 'bg-sunken text-ink-soft',
  accent: 'bg-accent-soft text-accent-strong',
  blue: 'bg-blue-soft text-blue',
  moss: 'bg-moss-soft text-moss',
  ochre: 'bg-ochre-soft text-ochre',
  danger: 'bg-danger-soft text-danger',
}

/** Nhãn nhỏ như mẩu giấy ghi chú. */
export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-[3px] px-1.5 py-px text-[11px] font-semibold tracking-wide ${TONE[tone]}`}>
      {children}
    </span>
  )
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.round(value * 100)
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${pct === 100 ? 'bg-moss' : 'bg-accent'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-semibold text-ink-soft tabular-nums">{pct}%</span>
    </div>
  )
}

interface CardProps {
  children: ReactNode
  className?: string
  tape?: boolean // dán một mẩu băng keo giấy ở mép trên
  index?: number // thứ tự xuất hiện khi trang vừa mở
}

/** Một trang giấy: nền sáng hơn nền chính, viền mảnh, bóng nhẹ. */
export function Card({ children, className = '', tape, index }: CardProps) {
  return (
    <section
      className={`relative rounded-lg bg-card p-5 shadow-paper ring-1 ring-line ${index !== undefined ? 'rise' : ''} ${className}`}
      style={index !== undefined ? ({ '--i': index } as CSSProperties) : undefined}
    >
      {tape && (
        <span
          aria-hidden="true"
          className="absolute -top-2.5 left-1/2 h-5 w-20 -translate-x-1/2 -rotate-2 bg-ochre-soft/90 shadow-sm ring-1 ring-ochre/15"
        />
      )}
      {children}
    </section>
  )
}

export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="rise max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-card p-6 shadow-2xl ring-1 ring-line"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between border-b border-dashed border-line pb-3">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Đóng">
            ✕
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const inputClass =
  'w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-faint transition focus:border-accent focus:bg-card focus:outline-none focus:ring-2 focus:ring-accent/20'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold tracking-wide text-muted uppercase">{label}</span>
      {children}
    </label>
  )
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="rounded-lg border-2 border-dashed border-line bg-card/50 p-10 text-center">
      <p className="font-display text-xl font-semibold text-ink">{title}</p>
      {hint && <p className="mt-1 font-hand text-lg text-muted">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

interface PageHeaderProps {
  title: string
  eyebrow?: string // dòng ghi chú viết tay phía trên tiêu đề
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ title, eyebrow, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="rise mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 -rotate-1 font-hand text-lg text-accent">{eyebrow}</p>}
        <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
