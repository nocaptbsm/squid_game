export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !['ADMIN', 'VOLUNTEER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { qrToken } = await request.json()

    if (!qrToken) {
      return NextResponse.json({ error: 'QR Token is required' }, { status: 400 })
    }

    const player = await prisma.player.findUnique({
      where: { qrToken },
      include: { rounds: true }
    })

    if (!player) {
      return NextResponse.json({ 
        isUnassigned: true, 
        qrToken,
        message: 'Valid unassigned QR code. Please provide student roll number.' 
      })
    }

    // Log the scan
    await prisma.scan.create({
      data: {
        playerId: player.id,
        volunteerId: session.user.id,
      }
    })

    return NextResponse.json({
      player,
      alreadyRegistered: player.isRegistered
    })
  } catch (error) {
    console.error('Scan error:', error)
    return NextResponse.json({ error: 'Failed to process scan' }, { status: 500 })
  }
}
