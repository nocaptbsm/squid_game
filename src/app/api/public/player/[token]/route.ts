export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const player = await prisma.player.findUnique({
      where: { qrToken: token },
      select: {
        playerNumber: true,
        name: true,
        isRegistered: true,
        photoUrl: true,
        rounds: { 
          select: { 
            round: true, 
            status: true 
          } 
        }
      }
    })

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    return NextResponse.json(player)
  } catch (error) {
    console.error('Public player fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player info' },
      { status: 500 }
    )
  }
}
