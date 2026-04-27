'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, RefreshCw } from 'lucide-react'
import { ROUND_ORDER, ROUND_LABELS } from '@/lib/constants'

export default function PlayerView({ params }: { params: { playerNumber: string } }) {
  const [player, setPlayer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const router = useRouter()

  const fetchPlayer = async () => {
    try {
      const res = await fetch(`/api/players/${params.playerNumber}`)
      if (res.status === 401) { router.push('/player/login'); return }
      if (!res.ok) throw new Error('Failed to retrieve status')
      const data = await res.json()
      setPlayer(data)
      setLastUpdated(new Date())
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayer()
    const interval = setInterval(fetchPlayer, 30000)
    return () => clearInterval(interval)
  }, [params.playerNumber])

  const handleLogout = () => {
    document.cookie = 'player-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/player/login')
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading player data...</p>
      </div>
    </div>
  )

  if (error || !player) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-4">
      <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 px-6 py-3 rounded-lg">
        {error || 'Player not found'}
      </p>
      <button onClick={handleLogout} className="h-btn-ghost">← Back to login</button>
    </div>
  )

  const isEliminated = player.rounds?.some((r: any) => r.status === 'ELIMINATED')
  const survivedCount = player.rounds?.filter((r: any) => r.status === 'SURVIVED').length ?? 0

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground tracking-tight">Paradox</span>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-surface-2 px-2 py-0.5 rounded">Player Portal</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-red-600 transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-8 space-y-6">
        {/* Status banner */}
        <div className={`h-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left ${isEliminated ? 'border-red-200 bg-red-50/50' : 'border-green-200 bg-green-50/50'}`}>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Current Status</p>
            <p className={`text-3xl font-bold tracking-tight ${isEliminated ? 'text-red-600' : 'text-green-600'}`}>
              {isEliminated ? 'Eliminated' : 'Surviving'}
            </p>
          </div>
        </div>

        {/* Player card */}
        <div className="h-card p-6 space-y-6">
          {/* Photo + info */}
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-surface-2 ${isEliminated ? 'opacity-50 grayscale' : ''}`}>
              {player.photoUrl
                ? <img src={player.photoUrl} className="w-full h-full object-cover" alt="" />
                : <div className="w-full h-full flex items-center justify-center text-xl font-medium text-muted-foreground">
                    {player.name?.[0]?.toUpperCase() || player.playerNumber.substring(0, 2)}
                  </div>
              }
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${isEliminated ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {player.name || 'Unknown Player'}
              </h2>
              <p className="text-sm text-muted-foreground font-mono mt-0.5">ID: {player.playerNumber}</p>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-foreground">{survivedCount} / 7 Rounds</span>
            </div>
            <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000 ease-out rounded-full" 
                style={{ width: `${(survivedCount / 7) * 100}%` }}
              />
            </div>
          </div>

          {/* Rounds list */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground mb-4">Round History</h3>
            {ROUND_ORDER.map((roundName) => {
              const r = player.rounds?.find((r: any) => r.round === roundName)
              const status = r?.status || 'PENDING'
              
              let badge = <span className="badge-gray">Pending</span>
              if (status === 'SURVIVED') badge = <span className="badge-green">Pass</span>
              if (status === 'ELIMINATED') badge = <span className="badge-red">Fail</span>

              return (
                <div key={roundName} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {ROUND_LABELS[roundName as keyof typeof ROUND_LABELS]}
                  </span>
                  {badge}
                </div>
              )
            })}
          </div>
        </div>

        {/* Auto-refresh */}
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
          <RefreshCw className="w-3 h-3" />
          Auto-refreshes every 30s
          {lastUpdated && <span>· {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
        </div>
      </main>
    </div>
  )
}
