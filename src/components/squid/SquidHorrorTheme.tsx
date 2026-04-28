'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

export function SquidHorrorTheme() {
  const [isMuted, setIsMuted] = useState(true)
  const ambientRef = useRef<HTMLAudioElement | null>(null)
  const clickRef = useRef<HTMLAudioElement | null>(null)
  const whisperRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize Audio objects once
    const ambient = new Audio('/audio/mingle_squid_game.mp3')
    ambient.loop = true
    ambient.volume = 0.25
    ambientRef.current = ambient

    const click = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3')
    click.volume = 0.1
    clickRef.current = click

    const whisper = new Audio('https://assets.mixkit.co/active_storage/sfx/2544/2544-preview.mp3')
    whisper.volume = 0.05
    whisperRef.current = whisper

    // Global hover sound listener
    const handleHover = (e: MouseEvent) => {
      // Check if we are NOT muted before playing click
      // We'll use a local check or just rely on the toggleMute state
      // Actually, easier to check a ref or just use the current state if possible
      // But since this effect runs once, we'll use a window variable or a ref for muted status
    }

    const whisperInterval = setInterval(() => {
      // Logic for random whisper
    }, 15000)

    return () => {
      ambient.pause()
      clearInterval(whisperInterval)
    }
  }, [])

  // Separate effect for muted status to handle global listeners and ambient play/pause
  useEffect(() => {
    const handleHover = (e: MouseEvent) => {
      if (!isMuted && (e.target as HTMLElement).closest('a, button')) {
        clickRef.current?.play().catch(() => {})
      }
    }

    document.addEventListener('mouseover', handleHover)
    
    const whisperInterval = setInterval(() => {
      if (!isMuted && Math.random() > 0.9) {
        whisperRef.current?.play().catch(() => {})
      }
    }, 12000)

    if (!isMuted) {
      ambientRef.current?.play().catch(() => {})
    } else {
      ambientRef.current?.pause()
    }

    return () => {
      document.removeEventListener('mouseover', handleHover)
      clearInterval(whisperInterval)
    }
  }, [isMuted])

  useEffect(() => {
    const handleSync = (e: any) => setIsMuted(e.detail.isMuted)
    window.addEventListener('paradox-audio-toggle' as any, handleSync)
    return () => window.removeEventListener('paradox-audio-toggle' as any, handleSync)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* Vignette effect */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] z-50" />
      
      {/* Background Pattern - Repeating Guards */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23E31B6D' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M30 10c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20zm0 36c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16z'/%3E%3Cpath d='M10 10h10v10H10zM40 40h10v10H40z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px'
        }} 
      />

      {/* Scanlines */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_3px,3px_100%]" />

      {/* Noise Grain */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-40"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* Flickering light effect */}
      <div className="absolute inset-0 animate-flicker pointer-events-none opacity-0 bg-white/5 mix-blend-overlay z-50" />

      {/* Corner Peeking Guards (SVG) */}
      <div className="absolute -left-10 bottom-0 w-48 h-64 opacity-20 pointer-events-none animate-breathe">
        <svg viewBox="0 0 100 120" className="w-full h-full fill-red-900/50 blur-[1px]">
          <path d="M50 10 L80 90 L20 90 Z" /> {/* Triangle mask silhouette */}
          <rect x="35" y="100" width="30" height="20" rx="2" />
        </svg>
      </div>

      {/* Doll Eyes (Occasional glow) */}
      <div className="absolute top-[15%] right-[10%] w-2 h-2 rounded-full bg-red-600 blur-[2px] opacity-0 animate-eye-glow z-40" />
      <div className="absolute top-[15%] right-[12%] w-2 h-2 rounded-full bg-red-600 blur-[2px] opacity-0 animate-eye-glow z-40" />


      <style jsx global>{`
        @keyframes flicker {
          0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% { opacity: 0; }
          20%, 21.999%, 63%, 63.999%, 65%, 69.999% { opacity: 1; }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1) translateY(0); opacity: 0.15; }
          50% { transform: scale(1.02) translateY(-5px); opacity: 0.25; }
        }
        @keyframes eye-glow {
          0%, 90%, 100% { opacity: 0; }
          92%, 98% { opacity: 0.8; box-shadow: 0 0 10px #ff0000; }
        }
        @keyframes glitch {
          0% { clip-path: inset(20% 0 50% 0); transform: translate(-5px); }
          20% { clip-path: inset(80% 0 10% 0); transform: translate(5px); }
          40% { clip-path: inset(10% 0 60% 0); transform: translate(-5px); }
          60% { clip-path: inset(40% 0 20% 0); transform: translate(5px); }
          80% { clip-path: inset(70% 0 30% 0); transform: translate(-5px); }
          100% { clip-path: inset(20% 0 50% 0); transform: translate(0); }
        }
        .glitch-text:hover {
          position: relative;
          color: #fff;
        }
        .glitch-text:hover::before {
          content: attr(data-text);
          position: absolute;
          left: -2px;
          text-shadow: 2px 0 #E31B6D;
          top: 0;
          background: #051919;
          overflow: hidden;
          animation: glitch 0.3s infinite linear alternate-reverse;
        }
        body {
          background-color: #051919 !important;
          color: #f1f1f1 !important;
        }
        /* Custom scrollbar for horror theme */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #051919; }
        ::-webkit-scrollbar-thumb { background: #E31B6D; border-radius: 0px; }
      `}</style>
    </div>
  )
}
