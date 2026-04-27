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

    // Prepare players for insertion with flexible header mapping
    const playerEntries = players.map((p: any) => {
      // Find name field (handle Name, name, full name, student name, etc.)
      const name = p.name || p.Name || p['Full Name'] || p['Student Name'] || p['player name']
      // Find roll number (handle rollNo, roll no, playerNumber, player number, id, etc.)
      const rollNo = p.rollNo || p.rollno || p['Roll No'] || p['roll no'] || p.playerNumber || p.id || p.ID

      return {
        playerNumber: String(rollNo).padStart(3, '0'),
        name: name || null,
      }
    })

    // Use a transaction for bulk upsert
    const result = await prisma.$transaction(async (tx) => {
      let updatedCount = 0
      
      for (const entry of playerEntries) {
        if (!entry.playerNumber || entry.playerNumber === 'NaN' || entry.playerNumber === 'undefined') continue

        await tx.player.upsert({
          where: { playerNumber: entry.playerNumber },
          update: { name: entry.name },
          create: { 
            playerNumber: entry.playerNumber,
            name: entry.name,
            isRegistered: false // New seeded players start as not registered
          }
        })
        updatedCount++

        // Also ensure RoundStatus entries exist for this player
        const player = await tx.player.findUnique({
          where: { playerNumber: entry.playerNumber },
          select: { id: true }
        })

        if (player) {
          const rounds = ROUND_ORDER.map(round => ({
            playerId: player.id,
            round: round,
            status: 'PENDING' as any
          }))

          for (const round of rounds) {
            await tx.roundStatus.upsert({
              where: {
                playerId_round: {
                  playerId: round.playerId,
                  round: round.round
                }
              },
              update: {}, // Don't reset status if it already exists
              create: round
            })
          }
        }
      }
      return updatedCount
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
