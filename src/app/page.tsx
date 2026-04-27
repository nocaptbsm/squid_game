import React from 'react'
import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'

const portals = [
  { href: '/admin/login', label: 'Admin Portal', desc: 'Secure management console for system operators.' },
  { href: '/volunteer/login', label: 'Crew Portal', desc: 'Field access for real-time player verification.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#051919] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl w-full relative z-10">
        {/* Header section */}
        <div className="text-center mb-20">
          <Logo className="justify-center mb-8 scale-150" />
          <p className="text-red-900/60 max-w-xl mx-auto text-sm uppercase tracking-[0.4em] font-bold">
            Unified Event Protocol & Verification
          </p>
        </div>

        {/* Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {portals.map((portal) => (
            <Link 
              key={portal.href} 
              href={portal.href}
              className="group relative flex flex-col p-8 h-full bg-[#0a2424] border border-red-900/30 hover:border-red-500 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
            >
              {/* Card Hover Glow */}
              <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/5 transition-colors" />
              
              <h2 className="text-lg font-black text-white uppercase tracking-[0.2em] mb-4 group-hover:text-red-500 transition-colors relative z-10">
                {portal.label}
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 relative z-10">
                {portal.desc}
              </p>
              
              <div className="mt-auto flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-red-900 group-hover:text-red-500 transition-colors relative z-10">
                Initiate Sequence
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
