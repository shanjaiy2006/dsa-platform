'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Trophy, Flame, Star, Medal } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { useAuthStore } from '@/hooks/useAuthStore'
import { cn } from '@/lib/utils'

const rankColors: Record<number, string> = {
  1: 'text-amber-400',
  2: 'text-slate-300',
  3: 'text-amber-600',
}

const rankBg: Record<number, string> = {
  1: 'bg-amber-400/10 border-amber-400/20',
  2: 'bg-slate-300/10 border-slate-300/20',
  3: 'bg-amber-600/10 border-amber-600/20',
}

export default function LeaderboardPage() {
  const { user } = useAuthStore()
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/leaderboard').then(({ data }) => {
      setLeaderboard(data.leaderboard)
      setLoading(false)
    })
  }, [])

  const myRank = leaderboard.find(e => e.user.id === user?.id)

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground text-sm">Top learners ranked by XP earned</p>
        </motion.div>

        {/* My rank card */}
        {myRank && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-4 mb-6 border border-primary/20 bg-primary/5"
          >
            <div className="flex items-center gap-4">
              <div className="text-lg font-bold text-primary w-8 text-center">#{myRank.rank}</div>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground text-sm">You</div>
                <div className="text-xs text-muted-foreground">{myRank.totalSolved} problems solved</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-primary">{myRank.totalXP.toLocaleString()} XP</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                  <Flame className="w-3 h-3 text-orange-400" />{myRank.streak}d
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Top 3 podium */}
        {!loading && leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, idx) => {
              const actualRank = idx === 0 ? 2 : idx === 1 ? 1 : 3
              const heights = ['h-24', 'h-32', 'h-20']
              return (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    'glass rounded-2xl p-4 flex flex-col items-center justify-end border',
                    rankBg[actualRank] || 'border-border',
                    heights[idx]
                  )}
                >
                  <div className={cn('text-xl font-bold mb-1', rankColors[actualRank] || 'text-foreground')}>
                    {actualRank === 1 ? '🥇' : actualRank === 2 ? '🥈' : '🥉'}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground">
                    {entry.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-xs font-medium text-foreground mt-1 text-center truncate w-full">
                    {entry.user.name.split(' ')[0]}
                  </div>
                  <div className="text-xs text-muted-foreground">{entry.totalXP.toLocaleString()} XP</div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Full list */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-3 border-b border-border text-xs font-medium text-muted-foreground bg-secondary/30">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">User</div>
            <div className="col-span-2">Solved</div>
            <div className="col-span-2">Streak</div>
            <div className="col-span-2 text-right">XP</div>
          </div>

          {loading ? (
            <div className="divide-y divide-border">
              {[...Array(10)].map((_, i) => <div key={i} className="h-14 shimmer" />)}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {leaderboard.map((entry, idx) => {
                const isMe = entry.user.id === user?.id
                return (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className={cn(
                      'grid grid-cols-12 px-4 py-3.5 items-center',
                      isMe ? 'bg-primary/5' : 'hover:bg-accent/50 transition-colors'
                    )}
                  >
                    <div className={cn('col-span-1 font-bold text-sm', rankColors[entry.rank] || 'text-muted-foreground')}>
                      {entry.rank <= 3 ? (entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉') : `#${entry.rank}`}
                    </div>
                    <div className="col-span-5 flex items-center gap-2">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                        isMe ? 'bg-primary/20 text-primary' : 'bg-muted text-foreground'
                      )}>
                        {entry.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {entry.user.name}
                          {isMe && <span className="ml-1 text-xs text-primary">(you)</span>}
                        </div>
                        <div className="text-xs text-muted-foreground">{entry.user.email}</div>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-foreground">{entry.totalSolved}</div>
                    <div className="col-span-2 flex items-center gap-1 text-sm text-muted-foreground">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      {entry.streak}d
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-sm font-semibold text-foreground">{entry.totalXP.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground ml-1">XP</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
