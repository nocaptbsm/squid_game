import React from 'react'
import Link from 'next/link'

const portals = [
  { href: '/admin/login', label: 'Admin Portal', desc: 'Manage players, rounds, and system settings.' },
  { href: '/volunteer/login', label: 'Volunteer Portal', desc: 'Scan players and verify round statuses.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Paradox
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            A unified platform for event management, player tracking, and live status verification.
          </p>
        </div>

        {/* Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {portals.map((portal) => (
            <Link 
              key={portal.href} 
              href={portal.href}
              className="group flex flex-col p-6 h-full bg-white rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200"
            >
              <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {portal.label}
              </h2>
              <p className="text-muted-foreground text-sm flex-grow">
                {portal.desc}
              </p>
              <div className="mt-6 flex items-center text-sm font-medium text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                Enter portal
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
