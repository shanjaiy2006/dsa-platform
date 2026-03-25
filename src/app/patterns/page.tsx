'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import Link from 'next/link'
import { Search, ChevronRight, Lock } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { Pattern } from '@/types'
import { cn, formatDifficulty, getMasteryLabel } from '@/lib/utils'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

export default function PatternsPage() {
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('ALL')

  useEffect(() => {
    axios.get('/api/patterns').then(({ data }) => {
      setPatterns(data.patterns)
      setLoading(false)
    })
  }, [])

  const filtered = patterns.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'ALL' || p.difficulty === filter
    return matchSearch && matchFilter
  })

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">DSA Patterns</h1>
          <p className="text-muted-foreground text-sm">
            Master these {patterns.length} core patterns to solve any coding interview problem.
          </p>
        </motion.div>

        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search patterns..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
          <div className="flex gap-2">
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-2 rounded-xl text-xs font-medium transition-all',
                  filter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
                )}
              >
                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Patterns grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl shimmer" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid md:grid-cols-2 gap-4"
          >
            {filtered.map((pattern) => {
              const diff = formatDifficulty(pattern.difficulty)
              const mastery = pattern.userProgress ? getMasteryLabel(pattern.userProgress.masteryLevel) : null
              const problemCount = (pattern as any)._count?.problems || 0

              return (
                <motion.div key={pattern.id} variants={item}>
                  <Link href={`/patterns/${pattern.slug}`}>
                    <div
                      className="glass rounded-2xl p-6 h-full group hover:border-border transition-all duration-300 pattern-glow cursor-pointer"
                      style={{ '--pattern-color': pattern.color + '33' } as React.CSSProperties}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold"
                            style={{ background: pattern.color + '15', color: pattern.color }}
                          >
                            {pattern.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {pattern.name}
                            </h3>
                            <span className={cn('text-xs px-2 py-0.5 rounded-full border', diff.class)}>
                              {diff.label}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-1" />
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                        {pattern.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{problemCount} problems</span>
                          <span>·</span>
                          <span>O({pattern.timeComplexity})</span>
                        </div>
                        {mastery && pattern.userProgress && (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${pattern.userProgress.masteryLevel}%`,
                                  background: pattern.color
                                }}
                              />
                            </div>
                            <span className="text-xs" style={{ color: mastery.color }}>
                              {mastery.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </AppLayout>
  )
}
