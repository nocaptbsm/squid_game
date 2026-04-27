import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { ROUND_ORDER } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    const { players } = await req.json()

    if (!Array.isArray(players) || players.length === 0) {
      return NextResponse.json({ error: 'No player data provided' }, { status: 400 })
    }

    // Prepare players for insertion
    // Each player needs a unique qrToken
    const playerEntries = players.map((p: any) => ({
      playerNumber: String(p.rollNo || p.playerNumber).padStart(3, '0'),
      name: p.name,
    }))

    // Use a transaction for bulk insertion
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create players (use createMany for speed if supported, otherwise loop)
      // Note: PostgreSQL supports createMany
      await tx.player.createMany({
        data: playerEntries,
        skipDuplicates: true, // Safety against re-uploading same roll numbers
      })

      // 2. Fetch the newly created players to get their DB IDs
      // We need IDs to create the RoundStatus records
      const createdPlayers = await tx.player.findMany({
        where: {
          playerNumber: { in: playerEntries.map(p => p.playerNumber) }
        },
        select: { id: true }
      })

      // 3. Initialize RoundStatus for all 7 rounds for each player
      const roundStatusEntries = createdPlayers.flatMap(player => 
        ROUND_ORDER.map(round => ({
          playerId: player.id,
          round: round,
          status: 'PENDING' as any
        }))
      )

      await tx.roundStatus.createMany({
        data: roundStatusEntries,
        skipDuplicates: true,
      })

      return createdPlayers.length
    })

    return NextResponse.json({ 
      success: true, 
      count: result,
      message: `Successfully seeded ${result} players and initialized rounds.`
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Failed to seed players' }, { status: 500 })
  }
}
