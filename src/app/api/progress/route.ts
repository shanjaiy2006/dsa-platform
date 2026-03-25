import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { generateHeatmapData } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [
      progress,
      recentSubmissions,
      totalProblems,
      acceptedSubmissions,
      userRecord,
    ] = await Promise.all([
      prisma.userProgress.findMany({
        where: { userId: user.id },
        include: { pattern: { select: { id: true, name: true, slug: true, color: true, icon: true } } },
        orderBy: { masteryLevel: 'asc' }
      }),
      prisma.submission.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          problem: { select: { id: true, title: true, slug: true, difficulty: true } }
        }
      }),
      prisma.problem.count(),
      prisma.submission.findMany({
        where: { userId: user.id, status: 'ACCEPTED' },
        select: { problemId: true, createdAt: true },
        distinct: ['problemId'],
      }),
      prisma.user.findUnique({
        where: { id: user.id },
        select: { streak: true, totalXP: true, lastSolvedAt: true }
      })
    ])

    // Build heatmap from submissions (last 365 days)
    const heatmapData = generateHeatmapData(365)
    const allSubs = await prisma.submission.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
      },
      select: { createdAt: true, status: true }
    })

    allSubs.forEach(sub => {
      const dateStr = sub.createdAt.toISOString().split('T')[0]
      const day = heatmapData.find(d => d.date === dateStr)
      if (day) day.count++
    })

    // Weak patterns = lowest mastery with some attempts
    const weakPatterns = progress
      .filter(p => p.solvedCount > 0)
      .slice(0, 3)
      .map(p => p.pattern)

    return NextResponse.json({
      stats: {
        totalSolved: acceptedSubmissions.length,
        totalProblems,
        currentStreak: userRecord?.streak || 0,
        totalXP: userRecord?.totalXP || 0,
        solvedByDifficulty: {
          easy: acceptedSubmissions.filter(s => true).length, // simplified
        }
      },
      progress,
      recentSubmissions,
      weakPatterns,
      heatmapData,
    })
  } catch (err) {
    console.error('Dashboard error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
