'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  Code2, Flame, Star, TrendingUp, Target, Clock,
  CheckCircle2, XCircle, AlertCircle, BookOpen
} from 'lucide-react'
import { useAuthStore } from '@/hooks/useAuthStore'
import { cn, getMasteryLabel, getStatusColor, getStatusLabel, formatTimeAgo, getXPForLevel } from '@/lib/utils'
import Link from 'next/link'
import AppLayout from '@/components/layout/AppLayout'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS = ['S','M','T','W','T','F','S']

function Heatmap({ data }: { data: { date: string; count: number }[] }) {
  const weeks: typeof data[] = []
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7))
  }

  const getColor = (count: number) => {
    if (count === 0) return 'bg-muted/50'
    if (count === 1) return 'bg-primary/20'
    if (count === 2) return 'bg-primary/40'
    if (count <= 4) return 'bg-primary/60'
    return 'bg-primary'
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                title={`${day.date}: ${day.count} submissions`}
                className={cn('w-3 h-3 rounded-sm heatmap-cell', getColor(day.count))}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color, sub }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + '15' }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
      {sub && <div className="text-xs text-muted-foreground/60 mt-0.5">{sub}</div>}
    </motion.div>
  )
}

function MasteryRing({ level, color }: { level: number; color: string }) {
  const r = 20
  const circ = 2 * Math.PI * r
  const offset = circ - (level / 100) * circ

  return (
    <svg width="52" height="52" className="rotate-[-90deg]">
      <circle cx="26" cy="26" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
      <circle
        cx="26" cy="26" r={r}
        fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [dashData, setDashData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const xpInfo = user ? getXPForLevel(user.totalXP) : null

  useEffect(() => {
    const fetchDash = async () => {
      try {
        const { data } = await axios.get('/api/progress')
        setDashData(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDash()
  }, [])

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl shimmer" />
          ))}
        </div>
      </AppLayout>
    )
  }

  const stats = dashData?.stats || {}
  const progress = dashData?.progress || []
  const recentSubs = dashData?.recentSubmissions || []
  const heatmap = dashData?.heatmapData || []

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {stats.currentStreak > 0
              ? `You're on a ${stats.currentStreak}-day streak. Keep it up!`
              : "Start solving problems to build your streak!"}
          </p>
        </motion.div>

        {/* XP progress */}
        {xpInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-4 mb-6 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold text-sm">
              {xpInfo.level}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">Level {xpInfo.level}</span>
                <span className="text-xs text-muted-foreground">{user?.totalXP} / {xpInfo.nextLevelXP} XP</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpInfo.progress}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                />
              </div>
            </div>
            <Star className="w-4 h-4 text-amber-400" />
          </motion.div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Problems Solved" value={stats.totalSolved || 0} icon={CheckCircle2} color="#10b981" sub={`of ${stats.totalProblems || 0} total`} />
          <StatCard label="Current Streak" value={`${stats.currentStreak || 0}d`} icon={Flame} color="#f97316" sub="consecutive days" />
          <StatCard label="Total XP" value={`${(stats.totalXP || 0).toLocaleString()}`} icon={Star} color="#f59e0b" sub={`Level ${xpInfo?.level || 1}`} />
          <StatCard label="Patterns Started" value={progress.filter((p: any) => p.solvedCount > 0).length} icon={Target} color="#6366f1" sub={`of ${progress.length} patterns`} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Pattern Mastery */}
          <div className="lg:col-span-2 glass rounded-2xl p-6">
            <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Pattern Mastery
            </h2>
            <div className="space-y-3">
              {progress.slice(0, 6).map((p: any) => {
                const mastery = getMasteryLabel(p.masteryLevel)
                return (
                  <Link key={p.id} href={`/patterns/${p.pattern.slug}`}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors group">
                      <div className="relative w-13 h-13 flex-shrink-0">
                        <MasteryRing level={p.masteryLevel} color={p.pattern.color} />
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                          {p.masteryLevel}%
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground truncate">{p.pattern.name}</span>
                          <span className="text-xs ml-2 flex-shrink-0" style={{ color: mastery.color }}>{mastery.label}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${p.masteryLevel}%` }}
                              transition={{ duration: 0.8 }}
                              className="h-full rounded-full"
                              style={{ background: p.pattern.color }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {p.solvedCount}/{p.totalCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
            <Link href="/patterns" className="block text-center text-xs text-primary hover:underline mt-4">
              View all patterns →
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Recent Submissions
            </h2>
            <div className="space-y-2">
              {recentSubs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Code2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No submissions yet.<br />
                  <Link href="/problems" className="text-primary hover:underline">Start solving!</Link>
                </div>
              ) : (
                recentSubs.map((sub: any) => (
                  <Link key={sub.id} href={`/problems/${sub.problem?.slug}`}>
                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors">
                      {sub.status === 'ACCEPTED'
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        : sub.status === 'WRONG_ANSWER'
                        ? <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        : <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-foreground truncate">
                          {sub.problem?.title}
                        </div>
                        <div className={cn('text-xs', getStatusColor(sub.status))}>
                          {getStatusLabel(sub.status)}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatTimeAgo(sub.createdAt)}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Activity Heatmap
          </h2>
          <Heatmap data={heatmap} />
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-xs text-muted-foreground">Less</span>
            {['bg-muted/50', 'bg-primary/20', 'bg-primary/40', 'bg-primary/60', 'bg-primary'].map(c => (
              <div key={c} className={cn('w-3 h-3 rounded-sm', c)} />
            ))}
            <span className="text-xs text-muted-foreground">More</span>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
