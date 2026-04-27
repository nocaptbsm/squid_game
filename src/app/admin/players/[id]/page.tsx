'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Webcam from 'react-webcam'
import { ArrowLeft, Trash2, Save, Camera, RefreshCw } from 'lucide-react'
import { ROUND_ORDER, ROUND_LABELS } from '@/lib/constants'

export default function EditPlayerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [player, setPlayer] = useState<any>(null)
  const [name, setName] = useState('')
  const [rounds, setRounds] = useState<any[]>([])
  const [isRegistered, setIsRegistered] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  
  const webcamRef = React.useRef<Webcam>(null)

  useEffect(() => {
    fetch(`/api/players/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setPlayer(data)
        setName(data.name || '')
        setRounds(data.rounds || [])
        setIsRegistered(data.isRegistered)
        setLoading(false)
      })
  }, [params.id])

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) setPhoto(imageSrc)
  }, [webcamRef])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/players/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          isRegistered,
          photoBase64: photo,
          roundOverrides: rounds 
        })
      })
      if (res.ok) {
        setMessage({ type: 'success', text: 'Record updated successfully.' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: 'Failed to update record.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'System error.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this participant?')) return
    try {
      const res = await fetch(`/api/players/${params.id}`, { method: 'DELETE' })
      if (res.ok) router.push('/admin/players')
    } catch {
      setMessage({ type: 'error', text: 'Delete failed.' })
    }
  }

  const handleRoundChange = (roundName: string, status: string) => {
    setRounds(prev => prev.map(r => r.round === roundName ? { ...r, status } : r))
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading player data...</span>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/players" className="p-2 border border-border rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Player</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ID: {player.playerNumber}
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border text-sm font-medium ${message.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="h-card p-6 space-y-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-24 h-24 rounded-full border border-border overflow-hidden flex-shrink-0 bg-surface-2">
            {player.photoUrl
              ? <img src={player.photoUrl} className="w-full h-full object-cover" alt="" />
              : <div className="w-full h-full flex items-center justify-center text-sm font-medium text-muted-foreground">No Photo</div>
            }
          </div>
          <div className="flex-1 space-y-5 w-full">
            <div>
              <label className="h-label">Display Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="h-input max-w-sm" placeholder="Participant Name" />
            </div>
            
            <div>
              <label className="h-label mb-2">Registration Status</label>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsRegistered(!isRegistered)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isRegistered 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {isRegistered ? 'REGISTERED' : 'PENDING'}
                </button>
                <span className="text-xs text-muted-foreground">Click to toggle</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="h-label">Capture / Update Photo</label>
              {photo ? (
                <div className="relative w-48 aspect-square rounded-xl overflow-hidden border border-border shadow-sm">
                  <img src={photo} alt="New" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPhoto(null)}
                    className="absolute bottom-2 right-2 p-2 bg-white/90 text-foreground rounded-full shadow-md hover:bg-white transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative w-48 aspect-square rounded-xl overflow-hidden border border-border bg-surface-2 group">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: facingMode, aspectRatio: 1 }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
                      className="h-btn-small bg-white/90 text-foreground shadow-md hover:bg-white"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" /> Flip
                    </button>
                    <button 
                      onClick={capture}
                      className="h-btn-small shadow-lg"
                    >
                      <Camera className="w-3.5 h-3.5 mr-1.5" /> Capture
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Round Progress Override</h3>
          <div className="space-y-3">
            {ROUND_ORDER.map(roundName => {
              const r = rounds.find(r => r.round === roundName)
              if (!r) return null
              return (
                <div key={roundName} className="flex items-center justify-between py-3 px-4 rounded-lg border border-border bg-surface-2">
                  <span className="text-sm font-medium text-foreground">
                    {ROUND_LABELS[roundName as keyof typeof ROUND_LABELS]}
                  </span>
                  <select
                    value={r.status}
                    onChange={e => handleRoundChange(roundName, e.target.value)}
                    className="text-sm border border-border bg-surface text-foreground rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="SURVIVED">Survived</option>
                    <option value="ELIMINATED">Eliminated</option>
                  </select>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <button onClick={handleDelete} className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 px-3 py-2 rounded-md hover:bg-red-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Reset Player Data
        </button>
        <button onClick={handleSave} disabled={saving} className="h-btn flex items-center gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
