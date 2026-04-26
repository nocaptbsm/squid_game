export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const filter = searchParams.get('filter') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where: Prisma.PlayerWhereInput = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { playerNumber: { contains: search } }
      ]
    }

    if (filter === 'registered') where.isRegistered = true
    if (filter === 'unregistered') where.isRegistered = false
    if (filter === 'eliminated') {
      where.rounds = { some: { status: 'ELIMINATED' } }
    }
    if (filter === 'surviving') {
      where.isRegistered = true
      where.rounds = { none: { status: 'ELIMINATED' } }
    }

    const [players, total] = await Promise.all([
      prisma.player.findMany({
        where,
        include: { rounds: true },
        orderBy: { playerNumber: 'asc' },
        skip,
        take: limit
      }),
      prisma.player.count({ where })
    ])

    return NextResponse.json({
      players,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Fetch players error:', error)
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 })
  }
}
