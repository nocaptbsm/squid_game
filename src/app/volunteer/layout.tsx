import React from 'react'
import { VolunteerNav } from '@/components/layout/VolunteerNav'

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-sBg flex flex-col">
      <VolunteerNav />
      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
