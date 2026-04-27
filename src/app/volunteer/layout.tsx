import React from 'react'
import { VolunteerSidebar } from '@/components/layout/VolunteerSidebar'

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-sBg flex flex-col md:flex-row">
      <VolunteerSidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 px-4 py-12 md:py-8 max-w-md mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
