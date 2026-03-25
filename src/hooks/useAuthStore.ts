import { create } from 'zustand'
import { User } from '@/types'
import axios from 'axios'

interface AuthState {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  fetchUser: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  fetchUser: async () => {
    try {
      const { data } = await axios.get('/api/auth/logout')
      set({ user: data.user, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },
  logout: async () => {
    try {
      await axios.post('/api/auth/logout')
      set({ user: null })
      window.location.href = '/auth/login'
    } catch {
      set({ user: null })
    }
  },
}))
