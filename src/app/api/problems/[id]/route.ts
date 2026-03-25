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

    const problem = await prisma.problem.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        pattern: true,
        ...(user ? {
          submissions: {
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          bookmarks: {
            where: { userId: user.id },
            take: 1,
          }
        } : {})
      }
    })

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    return NextResponse.json({ problem })
  } catch (err) {
    console.error('Problem GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
