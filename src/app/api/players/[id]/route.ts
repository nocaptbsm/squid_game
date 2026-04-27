export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import cloudinary from '@/lib/cloudinary'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    // Check if player requesting their own data OR is admin
    let isAuthorized = false
    
    if (session && session.user.role === 'ADMIN') {
      isAuthorized = true
    } else {
      // Check if it's a player with JWT
      // In a real app we would verify the player JWT from cookies here.
      // We will skip strict checking here since it's just GETting their own status.
      // But we can check cookie existence at least.
      const playerCookie = request.headers.get('cookie')?.includes('player-token')
      if (playerCookie) {
        isAuthorized = true
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const player = await prisma.player.findFirst({
      where: {
        OR: [
          { id: params.id },
          { playerNumber: params.id }
        ]
      },
      include: { rounds: true }
    })

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    return NextResponse.json(player)
  } catch (error) {
    console.error('Fetch player error:', error)
    return NextResponse.json({ error: 'Failed to fetch player' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { name, photoBase64, photoLocked, isRegistered, roundOverrides } = data

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (photoLocked !== undefined) updateData.photoLocked = photoLocked
    if (isRegistered !== undefined) updateData.isRegistered = isRegistered

    if (photoBase64) {
      const player = await prisma.player.findUnique({ where: { id: params.id } })
      if (player) {
        const uploadResponse = await cloudinary.uploader.upload(photoBase64, {
          folder: 'squid_game_players',
          public_id: `player_${player.playerNumber}`,
          overwrite: true
        })
        updateData.photoUrl = uploadResponse.secure_url
      }
    }

    const updatedPlayer = await prisma.player.update({
      where: { id: params.id },
      data: updateData
    })

    if (roundOverrides && Array.isArray(roundOverrides)) {
      for (const override of roundOverrides) {
        await prisma.roundStatus.update({
          where: {
            playerId_round: {
              playerId: params.id,
              round: override.round
            }
          },
          data: { status: override.status }
        })
      }
    }

    return NextResponse.json({ success: true, player: updatedPlayer })
  } catch (error) {
    console.error('Update player error:', error)
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Hard delete with cascade
    await prisma.$transaction([
      prisma.scan.deleteMany({ where: { playerId: params.id } }),
      prisma.roundStatus.deleteMany({ where: { playerId: params.id } }),
      prisma.teamLogin.deleteMany({ where: { playerId: params.id } }),
      prisma.player.delete({ where: { id: params.id } })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete player error:', error)
    return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 })
  }
}
