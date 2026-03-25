'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Code2, Brain, Zap, Trophy, ChevronRight, Star, Users, Target } from 'lucide-react'

const patterns = [
  { name: 'Sliding Window', icon: '⊡', color: '#6366f1', problems: 15 },
  { name: 'Two Pointers', icon: '⇄', color: '#10b981', problems: 12 },
  { name: 'Binary Search', icon: '⌖', color: '#f59e0b', problems: 18 },
  { name: 'DFS', icon: '↯', color: '#8b5cf6', problems: 20 },
  { name: 'BFS', icon: '≋', color: '#06b6d4', problems: 14 },
  { name: 'Dynamic Programming', icon: '⬡', color: '#ef4444', problems: 30 },
  { name: 'Backtracking', icon: '↩', color: '#f97316', problems: 16 },
  { name: 'Greedy', icon: '◈', color: '#84cc16', problems: 12 },
]

const stats = [
  { label: 'Patterns Covered', value: '20+', icon: Target },
  { label: 'Curated Problems', value: '300+', icon: Code2 },
  { label: 'Active Learners', value: '12K+', icon: Users },
  { label: 'Success Rate', value: '87%', icon: Trophy },
]

const features = [
  {
    icon: Brain,
    title: 'Pattern-Based Learning',
    description: 'Stop grinding randomly. Learn the 20 core patterns that power 90% of all DSA problems.',
    color: '#6366f1',
  },
  {
    icon: Code2,
    title: 'In-Browser Code Editor',
    description: 'Write, run, and submit solutions in Java, Python, or C++ without leaving the platform.',
    color: '#10b981',
  },
  {
    icon: Zap,
    title: 'AI-Powered Hints',
    description: "Stuck? Get intelligent hints that guide you toward the solution without giving it away.",
    color: '#f59e0b',
  },
  {
    icon: Trophy,
    title: 'Interview Simulation',
    description: 'Practice under real interview conditions with timed mock interviews and pattern detection.',
    color: '#8b5cf6',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
              D
            </div>
            <span className="font-semibold text-foreground">DSA Patterns</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {['Patterns', 'Problems', 'Leaderboard'].map(item => (
              <Link key={item} href={`/${item.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {item}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-100" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-8"
          >
            <Star className="w-3 h-3 fill-primary" />
            Pattern-based DSA learning platform
            <ChevronRight className="w-3 h-3" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"
          >
            Master DSA through{' '}
            <span className="gradient-text">patterns,</span>
            <br />not random problems
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Stop spending months grinding LeetCode blindly. Learn the 20 fundamental patterns
            that crack 90% of interview problems — then practice with mapped problem sets.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/auth/signup"
              className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20"
            >
              Start Learning Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/patterns"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border hover:border-border/80 text-foreground font-medium transition-all hover:bg-accent"
            >
              Browse Patterns
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 pb-20">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={item} className="glass rounded-2xl p-6 text-center">
              <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Patterns Grid */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">20 Patterns. Infinite Problems.</h2>
            <p className="text-muted-foreground">Every problem maps to one of these core patterns. Learn the pattern, solve any variant.</p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {patterns.map((pattern) => (
              <motion.div
                key={pattern.name}
                variants={item}
                whileHover={{ scale: 1.03, y: -2 }}
                className="glass glass-hover rounded-2xl p-5 cursor-pointer group pattern-glow"
                style={{ '--pattern-color': pattern.color + '33' } as React.CSSProperties}
              >
                <div
                  className="text-2xl mb-3 w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                  style={{ background: pattern.color + '15', color: pattern.color }}
                >
                  {pattern.icon}
                </div>
                <div className="font-medium text-foreground text-sm mb-1">{pattern.name}</div>
                <div className="text-xs text-muted-foreground">{pattern.problems} problems</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Everything you need to succeed</h2>
            <p className="text-muted-foreground">Built for engineers who want to get to the offer, not just solve problems.</p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                className="glass rounded-2xl p-8 group hover:border-border transition-all"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: feature.color + '15' }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center glass rounded-3xl p-12"
        >
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to crack your next interview?</h2>
          <p className="text-muted-foreground mb-8">Join thousands of engineers who landed offers at FAANG companies.</p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:scale-105"
          >
            Start for free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">D</div>
            <span>DSA Patterns © 2024</span>
          </div>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Contact'].map(link => (
              <a key={link} href="#" className="hover:text-foreground transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
