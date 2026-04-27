'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronRight, Search, X, Edit2, QrCode } from 'lucide-react'
import { ROUND_ORDER, ROUND_LABELS } from '@/lib/constants'

const filters = ['ALL', 'REGISTERED', 'SURVIVING', 'ELIMINATED']

// ─── Player Detail Drawer ─────────────────────────────────────────────────────
function PlayerDrawer({ playerId, onClose }: { playerId: string; onClose: () => void }) {
  const [player, setPlayer] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/players/${playerId}`)
      .then(r => r.json())
      .then(data => { setPlayer(data); setLoading(false) })
  }, [playerId])

  const isEliminated = player?.rounds?.some((r: any) => r.status === 'ELIMINATED')
  const survivedCount = player?.rounds?.filter((r: any) => r.status === 'SURVIVED').length ?? 0

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-surface border-l border-border shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-300">
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2">
          <h2 className="text-base font-semibold text-foreground">Player Details</h2>
          <div className="flex items-center gap-2">
            {player && (
              <Link
                href={`/admin/players/${player.id}`}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </Link>
            )}
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-surface text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !player ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            Player not found.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Identity section */}
            <div className="px-6 py-6 border-b border-border">
              <div className="flex items-center gap-5">
                <div className={`w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-surface-2 flex-shrink-0 ${isEliminated ? 'grayscale opacity-60' : ''}`}>
                  {player.photoUrl
                    ? <img src={player.photoUrl} className="w-full h-full object-cover" alt="" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl font-semibold text-muted-foreground">
                        {player.playerNumber.substring(0, 2)}
                      </div>
                  }
                </div>
                <div>
                  <h3 className={`text-xl font-bold tracking-tight ${isEliminated ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {player.name || 'Unregistered'}
                  </h3>
                  <p className="text-sm font-mono text-muted-foreground mt-1">#{player.playerNumber}</p>
                  <div className="mt-2">
                    {!player.isRegistered
                      ? <span className="badge-gray">Pending Registration</span>
                      : isEliminated
                        ? <span className="badge-red">Eliminated</span>
                        : <span className="badge-green">Surviving</span>
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="px-6 py-5 border-b border-border">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-muted-foreground">Round Progress</span>
                <span className="text-foreground">{survivedCount} / 7 passed</span>
              </div>
              <div className="h-2.5 w-full bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${(survivedCount / 7) * 100}%` }}
                />
              </div>
            </div>

            {/* Round statuses */}
            <div className="px-6 py-5 border-b border-border">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Round Results</h4>
              <div className="space-y-2.5">
                {ROUND_ORDER.map((roundName, idx) => {
                  const r = player.rounds?.find((r: any) => r.round === roundName)
                  const status = r?.status || 'PENDING'
                  return (
                    <div key={roundName} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-surface-2 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {ROUND_LABELS[roundName as keyof typeof ROUND_LABELS]}
                        </span>
                      </div>
                      {status === 'SURVIVED'
                        ? <span className="badge-green">Passed</span>
                        : status === 'ELIMINATED'
                          ? <span className="badge-red">Eliminated</span>
                          : <span className="badge-gray">Pending</span>
                      }
                    </div>
                  )
                })}
              </div>
            </div>

            {/* QR Code */}
            <div className="px-6 py-5 border-b border-border">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <QrCode className="w-3.5 h-3.5" /> QR Code
              </h4>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-white border border-border rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={`/api/qr/${player.qrToken}`}
                    alt="Player QR"
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <p>Scan this code at check-in or round update stations.</p>
                  <p className="mt-2 font-mono break-all text-[10px] text-border-foreground opacity-60">{player.qrToken}</p>
                </div>
              </div>
            </div>

            {/* Meta info */}
            <div className="px-6 py-5">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Account Info</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Login PIN</span>
                  <span className="font-mono font-medium text-foreground">{player.playerNumber.padStart(4, '0')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registration</span>
                  <span className="font-medium text-foreground">{player.isRegistered ? 'Completed' : 'Not yet registered'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Player ID</span>
                  <span className="font-mono text-xs text-muted-foreground">{player.id?.substring(0, 16)}…</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ─── Players List ─────────────────────────────────────────────────────────────
function PlayersListContent() {
  const searchParams = useSearchParams()
  const initialFilter = searchParams.get('filter') || 'all'

  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState(initialFilter)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  useEffect(() => {
    const f = searchParams.get('filter')
    if (f) setFilter(f.toLowerCase())
  }, [searchParams])

  useEffect(() => {
    setLoading(true)
    fetch(`/api/players?search=${search}&filter=${filter.toLowerCase()}`)
      .then(res => res.json())
      .then(data => {
        if (data.players) setPlayers(data.players)
        setLoading(false)
      })
  }, [search, filter])

  return (
    <div className="space-y-6 max-w-5xl">
      {selectedPlayerId && (
        <PlayerDrawer playerId={selectedPlayerId} onClose={() => setSelectedPlayerId(null)} />
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Players</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {players.length} participants · Click a name to view full details
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-input pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f.toLowerCase())}
              className={`px-4 py-2 text-xs font-medium rounded-md transition-colors ${
                filter === f.toLowerCase()
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface border border-border text-foreground hover:bg-surface-2'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="h-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm text-left">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                {['ID', 'Participant', 'Status', 'Action'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-6 py-4 font-semibold text-muted-foreground ${i === 3 ? 'text-right' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">Loading players...</p>
                  </td>
                </tr>
              ) : players.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-sm text-muted-foreground">
                    No players found.
                  </td>
                </tr>
              ) : players.map((player) => {
                const isEliminated = player.rounds.some((r: any) => r.status === 'ELIMINATED')
                return (
                  <tr key={player.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-foreground">
                      {player.playerNumber}
                    </td>
                    <td className="px-6 py-4">
                      {/* Clickable participant cell */}
                      <button
                        onClick={() => setSelectedPlayerId(player.id)}
                        className="flex items-center gap-3 group text-left w-full"
                      >
                        <div className={`w-8 h-8 rounded-full overflow-hidden bg-surface-2 flex-shrink-0 ${isEliminated ? 'opacity-50 grayscale' : ''}`}>
                          {player.photoUrl
                            ? <img src={player.photoUrl} className="w-full h-full object-cover" alt="" />
                            : <div className="w-full h-full flex items-center justify-center text-muted-foreground font-medium text-xs">
                                {player.playerNumber.substring(0, 2)}
                              </div>
                          }
                        </div>
                        <span className={`font-medium group-hover:text-primary group-hover:underline transition-colors ${
                          isEliminated ? 'line-through text-muted-foreground' : 'text-foreground'
                        } ${!player.name ? 'italic text-muted-foreground font-normal' : ''}`}>
                          {player.name || 'Unregistered'}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {!player.isRegistered
                        ? <span className="badge-gray">Pending</span>
                        : isEliminated
                          ? <span className="badge-red">Eliminated</span>
                          : <span className="badge-green">Surviving</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/players/${player.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        Edit <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function PlayersList() {
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3" />
        <span className="text-muted-foreground font-medium">Initializing list...</span>
      </div>
    }>
      <PlayersListContent />
    </Suspense>
  )
}
