'use client'

import React, { useState, useEffect } from 'react'
import { SquidButton } from '@/components/squid/SquidButton'
import { Printer } from 'lucide-react'
import { ShapeIcon } from '@/components/squid/ShapeIcon'

export default function PrintCards() {
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/players?limit=1000') // Fetch all players
      .then(res => res.json())
      .then(data => {
        if (data.players) setPlayers(data.players)
        setLoading(false)
      })
  }, [])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return <div className="p-8 font-bold">Loading cards...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8 print:hidden">
        <h1 className="text-3xl font-black uppercase tracking-widest text-white">
          Print ID Cards
        </h1>
        <SquidButton onClick={handlePrint} variant="pink">
          <Printer className="w-4 h-4 mr-2" /> Print All Cards
        </SquidButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 print:grid-cols-2 print:gap-4 print:p-0">
        {players.map(player => (
          <div 
            key={player.id} 
            className="bg-sqCard border-[3px] border-sqPink p-4 rounded-xl flex flex-col items-center relative overflow-hidden break-inside-avoid shadow-[0_0_15px_rgba(255,0,103,0.3)] aspect-[3/4]"
          >
            <div className="absolute top-2 right-2 text-2xl font-black font-mono text-sqPink tracking-tighter">
              #{player.playerNumber}
            </div>

            <div className="flex gap-2 mb-4 absolute top-3 left-3">
              <ShapeIcon shape="circle" size={12} />
              <ShapeIcon shape="triangle" size={12} />
              <ShapeIcon shape="square" size={12} />
            </div>

            <div className="w-24 h-24 mt-8 rounded-full border-2 border-sqPink bg-black overflow-hidden flex-shrink-0">
              {player.photoUrl ? (
                <img src={player.photoUrl} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-sqMuted text-center p-2">NO PHOTO</div>
              )}
            </div>

            <h3 className="mt-4 text-lg font-black uppercase tracking-widest text-white text-center line-clamp-2">
              {player.name || 'GUEST'}
            </h3>

            <div className="mt-auto pt-4 w-32 h-32 bg-white p-1 rounded-lg">
              <img src={`/api/qr/${player.qrToken}`} className="w-full h-full object-contain" />
            </div>

            <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-sqPink font-bold tracking-[0.3em] uppercase">
              Paradox 2025
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:grid-cols-2, .print\\:grid-cols-2 * {
            visibility: visible;
          }
          .print\\:grid-cols-2 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page { margin: 0.5cm; }
        }
      `}</style>
    </div>
  )
}
