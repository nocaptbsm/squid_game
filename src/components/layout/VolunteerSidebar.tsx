'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { QrCode, RefreshCw, LogOut, ChevronLeft, Menu } from 'lucide-react'
import { signOut } from 'next-auth/react'

export function VolunteerSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  // Auto-collapse on mobile and minimize on selection
  React.useEffect(() => {
    setIsMobileOpen(false)
    setIsCollapsed(true)
  }, [pathname])

  const links = [
    { href: '/volunteer/scan', label: 'Scan & Register', icon: QrCode },
    { href: '/volunteer/round', label: 'Update Rounds', icon: RefreshCw },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 bg-surface border border-border rounded-lg shadow-sm text-foreground"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        ${isCollapsed ? 'w-20' : 'w-64'} 
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        bg-surface border-r border-border min-h-screen flex flex-col fixed md:relative z-50 transition-all duration-300 ease-in-out
      `}>
        <div className={`p-6 border-b border-border flex items-center justify-between ${isCollapsed ? 'px-4' : ''}`}>
          {!isCollapsed && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-lg font-bold tracking-tight text-foreground">Crew Portal</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Field Console</p>
            </div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">
              C
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 rounded-md hover:bg-surface-2 text-muted-foreground transition-all hidden md:block ${isCollapsed ? 'rotate-180' : ''}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive 
                    ? 'bg-primary text-white shadow-sm shadow-primary/20' 
                    : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? link.label : ''}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform ${isActive ? '' : 'group-hover:scale-110'}`} />
                {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">{link.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => signOut({ callbackUrl: '/volunteer/login' })}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all ${isCollapsed ? 'justify-center px-0' : ''}`}
            title={isCollapsed ? 'Sign Out' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </div>
    </>
  )
}
