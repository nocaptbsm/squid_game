import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Full Protocol Reset
    await prisma.$transaction([
      prisma.scan.deleteMany({}),
      prisma.roundStatus.deleteMany({}),
      prisma.player.deleteMany({}),
      // Also unlock all protocol tokens so they can be reused
      prisma.protocolToken.updateMany({
        data: { isUsed: false }
      }),
    ])

    return NextResponse.json({ success: true, message: 'All seeded students have been removed.' })
  } catch (error) {
    console.error('Delete all players error:', error)
    return NextResponse.json({ error: 'Failed to delete students' }, { status: 500 })
  }
}
