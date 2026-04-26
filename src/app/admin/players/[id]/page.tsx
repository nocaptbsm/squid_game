'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, Save } from 'lucide-react'
import { ROUND_ORDER, ROUND_LABELS } from '@/lib/constants'
import { motion } from 'framer-motion'

export default function EditPlayerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [player, setPlayer] = useState<any>(null)
  const [name, setName] = useState('')
  const [rounds, setRounds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetch(`/api/players/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setPlayer(data)
        setName(data.name || '')
        setRounds(data.rounds || [])
        setLoading(false)
      })
  }, [params.id])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/players/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, roundOverrides: rounds })
      })
      if (res.ok) {
        setMessage({ type: 'success', text: 'RECORD UPDATED.' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: 'FAILED TO UPDATE RECORD.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'SYSTEM ERROR.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('DELETE THIS SUBJECT FROM THE SYSTEM?')) return
    try {
      const res = await fetch(`/api/players/${params.id}`, { method: 'DELETE' })
      if (res.ok) router.push('/admin/players')
    } catch {
      setMessage({ type: 'error', text: 'DELETE FAILED.' })
    }
  }

  const handleRoundChange = (roundName: string, status: string) => {
    setRounds(prev => prev.map(r => r.round === roundName ? { ...r, status } : r))
  }

  if (loading) return (
    <div className="flex h-40 items-center justify-center">
      <div className="text-center">
        <div className="w-6 h-6 border border-red-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[10px] tracking-widest text-red-900 animate-pulse uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>RETRIEVING SUBJECT...</p>
      </div>
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/players" className="p-2 border border-red-900/25 text-[#d4b8b8] hover:text-red-600 hover:border-red-900/50 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl text-[#c8bfbf]" style={{ fontFamily: 'Special Elite, cursive' }}>EDIT SUBJECT</h1>
          <p className="text-[10px] tracking-widest text-[#d4b8b8] uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            #{player.playerNumber}
          </p>
        </div>
      </div>

      {message && (
        <div className={`text-[11px] px-4 py-3 tracking-widest uppercase border ${message.type === 'success' ? 'border-green-900/50 bg-green-950/20 text-green-600' : 'border-red-900/50 bg-red-950/20 text-red-500'}`} style={{ fontFamily: 'Share Tech Mono, monospace' }}>
          {message.type === 'success' ? '✓' : '⚠'} {message.text}
        </div>
      )}

      <div className="h-card blood-border-top p-6 space-y-6">
        <div className="flex gap-5 items-start">
          <div className={`w-20 h-20 border overflow-hidden flex-shrink-0 ${player.isRegistered ? 'border-red-900/40' : 'border-red-950/30'}`}>
            {player.photoUrl
              ? <img src={player.photoUrl} className="w-full h-full object-cover" alt="" />
              : <div className="w-full h-full bg-red-950/20 flex items-center justify-center text-[10px] text-[#d4b8b8]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>NO PHOTO</div>
            }
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className="h-label">DISPLAY NAME</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="h-input" placeholder="SUBJECT NAME" />
            </div>
            <div>
              <label className="h-label">STATUS</label>
              <div className="px-3 py-2 border border-red-900/20 text-[11px] tracking-widest uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                {player.isRegistered ? <span className="badge-green">REGISTERED</span> : <span className="badge-gray">PENDING</span>}
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[10px] tracking-[0.3em] text-[#d4b8b8] uppercase mb-3" style={{ fontFamily: 'Share Tech Mono, monospace' }}>▸ ROUND OVERRIDE</p>
          <div className="space-y-2">
            {ROUND_ORDER.map(roundName => {
              const r = rounds.find(r => r.round === roundName)
              if (!r) return null
              return (
                <div key={roundName} className="flex items-center justify-between py-2 px-3 border border-red-900/15 hover:border-red-900/30 transition-colors">
                  <span className="text-[11px] tracking-widest text-[#7a6e6e] uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                    {ROUND_LABELS[roundName as keyof typeof ROUND_LABELS]}
                  </span>
                  <select
                    value={r.status}
                    onChange={e => handleRoundChange(roundName, e.target.value)}
                    className="text-[11px] bg-[#3a1c1e] border border-red-900/30 text-[#c8bfbf] px-3 py-1.5 focus:outline-none focus:border-red-700 cursor-pointer uppercase tracking-widest"
                    style={{ fontFamily: 'Share Tech Mono, monospace' }}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="SURVIVED">SURVIVED</option>
                    <option value="ELIMINATED">ELIMINATED</option>
                  </select>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-4">
        <button onClick={handleDelete} className="h-btn-danger flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> TERMINATE
        </button>
        <button onClick={handleSave} disabled={saving} className="h-btn flex items-center gap-2">
          <Save className="w-4 h-4" /> {saving ? 'SAVING...' : 'SAVE RECORD'}
        </button>
      </div>
    </motion.div>
  )
}
