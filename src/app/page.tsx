'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { playHeartbeat, playIntroDrone, playStatic, playFlatline, startHeartbeatLoop } from '@/lib/horror-audio'

const NUMBERS = ['001', '047', '067', '101', '212', '333', '456']

function BloodDrip({ left, delay }: { left: string; delay: number }) {
  return (
    <div
      className="absolute top-0 w-[2px] bg-gradient-to-b from-red-700 to-red-500"
      style={{
        left,
        height: `${20 + Math.random() * 60}px`,
        animation: `drip 3s ${delay}s ease-in-out infinite`,
        opacity: 0.85,
      }}
    />
  )
}

function EKGLine() {
  return (
    <svg viewBox="0 0 400 60" className="w-full h-12 opacity-60" fill="none">
      <polyline
        points="0,30 40,30 55,30 65,5 75,55 85,10 95,30 140,30 160,30 175,30 185,8 195,52 205,12 215,30 260,30 280,30 295,30 305,6 315,54 325,8 335,30 400,30"
        stroke="#ff2020"
        strokeWidth="2"
        strokeDasharray="1000"
        strokeDashoffset="1000"
        style={{ animation: 'ekg 3s ease-in-out infinite' }}
      />
    </svg>
  )
}

const portals = [
  { href: '/admin/login', symbol: '◯', label: 'STAFF PORTAL', sub: 'Admin Access', color: '#cc0000', delay: 0 },
  { href: '/volunteer/login', symbol: '△', label: 'EVENT CREW', sub: 'Volunteer', color: '#8b6914', delay: 0.15 },
  { href: '/player/login', symbol: '□', label: 'PARTICIPANTS', sub: 'Enter if you dare', color: '#2d7d2d', delay: 0.3 },
]

export default function LandingPage() {
  const [introComplete, setIntroComplete] = useState(false)
  const [showFlash, setShowFlash] = useState(false)
  const [floatingNum, setFloatingNum] = useState(0)
  const [audioUnlocked, setAudioUnlocked] = useState(false)
  const [introStep, setIntroStep] = useState(0) // 0=shapes, 1=ekg, 2=flatline, 3=done

  // Unlock audio on first interaction
  const unlockAudio = () => {
    if (!audioUnlocked) {
      setAudioUnlocked(true)
    }
  }

  // Intro sequence with sound sync
  useEffect(() => {
    if (!audioUnlocked) return

    // Step 0 → 0.4s: drone starts, shapes appear
    playIntroDrone()

    // Step 1 → 0.8s: EKG line appears
    const t1 = setTimeout(() => setIntroStep(1), 800)

    // Step 2 → 1.8s: heartbeat starts
    const t2 = setTimeout(() => {
      setIntroStep(2)
      playHeartbeat()
    }, 1800)

    // Step 3 → 2.2s: second beat
    const t3 = setTimeout(() => {
      playHeartbeat()
    }, 2200)

    // Step 4 → 2.6s: flatline + transition
    const t4 = setTimeout(() => {
      setIntroStep(3)
      playFlatline()
    }, 2600)

    // Step 5 → 3.2s: reveal main page
    const t5 = setTimeout(() => {
      playStatic(0.2, 0.4)
      setIntroComplete(true)
    }, 3200)

    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout)
  }, [audioUnlocked])

  // Random red flashes with static
  useEffect(() => {
    if (!introComplete) return
    const schedule = () => {
      const delay = 8000 + Math.random() * 14000
      return setTimeout(() => {
        setShowFlash(true)
        playStatic(0.15, 0.25)
        setTimeout(() => setShowFlash(false), 200)
        schedule()
      }, delay)
    }
    const id = schedule()
    return () => clearTimeout(id)
  }, [introComplete])

  // Floating number cycling
  useEffect(() => {
    const id = setInterval(() => setFloatingNum(n => (n + 1) % NUMBERS.length), 2500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-screen bg-[#3a1c1e] flex flex-col overflow-hidden relative" onClick={unlockAudio}>

      {/* First-interaction prompt */}
      {!audioUnlocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[9999] bg-black/90 flex flex-col items-center justify-center cursor-pointer"
          onClick={unlockAudio}
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-center"
          >
            <div className="text-6xl mb-6 text-red-600/80 heartbeat" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
              ◯ △ □
            </div>
            <p className="text-[11px] tracking-[0.5em] text-red-500/90 uppercase mb-2" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
              TAP TO ENTER
            </p>
            <p className="text-[9px] tracking-[0.3em] text-[#d4b8b8] uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
              — BEST EXPERIENCED WITH SOUND —
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Red flash */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9990] pointer-events-none bg-red-900/20"
          />
        )}
      </AnimatePresence>

      {/* Blood drips */}
      <div className="absolute top-0 left-0 right-0 h-0 overflow-visible pointer-events-none z-20">
        {['8%','18%','31%','44%','55%','67%','78%','89%'].map((left, i) => (
          <BloodDrip key={i} left={left} delay={i * 0.7} />
        ))}
      </div>

      {/* Intro screen */}
      <AnimatePresence>
        {audioUnlocked && !introComplete && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="fixed inset-0 z-[9995] bg-[#200a0b] flex flex-col items-center justify-center"
          >
            <div className="text-center max-w-xs">
              <div className="flex gap-8 items-center justify-center mb-8">
                {['◯', '△', '□'].map((sym, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -30, scale: 0.5 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.25, type: 'spring', stiffness: 200 }}
                    className="text-5xl text-red-600 flicker"
                    style={{ textShadow: '0 0 25px rgba(255,30,30,0.9)' }}
                  >
                    {sym}
                  </motion.div>
                ))}
              </div>

              <AnimatePresence>
                {introStep >= 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <EKGLine />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {introStep >= 2 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0, 1] }}
                    transition={{ duration: 0.6 }}
                    className="text-red-500/80 text-[10px] tracking-[0.4em] uppercase mt-2"
                    style={{ fontFamily: 'Share Tech Mono, monospace' }}
                  >
                    SUBJECT LOCATED...
                  </motion.p>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {introStep >= 3 && (
                  <motion.p
                    initial={{ opacity: 0, scale: 1.2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-red-500 text-sm tracking-[0.3em] uppercase mt-4"
                    style={{ fontFamily: 'Special Elite, cursive' }}
                  >
                    GOOD LUCK.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <AnimatePresence>
        {introComplete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="flex flex-col min-h-screen">
            <header className="h-14 border-b border-red-900/30 bg-[#441f21]/80 backdrop-blur flex items-center justify-between px-6 lg:px-12 relative z-10">
              <div className="flex items-center gap-3">
                <span className="text-red-800 text-xl" style={{ fontFamily: 'Special Elite, cursive' }}>PARADOX</span>
                <span className="text-[#a88080] text-[10px] tracking-[0.4em] uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>2025</span>
              </div>
              <Link href="/player/login" className="text-[10px] tracking-[0.3em] text-[#c87070] hover:text-red-500 uppercase transition-colors flicker" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                ENTER →
              </Link>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative">
              <div className="absolute top-8 right-8 opacity-10 pointer-events-none">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={floatingNum}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-6xl font-bold text-red-900"
                    style={{ fontFamily: 'Share Tech Mono, monospace' }}
                  >
                    {NUMBERS[floatingNum]}
                  </motion.span>
                </AnimatePresence>
              </div>

              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
                <div className="text-[10px] tracking-[0.5em] text-red-700/80 mb-6 uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>── PARADOX 2025 ──</div>
                <h1 className="text-6xl sm:text-7xl md:text-8xl mb-3 glitch flicker" data-text="SQUID GAME"
                  style={{ fontFamily: 'Special Elite, cursive', color: '#faf0f0', textShadow: '0 0 40px rgba(255,30,30,0.5), 2px 2px 0 #a00000', letterSpacing: '0.05em' }}
                >
                  SQUID GAME
                </h1>
                <p className="text-[#faf0f0] text-xs tracking-[0.4em] uppercase mt-4" style={{ fontFamily: 'Share Tech Mono, monospace' }}>456 entered. only 3 will survive.</p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
                {portals.map((p) => (
                  <motion.div key={p.href} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: p.delay + 0.2, duration: 0.6 }}>
                    <Link href={p.href} onClick={() => playStatic(0.08, 0.2)}>
                      <div className="h-card blood-border-top p-6 h-[160px] flex flex-col items-center justify-center text-center cursor-pointer group hover:border-red-900/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(100,0,0,0.3)]">
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300" style={{ color: p.color, textShadow: `0 0 15px ${p.color}`, fontFamily: 'Share Tech Mono, monospace' }}>
                          {p.symbol}
                        </div>
                        <div className="text-xs tracking-[0.3em] text-[#c8bfbf] group-hover:text-white transition-colors" style={{ fontFamily: 'Special Elite, cursive' }}>{p.label}</div>
                        <div className="text-[10px] tracking-widest text-[#d4b8b8] mt-1 uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>{p.sub}</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </main>

            <footer className="border-t border-red-900/20 bg-[#441f21]/60 py-6">
              <div className="max-w-2xl mx-auto flex justify-center gap-16">
                {[['350+', 'PLAYERS'], ['7', 'ROUNDS'], ['3', 'WINNERS']].map(([v, l]) => (
                  <div key={l} className="text-center">
                    <div className="text-2xl font-bold text-red-800/80 flicker" style={{ fontFamily: 'Special Elite, cursive' }}>{v}</div>
                    <div className="text-[9px] tracking-[0.4em] text-[#a88080] uppercase mt-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>{l}</div>
                  </div>
                ))}
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
