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

    console.log(`Received upload request with ${players.length} records. Sample:`, players[0])

    // Prepare players for insertion with extremely flexible header mapping
    const playerEntries = players.map((p: any) => {
      // Find name field - check every possible string key for 'name'
      let name = null;
      for (const key in p) {
        const k = key.toLowerCase().replace(/\s/g, '');
        if (k === 'name' || k === 'fullname' || k === 'studentname' || k === 'playername' || k === 'student') {
          name = p[key];
          break;
        }
      }

      // Find roll number - check every possible string key for 'roll' or 'id'
      let rollNo = null;
      for (const key in p) {
        const k = key.toLowerCase().replace(/\s/g, '').replace(/[^a-z0-9]/g, '');
        if (
          k === 'rollno' || k === 'roll' || k === 'id' || k === 'playernumber' || 
          k === 'srno' || k === 'slno' || k === 'rollnumber' || k === 'studentroll' ||
          k === 'studentrollno' || k === 'srnumber' || k === 'serialnumber' || k === 'no'
        ) {
          rollNo = p[key];
          break;
        }
      }

      // Fallback if no named keys matched: try to use first and second columns if it looks like an object with generic keys
      if (!name && p[1]) name = p[1];
      if (!rollNo && p[0]) rollNo = p[0];

      return {
        playerNumber: rollNo ? String(rollNo).padStart(3, '0') : null,
        name: name ? String(name).trim() : null,
      }
    }).filter(p => p.playerNumber && p.playerNumber !== 'NaN' && p.playerNumber !== 'undefined');

    console.log(`Mapped ${playerEntries.length} valid entries. Ready for database sync.`);

    // Use a transaction for bulk upsert
    const result = await prisma.$transaction(async (tx) => {
      let updatedCount = 0
      
      for (const entry of playerEntries) {
        if (!entry.playerNumber) continue;

        await tx.player.upsert({
          where: { playerNumber: entry.playerNumber },
          update: { name: entry.name },
          create: { 
            playerNumber: entry.playerNumber,
            name: entry.name,
            isRegistered: false 
          }
        })
        updatedCount++

        // Ensure RoundStatus entries exist
        const player = await tx.player.findUnique({
          where: { playerNumber: entry.playerNumber },
          select: { id: true }
        })

        if (player) {
          for (const round of ROUND_ORDER) {
            await tx.roundStatus.upsert({
              where: {
                playerId_round: {
                  playerId: player.id,
                  round: round
                }
              },
              update: {},
              create: {
                playerId: player.id,
                round: round,
                status: 'PENDING'
              }
            })
          }
        }
      }
      return updatedCount
    })

    return NextResponse.json({ 
      success: true, 
      count: result,
      message: `Successfully processed ${result} players.`
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Failed to seed players' }, { status: 500 })
  }
}
