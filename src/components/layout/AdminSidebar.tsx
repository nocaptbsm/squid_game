'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Users, Printer, LogOut, ChevronRight, ChevronLeft, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin', label: 'COMMAND CENTER', icon: LayoutDashboard },
  { href: '/admin/players', label: 'PLAYER ROSTER', icon: Users },
  { href: '/admin/print-cards', label: 'PRINT CARDS', icon: Printer },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#100e0e] border border-red-900/30 text-[#c8bfbf]"
      >
        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/70 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        "fixed md:sticky top-0 left-0 h-screen z-40 flex flex-col bg-[#3a1c1e] border-r border-red-900/25 transition-all duration-250 flex-shrink-0",
        collapsed ? "md:w-[64px]" : "md:w-52",
        mobileOpen ? "w-52 translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Top red line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-900/50" style={{ boxShadow: '0 0 10px rgba(139,0,0,0.5)' }} />

        {/* Logo */}
        <div className={cn("h-14 border-b border-red-900/20 flex items-center px-4 gap-3", collapsed && "justify-center px-0")}>
          {!collapsed && (
            <>
              <span className="text-red-800 text-sm tracking-[0.3em] uppercase flex-1 flicker" style={{ fontFamily: 'Special Elite, cursive' }}>
                PARADOX
              </span>
              <button onClick={() => setCollapsed(true)} className="hidden md:flex p-1 text-[#d4b8b8] hover:text-red-700 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          )}
          {collapsed && (
            <button onClick={() => setCollapsed(false)} className="hidden md:flex p-1 text-[#d4b8b8] hover:text-red-700 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {links.map(link => {
            const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? link.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-[11px] tracking-widest transition-all duration-150 border border-transparent",
                  collapsed && "justify-center px-0 mx-1",
                  isActive
                    ? "bg-red-950/40 text-red-500 border-red-900/40"
                    : "text-[#d4b8b8] hover:bg-red-950/20 hover:text-[#c8bfbf] hover:border-red-900/20"
                )}
                style={{ fontFamily: 'Share Tech Mono, monospace' }}
              >
                <link.icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-red-900/20">
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            title={collapsed ? 'Logout' : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-[11px] tracking-widest text-[#d4b8b8] hover:text-red-600 hover:bg-red-950/20 transition-all w-full border border-transparent hover:border-red-900/20",
              collapsed && "justify-center px-0"
            )}
            style={{ fontFamily: 'Share Tech Mono, monospace' }}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>DISCONNECT</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
