'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import {
  ChevronLeft, Play, Send, Lightbulb, BookOpen, Bookmark,
  BookmarkCheck, CheckCircle2, XCircle, Clock, Cpu, ChevronDown, ChevronUp
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { Problem, Language } from '@/types'
import {
  cn, formatDifficulty, getMonacoLanguage, getStatusColor,
  getStatusLabel, formatRuntime, formatMemory, getDefaultCode
} from '@/lib/utils'
import toast from 'react-hot-toast'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

type Tab = 'description' | 'editorial' | 'submissions'

export default function ProblemPage() {
  const { id } = useParams<{ id: string }>()
  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('description')
  const [language, setLanguage] = useState<Language>('JAVA')
  const [code, setCode] = useState('')
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [hint, setHint] = useState('')
  const [hintLoading, setHintLoading] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [consoleOpen, setConsoleOpen] = useState(false)
  const [showHints, setShowHints] = useState(false)

  useEffect(() => {
    axios.get(`/api/problems/${id}`).then(({ data }) => {
      setProblem(data.problem)
      setBookmarked(data.problem.bookmarks?.length > 0)
      const savedCode = localStorage.getItem(`code-${data.problem.slug}-${language}`)
      setCode(savedCode || getDefaultCode(language))
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    if (problem) {
      const savedCode = localStorage.getItem(`code-${problem.slug}-${language}`)
      const templateCode = (problem.pattern?.templateCode as any)?.[language.toLowerCase()]
      setCode(savedCode || getDefaultCode(language))
    }
  }, [language, problem])

  const handleCodeChange = (value: string | undefined) => {
    if (!value || !problem) return
    setCode(value)
    localStorage.setItem(`code-${problem.slug}-${language}`, value)
  }

  const handleRun = async () => {
    setRunning(true)
    setConsoleOpen(true)
    setResult(null)
    try {
      const { data } = await axios.post('/api/execute', { code, language, stdin: '' })
      setResult({ type: 'run', ...data })
    } catch {
      toast.error('Execution failed')
    } finally {
      setRunning(false)
    }
  }

  const handleSubmit = async () => {
    if (!problem) return
    setSubmitting(true)
    setConsoleOpen(true)
    setResult(null)
    try {
      const { data } = await axios.post(`/api/problems/${problem.slug}/submit`, { code, language })
      const sub = data.submission
      setResult({ type: 'submit', ...sub })
      if (sub.status === 'ACCEPTED') {
        toast.success('🎉 Accepted! Great job!')
        // Refresh problem to update submissions
        const { data: refreshed } = await axios.get(`/api/problems/${id}`)
        setProblem(refreshed.problem)
      } else {
        toast.error(`${getStatusLabel(sub.status)}`)
      }
    } catch {
      toast.error('Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleHint = async () => {
    if (!problem) return
    setHintLoading(true)
    try {
      const { data } = await axios.post('/api/hints', {
        problemTitle: problem.title,
        description: problem.description,
        userCode: code,
        language,
        patternName: problem.pattern?.name || 'General',
      })
      setHint(data.hint)
    } catch {
      toast.error('Could not load hint')
    } finally {
      setHintLoading(false)
    }
  }

  const handleBookmark = async () => {
    if (!problem) return
    try {
      const { data } = await axios.post('/api/bookmarks', { problemId: problem.id })
      setBookmarked(data.bookmarked)
      toast.success(data.bookmarked ? 'Bookmarked!' : 'Bookmark removed')
    } catch {
      toast.error('Failed to bookmark')
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="h-screen flex">
          <div className="w-1/2 p-6 space-y-4">
            <div className="h-8 rounded-xl shimmer" />
            <div className="h-64 rounded-xl shimmer" />
          </div>
          <div className="w-1/2 bg-secondary/30" />
        </div>
      </AppLayout>
    )
  }

  if (!problem) return <AppLayout><div className="p-8 text-center text-muted-foreground">Problem not found</div></AppLayout>

  const diff = formatDifficulty(problem.difficulty)
  const examples = problem.examples as any[]
  const accepted = problem.submissions?.find((s: any) => s.status === 'ACCEPTED')

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-0px)] overflow-hidden flex-col md:flex-row">
        {/* Left panel - Problem */}
        <div className="w-full md:w-[45%] flex flex-col border-r border-border overflow-hidden">
          {/* Problem header */}
          <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 flex-shrink-0">
            <Link href="/problems" className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h1 className="font-semibold text-foreground text-sm truncate">{problem.title}</h1>
              <span className={cn('text-xs px-2 py-0.5 rounded-full border flex-shrink-0', diff.class)}>
                {diff.label}
              </span>
              {accepted && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            </div>
            <button onClick={handleBookmark} className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
              {bookmarked ? <BookmarkCheck className="w-5 h-5 text-primary fill-primary" /> : <Bookmark className="w-5 h-5" />}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border flex-shrink-0">
            {[
              { id: 'description' as Tab, label: 'Description' },
              { id: 'editorial' as Tab, label: 'Editorial' },
              { id: 'submissions' as Tab, label: `Submissions (${problem.submissions?.length || 0})` },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'px-4 py-3 text-xs font-medium transition-all border-b-2 -mb-px',
                  tab === t.id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-5">
            <AnimatePresence mode="wait">
              {tab === 'description' && (
                <motion.div key="desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Pattern badge */}
                  {problem.pattern && (
                    <Link href={`/patterns/${problem.pattern.slug}`}>
                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4 border"
                        style={{
                          background: problem.pattern.color + '15',
                          color: problem.pattern.color,
                          borderColor: problem.pattern.color + '30'
                        }}
                      >
                        <BookOpen className="w-3 h-3" />
                        {problem.pattern.name} Pattern
                      </div>
                    </Link>
                  )}

                  {/* Description */}
                  <div className="prose prose-invert max-w-none prose-p:text-muted-foreground prose-li:text-muted-foreground prose-headings:text-foreground prose-code:text-primary prose-strong:text-foreground text-sm">
                    <ReactMarkdown>{problem.description}</ReactMarkdown>
                  </div>

                  {/* Examples */}
                  <div className="mt-6 space-y-4">
                    {examples?.map((ex, i) => (
                      <div key={i} className="rounded-xl bg-secondary/50 border border-border p-4">
                        <div className="text-xs font-semibold text-muted-foreground mb-2">Example {i + 1}</div>
                        <div className="font-mono text-xs space-y-1">
                          <div><span className="text-muted-foreground">Input: </span><span className="text-foreground">{ex.input}</span></div>
                          <div><span className="text-muted-foreground">Output: </span><span className="text-emerald-400">{ex.output}</span></div>
                          {ex.explanation && <div className="text-muted-foreground mt-2">{ex.explanation}</div>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Constraints */}
                  <div className="mt-6">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Constraints</h3>
                    <ul className="space-y-1">
                      {problem.constraints?.map((c, i) => (
                        <li key={i} className="text-xs text-muted-foreground font-mono flex items-start gap-2">
                          <span className="text-primary">·</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Companies */}
                  {problem.companies?.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Companies</h3>
                      <div className="flex flex-wrap gap-2">
                        {problem.companies.map(c => (
                          <span key={c} className="text-xs px-2 py-1 rounded-lg bg-secondary border border-border text-muted-foreground">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Hint */}
                  <div className="mt-6">
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <Lightbulb className="w-4 h-4" />
                      {showHints ? 'Hide hints' : 'Need a hint?'}
                      {showHints ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    <AnimatePresence>
                      {showHints && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 space-y-2">
                            {problem.hints?.map((h, i) => (
                              <div key={i} className="text-sm text-muted-foreground p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                💡 {h}
                              </div>
                            ))}
                            <button
                              onClick={handleHint}
                              disabled={hintLoading}
                              className="w-full py-2 text-xs text-amber-400 border border-amber-500/20 rounded-xl hover:bg-amber-500/5 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {hintLoading ? (
                                <span className="w-3 h-3 border border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                              ) : (
                                <Lightbulb className="w-3 h-3" />
                              )}
                              Get AI hint
                            </button>
                            {hint && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-muted-foreground p-3 rounded-xl bg-primary/5 border border-primary/10"
                              >
                                🤖 {hint}
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {tab === 'editorial' && (
                <motion.div key="editorial" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {problem.editorialText ? (
                    <>
                      <div className="prose prose-invert max-w-none prose-p:text-muted-foreground prose-headings:text-foreground text-sm mb-6">
                        <ReactMarkdown>{problem.editorialText}</ReactMarkdown>
                      </div>
                      {problem.editorialCode && (
                        <div className="rounded-xl bg-secondary/50 border border-border overflow-hidden">
                          <div className="flex gap-1 p-2 border-b border-border">
                            {['java', 'python', 'cpp'].map(l => (
                              <button
                                key={l}
                                onClick={() => setLanguage(l.toUpperCase() as Language)}
                                className={cn(
                                  'px-3 py-1 rounded-lg text-xs font-medium transition-all',
                                  language.toLowerCase() === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                                )}
                              >
                                {l === 'cpp' ? 'C++' : l.charAt(0).toUpperCase() + l.slice(1)}
                              </button>
                            ))}
                          </div>
                          <pre className="p-4 text-xs font-mono text-foreground/90 overflow-x-auto">
                            <code>{(problem.editorialCode as any)[language.toLowerCase()]}</code>
                          </pre>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      Editorial coming soon. Try solving it first! 💪
                    </div>
                  )}
                </motion.div>
              )}

              {tab === 'submissions' && (
                <motion.div key="subs" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {!problem.submissions?.length ? (
                    <div className="text-center py-12 text-muted-foreground text-sm">No submissions yet</div>
                  ) : (
                    <div className="space-y-2">
                      {(problem.submissions as any[]).map(sub => (
                        <div key={sub.id} className="rounded-xl border border-border p-4 text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className={cn('font-medium', getStatusColor(sub.status))}>
                              {getStatusLabel(sub.status)}
                            </span>
                            <span className="text-xs text-muted-foreground">{sub.language}</span>
                          </div>
                          {sub.runtime && (
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatRuntime(sub.runtime)}</span>
                              <span className="flex items-center gap-1"><Cpu className="w-3 h-3" />{formatMemory(sub.memory)}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right panel - Editor */}
        <div className="w-full md:w-[55%] flex flex-col">
          {/* Editor header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
            <div className="flex gap-1 bg-secondary/50 p-1 rounded-xl border border-border">
              {(['JAVA', 'PYTHON', 'CPP'] as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    language === l ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {l === 'CPP' ? 'C++' : l.charAt(0) + l.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRun}
                disabled={running || submitting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all disabled:opacity-50"
              >
                {running ? (
                  <span className="w-3.5 h-3.5 border border-current/30 border-t-current rounded-full animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                Run
              </button>
              <button
                onClick={handleSubmit}
                disabled={running || submitting}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Submit
              </button>
            </div>
          </div>

          {/* Monaco */}
          <div className="flex-1 overflow-hidden">
            <MonacoEditor
              height="100%"
              language={getMonacoLanguage(language)}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: 'var(--font-geist-mono), Menlo, Monaco, monospace',
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: { top: 16, bottom: 16 },
                renderLineHighlight: 'line',
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                tabSize: 4,
              }}
            />
          </div>

          {/* Console */}
          <AnimatePresence>
            {consoleOpen && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 200 }}
                exit={{ height: 0 }}
                className="overflow-hidden border-t border-border flex-shrink-0"
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/30">
                  <span className="text-xs font-medium text-muted-foreground">Console</span>
                  <button onClick={() => setConsoleOpen(false)} className="text-muted-foreground hover:text-foreground text-xs">
                    ✕
                  </button>
                </div>
                <div className="p-4 overflow-y-auto h-[calc(200px-40px)] font-mono text-xs">
                  {result ? (
                    <div>
                      {result.type === 'submit' ? (
                        <div className={cn('font-semibold mb-2', getStatusColor(result.status))}>
                          {getStatusLabel(result.status)}
                        </div>
                      ) : (
                        <div className="text-muted-foreground mb-2">
                          Status: {result.status}
                        </div>
                      )}
                      {result.output && <pre className="text-foreground">{result.output}</pre>}
                      {(result.error || result.errorMsg) && (
                        <pre className="text-red-400">{result.error || result.errorMsg}</pre>
                      )}
                      {result.runtime && (
                        <div className="text-muted-foreground mt-2 flex gap-4">
                          <span>Runtime: {formatRuntime(result.runtime)}</span>
                          {result.memory && <span>Memory: {formatMemory(result.memory)}</span>}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground flex items-center gap-2">
                      <span className="w-3 h-3 border border-primary/30 border-t-primary rounded-full animate-spin" />
                      Running...
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  )
}
