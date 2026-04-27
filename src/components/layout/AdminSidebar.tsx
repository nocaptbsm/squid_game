'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Settings, LogOut, ChevronLeft, Menu, Trophy, Upload, Target, Footprints, Timer, Box, Route, Flame } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Logo } from './Logo'

export function AdminSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  // Auto-collapse on mobile when navigating
  React.useEffect(() => {
    setIsMobileOpen(false)
    // Auto-minimize on selection as requested
    setIsCollapsed(true)
  }, [pathname])

  const [isRoundsExpanded, setIsRoundsExpanded] = React.useState(false)

  const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/players', label: 'Players', icon: Users },
  ]

  const roundLinks = [
    { href: '/admin/rounds/upload', label: 'Upload Players', icon: Upload },
    { href: '/admin/rounds/preliminary', label: 'Treasure Hunt', icon: Target },
    { href: '/admin/rounds/rlgl', label: 'Red Light Green Light', icon: Timer },
    { href: '/admin/rounds/hitch-hike', icon: Footprints, label: 'Hitch Hike' },
    { href: '/admin/rounds/90s-collapse', label: '90s Collapse', icon: Timer },
    { href: '/admin/rounds/glass-bridge', label: 'Glass Bridge', icon: Box },
    { href: '/admin/rounds/wright-way', label: 'The Wright Way', icon: Route },
    { href: '/admin/rounds/chocolate', label: 'Chocolate Crucible', icon: Flame },
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
        bg-[#051919] border-r border-red-900/20 min-h-screen flex flex-col fixed md:relative z-50 transition-all duration-300 ease-in-out shadow-[10px_0_30px_rgba(0,0,0,0.5)]
      `}>
        {/* Grain Overlay for Sidebar */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />

        <div className={`p-6 border-b border-red-900/20 flex items-center justify-between relative z-10 ${isCollapsed ? 'px-4' : ''}`}>
          <div className="flex items-center gap-3">
            <Logo hideText={isCollapsed} className={isCollapsed ? 'scale-110' : ''} />
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 rounded-md hover:bg-red-900/10 text-red-900/60 transition-all hidden md:block ${isCollapsed ? 'rotate-180' : ''}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 py-8 px-3 space-y-1 relative z-10 overflow-y-auto custom-scrollbar">
          {links.map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-none text-sm font-bold transition-all group border-l-2 ${
                  isActive 
                    ? 'bg-red-500/10 text-white border-red-500 shadow-[0_0_15px_rgba(227,27,109,0.1)]' 
                    : 'text-slate-500 border-transparent hover:bg-red-900/5 hover:text-red-400'
                } ${isCollapsed ? 'justify-center px-0 border-l-0 border-b-2' : ''}`}
                title={isCollapsed ? link.label : ''}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-all ${isActive ? 'scale-110 text-red-500' : 'group-hover:scale-110 group-hover:text-red-400'}`} />
                {!isCollapsed && (
                  <span className="animate-in fade-in slide-in-from-left-2 duration-300 tracking-widest uppercase text-[11px]">
                    {link.label}
                  </span>
                )}
              </Link>
            )
          })}

          {/* Rounds Section */}
          <div className="pt-4">
            <button
              onClick={() => {
                setIsRoundsExpanded(!isRoundsExpanded)
                if (isCollapsed) setIsCollapsed(false)
              }}
              className={`flex items-center gap-3 w-full px-3 py-3 rounded-none text-sm font-bold transition-all group border-l-2 border-transparent text-slate-500 hover:bg-red-900/5 hover:text-red-400 ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Trophy className="w-5 h-5 flex-shrink-0 transition-all group-hover:scale-110 group-hover:text-red-400" />
              {!isCollapsed && (
                <span className="flex-1 text-left tracking-widest uppercase text-[11px]">Rounds</span>
              )}
            </button>

            {isRoundsExpanded && !isCollapsed && (
              <div className="mt-1 ml-4 space-y-1 border-l border-red-900/20 pl-2">
                {roundLinks.map((link) => {
                  const isActive = pathname === link.href
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-none text-[10px] font-bold transition-all group border-l-2 ${
                        isActive 
                          ? 'bg-red-500/5 text-white border-red-500' 
                          : 'text-slate-600 border-transparent hover:bg-red-900/5 hover:text-red-400'
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 transition-all ${isActive ? 'text-red-500' : 'group-hover:text-red-400'}`} />
                      <span className="tracking-widest uppercase truncate">{link.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </nav>

        <div className="p-4 border-t border-red-900/20 relative z-10">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className={`flex items-center gap-3 w-full px-3 py-3 rounded-none text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all ${isCollapsed ? 'justify-center px-0' : ''}`}
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
