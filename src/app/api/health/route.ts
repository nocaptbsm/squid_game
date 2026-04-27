export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  let dbOk = false
  let dbUserCount = 0
  let dbError = ''

  try {
    dbUserCount = await prisma.user.count()
    dbOk = true
  } catch (e: any) {
    dbError = e?.message || 'DB connection failed'
  }

  const checks = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || '(using VERCEL_URL)',
    VERCEL_URL: process.env.VERCEL_URL || '(not on Vercel)',
    NODE_ENV: process.env.NODE_ENV,
    db_connected: dbOk,
    db_user_count: dbUserCount,
    db_error: dbError || null,
  }

  const allOk = checks.DATABASE_URL && (checks.NEXTAUTH_SECRET || checks.AUTH_SECRET) && dbOk
  return NextResponse.json({ ok: allOk, checks }, { status: allOk ? 200 : 500 })
}
