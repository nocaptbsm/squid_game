'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { QrCode, RefreshCw, LogOut, ChevronLeft, Menu } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Logo } from './Logo'

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
        bg-[#0F172A] border-r border-slate-800 min-h-screen flex flex-col fixed md:relative z-50 transition-all duration-300 ease-in-out shadow-2xl
      `}>
        <div className={`p-6 border-b border-slate-800 flex items-center justify-between ${isCollapsed ? 'px-4' : ''}`}>
          <div className="flex items-center gap-3">
            <Logo hideText={isCollapsed} className={isCollapsed ? 'scale-110' : ''} />
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 rounded-md hover:bg-slate-800 text-slate-400 transition-all hidden md:block ${isCollapsed ? 'rotate-180' : ''}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 py-8 px-3 space-y-1.5">
          {links.map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all group ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? link.label : ''}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-all ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-white'}`} />
                {!isCollapsed && (
                  <span className="animate-in fade-in slide-in-from-left-2 duration-300">
                    {link.label}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => signOut({ callbackUrl: '/volunteer/login' })}
            className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all ${isCollapsed ? 'justify-center px-0' : ''}`}
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
