const COLORS = ['bg-indigo-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500']

// Cùng tên thì luôn ra cùng màu
function colorFor(name: string): string {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0
  return COLORS[Math.abs(hash) % COLORS.length]
}

export function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'size-5 text-[10px]' : 'size-8 text-xs'
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${sizeClass} ${colorFor(name)}`}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  )
}
