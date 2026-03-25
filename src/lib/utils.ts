import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Difficulty } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDifficulty(difficulty: Difficulty) {
  const map = {
    EASY: { label: 'Easy', class: 'difficulty-easy' },
    MEDIUM: { label: 'Medium', class: 'difficulty-medium' },
    HARD: { label: 'Hard', class: 'difficulty-hard' },
  }
  return map[difficulty]
}

export function getMasteryLabel(level: number) {
  if (level >= 80) return { label: 'Expert', color: '#10b981' }
  if (level >= 60) return { label: 'Advanced', color: '#6366f1' }
  if (level >= 40) return { label: 'Intermediate', color: '#f59e0b' }
  if (level >= 20) return { label: 'Beginner', color: '#f97316' }
  return { label: 'Novice', color: '#6b7280' }
}

export function getXPForLevel(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1
  const currentLevelXP = Math.pow(level - 1, 2) * 100
  const nextLevelXP = Math.pow(level, 2) * 100
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
  return { level, progress, nextLevelXP, currentXP: xp }
}

export function formatTimeAgo(date: Date | string) {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

export function formatRuntime(ms?: number | null) {
  if (!ms) return 'N/A'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export function formatMemory(kb?: number | null) {
  if (!kb) return 'N/A'
  if (kb < 1024) return `${kb}KB`
  return `${(kb / 1024).toFixed(1)}MB`
}

export function getLanguageLabel(lang: string) {
  const map: Record<string, string> = {
    JAVA: 'Java',
    PYTHON: 'Python',
    CPP: 'C++',
  }
  return map[lang] || lang
}

export function getMonacoLanguage(lang: string) {
  const map: Record<string, string> = {
    JAVA: 'java',
    PYTHON: 'python',
    CPP: 'cpp',
  }
  return map[lang] || 'plaintext'
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    ACCEPTED: 'text-emerald-400',
    WRONG_ANSWER: 'text-red-400',
    TIME_LIMIT_EXCEEDED: 'text-amber-400',
    RUNTIME_ERROR: 'text-orange-400',
    COMPILE_ERROR: 'text-rose-400',
    PENDING: 'text-muted-foreground',
  }
  return map[status] || 'text-muted-foreground'
}

export function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    ACCEPTED: 'Accepted',
    WRONG_ANSWER: 'Wrong Answer',
    TIME_LIMIT_EXCEEDED: 'Time Limit Exceeded',
    RUNTIME_ERROR: 'Runtime Error',
    COMPILE_ERROR: 'Compile Error',
    PENDING: 'Pending',
  }
  return map[status] || status
}

export function generateHeatmapData(days = 365) {
  const data = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      count: 0,
    })
  }
  return data
}

export function getDefaultCode(language: string) {
  const defaults: Record<string, string> = {
    JAVA: `public class Solution {
    public int solve(int[] nums) {
        // Your code here
        
    }
}`,
    PYTHON: `class Solution:
    def solve(self, nums: List[int]) -> int:
        # Your code here
        pass`,
    CPP: `class Solution {
public:
    int solve(vector<int>& nums) {
        // Your code here
        
    }
};`,
  }
  return defaults[language] || ''
}
