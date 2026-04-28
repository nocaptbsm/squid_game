import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ROUND_LABELS } from '@/lib/constants'
import { Trophy, Shield, XCircle, Clock } from 'lucide-react'
import { AudioSync } from '@/components/squid/AudioSync'

export const dynamic = 'force-dynamic'

export default async function PublicPlayerProfile({ params }: { params: { token: string } }) {
  const { token } = params

  // 1. Try to find player by token
  const player = await prisma.player.findUnique({
    where: { qrToken: token },
    include: { rounds: true }
  })

  // 2. If no player, check if it's a valid protocol token but not yet registered
  const protocolToken = !player ? await prisma.protocolToken.findUnique({
    where: { token }
  }) : null

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

  // Player exists! Show their status
  const sortedRounds = player!.rounds.sort((a, b) => {
    const order = ['PRELIMINARY', 'RED_LIGHT_GREEN_LIGHT', 'HITCH_HIKE', 'SOUL_SEEKERS', 'GLASS_BRIDGE', 'THE_WRIGHT_WAY', 'CHOCOLATE_CRUCIBLE']
    return order.indexOf(a.round) - order.indexOf(b.round)
  })

  const isEliminated = player!.rounds.some(r => r.status === 'ELIMINATED')

  return (
    <div className="min-h-screen bg-[#051919] text-white p-6 pb-12">
      <AudioSync />
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center pt-8">
          <div className={`w-32 h-32 rounded-full mx-auto mb-6 p-1 border-4 ${isEliminated ? 'border-red-600/50' : 'border-green-500/50'} relative`}>
            {player!.photoUrl ? (
              <img src={player!.photoUrl} className={`w-full h-full rounded-full object-cover ${isEliminated ? 'grayscale sepia opacity-50' : ''}`} alt="" />
            ) : (
              <div className="w-full h-full rounded-full bg-red-950/20 flex items-center justify-center text-4xl font-black text-red-900">
                #{player!.playerNumber}
              </div>
            )}
            {isEliminated && (
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-red-600 text-white font-black text-xs px-3 py-1 uppercase tracking-[0.2em] -rotate-12 border-2 border-white">ELIMINATED</div>
               </div>
            )}
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">{player!.name}</h1>
          <p className="text-red-600 font-black tracking-[0.3em] uppercase text-xs mt-2">Player #{player!.playerNumber}</p>
        </div>

        {/* Protocol Status */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-900/60 mb-4 border-b border-red-900/10 pb-2">Protocol Progression</h2>
          
          <div className="grid gap-2">
            {sortedRounds.map((round) => (
              <div key={round.id} className="bg-black/20 border border-red-900/10 p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{ROUND_LABELS[round.round]}</p>
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
