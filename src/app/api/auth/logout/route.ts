import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' })
  response.cookies.delete('auth-token')
  return response
}

export async function GET() {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ user: session })
}
