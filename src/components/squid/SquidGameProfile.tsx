'use client'

import React, { useState, useEffect } from 'react'
import { Trophy, XCircle, Clock } from 'lucide-react'

export default function SquidGameProfile({ player, protocolToken, roundLabels }: any) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Show animation for 3 seconds
    const timer = setTimeout(() => setLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#051919] flex flex-col items-center justify-center p-6 text-center overflow-hidden fixed inset-0 z-[100]">
        {/* Animated Shapes */}
        <div className="relative w-64 h-64 mb-10 flex items-center justify-center">
          {/* Circle */}
          <div className="absolute w-32 h-32 border-[6px] border-red-600 rounded-full animate-pulse opacity-20" />
          <div className="absolute w-24 h-24 border-4 border-red-600 rounded-full animate-[ping_2s_infinite]" />
          
          {/* Triangle (using border hack) */}
          <div className="absolute w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[70px] border-b-white opacity-40 animate-pulse" 
               style={{ transform: 'translateY(-10px)' }} />
          
          {/* Square */}
          <div className="w-20 h-20 border-4 border-red-600 flex items-center justify-center animate-spin [animation-duration:8s]">
             <div className="w-10 h-10 bg-red-600 animate-pulse" />
          </div>

          {/* Glitch Overlay */}
          <div className="absolute inset-0 bg-red-600/5 mix-blend-overlay animate-glitch" />
        </div>

        <div className="space-y-4 relative z-10">
          <h2 className="text-3xl font-black text-white uppercase tracking-[0.4em] animate-pulse">
            ID SCANNING
          </h2>
          <div className="flex justify-center gap-2">
             <div className="w-3 h-3 bg-red-600 animate-bounce [animation-delay:-0.3s]" />
             <div className="w-3 h-3 bg-red-600 animate-bounce [animation-delay:-0.15s]" />
             <div className="w-3 h-3 bg-red-600 animate-bounce" />
          </div>
          <p className="text-[12px] text-red-900 font-black uppercase tracking-[0.8em] mt-8 opacity-50">
            PARADOX PROTOCOL v2.0
          </p>
        </div>

        {/* Laser Scan line */}
        <div className="fixed inset-0 pointer-events-none z-[110]">
           <div className="w-full h-[2px] bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-scan" />
        </div>
      </div>
    )
  }

  if (!player && !protocolToken) {
    return (
      <div className="min-h-screen bg-[#051919] flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <div className="w-20 h-20 border-2 border-red-600 flex items-center justify-center mx-auto mb-6 rotate-45">
            <XCircle className="w-10 h-10 text-red-600 -rotate-45" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Unauthorized Token</h1>
          <p className="text-red-900/60 font-bold uppercase tracking-widest text-xs">This QR code is not part of the Paradox Protocol.</p>
        </div>
      </div>
    )
  }

  if (protocolToken && !player) {
    return (
      <div className="min-h-screen bg-[#051919] flex items-center justify-center p-6 text-center">
        <div className="space-y-6">
          <div className="w-24 h-24 border-2 border-red-900/20 bg-red-950/10 flex items-center justify-center mx-auto mb-6 relative">
             <div className="absolute inset-0 animate-pulse bg-red-600/5" />
             <div className="text-red-900/40 font-black text-4xl">?</div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Unregistered Player</h1>
            <p className="text-red-600 font-bold uppercase tracking-widest text-[10px] mt-2">Protocol Token Detected: Unassigned</p>
          </div>
          <p className="text-slate-500 text-xs max-w-xs mx-auto leading-relaxed">
            This identity token has not been mapped to a participant yet. 
            Please report to the registration desk to initialize your profile.
          </p>
        </div>
      </div>
    )
  }

  const sortedRounds = player.rounds.sort((a: any, b: any) => {
    const order = ['PRELIMINARY', 'RED_LIGHT_GREEN_LIGHT', 'HITCH_HIKE', 'SOUL_SEEKERS', 'GLASS_BRIDGE', 'THE_WRIGHT_WAY', 'CHOCOLATE_CRUCIBLE']
    return order.indexOf(a.round) - order.indexOf(b.round)
  })

  const isEliminated = player.rounds.some((r: any) => r.status === 'ELIMINATED')

  return (
    <div className="min-h-screen bg-[#051919] text-white p-6 pb-12 animate-in fade-in duration-1000">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center pt-8">
          <div className={`w-32 h-32 rounded-full mx-auto mb-6 p-1 border-4 ${isEliminated ? 'border-red-600/50' : 'border-green-500/50'} relative`}>
            {player.photoUrl ? (
              <img src={player.photoUrl} className={`w-full h-full rounded-full object-cover ${isEliminated ? 'grayscale sepia opacity-50' : ''}`} alt="" />
            ) : (
              <div className="w-full h-full rounded-full bg-red-950/20 flex items-center justify-center text-4xl font-black text-red-900">
                #{player.playerNumber}
              </div>
            )}
            {isEliminated && (
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-red-600 text-white font-black text-xs px-3 py-1 uppercase tracking-[0.2em] -rotate-12 border-2 border-white">ELIMINATED</div>
               </div>
            )}
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">{player.name}</h1>
          <p className="text-red-600 font-black tracking-[0.3em] uppercase text-xs mt-2">Player #{player.playerNumber}</p>
        </div>

        {/* Protocol Status */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-900/60 mb-4 border-b border-red-900/10 pb-2">Protocol Progression</h2>
          
          <div className="grid gap-2">
            {sortedRounds.map((round: any) => (
              <div key={round.id} className="bg-black/20 border border-red-900/10 p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{roundLabels[round.round]}</p>
                  <p className={`text-xs font-bold mt-1 ${
                    round.status === 'SURVIVED' ? 'text-green-500' : 
                    round.status === 'ELIMINATED' ? 'text-red-600' : 'text-slate-400'
                  }`}>
                    {round.status}
                  </p>
                </div>
                <div>
                  {round.status === 'SURVIVED' && <Trophy className="w-5 h-5 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]" />}
                  {round.status === 'ELIMINATED' && <XCircle className="w-5 h-5 text-red-600" />}
                  {round.status === 'PENDING' && <Clock className="w-5 h-5 text-slate-700 animate-pulse" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-12">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-red-900/30">Paradox Protocol © 2026</p>
        </div>
      </div>
    </div>
  )
}
