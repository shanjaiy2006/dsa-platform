import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { problemId } = await req.json()

    const existing = await prisma.bookmark.findFirst({
      where: { userId: user.id, problemId }
    })

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } })
      return NextResponse.json({ bookmarked: false })
    }

    await prisma.bookmark.create({
      data: { userId: user.id, problemId }
    })
    return NextResponse.json({ bookmarked: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
