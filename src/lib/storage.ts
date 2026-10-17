import type { AppData } from '../types'

export const STORAGE_KEY = 'study-planner:data'
export const DATA_VERSION = 1

export function isAppData(value: unknown): value is AppData {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    v.version === DATA_VERSION &&
    ['tasks', 'groups', 'members', 'roadmaps'].every((key) => Array.isArray(v[key]))
  )
}

// Trả về null nếu chưa có dữ liệu, dữ liệu hỏng, hoặc khác version.
// Khi đổi cấu trúc dữ liệu: tăng DATA_VERSION và viết hàm chuyển đổi ở đây.
export function loadData(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isAppData(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Hết dung lượng hoặc trình duyệt chặn storage: app vẫn chạy trong bộ nhớ.
  }
}
