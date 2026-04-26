'use client'

import React, { useState } from 'react'
import { QRScanner } from '@/components/squid/QRScanner'
import { ROUND_ORDER, ROUND_LABELS } from '@/lib/constants'
import { Check, X, RefreshCw } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { playHorrorSting, playRelief, playScanBlip, playStatic } from '@/lib/horror-audio'

export default function VolunteerRoundPage() {
  const [selectedRound, setSelectedRound] = useState(ROUND_ORDER[0])
  const [player, setPlayer] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [showOverlay, setShowOverlay] = useState<'survived' | 'eliminated' | null>(null)

  const handleScan = async (token: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: token })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'SCAN FAILED')
      if (!data.player.isRegistered) throw new Error('SUBJECT NOT YET REGISTERED.')
      playScanBlip()
      setPlayer(data.player)
    } catch (err: any) {
      playStatic(0.1, 0.2)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateRound = async (status: 'SURVIVED' | 'ELIMINATED') => {
    setUpdating(true)
    setError('')
    // Play sound immediately before API call for instant feedback
    if (status === 'ELIMINATED') {
      playHorrorSting()
    } else {
      playRelief()
    }
    try {
      const res = await fetch('/api/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: player.qrToken, roundName: selectedRound, status })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'UPDATE FAILED')
      setPlayer(data.player)
      setShowOverlay(status === 'SURVIVED' ? 'survived' : 'eliminated')
      setTimeout(() => setShowOverlay(null), 2200)
    } catch (err: any) {
      playStatic(0.15, 0.3)
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const isEliminated = player?.rounds?.some((r: any) => r.status === 'ELIMINATED')
  const currentRoundStatus = player?.rounds?.find((r: any) => r.round === selectedRound)?.status

  return (
    <>
      {/* Full-screen verdict overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            className="fixed inset-0 z-[9995] flex flex-col items-center justify-center pointer-events-none"
            style={{ background: showOverlay === 'eliminated' ? 'rgba(80,0,0,0.85)' : 'rgba(0,40,0,0.75)' }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {showOverlay === 'eliminated' ? (
                <X className="w-40 h-40 text-red-600" style={{ filter: 'drop-shadow(0 0 40px rgba(200,0,0,0.8))' }} />
              ) : (
                <Check className="w-40 h-40 text-green-600" style={{ filter: 'drop-shadow(0 0 40px rgba(0,160,0,0.6))' }} />
              )}
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl mt-6 tracking-[0.3em] uppercase"
              style={{
                fontFamily: 'Special Elite, cursive',
                color: showOverlay === 'eliminated' ? '#cc3333' : '#4caf50',
              }}
            >
              {showOverlay === 'eliminated' ? 'ELIMINATED' : 'SURVIVED'}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-sm mx-auto w-full space-y-5 pb-8">
        <div>
          <h1 className="text-xl text-[#c8bfbf]" style={{ fontFamily: 'Special Elite, cursive' }}>ROUND UPDATE</h1>
          <p className="text-[10px] tracking-[0.4em] text-[#d4b8b8] uppercase mt-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            DECIDE THEIR FATE
          </p>
        </div>

        {/* Round selector */}
        <div className="h-card blood-border-top p-4">
          <label className="h-label">ACTIVE ROUND</label>
          <select
            value={selectedRound}
            onChange={e => { setSelectedRound(e.target.value); setPlayer(null); setError('') }}
            className="h-input uppercase tracking-widest"
          >
            {ROUND_ORDER.map(r => (
              <option key={r} value={r} className="bg-[#3a1c1e]">{ROUND_LABELS[r]}</option>
            ))}
          </select>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="border border-red-900/50 bg-red-950/20 text-red-500 text-[11px] px-4 py-3 tracking-widest uppercase"
            style={{ fontFamily: 'Share Tech Mono, monospace' }}
          >
            ⚠ {error}
          </motion.div>
        )}

        {!player && !loading && (
          <QRScanner onScan={handleScan} onError={err => console.log(err)} />
        )}

        {loading && (
          <div className="h-card blood-border-top p-12 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border border-red-800 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] tracking-[0.4em] text-red-900 uppercase animate-pulse" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
              SCANNING SUBJECT...
            </p>
          </div>
        )}

        {player && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="h-card blood-border-top p-4 flex items-center gap-3">
              <div className={`w-10 h-10 border overflow-hidden flex-shrink-0 ${isEliminated ? 'border-red-900/50 grayscale' : 'border-red-900/30'}`}>
                {player.photoUrl
                  ? <img src={player.photoUrl} className="w-full h-full object-cover" alt="" />
                  : <div className="w-full h-full bg-red-950/20" />
                }
              </div>
              <div className="flex-1">
                <p className={`text-sm truncate ${isEliminated ? 'line-through text-[#d4b8b8]' : 'text-[#c8bfbf]'}`} style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                  {player.name || 'UNKNOWN'}
                </p>
                <p className="text-[10px] text-[#d4b8b8]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>#{player.playerNumber}</p>
              </div>
              {isEliminated
                ? <span className="badge-red">DEAD</span>
                : <span className="badge-green">ALIVE</span>
              }
            </div>

            {!isEliminated && currentRoundStatus === 'PENDING' ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateRound('ELIMINATED')}
                  disabled={updating}
                  className="h-btn-danger flex items-center justify-center gap-2 py-5 text-base"
                >
                  <X className="w-6 h-6" />
                  ELIMINATE
                </button>
                <button
                  onClick={() => updateRound('SURVIVED')}
                  disabled={updating}
                  className="flex items-center justify-center gap-2 py-5 border text-base uppercase tracking-widest disabled:opacity-50 transition-all"
                  style={{
                    fontFamily: 'Share Tech Mono, monospace',
                    background: 'rgba(20,60,20,0.3)',
                    color: '#4caf50',
                    borderColor: 'rgba(60,120,60,0.4)',
                    fontSize: '13px',
                  }}
                >
                  <Check className="w-6 h-6" /> SURVIVE
                </button>
              </div>
            ) : (
              <div className="h-card p-4 text-center text-[11px] text-[#d4b8b8] tracking-widest uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                {isEliminated ? 'SUBJECT IS ELIMINATED' : 'ROUND ALREADY RECORDED'}
              </div>
            )}

            <button
              onClick={() => { setPlayer(null); setError('') }}
              className="h-btn-ghost w-full flex items-center justify-center gap-2 text-[11px]"
            >
              <RefreshCw className="w-3 h-3" /> SCAN NEXT SUBJECT
            </button>
          </motion.div>
        )}
      </div>
    </>
  )
}
