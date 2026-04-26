export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function GET() {
  const checks = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || '(not set — using VERCEL_URL)',
    VERCEL_URL: process.env.VERCEL_URL || '(not on Vercel)',
    NODE_ENV: process.env.NODE_ENV,
  }
  const allOk = checks.DATABASE_URL && checks.NEXTAUTH_SECRET
  return NextResponse.json({ ok: allOk, checks }, { status: allOk ? 200 : 500 })
}
