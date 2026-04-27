import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { ROUND_ORDER } from '@/lib/constants'
import { RoundName } from '@prisma/client'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const slug = params.slug.toUpperCase().replace(/-/g, '_')
    // Handle special slugs like 'rlgl' or 'preliminary'
    const slugMap: Record<string, RoundName> = {
      'PRELIMINARY': 'PRELIMINARY',
      'RLGL': 'RED_LIGHT_GREEN_LIGHT',
      'HITCH_HIKE': 'HITCH_HIKE',
      '90S_COLLAPSE': 'SOUL_SEEKERS',
      'GLASS_BRIDGE': 'GLASS_BRIDGE',
      'WRIGHT_WAY': 'THE_WRIGHT_WAY',
      'CHOCOLATE': 'CHOCOLATE_CRUCIBLE'
    }
    
    const roundName = slugMap[slug] || slug as RoundName
    const roundIndex = ROUND_ORDER.indexOf(roundName)

    if (roundIndex === -1) {
      return NextResponse.json({ error: 'Invalid round' }, { status: 400 })
    }

    let players;

    if (roundIndex === 0) {
      // First round: All registered players
      players = await prisma.player.findMany({
        where: { isRegistered: true },
        include: {
          rounds: {
            where: { round: roundName }
          }
        },
        orderBy: { playerNumber: 'asc' }
      })
    } else {
      // Subsequent rounds: Only survivors of the previous round
      const prevRound = ROUND_ORDER[roundIndex - 1]
      players = await prisma.player.findMany({
        where: {
          isRegistered: true,
          rounds: {
            some: {
              round: prevRound,
              status: 'SURVIVED'
            }
          }
        },
        include: {
          rounds: {
            where: { round: roundName }
          }
        },
        orderBy: { playerNumber: 'asc' }
      })
    }

    return NextResponse.json({ players })
  } catch (error) {
    console.error('Fetch round players error:', error)
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { updates } = await req.json() // Array of { playerId: string, status: 'SURVIVED' | 'ELIMINATED' | 'PENDING' }
    const slug = params.slug.toUpperCase().replace(/-/g, '_')
    const slugMap: Record<string, RoundName> = {
      'PRELIMINARY': 'PRELIMINARY',
      'RLGL': 'RED_LIGHT_GREEN_LIGHT',
      'HITCH_HIKE': 'HITCH_HIKE',
      '90S_COLLAPSE': 'SOUL_SEEKERS',
      'GLASS_BRIDGE': 'GLASS_BRIDGE',
      'WRIGHT_WAY': 'THE_WRIGHT_WAY',
      'CHOCOLATE': 'CHOCOLATE_CRUCIBLE'
    }
    const roundName = slugMap[slug] || slug as RoundName

    await prisma.$transaction(
      updates.map((u: any) => 
        prisma.roundStatus.update({
          where: {
            playerId_round: {
              playerId: u.playerId,
              round: roundName
            }
          },
          data: {
            status: u.status,
            updatedBy: session.user.id
          }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update round status error:', error)
    return NextResponse.json({ error: 'Failed to update statuses' }, { status: 500 })
  }
}
