'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ROUND_LABELS } from '@/lib/constants'
import { Check, X, Search, Loader2, Save, UserCheck, UserMinus } from 'lucide-react'

export default function RoundManagementPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, string>>({})

  const fetchPlayers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/rounds/${slug}`)
      const data = await res.json()
      if (data.players) {
        setPlayers(data.players)
        // Reset pending updates when new data is fetched
        setPendingUpdates({})
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayers()
  }, [slug])

  const handleStatusToggle = (playerId: string, currentStatus: string) => {
    let nextStatus: string
    if (currentStatus === 'PENDING') nextStatus = 'SURVIVED'
    else if (currentStatus === 'SURVIVED') nextStatus = 'ELIMINATED'
    else nextStatus = 'PENDING'

    setPendingUpdates(prev => ({
      ...prev,
      [playerId]: nextStatus
    }))
  }

  const saveChanges = async () => {
    setSaving(true)
    try {
      const updates = Object.entries(pendingUpdates).map(([playerId, status]) => ({
        playerId,
        status
      }))

      const res = await fetch(`/api/admin/rounds/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      })

      if (!res.ok) throw new Error('Failed to save')
      
      await fetchPlayers()
      alert('Changes saved successfully!')
    } catch (err) {
      alert('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const filteredPlayers = players.filter(p => 
    p.playerNumber.includes(search) || 
    (p.name && p.name.toLowerCase().includes(search.toLowerCase()))
  )

  const stats = {
    total: players.length,
    survived: players.filter(p => (pendingUpdates[p.id] || p.rounds[0]?.status) === 'SURVIVED').length,
    eliminated: players.filter(p => (pendingUpdates[p.id] || p.rounds[0]?.status) === 'ELIMINATED').length,
    pending: players.filter(p => (pendingUpdates[p.id] || p.rounds[0]?.status) === 'PENDING').length,
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#051919]">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
            {slug.replace(/-/g, ' ')}
          </h1>
          <p className="text-red-900/60 text-[10px] font-bold uppercase tracking-widest mt-1">
            Game Protocol: Progression Mapping
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="SEARCH PLAYER..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-black/40 border border-red-900/20 pl-10 pr-4 py-2 text-xs uppercase tracking-widest text-white focus:outline-none focus:border-red-500 w-64 transition-all"
            />
          </div>
          <button 
            onClick={saveChanges}
            disabled={saving || Object.keys(pendingUpdates).length === 0}
            className="h-btn flex items-center gap-2 !py-2 px-6 disabled:opacity-50 disabled:grayscale"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Stats Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="h-card p-6 border-red-900/20 bg-black/40">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-900/60 mb-6">Round Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-red-900/10 pb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Entering</span>
                <span className="text-xl font-black text-white">{stats.total}</span>
              </div>
              <div className="flex justify-between items-end border-b border-red-900/10 pb-2">
                <span className="text-[10px] font-bold text-green-900 uppercase tracking-widest">Survived</span>
                <span className="text-xl font-black text-green-500">{stats.survived}</span>
              </div>
              <div className="flex justify-between items-end border-b border-red-900/10 pb-2">
                <span className="text-[10px] font-bold text-red-900 uppercase tracking-widest">Eliminated</span>
                <span className="text-xl font-black text-red-600">{stats.eliminated}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Awaiting</span>
                <span className="text-xl font-black text-slate-400">{stats.pending}</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-red-900/5 border border-red-900/10 rounded-none">
            <p className="text-[9px] text-red-900/60 font-bold uppercase leading-relaxed tracking-wider">
              Note: Only players marked as <span className="text-green-500">SURVIVED</span> will progress to the next protocol stage.
            </p>
          </div>
        </div>

        {/* Player List */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredPlayers.map(player => {
              const currentStatus = pendingUpdates[player.id] || player.rounds[0]?.status || 'PENDING'
              
              return (
                <div 
                  key={player.id}
                  onClick={() => handleStatusToggle(player.id, currentStatus)}
                  className={`
                    cursor-pointer group p-4 border transition-all relative overflow-hidden
                    ${currentStatus === 'SURVIVED' ? 'bg-green-500/10 border-green-500/30' : 
                      currentStatus === 'ELIMINATED' ? 'bg-red-500/10 border-red-600/30' : 
                      'bg-black/40 border-red-900/10 hover:border-red-500/40'}
                  `}
                >
                  {/* Status Indicator Bar */}
                  <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${
                    currentStatus === 'SURVIVED' ? 'bg-green-500' : 
                    currentStatus === 'ELIMINATED' ? 'bg-red-600' : 'bg-slate-800 group-hover:bg-red-500'
                  }`} />

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-950/20 border border-red-900/20 flex items-center justify-center text-red-900 font-black text-sm relative">
                       {player.photoUrl ? (
                         <img src={player.photoUrl} className={`w-full h-full object-cover ${currentStatus === 'ELIMINATED' ? 'grayscale opacity-50' : ''}`} alt="" />
                       ) : (
                         `#${player.playerNumber}`
                       )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-black uppercase tracking-tighter truncate ${currentStatus === 'ELIMINATED' ? 'text-slate-500 line-through' : 'text-white'}`}>
                        {player.name || 'UNNAMED'}
                      </p>
                      <p className="text-[9px] font-bold text-red-900/60 tracking-widest mt-0.5">
                        PLAYER #{player.playerNumber}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                       {currentStatus === 'SURVIVED' && <UserCheck className="w-4 h-4 text-green-500" />}
                       {currentStatus === 'ELIMINATED' && <UserMinus className="w-4 h-4 text-red-600" />}
                       {currentStatus === 'PENDING' && <div className="w-2 h-2 rounded-full bg-slate-800" />}
                    </div>
                  </div>

                  {/* Feedback Overlay on Hover */}
                  <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/5 transition-colors pointer-events-none" />
                </div>
              )
            })}
          </div>

          {filteredPlayers.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-red-900/20 bg-black/20">
              <p className="text-slate-600 font-bold uppercase tracking-widest text-xs italic">No matching participants found for this stage.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
