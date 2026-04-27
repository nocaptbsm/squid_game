'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { ROUND_LABELS } from '@/lib/constants'

export default function RoundManagementPage() {
  const params = useParams()
  const slug = params.slug as string
  
  // Map slug back to RoundName key if needed, or just display the title
  const roundTitle = slug.toUpperCase().replace(/-/g, '_')
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-[0.3em] text-white">
          {slug.replace(/-/g, ' ')}
        </h1>
        <p className="text-red-900/60 text-xs uppercase tracking-widest mt-2">
          Real-time survivor tracking and elimination
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0a2424] border border-red-900/30 p-6 shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Round Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-black/20 border border-red-900/10">
                <div className="text-2xl font-black text-white">456</div>
                <div className="text-[8px] uppercase tracking-widest text-slate-600 mt-1">Starting</div>
              </div>
              <div className="p-4 bg-black/20 border border-green-900/10">
                <div className="text-2xl font-black text-green-500">218</div>
                <div className="text-[8px] uppercase tracking-widest text-slate-600 mt-1">Survivors</div>
              </div>
            </div>
          </div>
        </div>

        {/* Player List Column */}
        <div className="lg:col-span-2 bg-[#0a2424] border border-red-900/30 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-red-900/20 bg-black/20 flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Active Players</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="SEARCH PLAYER..." 
                className="bg-black/40 border border-red-900/30 px-3 py-1 text-[10px] uppercase tracking-widest text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
          
          <div className="p-12 text-center text-slate-600 italic text-sm">
            Load player data to start tracking elimination.
          </div>
        </div>
      </div>
    </div>
  )
}
