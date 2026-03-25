import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionFromRequest(req)
    const { id } = params

    const pattern = await prisma.pattern.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        problems: {
          orderBy: { order: 'asc' },
          include: {
            ...(user ? {
              submissions: {
                where: { userId: user.id, status: 'ACCEPTED' },
                take: 1,
                select: { id: true, status: true }
              },
              bookmarks: {
                where: { userId: user.id },
                take: 1,
                select: { id: true }
              }
            } : {})
          }
        },
        ...(user ? {
          userProgress: {
            where: { userId: user.id },
          }
        } : {})
      }
    })

    if (!pattern) {
      return NextResponse.json({ error: 'Pattern not found' }, { status: 404 })
    }

    return NextResponse.json({ pattern })
  } catch (err) {
    console.error('Pattern GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
