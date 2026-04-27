import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !['ADMIN', 'VOLUNTEER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { rollNo } = await request.json()

    if (!rollNo) {
      return NextResponse.json({ error: 'Roll number is required' }, { status: 400 })
    }

    // Format roll no to ensure it matches db (e.g., pad to 3 digits)
    const formattedRollNo = String(rollNo).padStart(3, '0')

    const player = await prisma.player.findUnique({
      where: { playerNumber: formattedRollNo }
    })

    if (!player) {
      return NextResponse.json({ error: 'Roll number not found in seeded database' }, { status: 404 })
    }

    if (player.isRegistered) {
      return NextResponse.json({ error: 'Player is already registered with a different QR code' }, { status: 409 })
    }

    return NextResponse.json({
      player
    })
  } catch (error) {
    console.error('Verify roll error:', error)
    return NextResponse.json({ error: 'Failed to verify roll number' }, { status: 500 })
  }
}
