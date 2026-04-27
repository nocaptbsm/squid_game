'use client'

import React, { useState, useEffect } from 'react'
import { ROUND_ORDER, ROUND_LABELS } from '@/lib/constants'
import { Download } from 'lucide-react'

// Inline RoundBadge for minimal UI to avoid horror styling dependencies
function CleanRoundBadge({ status }: { status: string }) {
  if (status === 'SURVIVED') return <span className="badge-green">Pass</span>
  if (status === 'ELIMINATED') return <span className="badge-red">Fail</span>
  return <span className="badge-gray">Pending</span>
}

export default function RoundsMatrix() {
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/players?limit=1000`)
      .then(res => res.json())
      .then(data => {
        if (data.players) setPlayers(data.players)
        setLoading(false)
      })
  }, [])

  const exportCSV = () => {
    const headers = ['Player Number', 'Name', ...ROUND_ORDER.map(r => ROUND_LABELS[r])]
    const rows = players.map(p => {
      const pRounds = ROUND_ORDER.map(roundName => {
        return p.rounds.find((r: any) => r.round === roundName)?.status || 'PENDING'
      })
      return [p.playerNumber, p.name || 'Unregistered', ...pRounds]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'paradox_rounds_export.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Rounds Matrix
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Full progression overview for all participants.</p>
        </div>
        <button onClick={exportCSV} disabled={loading || players.length === 0} className="h-btn-ghost flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="h-card overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px] text-sm">
          <thead>
            <tr className="bg-surface-2 border-b border-border">
              <th className="p-4 font-semibold text-muted-foreground sticky left-0 bg-surface-2 z-10 w-24 border-r border-border shadow-[2px_0_5px_rgba(0,0,0,0.02)]">ID</th>
              {ROUND_ORDER.map(r => (
                <th key={r} className="p-4 font-semibold text-muted-foreground text-center">
                  <div className="rotate-[-45deg] whitespace-nowrap -ml-4 mt-4 h-24 flex items-end justify-start translate-y-4 translate-x-4">
                    {ROUND_LABELS[r]}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {loading ? (
              <tr>
                <td colSpan={ROUND_ORDER.length + 1} className="p-8 text-center text-sm text-muted-foreground font-medium">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading Matrix...
                </td>
              </tr>
            ) : players.map(player => (
              <tr key={player.id} className="hover:bg-surface-2 transition-colors group">
                <td className="p-4 sticky left-0 bg-surface group-hover:bg-surface-2 font-mono font-medium text-foreground border-r border-border shadow-[2px_0_5px_rgba(0,0,0,0.02)] transition-colors">
                  {player.playerNumber}
                </td>
                {ROUND_ORDER.map(roundName => {
                  const status = player.rounds.find((r: any) => r.round === roundName)?.status || 'PENDING'
                  return (
                    <td key={roundName} className="p-4 text-center border-r border-border/50">
                      <CleanRoundBadge status={status} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
