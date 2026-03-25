'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import Link from 'next/link'
import { Dumbbell, Target, TrendingUp, ChevronRight, RefreshCw } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { cn, formatDifficulty, getMasteryLabel } from '@/lib/utils'

export default function PracticePage() {
  const [progress, setProgress] = useState<any[]>([])
  const [recommended, setRecommended] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressRes, problemsRes] = await Promise.all([
          axios.get('/api/progress'),
          axios.get('/api/problems?limit=10'),
        ])
        setProgress(progressRes.data.progress || [])
        // Recommend problems from weak patterns
        const weakPatterns = (progressRes.data.progress || [])
          .sort((a: any, b: any) => a.masteryLevel - b.masteryLevel)
          .slice(0, 3)
          .map((p: any) => p.patternId)

        const recs = problemsRes.data.problems.filter((p: any) =>
          weakPatterns.includes(p.patternId)
        ).slice(0, 5)
        setRecommended(recs.length > 0 ? recs : problemsRes.data.problems.slice(0, 5))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const weakPatterns = [...progress]
    .sort((a, b) => a.masteryLevel - b.masteryLevel)
    .filter(p => p.solvedCount < p.totalCount)
    .slice(0, 4)

  const strongPatterns = [...progress]
    .sort((a, b) => b.masteryLevel - a.masteryLevel)
    .slice(0, 3)

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-primary" />
            Smart Practice
          </h1>
          <p className="text-muted-foreground text-sm">Personalized recommendations based on your weak areas</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Recommendations */}
          <div className="md:col-span-2 space-y-6">
            {/* Daily problems */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Recommended for You
                </h2>
                <button
                  onClick={() => window.location.reload()}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {loading ? (
                  [...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl shimmer" />)
                ) : recommended.map((problem: any, idx) => {
                  const diff = formatDifficulty(problem.difficulty)
                  return (
                    <Link key={problem.id} href={`/problems/${problem.slug}`}>
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors group border border-transparent hover:border-border"
                      >
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {problem.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {problem.pattern?.name || 'General'}
                          </div>
                        </div>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full border flex-shrink-0', diff.class)}>
                          {diff.label}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Focus areas */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Focus Areas (Weakest Patterns)
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {loading ? (
                  [...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl shimmer" />)
                ) : weakPatterns.map((p: any) => {
                  const mastery = getMasteryLabel(p.masteryLevel)
                  return (
                    <Link key={p.id} href={`/patterns/${p.pattern.slug}`}>
                      <div className="p-4 rounded-xl border border-border hover:border-border/80 hover:bg-accent transition-all group">
                        <div className="flex items-center gap-2 mb-2">
                          <span style={{ color: p.pattern.color }}>{p.pattern.icon}</span>
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {p.pattern.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${p.masteryLevel}%`, background: p.pattern.color }}
                            />
                          </div>
                          <span className="text-xs" style={{ color: mastery.color }}>{mastery.label}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {p.solvedCount}/{p.totalCount} solved
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="space-y-4">
            {/* Strongest patterns */}
            <div className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-foreground text-sm mb-4">Your Best Patterns</h3>
              <div className="space-y-3">
                {loading ? (
                  [...Array(3)].map((_, i) => <div key={i} className="h-10 rounded-xl shimmer" />)
                ) : strongPatterns.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <span style={{ color: p.pattern?.color }}>{p.pattern?.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{p.pattern?.name}</div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${p.masteryLevel}%`, background: p.pattern?.color }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{p.masteryLevel}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Practice tips */}
            <div className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-foreground text-sm mb-3">💡 Practice Tips</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                  Solve 2-3 problems daily for consistent progress
                </div>
                <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  Focus on understanding patterns, not memorizing solutions
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  Always explain your approach before coding
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-foreground text-sm mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/interview" className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
                  <span>⚡</span> Start mock interview
                </Link>
                <Link href="/patterns" className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
                  <span>📚</span> Review a pattern
                </Link>
                <Link href="/notes" className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
                  <span>📝</span> Write a note
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
