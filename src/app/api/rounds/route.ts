import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !['ADMIN', 'VOLUNTEER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { playerId, round, status } = await request.json()

    if (!playerId || !round || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const allRounds = await prisma.roundStatus.findMany({
      where: { playerId }
    })

    const hasEliminated = allRounds.some(r => r.status === 'ELIMINATED')
    
    if (hasEliminated) {
      return NextResponse.json({ error: 'Player is already eliminated' }, { status: 403 })
    }

    const currentRound = allRounds.find(r => r.round === round)
    if (currentRound?.status === 'ELIMINATED') {
      return NextResponse.json({ error: 'Player eliminated in this round' }, { status: 403 })
    }

    const updatedRound = await prisma.roundStatus.update({
      where: {
        playerId_round: {
          playerId,
          round
        }
      },
      data: {
        status,
        updatedBy: session.user.id
      }
    })

    return NextResponse.json(updatedRound)
  } catch (error) {
    console.error('Round update error:', error)
    return NextResponse.json({ error: 'Failed to update round' }, { status: 500 })
  }
}
