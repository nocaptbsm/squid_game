'use client'

import React, { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import { QRScanner } from '@/components/squid/QRScanner'
import { Camera, RefreshCw, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { playScanBlip, playSuccess, playError, playStatic } from '@/lib/horror-audio'

export default function VolunteerScanPage() {
  const [player, setPlayer] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [registering, setRegistering] = useState(false)
  const [registered, setRegistered] = useState(false)
  const webcamRef = useRef<Webcam>(null)

  const handleScan = async (token: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: token })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'SCAN FAILED')
      playScanBlip()
      setPlayer(data.player)
      setName(data.player.name || '')
      setPhoto(null)
    } catch (err: any) {
      playStatic(0.12, 0.25)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) setPhoto(imageSrc)
  }, [webcamRef])

  const registerPlayer = async () => {
    if (!name.trim()) { playError(); setError('NAME IS REQUIRED'); return }
    setRegistering(true)
    setError('')
    playStatic(0.08, 0.15)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: player.qrToken, name, photoBase64: photo })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'REGISTRATION FAILED')
      playSuccess()
      setPlayer(data.player)
      setRegistered(true)
    } catch (err: any) {
      playError()
      setError(err.message)
    } finally {
      setRegistering(false)
    }
  }

  const reset = () => { setPlayer(null); setError(''); setPhoto(null); setName(''); setRegistered(false) }

  return (
    <div className="max-w-sm mx-auto w-full space-y-5 pb-8">
      <div>
        <h1 className="text-xl text-[#c8bfbf]" style={{ fontFamily: 'Special Elite, cursive' }}>CHECK-IN</h1>
        <p className="text-[10px] tracking-[0.4em] text-[#d4b8b8] uppercase mt-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
          SCAN QR TO REGISTER SUBJECT
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="border border-red-900/50 bg-red-950/20 text-red-500 text-[11px] px-4 py-3 tracking-widest uppercase"
          style={{ fontFamily: 'Share Tech Mono, monospace' }}
        >
          ⚠ {error}
        </motion.div>
      )}

      {!player && !loading && (
        <QRScanner onScan={handleScan} onError={err => console.log('scan error:', err)} />
      )}

      {loading && (
        <div className="h-card p-12 flex flex-col items-center gap-4 blood-border-top">
          <div className="w-8 h-8 border border-red-800 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] tracking-[0.4em] text-red-900 uppercase animate-pulse" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            IDENTIFYING SUBJECT...
          </p>
        </div>
      )}

      <AnimatePresence>
        {player && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Player info */}
            <div className="h-card blood-border-top p-4 flex items-center gap-3">
              <div className="w-10 h-10 border border-red-900/40 overflow-hidden flex-shrink-0">
                {player.photoUrl
                  ? <img src={player.photoUrl} className="w-full h-full object-cover" alt="" />
                  : <div className="w-full h-full bg-red-950/20" />
                }
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#c8bfbf] truncate" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                  {player.name || 'UNKNOWN SUBJECT'}
                </p>
                <p className="text-[10px] text-[#d4b8b8]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                  #{player.playerNumber}
                </p>
              </div>
            </div>

            {player.isRegistered ? (
              /* Already registered */
              <div className="h-card blood-border-top p-6 text-center space-y-4">
                {registered && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                    className="w-12 h-12 flex items-center justify-center border border-green-900/50 mx-auto"
                    style={{ background: 'rgba(20,60,20,0.3)' }}
                  >
                    <Check className="w-6 h-6 text-green-600" />
                  </motion.div>
                )}
                <p className="text-[11px] tracking-[0.3em] text-green-600 uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                  {registered ? '✓ REGISTRATION COMPLETE' : '✓ SUBJECT VERIFIED'}
                </p>
                <p className="text-[10px] text-[#d4b8b8]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                  SUBJECT IS ACTIVE IN THE GAME.
                </p>
                <button onClick={reset} className="h-btn-ghost w-full flex items-center justify-center gap-2 text-[11px]">
                  <RefreshCw className="w-3 h-3" /> SCAN NEXT
                </button>
              </div>
            ) : (
              /* Registration form */
              <div className="h-card blood-border-top p-5 space-y-4">
                <p className="text-[11px] tracking-[0.3em] text-[#c87070] uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                  ▸ ENROLL SUBJECT
                </p>

                <div>
                  <label className="h-label">FULL NAME</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="h-input" placeholder="ENTER NAME" />
                </div>

                <div>
                  <label className="h-label">PHOTO IDENTIFICATION</label>
                  {photo ? (
                    <div className="relative border border-green-900/40 overflow-hidden aspect-square">
                      <img src={photo} alt="Captured" className="w-full h-full object-cover grayscale-[30%]" />
                      <button
                        onClick={() => setPhoto(null)}
                        className="absolute bottom-3 right-3 bg-black/80 text-[#c8bfbf] p-2 border border-red-900/30 hover:border-red-900 transition-all"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border border-red-900/30 bg-black overflow-hidden aspect-square relative">
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: 'user', aspectRatio: 1 }}
                        className="w-full h-full object-cover grayscale-[20%]"
                      />
                      {/* Scan overlay */}
                      <div className="absolute inset-0 pointer-events-none border border-red-900/20">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-800" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-800" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-800" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-800" />
                      </div>
                      <button onClick={capture} className="absolute bottom-4 left-1/2 -translate-x-1/2 h-btn flex items-center gap-2 text-xs">
                        <Camera className="w-4 h-4" /> CAPTURE
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button onClick={reset} disabled={registering} className="h-btn-ghost text-[11px]">CANCEL</button>
                  <button
                    onClick={registerPlayer}
                    disabled={registering || !photo || !name}
                    className="h-btn flex items-center justify-center gap-2 text-[11px]"
                  >
                    {registering ? (
                      <>
                        <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                        ENROLLING...
                      </>
                    ) : 'ENROLL →'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
