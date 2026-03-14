import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface MoodRecord {
  id: string
  date: string
  moodType: string
  moodScore: number
  keywords: string[]
  notes?: string
  triggerFactor?: string // 触发因素：学习压力/人际关系/自我评价/未知
  duration?: string // 持续时间：今天/最近几天/一直
}

interface AppState {
  // 对话状态
  messages: ChatMessage[]
  isTyping: boolean
  currentStep: number

  // 情绪记录
  moodRecords: MoodRecord[]
  lastCheckInDate: string | null

  // Actions
  addMessage: (role: 'user' | 'assistant', content: string) => void
  setTyping: (isTyping: boolean) => void
  clearMessages: () => void
  incrementStep: () => void
  resetStep: () => void

  addMoodRecord: (record: Omit<MoodRecord, 'id'>) => void
  updateMoodRecord: (id: string, record: Partial<MoodRecord>) => void
  deleteMoodRecord: (id: string) => void
  setLastCheckInDate: (date: string) => void

  // 数据管理
  exportData: () => string
  importData: (jsonData: string) => void
  clearAllData: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初始状态
      messages: [],
      isTyping: false,
      currentStep: 0,
      moodRecords: [],
      lastCheckInDate: null,

      // Actions
      addMessage: (role, content) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: Date.now().toString(),
              role,
              content,
              timestamp: Date.now(),
            },
          ],
        })),

      setTyping: (isTyping) => set({ isTyping }),

      clearMessages: () => set({ messages: [], currentStep: 0 }),

      incrementStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),

      resetStep: () => set({ currentStep: 0 }),

      addMoodRecord: (record) =>
        set((state) => ({
          moodRecords: [
            ...state.moodRecords,
            { ...record, id: Date.now().toString() },
          ],
        })),

      updateMoodRecord: (id, record) =>
        set((state) => ({
          moodRecords: state.moodRecords.map((r) =>
            r.id === id ? { ...r, ...record } : r
          ),
        })),

      deleteMoodRecord: (id) =>
        set((state) => ({
          moodRecords: state.moodRecords.filter((r) => r.id !== id),
        })),

      setLastCheckInDate: (date) => set({ lastCheckInDate: date }),

      exportData: () => {
        const state = get()
        return JSON.stringify({
          moodRecords: state.moodRecords,
          lastCheckInDate: state.lastCheckInDate,
          exportDate: new Date().toISOString(),
        }, null, 2)
      },

      importData: (jsonData) => {
        try {
          const data = JSON.parse(jsonData)
          if (Array.isArray(data.moodRecords)) {
            set({
              moodRecords: data.moodRecords,
              lastCheckInDate: data.lastCheckInDate || null,
            })
            return true
          }
          return false
        } catch {
          return false
        }
      },

      clearAllData: () =>
        set({
          moodRecords: [],
          lastCheckInDate: null,
        }),
    }),
    {
      name: 'ai-healing-assistant',
      partialize: (state) => ({
        moodRecords: state.moodRecords,
        lastCheckInDate: state.lastCheckInDate,
      }),
    }
  )
)
