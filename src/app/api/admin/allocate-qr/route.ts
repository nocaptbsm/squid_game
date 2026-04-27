import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const { playerIds } = await req.json()

    if (!Array.isArray(playerIds) || playerIds.length === 0) {
      return NextResponse.json({ error: 'No players selected' }, { status: 400 })
    }

    // Check current QR count
    const currentQrCount = await prisma.player.count({
      where: { qrToken: { not: null } }
    })

    const availableSpots = 350 - currentQrCount
    const toAllocate = playerIds.slice(0, availableSpots)

    if (toAllocate.length === 0) {
      return NextResponse.json({ error: 'QR Allocation limit reached (350/350)' }, { status: 400 })
    }

    // Allocate tokens in a transaction
    await prisma.$transaction(
      toAllocate.map((id: string) => 
        prisma.player.update({
          where: { id },
          data: { qrToken: uuidv4() }
        })
      )
    )

    return NextResponse.json({ 
      success: true, 
      message: `Successfully allocated QR tokens to ${toAllocate.length} students.` 
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
