'use client'

import React, { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { startHeartbeatLoop, playError, playSuccess, playStatic } from '@/lib/horror-audio'

export default function VolunteerLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [shake, setShake] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setTimeout(() => setMounted(true), 100)
    const stop = startHeartbeatLoop(65)
    const stopTimer = setTimeout(stop, 2500)
    return () => { stop(); clearTimeout(stopTimer) }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    playStatic(0.1, 0.3)
    try {
      const res = await signIn('credentials', { redirect: false, email, password })
      if (res?.error) {
        playError()
        setShake(true)
        setTimeout(() => setShake(false), 500)
        setError('ACCESS DENIED. IDENTITY UNVERIFIED.')
      } else {
        playSuccess()
        router.push('/volunteer/scan')
      }
    } catch {
      playError()
      setError('SYSTEM ERROR. TRY AGAIN.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#3a1c1e] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-900/6 rounded-full blur-3xl" />
      </div>

      <Link href="/" className="absolute top-4 left-4 text-[10px] tracking-[0.3em] text-[#d4b8b8] hover:text-red-700 uppercase transition-colors" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
        ← BACK
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.06, 1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
            className="text-6xl mb-4 inline-block"
            style={{ color: '#8b6914', textShadow: '0 0 25px rgba(139,105,20,0.6)', fontFamily: 'Share Tech Mono, monospace' }}
          >
            △
          </motion.div>
          <h1 className="text-2xl text-[#c8bfbf] tracking-[0.2em]" style={{ fontFamily: 'Special Elite, cursive' }}>EVENT CREW</h1>
          <p className="text-[10px] tracking-[0.4em] text-[#d4b8b8] uppercase mt-2" style={{ fontFamily: 'Share Tech Mono, monospace' }}>VOLUNTEER ACCESS</p>
        </div>

        <motion.div
          animate={shake ? { x: [-6, 6, -6, 6, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="h-card blood-border-top p-8"
        >
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="h-label">EMAIL ADDRESS</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-input" required placeholder="vol@paradox.com" />
            </div>
            <div>
              <label className="h-label">PASSPHRASE</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-input" required placeholder="••••••••" />
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="border border-red-900/50 bg-red-950/30 text-red-500 text-[11px] px-4 py-3 tracking-widest uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                ⚠ {error}
              </motion.div>
            )}

            <button type="submit" disabled={loading} className="h-btn w-full mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="inline-block w-3 h-3 border border-red-500 border-t-transparent rounded-full animate-spin" />
                  VERIFYING...
                </span>
              ) : 'AUTHENTICATE →'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
}
