import { useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { createSeedData } from '../data/seed'
import { loadData, saveData } from '../lib/storage'
import { StoreContext } from './context'
import { reducer } from './reducer'

export function AppStoreProvider({ children }: { children: ReactNode }) {
  // Lần đầu mở app (localStorage trống) thì nạp dữ liệu mẫu cho demo
  const [data, dispatch] = useReducer(reducer, undefined, () => loadData() ?? createSeedData())

  // Mỗi lần state đổi thì lưu xuống localStorage
  useEffect(() => {
    saveData(data)
  }, [data])

  const value = useMemo(() => ({ data, dispatch }), [data])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
