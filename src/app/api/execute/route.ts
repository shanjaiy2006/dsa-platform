import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code, language, stdin } = await req.json()

    if (process.env.JUDGE0_API_URL) {
      const langMap: Record<string, number> = { JAVA: 62, PYTHON: 71, CPP: 54 }
      const response = await fetch(
        `${process.env.JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': process.env.JUDGE0_API_KEY || '',
          },
          body: JSON.stringify({
            source_code: code,
            language_id: langMap[language] || 71,
            stdin: stdin || '',
          }),
        }
      )
      const result = await response.json()
      return NextResponse.json({
        status: result.status?.description || 'Unknown',
        output: result.stdout,
        error: result.stderr || result.compile_output,
        runtime: result.time ? Math.round(parseFloat(result.time) * 1000) : null,
        memory: result.memory,
      })
    }

    // Demo mode simulation
    await new Promise(r => setTimeout(r, 600))
    const demoOutputs: Record<string, string> = {
      PYTHON: '9\n',
      JAVA: '9\n',
      CPP: '9\n',
    }

    return NextResponse.json({
      status: 'Accepted',
      output: demoOutputs[language] || '9\n',
      runtime: Math.floor(Math.random() * 50) + 10,
      memory: Math.floor(Math.random() * 5000) + 2000,
    })
  } catch (err) {
    console.error('Execute error:', err)
    return NextResponse.json({ error: 'Execution failed' }, { status: 500 })
  }
}
