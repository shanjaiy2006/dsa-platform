import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { problemTitle, description, userCode, language, patternName } = await req.json()

    const prompt = `You are a helpful DSA mentor. A student is stuck on a coding problem.

Problem: ${problemTitle}
Pattern: ${patternName}
Description: ${description}

Student's current code (${language}):
\`\`\`${language.toLowerCase()}
${userCode || '// No code written yet'}
\`\`\`

Give a helpful hint that:
1. Points them in the right direction WITHOUT giving away the solution
2. References the ${patternName} pattern if relevant
3. Is encouraging and concise (2-4 sentences max)
4. Asks a guiding question to help them think

Do NOT write the solution code. Be Socratic.`

    // Use Anthropic API if available
    if (process.env.ANTHROPIC_API_KEY) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await response.json()
      const hint = data.content?.[0]?.text || 'Try thinking about the pattern structure first.'
      return NextResponse.json({ hint })
    }

    // Fallback hints by pattern
    const patternHints: Record<string, string[]> = {
      'Sliding Window': [
        'Think about maintaining a window over the data. What information do you need to track as the window moves?',
        'Can you avoid recomputing from scratch each time? What changes when the window slides by one position?',
        'Consider: what causes your window to expand? What causes it to shrink?',
      ],
      'Two Pointers': [
        'Since the array is sorted, what can you deduce when the sum is too large? Too small?',
        'Try starting one pointer at each end. How do you decide which pointer to move?',
      ],
      'Binary Search': [
        "Think about what property splits your search space in half. What does 'too small' vs 'too large' mean here?",
        'Can you define a monotonic predicate function? Binary search works when answers go from false→true (or true→false).',
      ],
      'Dynamic Programming': [
        'Start with brute force recursion first. What are the choices at each step?',
        'What information do you need to carry between subproblems? That\'s your state.',
        'Write the recurrence relation: dp[i] = ? in terms of smaller subproblems.',
      ],
      'Backtracking': [
        'Think about the three phases: choose, explore, unchoose. Are you undoing your choices after recursion?',
        'What is the base case? When do you know you have a complete solution?',
      ],
    }

    const hints = patternHints[patternName] || [
      'Break the problem into smaller pieces. What would the simplest version of this problem look like?',
      'Think about the constraints. What data structure would give you O(1) or O(log n) access to what you need?',
    ]

    const hint = hints[Math.floor(Math.random() * hints.length)]
    return NextResponse.json({ hint })
  } catch (err) {
    console.error('Hints error:', err)
    return NextResponse.json({ error: 'Failed to generate hint' }, { status: 500 })
  }
}
