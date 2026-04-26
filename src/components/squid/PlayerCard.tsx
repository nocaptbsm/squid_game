import React from 'react'
import { RoundBadge } from './RoundBadge'
import { Skull } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUND_LABELS } from '@/lib/constants'
import { GlassCard } from '@/components/ui/GlassCard'

interface PlayerCardProps {
  player: any
  showRounds?: boolean
  className?: string
}

export function PlayerCard({ player, showRounds = false, className }: PlayerCardProps) {
  const isEliminated = player.rounds?.some((r: any) => r.status === 'ELIMINATED')

  const displayRounds = player.rounds?.map((r: any) => {
    if (isEliminated && r.status === 'PENDING') {
      return { ...r, status: 'LOCKED' }
    }
    return r
  })

  return (
    <GlassCard glow={isEliminated ? 'none' : 'teal'} className={cn(
      "relative overflow-hidden w-full max-w-sm mx-auto p-6",
      isEliminated && "border-npCoral/30 bg-npCoral/5",
      className
    )}>
      {/* Number Badge */}
      <div className="absolute top-0 right-0 bg-npPink text-white px-4 py-1.5 rounded-bl-2xl font-mono text-xl font-bold tracking-widest shadow-npPinkGlow z-10">
        {player.playerNumber}
      </div>

      <div className="flex flex-col items-center mt-2 mb-6">
        <div className={cn(
          "relative w-32 h-32 rounded-full overflow-hidden border-4 mb-4 shadow-[0_0_20px_rgba(0,0,0,0.3)]",
          isEliminated ? "border-npCoral shadow-npCoral/30" : "border-npTeal shadow-npTealGlow"
        )}>
          {player.photoUrl ? (
            <img 
              src={player.photoUrl} 
              alt={player.name || "Player"} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-white/5 flex items-center justify-center text-npTextMuted backdrop-blur-sm">
              No Photo
            </div>
          )}
          
          {isEliminated && (
            <div className="absolute inset-0 bg-npCoral/40 flex items-center justify-center backdrop-blur-sm">
              <Skull className="w-12 h-12 text-white drop-shadow-md" />
            </div>
          )}
        </div>
        
        <h3 className="text-2xl font-heading font-bold text-white text-center truncate w-full tracking-wide">
          {player.name || 'UNREGISTERED'}
        </h3>
        
        {!player.isRegistered && (
          <span className="text-xs text-npPink mt-2 tracking-widest uppercase font-bold">
            Pending Registration
          </span>
        )}
      </div>

      {showRounds && player.rounds && (
        <div className="space-y-3 mt-6 pt-6 border-t border-white/10">
          {displayRounds.map((round: any) => (
            <div key={round.round} className="flex justify-between items-center bg-white/[0.02] p-2 rounded-lg border border-white/[0.05]">
              <span className="text-xs font-bold text-npTextSecondary uppercase tracking-widest ml-2">
                {ROUND_LABELS[round.round as keyof typeof ROUND_LABELS]}
              </span>
              <RoundBadge status={round.status} />
            </div>
          ))}
        </div>
      )}

      {isEliminated && (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-npCoral/20 to-transparent mix-blend-overlay"></div>
      )}
    </GlassCard>
  )
}
