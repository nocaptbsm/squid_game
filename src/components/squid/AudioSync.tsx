'use client'

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

export function AudioSync() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  
  const audioRefs = [
    useRef<HTMLAudioElement>(null),
    useRef<HTMLAudioElement>(null),
    useRef<HTMLAudioElement>(null)
  ]

  const songs = [
    '/audio/mingle_squid_game.mp3',
    '/audio/Squid Game & Do It To It (Zedd Edit) - Zedd.mp3',
    '/audio/Squid Game - Pink Soldiers (Maddix Remix)  Techno - Maddix.mp3'
  ]

  useEffect(() => {
    if (hasInteracted) {
      audioRefs.forEach(ref => {
        if (ref.current) {
          ref.current.play().catch(e => console.log('Audio blocked:', e))
        }
      })
      setIsPlaying(true)
    }
  }, [hasInteracted])

  const toggleAll = () => {
    if (!hasInteracted) {
      setHasInteracted(true)
      return
    }

    if (isPlaying) {
      audioRefs.forEach(ref => ref.current?.pause())
    } else {
      audioRefs.forEach(ref => ref.current?.play())
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <>
      {songs.map((src, i) => (
        <audio 
          key={src}
          ref={audioRefs[i]}
          src={src}
          loop
          preload="auto"
        />
      ))}

      {/* Floating Audio Control */}
      <button 
        onClick={toggleAll}
        className="fixed bottom-6 right-6 z-[100] w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 transition-all animate-bounce"
      >
        {isPlaying ? (
          <Volume2 className="w-6 h-6 text-white" />
        ) : (
          <VolumeX className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Initial Interaction Overlay */}
      {!hasInteracted && (
        <div 
          onClick={toggleAll}
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center cursor-pointer group"
        >
          <div className="w-24 h-24 border-4 border-red-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
             <div className="w-12 h-12 bg-red-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-[0.4em] animate-pulse text-center px-6">
            CLICK TO INITIALIZE PROTOCOL
          </h2>
          <p className="text-red-600 text-[10px] font-bold uppercase tracking-widest mt-4 opacity-50">
            AUDIO INTERFACE ACTIVATION REQUIRED
          </p>
        </div>
      )}
    </>
  )
}
