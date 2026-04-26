'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, Search } from 'lucide-react'
import { motion } from 'framer-motion'

const filters = ['ALL', 'REGISTERED', 'SURVIVING', 'ELIMINATED']

export default function PlayersList() {
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl text-[#c8bfbf]" style={{ fontFamily: 'Special Elite, cursive' }}>PLAYER ROSTER</h1>
        <p className="text-[10px] tracking-[0.4em] text-[#d4b8b8] uppercase mt-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
          {players.length} SUBJECTS CATALOGUED
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4b8b8]" />
          <input
            type="text"
            placeholder="SEARCH SUBJECTS..."
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
              className={`px-3 py-2 text-[10px] tracking-widest uppercase border transition-all ${
                filter === f.toLowerCase()
                  ? 'bg-red-950/40 text-red-500 border-red-900/50'
                  : 'bg-transparent text-[#d4b8b8] border-red-900/20 hover:border-red-900/40 hover:text-[#c8bfbf]'
              }`}
              style={{ fontFamily: 'Share Tech Mono, monospace' }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="h-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-red-900/20 bg-red-950/10">
                {['#', 'SUBJECT', 'STATUS', 'ROUNDS', 'ACTION'].map(h => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-left text-[9px] tracking-[0.3em] text-[#d4b8b8] uppercase ${h === 'ACTION' ? 'text-right' : ''}`}
                    style={{ fontFamily: 'Share Tech Mono, monospace' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-red-900/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="w-5 h-5 border border-red-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-[10px] tracking-widest text-red-900 uppercase animate-pulse" style={{ fontFamily: 'Share Tech Mono, monospace' }}>RETRIEVING DATA...</p>
                  </td>
                </tr>
              ) : players.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center text-[11px] text-[#d4b8b8]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>NO SUBJECTS FOUND</td></tr>
              ) : players.map((player, idx) => {
                const isEliminated = player.rounds.some((r: any) => r.status === 'ELIMINATED')
                const survived = player.rounds.filter((r: any) => r.status === 'SURVIVED').length

                return (
                  <motion.tr
                    key={player.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-red-950/10 transition-colors group"
                  >
                    <td className="px-4 py-3 font-mono text-sm text-red-900" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                      {player.playerNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 overflow-hidden border flex-shrink-0 ${isEliminated ? 'border-red-900/50 opacity-50 grayscale' : 'border-red-900/20'}`}>
                          {player.photoUrl
                            ? <img src={player.photoUrl} className="w-full h-full object-cover" alt="" />
                            : <div className="w-full h-full bg-red-950/20" />
                          }
                        </div>
                        <span
                          className={`text-sm ${isEliminated ? 'line-through text-[#d4b8b8]' : 'text-[#c8bfbf]'} ${!player.name ? 'italic text-[#d4b8b8]' : ''}`}
                          style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px' }}
                        >
                          {player.name || 'UNREGISTERED'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {!player.isRegistered
                        ? <span className="badge-gray">PENDING</span>
                        : isEliminated
                          ? <span className="badge-red">ELIMINATED</span>
                          : <span className="badge-green">SURVIVING</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5 items-center">
                        {[...Array(7)].map((_, i) => (
                          <div key={i} className={`w-2 h-4 ${i < survived ? 'bg-red-800' : 'bg-red-950/30 border border-red-900/15'}`}
                            style={i < survived ? { boxShadow: '0 0 4px rgba(139,0,0,0.5)' } : {}}
                          />
                        ))}
                        <span className="ml-2 text-[10px] text-[#d4b8b8]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>{survived}/7</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/players/${player.id}`}
                        className="inline-flex items-center gap-1 text-[10px] tracking-widest text-red-900 hover:text-red-500 uppercase transition-colors"
                        style={{ fontFamily: 'Share Tech Mono, monospace' }}
                      >
                        EDIT <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
