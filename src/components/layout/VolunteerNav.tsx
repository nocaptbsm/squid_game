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
    { href: '/volunteer/scan', label: 'Scan & Register', icon: QrCode },
    { href: '/volunteer/round', label: 'Update Rounds', icon: RefreshCw },
  ]

  return (
    <header className="h-16 border-b border-border bg-surface sticky top-0 z-50 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-3 mr-6">
        <span className="font-bold text-foreground tracking-tight">Crew Portal</span>
      </div>

      <nav className="flex items-center gap-2 flex-1">
        {links.map(link => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              )}
            >
              <link.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          )
        })}
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: '/volunteer/login' })}
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-red-600 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Sign Out</span>
      </button>
    </header>
  )
}
