import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionFromRequest(req)
    const { searchParams } = new URL(req.url)
    const patternId = searchParams.get('patternId')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (patternId) where.patternId = patternId
    if (difficulty) where.difficulty = difficulty
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
        { companies: { has: search } },
      ]
    }

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ order: 'asc' }],
        include: {
          pattern: { select: { id: true, name: true, slug: true, color: true } },
          ...(user ? {
            submissions: {
              where: { userId: user.id, status: 'ACCEPTED' },
              take: 1,
              select: { id: true }
            },
            bookmarks: {
              where: { userId: user.id },
              take: 1,
              select: { id: true }
            }
          } : {})
        }
      }),
      prisma.problem.count({ where })
    ])

    return NextResponse.json({
      problems,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (err) {
    console.error('Problems GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
