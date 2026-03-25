# 🧠 DSA Patterns — Pattern-Based DSA Learning Platform

A premium, production-ready web platform for mastering Data Structures & Algorithms through pattern-based learning. Built with Next.js 14, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

![DSA Patterns](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-5-2d3748?style=flat-square&logo=prisma)

---

## ✨ Features

- **Pattern-Based Learning** — 20 core patterns with detailed explanations, templates, and visual intuition
- **In-Browser Code Editor** — Monaco editor with Java, Python, and C++ support
- **AI-Powered Hints** — Socratic hints powered by Claude (Anthropic)
- **Real Code Execution** — Judge0 integration for running/submitting code
- **Progress Tracking** — Mastery levels, XP, streaks, and heatmaps
- **Interview Mode** — Timed mock interviews with random problem selection
- **Leaderboard** — Community rankings by XP and problems solved
- **Smart Practice** — Spaced repetition recommendations based on weak patterns
- **Notes System** — Full-featured markdown note-taking per problem/pattern
- **Bookmarks** — Save important problems for revision
- **Dark Mode** — Beautiful dark-first design with glassmorphism

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Animations | Framer Motion |
| Editor | Monaco Editor (VS Code engine) |
| State | Zustand |
| Auth | JWT + httpOnly cookies |
| Database | PostgreSQL via Prisma ORM |
| Hosting | Vercel (frontend) + Neon/Supabase (DB) |
| AI Hints | Anthropic Claude API |
| Code Execution | Judge0 API |

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or cloud)

### 1. Clone and install
```bash
git clone https://github.com/yourusername/dsa-patterns.git
cd dsa-patterns
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dsa_patterns"
JWT_SECRET="your-secret-key-run-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Optional for AI hints:
ANTHROPIC_API_KEY="sk-ant-..."

# Optional for real code execution:
JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY="your-rapidapi-key"
```

### 3. Set up the database
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data (patterns + problems + demo user)
npm run db:seed
```

### 4. Run the development server
```bash
npm run dev
```

Visit http://localhost:3000

### 5. Demo credentials
```
Email: demo@dsapatterns.dev
Password: demo1234
```

---

## 🗄️ Database Setup Options

### Option A: Supabase (Recommended — Free tier available)
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database → Connection string
4. Copy the **Direct** connection string (not the pooler for migrations)
5. Add to `.env.local`:
```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

### Option B: Neon (Serverless PostgreSQL — Free tier)
1. Go to https://neon.tech
2. Create project
3. Copy the connection string
4. Add `?sslmode=require` at the end

### Option C: Local PostgreSQL
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15
createdb dsa_patterns

# Ubuntu
sudo apt install postgresql
sudo -u postgres createdb dsa_patterns
```

---

## ☁️ Deployment (Vercel + Neon)

### Step 1: Database (Neon)
1. Create account at https://neon.tech
2. Create new project → choose region closest to your users
3. Copy the connection string from dashboard
4. Note: Use the **pooler** connection string for Vercel (serverless)

### Step 2: Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect GitHub repo in Vercel dashboard
```

### Step 3: Set Environment Variables in Vercel
In your Vercel project dashboard → Settings → Environment Variables:

```
DATABASE_URL          = postgresql://...  (from Neon)
JWT_SECRET            = (run: openssl rand -base64 32)
NEXTAUTH_URL          = https://your-app.vercel.app
ANTHROPIC_API_KEY     = sk-ant-...  (optional)
JUDGE0_API_URL        = https://judge0-ce.p.rapidapi.com  (optional)
JUDGE0_API_KEY        = ...  (optional)
```

### Step 4: Run database migrations on production
```bash
# Set DATABASE_URL to your Neon URL temporarily
DATABASE_URL="postgresql://..." npm run db:push
DATABASE_URL="postgresql://..." npm run db:seed
```

Or use Vercel's run command:
```bash
vercel env pull .env.production.local
npx prisma db push
npx tsx prisma/seed.ts
```

### Step 5: Redeploy
```bash
vercel --prod
```

---

## 🔑 Getting API Keys

### Anthropic (AI Hints)
1. Go to https://console.anthropic.com
2. Create account → API Keys → Create Key
3. Add to env as `ANTHROPIC_API_KEY`
4. Free trial credits available

### Judge0 (Code Execution)
1. Go to https://rapidapi.com/judge0-official/api/judge0-ce
2. Subscribe to the **Basic** plan (free: 50 req/day)
3. Copy your RapidAPI Key
4. Add to env as `JUDGE0_API_KEY`
5. `JUDGE0_API_URL` = `https://judge0-ce.p.rapidapi.com`

> **Note:** Without Judge0, the platform uses demo mode (simulated execution). This is fine for development and testing.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx          # Login page
│   │   └── signup/page.tsx         # Signup page
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts      # POST /api/auth/login
│   │   │   ├── signup/route.ts     # POST /api/auth/signup
│   │   │   └── logout/route.ts     # POST /api/auth/logout
│   │   ├── patterns/
│   │   │   ├── route.ts            # GET /api/patterns
│   │   │   └── [id]/route.ts       # GET /api/patterns/:id
│   │   ├── problems/
│   │   │   ├── route.ts            # GET /api/problems
│   │   │   └── [id]/
│   │   │       ├── route.ts        # GET /api/problems/:id
│   │   │       └── submit/route.ts # POST /api/problems/:id/submit
│   │   ├── execute/route.ts        # POST /api/execute
│   │   ├── hints/route.ts          # POST /api/hints
│   │   ├── notes/route.ts          # CRUD /api/notes
│   │   ├── bookmarks/route.ts      # POST /api/bookmarks
│   │   ├── progress/route.ts       # GET /api/progress (dashboard)
│   │   └── leaderboard/route.ts    # GET /api/leaderboard
│   ├── dashboard/page.tsx          # Main dashboard
│   ├── patterns/
│   │   ├── page.tsx                # Patterns list
│   │   └── [id]/page.tsx           # Pattern detail
│   ├── problems/
│   │   ├── page.tsx                # Problems list
│   │   └── [id]/page.tsx           # Problem + Editor
│   ├── practice/page.tsx           # Smart practice
│   ├── interview/page.tsx          # Mock interview mode
│   ├── leaderboard/page.tsx        # Leaderboard
│   ├── notes/page.tsx              # Notes CRUD
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Landing page
├── components/
│   ├── layout/
│   │   └── AppLayout.tsx           # Sidebar + navigation
│   └── shared/
│       └── ThemeProvider.tsx       # Dark mode
├── hooks/
│   ├── useAuthStore.ts             # Zustand auth state
│   └── useDebounce.ts              # Debounce hook
├── lib/
│   ├── auth.ts                     # JWT utilities
│   ├── prisma.ts                   # Prisma client singleton
│   └── utils.ts                    # Helper functions
├── styles/
│   └── globals.css                 # Global styles + design tokens
└── types/
    └── index.ts                    # TypeScript interfaces
prisma/
├── schema.prisma                   # Database schema
└── seed.ts                         # Seed data (patterns + problems)
```

---

## 🧩 Adding More Content

### Add a new pattern
Edit `prisma/seed.ts` and add to the `patterns` array:
```typescript
{
  slug: 'your-pattern',
  name: 'Your Pattern Name',
  description: 'Brief description',
  difficulty: Difficulty.MEDIUM,
  order: 10,
  icon: '⊞',
  color: '#your-hex-color',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  conceptExplanation: '# Your Pattern\n\nMarkdown content...',
  visualIntuition: 'Visual explanation...',
  stepByStep: '## Steps\n1. Step one...',
  templateCode: {
    java: '// Java template',
    python: '# Python template',
    cpp: '// C++ template'
  },
  commonMistakes: '## Mistakes\n1. ...',
  interviewInsights: '## Tips\n...',
}
```

Then run `npm run db:seed`.

### Add problems
Add to the `problems` array in `prisma/seed.ts` with a `patternSlug` matching an existing pattern.

---

## 🔧 Customization

### Change theme colors
Edit `src/styles/globals.css` — modify the CSS variables in the `:root` and `.dark` blocks.

### Add a language
1. Add to `Language` enum in `prisma/schema.prisma`
2. Add to `getMonacoLanguage()` in `src/lib/utils.ts`
3. Add template to `getDefaultCode()` in `src/lib/utils.ts`
4. Add to Judge0 language map in `src/app/api/execute/route.ts`

---

## 🛠️ Development Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes (no migration file)
npm run db:migrate   # Create migration file + push
npm run db:seed      # Seed database with patterns & problems
npm run db:studio    # Open Prisma Studio (GUI for DB)
```

---

## 🎯 Roadmap

- [ ] OAuth (Google/GitHub login)
- [ ] Company-specific problem sets
- [ ] Video explanations per pattern
- [ ] Discussion threads per problem
- [ ] Resume-based recommendations
- [ ] Pattern detection training mode
- [ ] Mobile app (React Native)
- [ ] Weekly contests
- [ ] Team/study group features

---

## 📝 License

MIT — feel free to use, modify, and deploy.

---

Built with ❤️ for developers who want to crack their next technical interview.
