import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.PLAYER_JWT_SECRET || 'fallback-secret-for-dev'

export async function POST(request: Request) {
  try {
    const { playerNumber, pin } = await request.json()

    if (!playerNumber || !pin) {
      return NextResponse.json(
        { error: 'Player number and PIN are required' },
        { status: 400 }
      )
    }

    const player = await prisma.player.findUnique({
      where: { playerNumber },
      include: { teamLogin: true },
    })

    if (!player || !player.teamLogin) {
      return NextResponse.json(
        { error: 'Invalid player number or PIN' },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(pin, player.teamLogin.pin)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid player number or PIN' },
        { status: 401 }
      )
    }

    const token = jwt.sign(
      { playerId: player.id, playerNumber: player.playerNumber },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    cookies().set('player-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json({ success: true, playerNumber: player.playerNumber })
  } catch (error) {
    console.error('Player auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
