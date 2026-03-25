export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'
export type Language = 'JAVA' | 'PYTHON' | 'CPP'
export type SubmissionStatus = 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILE_ERROR' | 'PENDING'

export interface User {
  id: string
  email: string
  name: string
  image?: string | null
  role: 'USER' | 'ADMIN'
  streak: number
  totalXP: number
  createdAt: Date
}

export interface Pattern {
  id: string
  slug: string
  name: string
  description: string
  difficulty: Difficulty
  order: number
  icon: string
  color: string
  timeComplexity: string
  spaceComplexity: string
  conceptExplanation: string
  visualIntuition: string
  stepByStep: string
  templateCode: TemplateCode
  commonMistakes: string
  interviewInsights: string
  problems?: Problem[]
  userProgress?: UserProgress | null
  _count?: { problems: number }
}

export interface TemplateCode {
  java: string
  python: string
  cpp: string
}

export interface Problem {
  id: string
  slug: string
  title: string
  description: string
  difficulty: Difficulty
  patternId: string
  order: number
  companies: string[]
  tags: string[]
  examples: Example[]
  constraints: string[]
  hints: string[]
  editorialCode?: TemplateCode | null
  editorialText?: string | null
  solvedCount: number
  attemptCount: number
  pattern?: Pattern
  submissions?: Submission[]
  bookmarks?: Bookmark[]
}

export interface Example {
  input: string
  output: string
  explanation?: string
}

export interface UserProgress {
  id: string
  userId: string
  patternId: string
  masteryLevel: number
  solvedCount: number
  totalCount: number
  lastPracticed?: Date | null
}

export interface Submission {
  id: string
  userId: string
  problemId: string
  code: string
  language: Language
  status: SubmissionStatus
  runtime?: number | null
  memory?: number | null
  output?: string | null
  errorMsg?: string | null
  createdAt: Date
}

export interface Note {
  id: string
  userId: string
  problemId?: string | null
  patternId?: string | null
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface Bookmark {
  id: string
  userId: string
  problemId: string
  createdAt: Date
  problem?: Problem
}

export interface DashboardStats {
  totalSolved: number
  totalProblems: number
  currentStreak: number
  totalXP: number
  weakPatterns: Pattern[]
  recentSubmissions: Submission[]
  patternProgress: UserProgress[]
  heatmapData: HeatmapDay[]
}

export interface HeatmapDay {
  date: string
  count: number
}

export interface LeaderboardEntry {
  rank: number
  user: User
  totalSolved: number
  totalXP: number
  streak: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface ExecuteCodeRequest {
  code: string
  language: Language
  stdin?: string
}

export interface ExecuteCodeResponse {
  status: string
  output?: string
  error?: string
  runtime?: number
  memory?: number
}

export interface HintRequest {
  problemId: string
  problemTitle: string
  description: string
  userCode: string
  language: Language
}
