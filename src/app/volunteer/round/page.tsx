'use client'

import React, { useState } from 'react'
import { QRScanner } from '@/components/squid/QRScanner'
import { ROUND_ORDER, ROUND_LABELS } from '@/lib/constants'
import { Check, X, RefreshCw } from 'lucide-react'

export default function VolunteerRoundPage() {
  const [selectedRound, setSelectedRound] = useState(ROUND_ORDER[0])
  const [player, setPlayer] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [showOverlay, setShowOverlay] = useState<'survived' | 'eliminated' | null>(null)

  const handleScan = async (rawValue: string) => {
    setLoading(true)
    setError('')
    try {
      let token = rawValue
      try {
        const url = new URL(rawValue)
        const parts = url.pathname.split('/')
        token = parts[parts.length - 1]
      } catch {
        // Not a URL, use raw value
      }

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: token })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scan failed')
      if (!data.player.isRegistered) throw new Error('Player not yet registered.')
      setPlayer(data.player)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateRound = async (status: 'SURVIVED' | 'ELIMINATED') => {
    setUpdating(true)
    setError('')
    try {
      const res = await fetch('/api/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: player.id, round: selectedRound, status })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')
      setPlayer(data.player)
      setShowOverlay(status === 'SURVIVED' ? 'survived' : 'eliminated')
      setTimeout(() => setShowOverlay(null), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const isEliminated = player?.rounds?.some((r: any) => r.status === 'ELIMINATED')
  const currentRoundStatus = player?.rounds?.find((r: any) => r.round === selectedRound)?.status

  return (
    <>
      {/* Verdict overlay */}
      {showOverlay && (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center animate-in fade-in duration-300 ${showOverlay === 'eliminated' ? 'bg-red-500/90' : 'bg-green-500/90'}`}>
          <div className="bg-white p-8 rounded-full mb-6 shadow-xl animate-in zoom-in duration-300 delay-150">
            {showOverlay === 'eliminated' ? (
              <X className="w-24 h-24 text-red-600" />
            ) : (
              <Check className="w-24 h-24 text-green-600" />
            )}
          </div>
          <p className="text-3xl font-bold tracking-tight text-white animate-in slide-in-from-bottom-4 duration-300 delay-150">
            {showOverlay === 'eliminated' ? 'ELIMINATED' : 'SURVIVED'}
          </p>
        </div>
      )}

      <div className="max-w-sm mx-auto w-full space-y-6 pb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Round Update</h1>
          <p className="text-sm text-muted-foreground mt-1">Record player results</p>
        </div>

        {/* Round selector */}
        <div className="h-card p-5">
          <label className="h-label mb-2">Active Round</label>
          <select
            value={selectedRound}
            onChange={e => { setSelectedRound(e.target.value); setPlayer(null); setError('') }}
            className="w-full border border-border bg-surface text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer font-medium"
          >
            {ROUND_ORDER.map(r => (
              <option key={r} value={r}>{ROUND_LABELS[r]}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {!player && !loading && (
          <QRScanner onScan={handleScan} onError={err => console.log(err)} />
        )}

        {loading && (
          <div className="h-card p-12 flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-foreground">Scanning player...</p>
          </div>
        )}

        {player && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="h-card p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-surface-2 ${isEliminated ? 'opacity-50 grayscale' : ''}`}>
                {player.photoUrl
                  ? <img src={player.photoUrl} className="w-full h-full object-cover" alt="" />
                  : <div className="w-full h-full flex items-center justify-center text-lg font-medium text-muted-foreground">
                      {player.playerNumber.substring(0, 2)}
                    </div>
                }
              </div>
              <div className="flex-1">
                <p className={`text-base font-semibold truncate ${isEliminated ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {player.name || 'Unknown Player'}
                </p>
                <p className="text-sm text-muted-foreground font-mono mt-0.5">#{player.playerNumber}</p>
              </div>
              {isEliminated
                ? <span className="badge-red">Eliminated</span>
                : <span className="badge-green">Active</span>
              }
            </div>

            {!isEliminated && currentRoundStatus === 'PENDING' ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateRound('ELIMINATED')}
                  disabled={updating}
                  className="flex items-center justify-center gap-2 py-4 rounded-lg bg-red-50 text-red-600 border border-red-200 font-semibold hover:bg-red-100 transition-colors"
                >
                  <X className="w-5 h-5" /> Eliminate
                </button>
                <button
                  onClick={() => updateRound('SURVIVED')}
                  disabled={updating}
                  className="flex items-center justify-center gap-2 py-4 rounded-lg bg-green-50 text-green-600 border border-green-200 font-semibold hover:bg-green-100 transition-colors"
                >
                  <Check className="w-5 h-5" /> Survive
                </button>
              </div>
            ) : (
              <div className="h-card p-4 text-center text-sm font-medium text-muted-foreground bg-surface-2">
                {isEliminated ? 'Player is eliminated' : 'Round result already recorded'}
              </div>
            )}

            <button
              onClick={() => { setPlayer(null); setError('') }}
              className="h-btn-ghost w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Scan Next Player
            </button>
          </div>
        )}
      </div>
    </>
  )
}
