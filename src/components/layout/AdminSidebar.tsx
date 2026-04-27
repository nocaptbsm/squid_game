'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Printer, Settings, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

export function AdminSidebar() {
  const pathname = usePathname()

  const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/players', label: 'Players', icon: Users },
    { href: '/admin/print-cards', label: 'Print Cards', icon: Printer },
  ]

  return (
    <div className="w-64 bg-surface border-r border-border min-h-screen flex flex-col hidden md:flex">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Paradox Admin</h2>
        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Management Console</p>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`) && link.href !== '/admin'
          const exactActive = link.href === '/admin' ? pathname === '/admin' : isActive
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                exactActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}
