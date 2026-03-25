'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import Link from 'next/link'
import { Zap, Timer, SkipForward, Play, RotateCcw, Trophy, ChevronRight } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { Problem, Pattern } from '@/types'
import { cn, formatDifficulty } from '@/lib/utils'

type Mode = 'setup' | 'active' | 'done'

export default function InterviewPage() {
  const [mode, setMode] = useState<Mode>('setup')
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState<string>('MEDIUM')
  const [duration, setDuration] = useState(45) // minutes
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [problems, setProblems] = useState<Problem[]>([])
  const [problemIdx, setProblemIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [solved, setSolved] = useState<string[]>([])
  const [skipped, setSkipped] = useState<string[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    axios.get('/api/patterns').then(({ data }) => setPatterns(data.patterns))
  }, [])

  useEffect(() => {
    if (mode === 'active' && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    } else if (mode === 'active' && timeLeft === 0) {
      setMode('done')
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [mode, timeLeft])

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const startInterview = async () => {
    const params = new URLSearchParams()
    if (difficulty) params.set('difficulty', difficulty)
    if (selectedPatterns.length > 0) params.set('patternId', selectedPatterns[0])
    params.set('limit', '5')

    const { data } = await axios.get(`/api/problems?${params}`)
    const shuffled = data.problems.sort(() => Math.random() - 0.5).slice(0, 5)
    setProblems(shuffled)
    setCurrentProblem(shuffled[0])
    setProblemIdx(0)
    setTimeLeft(duration * 60)
    setSolved([])
    setSkipped([])
    setMode('active')
  }

  const nextProblem = (didSolve: boolean) => {
    if (!currentProblem) return
    if (didSolve) setSolved(s => [...s, currentProblem.id])
    else setSkipped(s => [...s, currentProblem.id])

    const next = problemIdx + 1
    if (next >= problems.length) {
      setMode('done')
    } else {
      setProblemIdx(next)
      setCurrentProblem(problems[next])
    }
  }

  const togglePattern = (id: string) => {
    setSelectedPatterns(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const timePercent = (timeLeft / (duration * 60)) * 100
  const timeColor = timePercent > 50 ? 'text-emerald-400' : timePercent > 25 ? 'text-amber-400' : 'text-red-400'

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Interview Mode
          </h1>
          <p className="text-muted-foreground text-sm mb-8">Simulate a real coding interview with timed problems</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Setup */}
          {mode === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass rounded-2xl p-6">
                  <h2 className="font-semibold text-foreground mb-4">Interview Settings</h2>

                  <div className="space-y-5">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Difficulty</label>
                      <div className="flex gap-2">
                        {['EASY', 'MEDIUM', 'HARD'].map(d => (
                          <button
                            key={d}
                            onClick={() => setDifficulty(d)}
                            className={cn(
                              'flex-1 py-2 rounded-xl text-xs font-medium border transition-all',
                              difficulty === d
                                ? d === 'EASY' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : d === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                  : 'bg-red-500/20 text-red-400 border-red-500/30'
                                : 'text-muted-foreground border-border hover:border-border/80 bg-secondary'
                            )}
                          >
                            {d.charAt(0) + d.slice(1).toLowerCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Duration: <span className="text-foreground font-medium">{duration} minutes</span>
                      </label>
                      <input
                        type="range"
                        min={15} max={90} step={15}
                        value={duration}
                        onChange={e => setDuration(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>15m</span><span>45m</span><span>90m</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Number of problems</label>
                      <div className="text-sm text-foreground">5 problems (random selection)</div>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-2xl p-6">
                  <h2 className="font-semibold text-foreground mb-4">Focus Patterns (optional)</h2>
                  <p className="text-xs text-muted-foreground mb-3">Leave empty for random. Select patterns to focus on.</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {patterns.map(p => (
                      <button
                        key={p.id}
                        onClick={() => togglePattern(p.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-xl text-sm border transition-all',
                          selectedPatterns.includes(p.id)
                            ? 'border-primary/40 bg-primary/5 text-foreground'
                            : 'border-border text-muted-foreground hover:text-foreground hover:bg-accent bg-secondary/30'
                        )}
                      >
                        <span style={{ color: p.color }}>{p.icon}</span>
                        {p.name}
                        {selectedPatterns.includes(p.id) && <span className="ml-auto text-primary text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={startInterview}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20"
                >
                  <Play className="w-5 h-5" />
                  Start Interview
                </button>
              </div>
            </motion.div>
          )}

          {/* Active interview */}
          {mode === 'active' && currentProblem && (
            <motion.div key="active" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              {/* Timer bar */}
              <div className="glass rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Problem {problemIdx + 1} of {problems.length}</span>
                  </div>
                  <div className={cn('text-2xl font-bold font-mono tabular-nums', timeColor)}>
                    {formatTime(timeLeft)}
                  </div>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    style={{ width: `${timePercent}%` }}
                    className={cn('h-full rounded-full transition-all duration-1000',
                      timePercent > 50 ? 'bg-emerald-500' : timePercent > 25 ? 'bg-amber-500' : 'bg-red-500'
                    )}
                  />
                </div>
              </div>

              {/* Problem card */}
              <div className="glass rounded-2xl p-6 mb-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full border mb-2 inline-block', formatDifficulty(currentProblem.difficulty).class)}>
                      {formatDifficulty(currentProblem.difficulty).label}
                    </span>
                    <h2 className="text-xl font-bold text-foreground">{currentProblem.title}</h2>
                  </div>
                  {currentProblem.pattern && (
                    <div
                      className="text-xs px-3 py-1 rounded-full border flex-shrink-0"
                      style={{
                        background: (currentProblem.pattern as any).color + '15',
                        color: (currentProblem.pattern as any).color,
                        borderColor: (currentProblem.pattern as any).color + '30'
                      }}
                    >
                      {(currentProblem.pattern as any).name}
                    </div>
                  )}
                </div>

                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap mb-6">
                  {currentProblem.description.slice(0, 300)}...
                </div>

                {/* Examples */}
                {(currentProblem.examples as any[])?.slice(0, 1).map((ex: any, i: number) => (
                  <div key={i} className="rounded-xl bg-secondary/50 border border-border p-4 font-mono text-xs mb-4">
                    <div className="text-muted-foreground mb-1">Input: <span className="text-foreground">{ex.input}</span></div>
                    <div className="text-muted-foreground">Output: <span className="text-emerald-400">{ex.output}</span></div>
                  </div>
                ))}

                <div className="flex items-center gap-3 mt-4">
                  <Link
                    href={`/problems/${currentProblem.slug}`}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
                  >
                    Open in Editor
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => nextProblem(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm hover:bg-emerald-500/20 transition-all"
                  >
                    ✓ Solved
                  </button>
                  <button
                    onClick={() => nextProblem(false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-muted-foreground text-sm hover:text-foreground hover:bg-accent transition-all"
                  >
                    <SkipForward className="w-4 h-4" />
                    Skip
                  </button>
                </div>
              </div>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2">
                {problems.map((p, i) => (
                  <div
                    key={p.id}
                    className={cn('w-2 h-2 rounded-full transition-all',
                      i === problemIdx ? 'bg-primary w-4' :
                      solved.includes(p.id) ? 'bg-emerald-500' :
                      skipped.includes(p.id) ? 'bg-red-500/50' :
                      'bg-muted'
                    )}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Results */}
          {mode === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="glass rounded-2xl p-8 text-center">
                <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Interview Complete!</h2>
                <p className="text-muted-foreground mb-8">Here's how you did:</p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="glass rounded-xl p-4">
                    <div className="text-3xl font-bold text-emerald-400">{solved.length}</div>
                    <div className="text-sm text-muted-foreground">Solved</div>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <div className="text-3xl font-bold text-red-400">{skipped.length}</div>
                    <div className="text-sm text-muted-foreground">Skipped</div>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <div className="text-3xl font-bold text-foreground">{problems.length}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                </div>

                <div className="text-4xl font-bold text-primary mb-2">
                  {Math.round((solved.length / problems.length) * 100)}%
                </div>
                <div className="text-muted-foreground text-sm mb-8">
                  {solved.length >= 4 ? '🎉 Excellent! You\'re interview-ready!' :
                   solved.length >= 2 ? '💪 Good effort! Keep practicing.' :
                   '📚 Keep learning those patterns!'}
                </div>

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => { setMode('setup'); setSolved([]); setSkipped([]) }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </button>
                  <Link
                    href="/patterns"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
                  >
                    Review Patterns
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
