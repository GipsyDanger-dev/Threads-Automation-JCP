import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, threadItems, accountId } = body

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const apiKey = process.env.ZERNIO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Zernio API key not configured' }, { status: 500 })
    }

    const payload = {
      content,
      platforms: [
        {
          platform: 'threads',
          accountId: accountId || '6a4769089d9472faae61f262',
          platformSpecificData: { threadItems: threadItems || [] },
        },
      ],
      publishNow: true,
    }

    const res = await fetch('https://zernio.com/api/v1/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: errData.message || `Zernio API error: ${res.status}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Publish error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
