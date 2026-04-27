import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { count = 350 } = await req.json()

    // 1. Check if tokens already exist
    const existingCount = await prisma.protocolToken.count()
    if (existingCount > 0) {
      return NextResponse.json({ 
        error: 'Tokens already generated. Please use existing tokens or clear them first.' 
      }, { status: 400 })
    }

    // 2. Generate unique tokens
    const tokens = Array.from({ length: count }).map(() => ({
      token: uuidv4()
    }))

    // 3. Bulk insert
    await prisma.protocolToken.createMany({
      data: tokens,
      skipDuplicates: true
    })

    return NextResponse.json({ 
      success: true, 
      message: `Successfully generated ${count} protocol tokens.` 
    })

  } catch (error: any) {
    console.error('Token generation error:', error)
    return NextResponse.json({ error: 'Failed to generate tokens' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tokens = await prisma.protocolToken.findMany({
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ tokens })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.protocolToken.deleteMany({})

    return NextResponse.json({ success: true, message: 'All protocol tokens cleared.' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear tokens' }, { status: 500 })
  }
}
