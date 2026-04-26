'use client'

import React, { useEffect, useState } from 'react'
import { Users, UserCheck, Activity } from 'lucide-react'
import { motion } from 'framer-motion'

function StatCard({ label, value, icon: Icon, color, delay }: any) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    if (!value) return
    // Count-up with horror scramble effect
    let start = 0
    const end = parseInt(value)
    const duration = 1200
    const step = Math.max(1, Math.floor(end / 30))
    const interval = setInterval(() => {
      start += step
      if (start >= end) { setDisplayed(end); clearInterval(interval) }
      else setDisplayed(start)
    }, duration / 30)
    return () => clearInterval(interval)
  }, [value])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="h-card p-5 blood-border-top relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.03] pointer-events-none" style={{ color }}>
        <Icon style={{ width: '100%', height: '100%' }} />
      </div>
      <p className="text-[10px] tracking-[0.3em] text-[#d4b8b8] uppercase mb-3" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
        {label}
      </p>
      <p className="text-4xl font-bold flicker" style={{ color, fontFamily: 'Special Elite, cursive', textShadow: `0 0 15px ${color}40` }}>
        {displayed}
      </p>
    </motion.div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/players?limit=1000')
      .then(res => res.json())
      .then(data => {
        const players = data.players || []
        const registered = players.filter((p: any) => p.isRegistered).length
        const eliminated = players.filter((p: any) => p.rounds?.some((r: any) => r.status === 'ELIMINATED')).length
        const surviving = registered - eliminated
        setStats({ total: players.length, registered, eliminated, surviving })
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border border-red-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[10px] tracking-[0.4em] text-red-900 uppercase animate-pulse" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            LOADING DATA...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl text-[#c8bfbf] flicker" style={{ fontFamily: 'Special Elite, cursive' }}>
          COMMAND CENTER
        </h1>
        <p className="text-[10px] tracking-[0.4em] text-[#d4b8b8] uppercase mt-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
          LIVE EVENT STATISTICS
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="TOTAL SEEDED" value={stats.total} icon={Users} color="#6b5555" delay={0.1} />
        <StatCard label="REGISTERED" value={stats.registered} icon={UserCheck} color="#8b6914" delay={0.2} />
        <StatCard label="SURVIVING" value={stats.surviving} icon={Activity} color="#2d7d2d" delay={0.3} />
        <StatCard label="ELIMINATED" value={stats.eliminated} icon={Users} color="#cc0000" delay={0.4} />
      </div>

      {stats.registered > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="h-card p-6 blood-border-top">
          <p className="text-[10px] tracking-[0.4em] text-[#d4b8b8] uppercase mb-5" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            ▸ SURVIVAL METRICS
          </p>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-[10px] tracking-widest text-[#d4b8b8] uppercase mb-2" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                <span>REGISTRATION</span>
                <span>{Math.round((stats.registered / stats.total) * 100)}%</span>
              </div>
              <div className="h-1 bg-red-950/40 rounded-none overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.registered / stats.total) * 100}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="h-full bg-red-800"
                  style={{ boxShadow: '0 0 8px rgba(139,0,0,0.6)' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] tracking-widest text-[#d4b8b8] uppercase mb-2" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                <span>SURVIVAL RATE</span>
                <span>{stats.registered > 0 ? Math.round((stats.surviving / stats.registered) * 100) : 0}%</span>
              </div>
              <div className="h-1 bg-red-950/40 rounded-none overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.registered > 0 ? (stats.surviving / stats.registered) * 100 : 0}%` }}
                  transition={{ duration: 1, delay: 0.9 }}
                  className="h-full"
                  style={{ background: '#2d7d2d', boxShadow: '0 0 8px rgba(45,125,45,0.5)' }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
