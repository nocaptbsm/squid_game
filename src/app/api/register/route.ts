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

    const { playerId, name, photoBase64 } = await request.json()

    if (!playerId || !name || !photoBase64) {
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

    // Upload photo to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(photoBase64, {
      folder: 'squid_game_players',
      public_id: `player_${player.playerNumber}`,
    })

    const updatedPlayer = await prisma.player.update({
      where: { id: playerId },
      data: {
        name,
        photoUrl: uploadResponse.secure_url,
        isRegistered: true,
        photoLocked: true,
      }
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
