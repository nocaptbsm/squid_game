import React from 'react'
import { prisma } from '@/lib/prisma'
import { ROUND_ORDER, ROUND_LABELS } from '@/lib/constants'
import { Check, X, ShieldAlert } from 'lucide-react'

// This page is a server component, so we can fetch directly from Prisma if we want,
// but since it's dynamic, we'll fetch inside the component to render it on the server.
export default async function PublicPlayerPage({
  params
}: {
  params: { token: string }
}) {
  const player = await prisma.player.findUnique({
    where: { qrToken: params.token },
    select: {
      playerNumber: true,
      name: true,
      isRegistered: true,
      photoUrl: true,
      rounds: { 
        select: { round: true, status: true } 
      }
    }
  })

  if (!player) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Invalid Token</h1>
        <p className="text-muted-foreground mt-2">This player profile could not be found or the QR code is invalid.</p>
      </div>
    )
  }

  const isEliminated = player.rounds.some(r => r.status === 'ELIMINATED')
  const survivedCount = player.rounds.filter(r => r.status === 'SURVIVED').length

  return (
    <div className="min-h-screen bg-surface-2 flex flex-col p-4 md:p-8">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-black uppercase tracking-widest text-foreground">
            Paradox 2025
          </h1>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
            Participant Profile
          </p>
        </div>

        {/* Player Card */}
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
          {/* Status Banner */}
          <div className={`p-4 text-center border-b ${isEliminated ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <p className={`text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 ${isEliminated ? 'text-red-700' : 'text-green-700'}`}>
              {isEliminated ? <><X className="w-4 h-4" /> Eliminated</> : <><Check className="w-4 h-4" /> Surviving</>}
            </p>
          </div>

          <div className="p-6 flex-1 flex flex-col">
            {/* Identity */}
            <div className="flex flex-col items-center text-center space-y-4 mb-8">
              <div className={`w-32 h-32 rounded-full border-4 border-surface-2 bg-surface-2 overflow-hidden ${isEliminated ? 'opacity-50 grayscale' : ''}`}>
                {player.photoUrl ? (
                  <img src={player.photoUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-medium text-muted-foreground">
                    {player.playerNumber.substring(0, 2)}
                  </div>
                )}
              </div>
              
              <div>
                <h2 className={`text-2xl font-bold tracking-tight ${isEliminated ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {player.name || `Player #${player.playerNumber}`}
                </h2>
                <p className="text-sm font-mono text-muted-foreground mt-1">
                  ID: {player.playerNumber}
                </p>
              </div>
              
              {!player.isRegistered && (
                <span className="badge-gray mt-2">Unregistered</span>
              )}
            </div>

            {/* Progress */}
            <div className="mt-auto">
              <div className="flex justify-between text-sm font-medium mb-3">
                <span className="text-muted-foreground">Round Progress</span>
                <span className="text-foreground">{survivedCount} / 7</span>
              </div>
              
              <div className="space-y-3">
                {ROUND_ORDER.map((roundName, index) => {
                  const r = player.rounds.find(r => r.round === roundName)
                  const status = r?.status || 'PENDING'
                  
                  let badge = <span className="text-xs font-semibold px-2 py-1 rounded bg-surface-2 text-muted-foreground">Pending</span>
                  if (status === 'SURVIVED') badge = <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700">Pass</span>
                  if (status === 'ELIMINATED') badge = <span className="text-xs font-semibold px-2 py-1 rounded bg-red-100 text-red-700">Fail</span>

                  return (
                    <div key={roundName} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm font-medium text-muted-foreground">
                        {index + 1}. {ROUND_LABELS[roundName as keyof typeof ROUND_LABELS]}
                      </span>
                      {badge}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Verified by Paradox Administration
          </p>
        </div>
      </div>
    </div>
  )
}
