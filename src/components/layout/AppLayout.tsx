'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard, BookOpen, Code2, Dumbbell, Trophy, FileText,
  Zap, LogOut, Menu, X, ChevronRight, Flame, Star,
  Sun, Moon, Monitor
} from 'lucide-react'
import { useAuthStore } from '@/hooks/useAuthStore'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patterns', label: 'Patterns', icon: BookOpen },
  { href: '/problems', label: 'Problems', icon: Code2 },
  { href: '/practice', label: 'Practice', icon: Dumbbell },
  { href: '/interview', label: 'Interview Mode', icon: Zap },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/notes', label: 'Notes', icon: FileText },
]

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border mb-2">
      {[
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
      ].map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={cn(
            'flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all',
            theme === value
              ? 'bg-card text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Icon className="w-3 h-3" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, fetchUser, logout, loading } = useAuthStore()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    if (!fetched) { setFetched(true); fetchUser() }
  }, [])

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [loading, user])

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-background flex">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" />
        )}
      </AnimatePresence>

      <aside className={cn(
        'fixed left-0 top-0 z-50 h-full w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 md:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        <div className="p-5 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">D</div>
            <span className="font-semibold text-foreground">DSA Patterns</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  isActive ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}>
                <item.icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                {item.label}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto text-primary" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <ThemeToggle />
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500/5 border border-orange-500/10 mb-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-orange-400 font-medium">{user.streak}d streak</span>
            <div className="flex items-center gap-1 ml-auto">
              <Star className="w-3 h-3 text-amber-400" />
              <span className="text-xs text-muted-foreground">{user.totalXP} XP</span>
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-accent transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
            <button onClick={logout} className="text-muted-foreground hover:text-red-400 transition-colors" title="Log out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="md:hidden sticky top-0 z-30 bg-card border-b border-border px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">D</div>
            <span className="font-semibold text-foreground text-sm">DSA Patterns</span>
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
