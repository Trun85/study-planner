import { createContext, useContext, type Dispatch } from 'react'
import type { AppData } from '../types'
import type { Action } from './reducer'

interface StoreValue {
  data: AppData
  dispatch: Dispatch<Action>
}

export const StoreContext = createContext<StoreValue | null>(null)

export function useAppStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useAppStore phải được dùng bên trong <AppStoreProvider>')
  return ctx
}
