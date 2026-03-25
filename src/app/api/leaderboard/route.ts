import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        streak: true,
        totalXP: true,
        _count: {
          select: {
            submissions: {
              where: { status: 'ACCEPTED' }
            }
          }
        }
      },
      orderBy: { totalXP: 'desc' },
      take: 50,
    })

    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      user: {
        id: u.id,
        name: u.name,
        image: u.image,
        email: u.email.replace(/(.{2}).*@/, '$1***@'),
      },
      totalSolved: u._count.submissions,
      totalXP: u.totalXP,
      streak: u.streak,
    }))

    return NextResponse.json({ leaderboard })
  } catch (err) {
    console.error('Leaderboard error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
