'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import Link from 'next/link'
import { Search, CheckCircle2, Circle, Bookmark, Filter, ChevronRight } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { Problem, Pattern } from '@/types'
import { cn, formatDifficulty } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [patternFilter, setPatternFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const debouncedSearch = useDebounce(search, 300)

  const fetchProblems = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (difficulty) params.set('difficulty', difficulty)
      if (patternFilter) params.set('patternId', patternFilter)
      params.set('page', page.toString())
      params.set('limit', '20')

      const { data } = await axios.get(`/api/problems?${params}`)
      setProblems(data.problems)
      setTotal(data.pagination.total)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, difficulty, patternFilter, page])

  useEffect(() => {
    fetchProblems()
  }, [fetchProblems])

  useEffect(() => {
    axios.get('/api/patterns').then(({ data }) => setPatterns(data.patterns))
  }, [])

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Problems</h1>
          <p className="text-muted-foreground text-sm">{total} problems, organized by pattern</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search problems, companies, tags..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* Difficulty */}
            {['', 'EASY', 'MEDIUM', 'HARD'].map(d => (
              <button
                key={d}
                onClick={() => { setDifficulty(d); setPage(1) }}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-medium transition-all border',
                  difficulty === d
                    ? d === '' ? 'bg-primary text-primary-foreground border-primary'
                      : d === 'EASY' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : d === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                    : 'text-muted-foreground border-border hover:text-foreground bg-secondary'
                )}
              >
                {d === '' ? 'All' : d.charAt(0) + d.slice(1).toLowerCase()}
              </button>
            ))}

            {/* Pattern filter */}
            <select
              value={patternFilter}
              onChange={e => { setPatternFilter(e.target.value); setPage(1) }}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-secondary border border-border text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 hover:text-foreground transition-colors"
            >
              <option value="">All Patterns</option>
              {patterns.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Problem list */}
        <div className="glass rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border text-xs font-medium text-muted-foreground bg-secondary/30">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-2">Pattern</div>
            <div className="col-span-2">Companies</div>
          </div>

          {loading ? (
            <div className="divide-y divide-border">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-14 shimmer" />
              ))}
            </div>
          ) : problems.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              No problems found. Try adjusting your filters.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {problems.map((problem: any, idx) => {
                const diff = formatDifficulty(problem.difficulty)
                const solved = problem.submissions?.length > 0
                const bookmarked = problem.bookmarks?.length > 0

                return (
                  <Link key={problem.id} href={`/problems/${problem.slug}`}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="grid grid-cols-12 gap-4 px-4 py-3.5 items-center hover:bg-accent/50 transition-colors group"
                    >
                      <div className="col-span-1">
                        {solved
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          : <Circle className="w-4 h-4 text-muted-foreground/30" />
                        }
                      </div>
                      <div className="col-span-5 flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {problem.title}
                        </span>
                        {bookmarked && <Bookmark className="w-3 h-3 text-primary fill-primary flex-shrink-0" />}
                      </div>
                      <div className="col-span-2">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full border', diff.class)}>
                          {diff.label}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: (problem.pattern?.color || '#6366f1') + '15',
                            color: problem.pattern?.color || '#6366f1'
                          }}
                        >
                          {problem.pattern?.name || 'N/A'}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1 text-xs text-muted-foreground/60 truncate">
                        {problem.companies?.slice(0, 2).join(', ')}
                      </div>
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {Math.ceil(total / 20)}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / 20)}
              className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
