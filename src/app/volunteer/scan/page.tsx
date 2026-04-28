'use client'

import React, { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import { QRScanner } from '@/components/squid/QRScanner'
import { Camera, RefreshCw, Check } from 'lucide-react'

export default function VolunteerScanPage() {
  const [player, setPlayer] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [registering, setRegistering] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [qrToken, setQrToken] = useState<string | null>(null)
  const [rollNoInput, setRollNoInput] = useState('')
  const [needsRollNo, setNeedsRollNo] = useState(false)
  const webcamRef = useRef<Webcam>(null)

  const playBeep = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime)
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05)
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2)
      oscillator.start()
      oscillator.stop(audioCtx.currentTime + 0.2)
    } catch (e) { console.error(e) }
  }, [])

  const handleScan = async (rawValue: string) => {
    setLoading(true)
    setError('')
    try {
      let token = rawValue
      try {
        const url = new URL(rawValue)
        const parts = url.pathname.split('/')
        token = parts[parts.length - 1]
      } catch {
        // Not a URL, use raw value
      }

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: token })
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Scan failed')

      playBeep()

      if (data.isUnassigned) {
        setQrToken(data.qrToken)
        setNeedsRollNo(true)
      } else {
        setPlayer(data.player)
        setName(data.player.name || '')
        setPhoto(null)
        // If already registered, auto-reset after 1.5s
        if (data.player.isRegistered) {
          setTimeout(reset, 1500)
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const verifyRollNo = async () => {
    if (!rollNoInput.trim()) { setError('Roll Number is required'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/verify-roll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNo: rollNoInput })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed')
      
      setPlayer(data.player)
      setName(data.player.name || '')
      setNeedsRollNo(false)
    } catch (err: any) {
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
    if (!name.trim()) { setError('Name is required'); return }
    setRegistering(true)
    setError('')
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: player.id, name, photoBase64: photo, qrToken })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      playBeep()
      setPlayer(data.player)
      setRegistered(true)
      setTimeout(reset, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setRegistering(false)
    }
  }

  const reset = () => { 
    setPlayer(null); setError(''); setPhoto(null); setName(''); 
    setRegistered(false); setQrToken(null); setNeedsRollNo(false); setRollNoInput('');
  }

  return (
    <div className="max-w-sm mx-auto w-full space-y-8 pb-12">
      <div className="text-center pt-8">
        <h1 className="text-4xl font-black tracking-tighter text-white uppercase horror-glitch" data-text="REGISTRATION">REGISTRATION</h1>
        <p className="text-[9px] text-red-900 font-bold uppercase tracking-[0.4em] mt-2">Active Surveillance Link // Guard ID: {typeof window !== 'undefined' ? Math.floor(Math.random() * 9999).toString().padStart(4, '0') : '0000'}</p>
      </div>

      {error && (
        <div className="p-4 rounded-none bg-red-950/20 border border-red-600/50 text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
          ⚠️ System Error: {error}
        </div>
      )}

      {!player && !loading && !needsRollNo && (
        <div className="relative">
          <div className="absolute -inset-4 border border-red-900/10 pointer-events-none" />
          <QRScanner onScan={handleScan} onError={err => console.log('scan error:', err)} />
        </div>
      )}

      {needsRollNo && !loading && (
        <div className="h-card p-6 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center mb-4">
            <div className="w-16 h-16 flex items-center justify-center rounded-none border border-red-600/50 bg-red-950/20 mx-auto mb-6 horror-pulse">
              <Camera className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-lg font-black uppercase tracking-[0.2em] text-white">Identity Missing</p>
            <p className="text-[9px] text-red-900 font-bold uppercase tracking-widest mt-2">Map unassigned token to database record</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="h-label">Protocol Roll Number</label>
              <input 
                type="text" 
                value={rollNoInput} 
                onChange={e => setRollNoInput(e.target.value)} 
                className="h-input text-center text-xl tracking-[0.3em]" 
                placeholder="000" 
                onKeyDown={e => e.key === 'Enter' && verifyRollNo()}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 pt-4">
              <button onClick={verifyRollNo} className="h-btn w-full">Initiate Mapping</button>
              <button onClick={reset} className="text-[10px] text-red-950 font-black uppercase tracking-widest hover:text-red-600 transition-colors">Abort Link</button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="h-card p-16 flex flex-col items-center justify-center gap-6">
          <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-none animate-spin" />
          <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em]">Deciphering Link...</p>
        </div>
      )}

      {player && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Identity Header */}
          <div className="h-card p-6 flex items-center gap-6 border-l-4 border-l-red-600">
            <div className="w-16 h-16 rounded-none overflow-hidden bg-red-950/20 border border-red-900/30 flex-shrink-0">
              {player.photoUrl
                ? <img src={player.photoUrl} className="w-full h-full object-cover grayscale brightness-125" alt="" />
                : <div className="w-full h-full flex items-center justify-center text-red-600 font-black text-2xl">
                    {player.playerNumber.substring(0, 2)}
                  </div>
              }
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black text-red-900 uppercase tracking-widest mb-1">Subject Identified</p>
              <p className="text-xl font-black text-white truncate uppercase tracking-tighter">
                {player.name || 'ANONYMOUS'}
              </p>
              <p className="text-[10px] font-mono text-red-600/60 mt-1">
                ID: #{player.playerNumber.padStart(4, '0')}
              </p>
            </div>
          </div>

          {player.isRegistered ? (
            /* Locked identity */
            <div className="h-card p-10 text-center space-y-8 bg-red-950/10">
              <div className="w-20 h-20 flex items-center justify-center rounded-none border-2 border-red-600 mx-auto horror-pulse">
                <Check className="w-10 h-10 text-red-600" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-black text-white uppercase tracking-widest">
                  {registered ? 'LINK SECURED' : 'IDENTITY VERIFIED'}
                </p>
                <p className="text-[9px] text-red-900 font-bold uppercase tracking-[0.2em]">
                  Subject is now active in the protocol
                </p>
              </div>
              <div className="pt-4">
                <button onClick={reset} className="h-btn w-full !bg-transparent border border-red-600/50 hover:!bg-red-600">
                  Ready Next Subject
                </button>
              </div>
            </div>
          ) : (
            /* Capture screen */
            <div className="h-card p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-red-900/20 pb-4">
                <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">New Link Initialization</p>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-red-600" />
                  <div className="w-1.5 h-1.5 bg-red-900" />
                </div>
              </div>

              <div>
                <label className="h-label">Confirm Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="h-input" placeholder="Enter identity name" />
              </div>

              <div className="relative">
                <label className="h-label">Subject Capture</label>
                {photo ? (
                  <div className="relative rounded-none overflow-hidden aspect-square border border-red-600">
                    <img src={photo} alt="Captured" className="w-full h-full object-cover grayscale contrast-125" />
                    <button
                      onClick={() => setPhoto(null)}
                      className="absolute bottom-4 right-4 bg-red-600 text-white p-3 rounded-none shadow-2xl hover:bg-red-500 transition-colors"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="border border-red-900/30 rounded-none overflow-hidden aspect-square relative bg-black">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: facingMode, aspectRatio: 1 }}
                      className="w-full h-full object-cover grayscale opacity-80"
                    />
                    {/* Camera scanline overlay */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />
                    
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-6">
                      <button 
                        onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
                        className="p-3 bg-black/60 border border-red-600/30 text-white hover:bg-red-600 transition-all"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                      <button onClick={capture} className="h-btn !py-0 px-8 h-12 flex items-center justify-center">
                        <Camera className="w-5 h-5 mr-3" /> CAPTURE IDENTITY
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 pt-6">
                <button
                  onClick={registerPlayer}
                  disabled={registering || !photo || !name}
                  className="h-btn !py-4"
                >
                  {registering ? 'LOCKING IDENTITY...' : 'LOCK & FINALIZE LINK'}
                </button>
                <button onClick={reset} disabled={registering} className="text-[10px] text-red-950 font-black uppercase tracking-widest hover:text-red-600 transition-colors">Abort Registration</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
