import { create } from 'zustand'
import { User } from '../types'

interface UserState {
  user: User | null
  setUser: (user: User | null) => void
  updateBudget: (min: number, max: number) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateBudget: (min, max) => set((state) => ({
    user: state.user
      ? { ...state.user, budget_min: min, budget_max: max }
      : null
  }))
}))
