'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

const AUDIO_FILES = [
  '/audio/mingle_squid_game.mp3',
  '/audio/Squid Game & Do It To It (Zedd Edit) - Zedd.mp3',
  '/audio/Squid Game - Pink Soldiers (Maddix Remix)  Techno - Maddix.mp3'
]

export function BackgroundAudio() {
  const [isMuted, setIsMuted] = useState(true) // Start muted to comply with browser policies
  const [currentIndex, setCurrentIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio(AUDIO_FILES[currentIndex])
    audioRef.current = audio
    audio.muted = isMuted
    
    const handleEnded = () => {
      setCurrentIndex((prev) => (prev + 1) % AUDIO_FILES.length)
    }

    audio.addEventListener('ended', handleEnded)

    if (!isMuted) {
      audio.play().catch(e => console.log('Autoplay blocked or failed:', e))
    }

    return () => {
      audio.removeEventListener('ended', handleEnded)
      audio.pause()
      audioRef.current = null
    }
  }, [currentIndex])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted
      if (!isMuted) {
        audioRef.current.play().catch(e => console.log('Play failed:', e))
      } else {
        audioRef.current.pause()
      }
    }
  }, [isMuted])

  return (
    <div className="fixed bottom-6 right-6 z-[1000]">
      <button
        onClick={() => setIsMuted(!isMuted)}
        className={`p-4 rounded-full shadow-2xl transition-all duration-500 border ${
          isMuted 
            ? 'bg-black/80 text-white border-red-900/50 hover:bg-black' 
            : 'bg-red-600 text-white border-white/20 animate-pulse'
        }`}
        title={isMuted ? 'Unmute Background Music' : 'Mute Background Music'}
      >
        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </button>
      {!isMuted && (
        <div className="absolute -top-12 right-0 bg-red-600 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
          Protocol Audio Active
        </div>
      )}
    </div>
  )
}
