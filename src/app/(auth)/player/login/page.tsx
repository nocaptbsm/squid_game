'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PlayerLogin() {
  const [playerNumber, setPlayerNumber] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const formattedNumber = playerNumber.padStart(3, '0')
      const res = await fetch('/api/player/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerNumber: formattedNumber, pin })
      })

      if (!res.ok) {
        setError('Invalid player number or PIN')
      } else {
        router.push(`/player/${formattedNumber}`)
      }
    } catch {
      setError('System error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link href="/" className="absolute top-6 left-6 text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Back to portals
      </Link>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Player Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your player credentials</p>
        </div>

        <div className="h-card p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="h-label">Player Number</label>
              <input 
                type="text" 
                value={playerNumber} 
                onChange={e => setPlayerNumber(e.target.value.replace(/\D/g, '').slice(0, 3))} 
                className="h-input" 
                required 
                placeholder="001" 
              />
            </div>
            <div>
              <label className="h-label">Access PIN</label>
              <input 
                type="password" 
                value={pin} 
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} 
                className="h-input" 
                required 
                placeholder="••••" 
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                4-digit PIN is your padded player number (e.g., player 042 uses 0042).
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="h-btn w-full mt-2 !bg-orange-500 hover:!bg-orange-600">
              {loading ? 'Authenticating...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
