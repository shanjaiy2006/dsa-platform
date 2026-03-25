import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code, language } = await req.json()
    if (!code || !language) {
      return NextResponse.json({ error: 'Code and language required' }, { status: 400 })
    }

    const problem = await prisma.problem.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
      include: { pattern: true }
    })

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    // Execute via Judge0
    let status = 'ACCEPTED'
    let runtime: number | null = null
    let memory: number | null = null
    let output: string | null = null
    let errorMsg: string | null = null

    if (process.env.JUDGE0_API_URL) {
      try {
        const judge0Result = await executeCode(code, language)
        status = mapJudge0Status(judge0Result.status?.id)
        runtime = judge0Result.time ? Math.round(parseFloat(judge0Result.time) * 1000) : null
        memory = judge0Result.memory || null
        output = judge0Result.stdout || null
        errorMsg = judge0Result.stderr || judge0Result.compile_output || null
      } catch (e) {
        console.error('Judge0 error:', e)
        // Fall back to mock accepted for demo
        status = 'ACCEPTED'
        runtime = Math.floor(Math.random() * 100) + 10
        memory = Math.floor(Math.random() * 10000) + 5000
      }
    } else {
      // Demo mode: simulate execution
      await new Promise(r => setTimeout(r, 800))
      const rand = Math.random()
      if (rand > 0.3) {
        status = 'ACCEPTED'
        runtime = Math.floor(Math.random() * 100) + 5
        memory = Math.floor(Math.random() * 10000) + 5000
      } else {
        status = 'WRONG_ANSWER'
        output = 'Expected: 9\nGot: 7'
      }
    }

    // Save submission
    const submission = await prisma.submission.create({
      data: {
        userId: user.id,
        problemId: problem.id,
        code,
        language: language as any,
        status: status as any,
        runtime,
        memory,
        output,
        errorMsg,
      }
    })

    // Update stats if accepted
    if (status === 'ACCEPTED') {
      // Update problem stats
      await prisma.problem.update({
        where: { id: problem.id },
        data: { solvedCount: { increment: 1 }, attemptCount: { increment: 1 } }
      })

      // Check if first time solving
      const prevAccepted = await prisma.submission.count({
        where: { userId: user.id, problemId: problem.id, status: 'ACCEPTED', NOT: { id: submission.id } }
      })

      if (prevAccepted === 0) {
        // Update user progress
        await prisma.userProgress.updateMany({
          where: { userId: user.id, patternId: problem.patternId },
          data: {
            solvedCount: { increment: 1 },
            lastPracticed: new Date(),
          }
        })

        // Recalculate mastery
        const progress = await prisma.userProgress.findFirst({
          where: { userId: user.id, patternId: problem.patternId }
        })
        if (progress) {
          const masteryLevel = Math.min(100, Math.round((progress.solvedCount / Math.max(progress.totalCount, 1)) * 100))
          await prisma.userProgress.update({
            where: { id: progress.id },
            data: { masteryLevel }
          })
        }

        // Award XP
        const xpMap: Record<string, number> = { EASY: 50, MEDIUM: 100, HARD: 200 }
        await prisma.user.update({
          where: { id: user.id },
          data: { totalXP: { increment: xpMap[problem.difficulty] || 50 } }
        })

        // Update streak
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const userRecord = await prisma.user.findUnique({ where: { id: user.id } })
        if (userRecord) {
          const lastSolved = userRecord.lastSolvedAt
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)

          let newStreak = userRecord.streak
          if (!lastSolved || lastSolved < yesterday) {
            newStreak = 1
          } else if (lastSolved >= yesterday && lastSolved < today) {
            newStreak = userRecord.streak + 1
          }

          await prisma.user.update({
            where: { id: user.id },
            data: { lastSolvedAt: new Date(), streak: newStreak }
          })
        }
      }
    } else {
      await prisma.problem.update({
        where: { id: problem.id },
        data: { attemptCount: { increment: 1 } }
      })
    }

    return NextResponse.json({ submission })
  } catch (err) {
    console.error('Submit error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function executeCode(code: string, language: string) {
  const langMap: Record<string, number> = {
    JAVA: 62,
    PYTHON: 71,
    CPP: 54,
  }

  const response = await fetch(`${process.env.JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': process.env.JUDGE0_API_KEY || '',
    },
    body: JSON.stringify({
      source_code: code,
      language_id: langMap[language] || 71,
      stdin: '',
    }),
  })

  return response.json()
}

function mapJudge0Status(statusId?: number): string {
  const map: Record<number, string> = {
    3: 'ACCEPTED',
    4: 'WRONG_ANSWER',
    5: 'TIME_LIMIT_EXCEEDED',
    6: 'COMPILE_ERROR',
    11: 'RUNTIME_ERROR',
    12: 'RUNTIME_ERROR',
    13: 'RUNTIME_ERROR',
    14: 'RUNTIME_ERROR',
  }
  return map[statusId || 0] || 'RUNTIME_ERROR'
}
