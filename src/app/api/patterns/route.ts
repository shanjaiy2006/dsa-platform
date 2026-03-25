import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionFromRequest(req)

    const patterns = await prisma.pattern.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { problems: true } },
        ...(user ? {
          userProgress: {
            where: { userId: user.id },
            take: 1,
          }
        } : {})
      }
    })

    const formatted = patterns.map((p: any) => ({
      ...p,
      userProgress: p.userProgress?.[0] || null,
    }))

    return NextResponse.json({ patterns: formatted })
  } catch (err) {
    console.error('Patterns GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
