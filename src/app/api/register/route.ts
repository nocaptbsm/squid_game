export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import cloudinary from '@/lib/cloudinary'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !['ADMIN', 'VOLUNTEER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { playerId, name, photoBase64, qrToken } = await request.json()

    if (!playerId || !name || !photoBase64 || !qrToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const player = await prisma.player.findUnique({ where: { id: playerId } })

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    if (player.isRegistered) {
      return NextResponse.json({ error: 'Player already registered' }, { status: 409 })
    }

    if (player.photoLocked) {
      return NextResponse.json({ error: 'Player photo is locked' }, { status: 403 })
    }

    // Check 350 limit
    const currentRegistered = await prisma.player.count({
      where: { isRegistered: true }
    })

    if (currentRegistered >= 350) {
      return NextResponse.json({ error: 'Registration limit reached (350/350). No more QR codes can be assigned.' }, { status: 403 })
    }

    // Upload photo to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(photoBase64, {
      folder: 'squid_game_players',
      public_id: `player_${player.playerNumber}`,
    })

    const updatedPlayer = await prisma.player.update({
      where: { id: playerId },
      data: {
        name,
        qrToken, // Map the physical QR to this player
        photoUrl: uploadResponse.secure_url,
        isRegistered: true,
        photoLocked: true,
      }
    })

    // Mark the protocol token as used
    await prisma.protocolToken.update({
      where: { token: qrToken },
      data: { isUsed: true }
    })

    await prisma.scan.create({
      data: {
        playerId: player.id,
        volunteerId: session.user.id,
      }
    })

    return NextResponse.json(updatedPlayer)
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Failed to register player' }, { status: 500 })
  }
}
