'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, RefreshCw } from 'lucide-react'
import { ROUND_ORDER, ROUND_LABELS } from '@/lib/constants'
import { motion, AnimatePresence } from 'framer-motion'

const statusMap: Record<string, { label: string; cls: string }> = {
  SURVIVED: { label: 'SURVIVED', cls: 'badge-green' },
  ELIMINATED: { label: 'ELIMINATED', cls: 'badge-red' },
  PENDING: { label: 'PENDING', cls: 'badge-gray' },
}

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
      if (!res.ok) throw new Error('FAILED TO RETRIEVE STATUS')
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
    <div className="min-h-screen bg-[#3a1c1e] flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border border-red-800 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
        <p className="text-[10px] tracking-[0.5em] text-red-900 uppercase animate-pulse" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
          RETRIEVING YOUR FATE...
        </p>
        <svg viewBox="0 0 300 40" className="w-48 h-8 mt-4 opacity-20 mx-auto">
          <polyline
            points="0,20 30,20 40,20 48,5 56,35 64,8 72,20 110,20 120,20 128,20 136,6 144,34 152,8 160,20 200,20"
            stroke="#cc0000" strokeWidth="1.5" fill="none"
            strokeDasharray="500" strokeDashoffset="500"
            style={{ animation: 'ekg 2s ease-in-out infinite' }}
          />
        </svg>
      </div>
    </div>
  )

  if (error || !player) return (
    <div className="min-h-screen bg-[#3a1c1e] flex flex-col items-center justify-center p-4 gap-4">
      <p className="text-[11px] tracking-widest text-red-500 border border-red-900/40 bg-red-950/20 px-6 py-3 uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
        ⚠ {error || 'PLAYER NOT FOUND'}
      </p>
      <button onClick={handleLogout} className="h-btn-ghost text-[11px]">← BACK</button>
    </div>
  )

  const isEliminated = player.rounds?.some((r: any) => r.status === 'ELIMINATED')
  const survivedCount = player.rounds?.filter((r: any) => r.status === 'SURVIVED').length ?? 0

  return (
    <div className="min-h-screen bg-[#3a1c1e] flex flex-col">
      {/* Nav */}
      <header className="h-14 border-b border-red-900/20 bg-[#441f21]/80 flex items-center justify-between px-4 lg:px-8 relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-900/40" style={{ boxShadow: '0 0 8px rgba(139,0,0,0.4)' }} />
        <div className="flex items-center gap-2">
          <span className="text-red-800 text-sm flicker" style={{ fontFamily: 'Special Elite, cursive' }}>PARADOX</span>
          <span className="text-[#a88080] text-[9px] tracking-widest uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>2025</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-[10px] tracking-widest text-[#d4b8b8] hover:text-red-700 uppercase transition-colors" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
          <LogOut className="w-4 h-4" /> EXIT
        </button>
      </header>

      <main className="flex-1 max-w-sm mx-auto w-full px-4 py-8 space-y-5">
        {/* Status banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`h-card blood-border-top p-5 flex items-center justify-between ${isEliminated ? 'border-red-900/50' : 'border-green-900/30'}`}
          style={isEliminated ? { boxShadow: '0 0 30px rgba(100,0,0,0.2)' } : { boxShadow: '0 0 20px rgba(0,60,0,0.15)' }}
        >
          <div>
            <p className="text-[9px] tracking-[0.4em] text-[#d4b8b8] uppercase mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>YOUR STATUS</p>
            <p
              className={`text-2xl flicker ${isEliminated ? '' : ''}`}
              style={{
                fontFamily: 'Special Elite, cursive',
                color: isEliminated ? '#cc3333' : '#4caf50',
                textShadow: isEliminated ? '0 0 20px rgba(180,0,0,0.5)' : '0 0 15px rgba(0,160,0,0.4)',
              }}
            >
              {isEliminated ? 'ELIMINATED' : 'SURVIVING'}
            </p>
          </div>
          <div
            className="text-5xl"
            style={{
              fontFamily: 'Share Tech Mono, monospace',
              color: isEliminated ? '#cc3333' : '#2d7d2d',
              opacity: 0.4,
            }}
          >
            {isEliminated ? '✗' : '□'}
          </div>
        </motion.div>

        {/* Player card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="h-card blood-border-top p-5 space-y-5"
        >
          {/* Photo + info */}
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 border overflow-hidden flex-shrink-0 ${isEliminated ? 'border-red-900/50 grayscale contrast-75' : 'border-red-900/30'}`}>
              {player.photoUrl
                ? <img src={player.photoUrl} className="w-full h-full object-cover" alt="" />
                : <div className="w-full h-full bg-red-950/20 flex items-center justify-center text-3xl font-bold text-[#d4b8b8]">
                    {player.name?.[0]?.toUpperCase() || '?'}
                  </div>
              }
            </div>
            <div>
              <h2 className={`text-base ${isEliminated ? 'line-through text-[#d4b8b8]' : 'text-[#c8bfbf]'}`} style={{ fontFamily: 'Special Elite, cursive' }}>
                {player.name || 'UNKNOWN'}
              </h2>
              <p className="text-[10px] text-[#d4b8b8] mt-0.5" style={{ fontFamily: 'Share Tech Mono, monospace' }}>PLAYER #{player.playerNumber}</p>
              <p className="text-[10px] text-[#d4b8b8] mt-0.5" style={{ fontFamily: 'Share Tech Mono, monospace' }}>{survivedCount}/7 ROUNDS</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-red-950/30 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(survivedCount / 7) * 100}%` }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="h-full bg-red-800"
              style={{ boxShadow: '0 0 6px rgba(139,0,0,0.6)' }}
            />
          </div>

          {/* Rounds list */}
          <div className="space-y-1.5">
            {ROUND_ORDER.map((roundName, i) => {
              const r = player.rounds?.find((r: any) => r.round === roundName)
              const status = r?.status || 'PENDING'
              const cfg = statusMap[status]
              return (
                <motion.div
                  key={roundName}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  className="flex items-center justify-between py-2 border-b border-red-900/10 last:border-0"
                >
                  <span className="text-[11px] text-[#7a6e6e] tracking-widest uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                    {ROUND_LABELS[roundName as keyof typeof ROUND_LABELS]}
                  </span>
                  <span className={cfg.cls}>{cfg.label}</span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Auto-refresh */}
        <div className="flex items-center justify-center gap-2 text-[9px] text-[#a88080] uppercase tracking-widest" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
          <RefreshCw className="w-3 h-3" />
          AUTO-REFRESHES EVERY 30 SECONDS
          {lastUpdated && <span>· {lastUpdated.toLocaleTimeString()}</span>}
        </div>
      </main>
    </div>
  )
}
