'use client'

import React, { useState, useEffect } from 'react'
import { RoundBadge } from '@/components/squid/RoundBadge'
import { ROUND_ORDER, ROUND_LABELS } from '@/lib/constants'
import { GlowButton } from '@/components/ui/GlowButton'
import { Download } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'

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
    <div className="space-y-8 relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black uppercase tracking-widest text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            Rounds Matrix
          </h1>
          <p className="text-npTextSecondary text-sm uppercase tracking-widest mt-1">Full Progression Overview</p>
        </div>
        <GlowButton variant="secondary" onClick={exportCSV} disabled={loading || players.length === 0} className="px-6 py-3">
          <Download className="w-4 h-4" /> Export CSV
        </GlowButton>
      </div>

      <GlassCard className="overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/10 text-[10px] uppercase tracking-widest text-npTextMuted">
              <th className="p-4 font-bold sticky left-0 bg-[#0c0822] z-10 w-24 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">#</th>
              {ROUND_ORDER.map(r => (
                <th key={r} className="p-4 font-bold text-center">
                  <div className="rotate-[-45deg] whitespace-nowrap -ml-4 mt-4 h-24 flex items-end justify-start translate-y-4 translate-x-4">
                    {ROUND_LABELS[r]}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={ROUND_ORDER.length + 1} className="p-8 text-center text-npTextMuted font-bold uppercase tracking-widest text-sm">
                  <div className="w-6 h-6 border-2 border-npTeal border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading Matrix...
                </td>
              </tr>
            ) : players.map(player => (
              <tr key={player.id} className="hover:bg-white/[0.04] transition-colors group">
                <td className="p-4 sticky left-0 bg-[#0c0822] group-hover:bg-[#120c33] font-mono font-bold text-npPink border-r border-white/10 shadow-[4px_0_10px_rgba(0,0,0,0.3)] transition-colors">
                  {player.playerNumber}
                </td>
                {ROUND_ORDER.map(roundName => {
                  const status = player.rounds.find((r: any) => r.round === roundName)?.status || 'PENDING'
                  return (
                    <td key={roundName} className="p-4 text-center border-r border-white/[0.02]">
                      <RoundBadge status={status} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  )
}
