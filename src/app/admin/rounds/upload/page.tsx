'use client'

import React from 'react'

export default function UploadPlayersPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-[0.3em] text-white">Upload Registered Players</h1>
        <p className="text-red-900/60 text-xs uppercase tracking-widest mt-2">Initialize player database for the current cycle</p>
      </div>

      <div className="bg-[#0a2424] border border-red-900/30 p-12 text-center shadow-2xl">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 border-2 border-dashed border-red-900/50 rounded-none flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-900/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <h2 className="text-white font-bold uppercase tracking-widest mb-4">Drop CSV File</h2>
          <p className="text-slate-500 text-xs mb-8">Upload the list of registered players to generate QR tokens and player numbers.</p>
          
          <button className="h-btn w-full !bg-red-600 hover:!bg-red-700 !rounded-none py-4 font-black uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.2)]">
            Select File
          </button>
        </div>
      </div>
    </div>
  )
}
