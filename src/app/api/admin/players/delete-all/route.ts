import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete all players (this will cascade delete round statuses and scans due to schema)
    // Actually, let's be explicit and safe.
    await prisma.$transaction([
      prisma.scan.deleteMany({}),
      prisma.roundStatus.deleteMany({}),
      prisma.player.deleteMany({}),
    ])

    return NextResponse.json({ success: true, message: 'All seeded students have been removed.' })
  } catch (error) {
    console.error('Delete all players error:', error)
    return NextResponse.json({ error: 'Failed to delete students' }, { status: 500 })
  }
}
