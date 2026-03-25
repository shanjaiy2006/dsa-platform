'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import axios from 'axios'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import {
  BookOpen, Code2, CheckCircle2, Circle, ChevronLeft,
  Clock, Cpu, Bookmark, Eye
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { Pattern, Problem } from '@/types'
import { cn, formatDifficulty, getMasteryLabel } from '@/lib/utils'

type Tab = 'concept' | 'problems' | 'template' | 'insights'

export default function PatternDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [pattern, setPattern] = useState<Pattern | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('concept')
  const [activeLang, setActiveLang] = useState<'java' | 'python' | 'cpp'>('java')

  useEffect(() => {
    axios.get(`/api/patterns/${id}`).then(({ data }) => {
      setPattern(data.pattern)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8 space-y-4">
          <div className="h-32 rounded-2xl shimmer" />
          <div className="h-64 rounded-2xl shimmer" />
        </div>
      </AppLayout>
    )
  }

  if (!pattern) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-muted-foreground">Pattern not found</div>
      </AppLayout>
    )
  }

  const mastery = pattern.userProgress ? getMasteryLabel(pattern.userProgress.masteryLevel) : null
  const problems = pattern.problems || []

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'concept', label: 'Concept', icon: BookOpen },
    { id: 'template', label: 'Template Code', icon: Code2 },
    { id: 'problems', label: `Problems (${problems.length})`, icon: CheckCircle2 },
    { id: 'insights', label: 'Interview Tips', icon: Eye },
  ]

  const templateCode = pattern.templateCode as unknown as Record<string, string>

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        {/* Back */}
        <Link href="/patterns" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          All Patterns
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
                style={{ background: pattern.color + '15', color: pattern.color }}
              >
                {pattern.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{pattern.name}</h1>
                    <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{pattern.description}</p>
                  </div>
                  {mastery && pattern.userProgress && (
                    <div className="flex-shrink-0 text-right">
                      <div className="text-2xl font-bold" style={{ color: mastery.color }}>
                        {pattern.userProgress.masteryLevel}%
                      </div>
                      <div className="text-xs text-muted-foreground">{mastery.label}</div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Time: O({pattern.timeComplexity})
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    Space: O({pattern.spaceComplexity})
                  </div>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full border', formatDifficulty(pattern.difficulty).class)}>
                    {formatDifficulty(pattern.difficulty).label}
                  </span>
                </div>

                {pattern.userProgress && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-xs">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pattern.userProgress.masteryLevel}%` }}
                        transition={{ duration: 1 }}
                        className="h-full rounded-full"
                        style={{ background: pattern.color }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {pattern.userProgress.solvedCount}/{pattern.userProgress.totalCount} solved
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-secondary/50 p-1 rounded-xl border border-border w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'concept' && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-6 prose prose-invert max-w-none prose-pre:bg-secondary prose-pre:border prose-pre:border-border prose-code:text-primary prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground">
                <ReactMarkdown>{pattern.conceptExplanation}</ReactMarkdown>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="text-lg">🎯</span> Visual Intuition
                </h3>
                <div className="prose prose-invert max-w-none prose-pre:bg-secondary prose-pre:border prose-pre:border-border prose-code:text-primary prose-p:text-muted-foreground prose-li:text-muted-foreground">
                  <ReactMarkdown>{pattern.visualIntuition}</ReactMarkdown>
                </div>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="text-lg">📋</span> Step-by-Step
                </h3>
                <div className="prose prose-invert max-w-none prose-p:text-muted-foreground prose-li:text-muted-foreground prose-headings:text-foreground">
                  <ReactMarkdown>{pattern.stepByStep}</ReactMarkdown>
                </div>
              </div>
              <div className="glass rounded-2xl p-6 border-l-4 border-red-500/40">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="text-lg">⚠️</span> Common Mistakes
                </h3>
                <div className="prose prose-invert max-w-none prose-p:text-muted-foreground prose-li:text-muted-foreground">
                  <ReactMarkdown>{pattern.commonMistakes}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'template' && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="flex items-center gap-1 p-3 border-b border-border bg-secondary/30">
                {(['java', 'python', 'cpp'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                      activeLang === lang
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
              <pre className="p-6 overflow-x-auto text-sm text-foreground/90 leading-relaxed font-mono">
                <code>{templateCode[activeLang]}</code>
              </pre>
            </div>
          )}

          {activeTab === 'problems' && (
            <div className="space-y-2">
              {problems.map((problem: any, idx: number) => {
                const diff = formatDifficulty(problem.difficulty)
                const solved = problem.submissions?.some((s: any) => s.status === 'ACCEPTED')
                return (
                  <Link key={problem.id} href={`/problems/${problem.slug}`}>
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="glass rounded-xl p-4 flex items-center gap-3 group hover:border-border transition-all"
                    >
                      <div className="flex-shrink-0">
                        {solved
                          ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          : <Circle className="w-5 h-5 text-muted-foreground/40" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {idx + 1}. {problem.title}
                          </span>
                          <span className={cn('text-xs px-1.5 py-0.5 rounded-full border flex-shrink-0', diff.class)}>
                            {diff.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {problem.companies?.slice(0, 3).map((c: string) => (
                            <span key={c} className="text-xs text-muted-foreground/60">{c}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {problem.bookmarks?.length > 0 && (
                          <Bookmark className="w-3.5 h-3.5 text-primary fill-primary" />
                        )}
                        <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary rotate-180 transition-all" />
                      </div>
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="glass rounded-2xl p-6">
              <div className="prose prose-invert max-w-none prose-p:text-muted-foreground prose-li:text-muted-foreground prose-headings:text-foreground">
                <ReactMarkdown>{pattern.interviewInsights}</ReactMarkdown>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  )
}
