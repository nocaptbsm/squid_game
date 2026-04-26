export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { generateQRBuffer } from '@/lib/qr'

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const buffer = await generateQRBuffer(token)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    })
  } catch (error) {
    console.error('QR generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}
