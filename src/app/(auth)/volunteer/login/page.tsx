'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function VolunteerLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await signIn('credentials', { redirect: false, email, password })
      if (res?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/volunteer')
      }
    } catch {
      setError('System error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#051919] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/5 rounded-full blur-[100px] pointer-events-none" />

      <Link href="/" className="absolute top-6 left-6 text-[10px] font-black uppercase tracking-[0.3em] text-red-900 hover:text-red-500 transition-colors z-20">
        ← Abort Sequence
      </Link>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 border-2 border-red-500 shadow-[0_0_20px_rgba(227,27,109,0.2)] rounded-none flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-black uppercase tracking-[0.4em] text-white">Crew Protocol</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-red-900 font-bold mt-2">Field Operator Deployment</p>
        </div>

        <div className="bg-[#0a2424] border border-red-900/30 p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="h-label">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-input" required placeholder="vol@paradox.com" />
            </div>
            <div>
              <label className="h-label">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-input" required placeholder="••••••••" />
            </div>

            {error && (
              <div className="p-3 rounded-none bg-red-950/30 border border-red-500/50 text-red-500 text-[10px] font-bold uppercase tracking-wider">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="h-btn w-full mt-4 !bg-red-600 hover:!bg-red-700 !rounded-none !py-4 font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(220,38,38,0.2)]">
              {loading ? 'Deploying...' : 'Initiate Deployment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
