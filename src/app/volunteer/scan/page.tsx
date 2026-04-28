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
    <div className="max-w-sm mx-auto w-full space-y-5 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Check-in</h1>
        <p className="text-sm text-muted-foreground mt-1">Scan player QR code</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
          {error}
        </div>
      )}

      {!player && !loading && !needsRollNo && (
        <QRScanner onScan={handleScan} onError={err => console.log('scan error:', err)} />
      )}

      {needsRollNo && !loading && (
        <div className="h-card p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-6">
            <div className="w-12 h-12 flex items-center justify-center rounded-none border-2 border-red-500 bg-red-950/20 mx-auto mb-4">
              <Camera className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-base font-black uppercase tracking-widest text-white">Unassigned QR Scanned</p>
            <p className="text-xs text-red-900/80 font-bold uppercase tracking-wider mt-1">Please map this QR to a seeded student</p>
          </div>
          
          <div>
            <label className="h-label">Student Roll Number</label>
            <input 
              type="text" 
              value={rollNoInput} 
              onChange={e => setRollNoInput(e.target.value)} 
              className="h-input" 
              placeholder="e.g. 042" 
              onKeyDown={e => e.key === 'Enter' && verifyRollNo()}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button onClick={reset} className="h-btn-ghost">Cancel</button>
            <button onClick={verifyRollNo} className="h-btn !bg-red-600">Verify Roll No</button>
          </div>
        </div>
      )}

      {loading && (
        <div className="h-card p-12 flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-foreground">Identifying Player...</p>
        </div>
      )}

      {player && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Player info */}
          <div className="h-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-2 flex-shrink-0">
              {player.photoUrl
                ? <img src={player.photoUrl} className="w-full h-full object-cover" alt="" />
                : <div className="w-full h-full flex items-center justify-center text-muted-foreground font-medium text-lg">
                    {player.playerNumber.substring(0, 2)}
                  </div>
              }
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-foreground truncate">
                {player.name || 'Unregistered Player'}
              </p>
              <p className="text-sm text-muted-foreground">
                ID: {player.playerNumber}
              </p>
            </div>
          </div>

          {player.isRegistered ? (
            /* Already registered */
            <div className="h-card p-6 text-center space-y-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-100 mx-auto">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">
                  {registered ? 'Registration Complete' : 'Player Verified'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Player is active and ready.
                </p>
              </div>
              <button onClick={reset} className="h-btn-ghost w-full">
                <RefreshCw className="w-4 h-4 mr-2" /> Scan Next
              </button>
            </div>
          ) : (
            /* Registration form */
            <div className="h-card p-5 space-y-4">
              <p className="text-sm font-semibold text-foreground border-b border-border pb-2">
                Register New Player
              </p>

              <div>
                <label className="h-label">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="h-input" placeholder="Enter name" />
              </div>

              <div>
                <label className="h-label">Photo Identification</label>
                {photo ? (
                  <div className="relative rounded-lg overflow-hidden aspect-square border border-border">
                    <img src={photo} alt="Captured" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setPhoto(null)}
                      className="absolute bottom-3 right-3 bg-white/90 text-foreground p-2 rounded-full shadow-sm hover:bg-white transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden aspect-square relative bg-surface-2">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: facingMode, aspectRatio: 1 }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">
                      <button 
                        onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
                        className="h-btn-small bg-white/90 text-foreground shadow-md hover:bg-white"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" /> Flip
                      </button>
                      <button onClick={capture} className="h-btn shadow-md">
                        <Camera className="w-4 h-4 mr-2" /> Capture
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={reset} disabled={registering} className="h-btn-ghost">Cancel</button>
                <button
                  onClick={registerPlayer}
                  disabled={registering || !photo || !name}
                  className="h-btn"
                >
                  {registering ? 'Registering...' : 'Register Player'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
