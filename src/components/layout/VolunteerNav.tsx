'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { QrCode, RefreshCw, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

export function VolunteerNav() {
  const pathname = usePathname()

  const links = [
    { href: '/volunteer/scan', label: 'SCAN & REGISTER', icon: QrCode },
    { href: '/volunteer/round', label: 'UPDATE ROUNDS', icon: RefreshCw },
  ]

  return (
    <header className="h-14 border-b border-red-900/25 bg-[#3a1c1e]/90 backdrop-blur sticky top-0 z-50 flex items-center justify-between px-4 lg:px-8 relative">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-900/40" style={{ boxShadow: '0 0 8px rgba(139,0,0,0.4)' }} />
      
      <div className="flex items-center gap-3 mr-6">
        <span className="text-red-800 text-sm flicker" style={{ fontFamily: 'Special Elite, cursive' }}>CREW</span>
      </div>

      <nav className="flex items-center gap-1 flex-1">
        {links.map(link => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-[10px] tracking-widest uppercase border border-transparent transition-all",
                isActive
                  ? "bg-red-950/40 text-red-500 border-red-900/40"
                  : "text-[#d4b8b8] hover:bg-red-950/20 hover:text-[#c8bfbf] hover:border-red-900/20"
              )}
              style={{ fontFamily: 'Share Tech Mono, monospace' }}
            >
              <link.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          )
        })}
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: '/volunteer/login' })}
        className="flex items-center gap-1.5 text-[10px] tracking-widest text-[#d4b8b8] hover:text-red-600 uppercase transition-colors"
        style={{ fontFamily: 'Share Tech Mono, monospace' }}
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">EXIT</span>
      </button>
    </header>
  )
}
