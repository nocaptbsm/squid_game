'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface QRScannerProps {
  onScan: (token: string) => void
  onError?: (err: string) => void
  className?: string
}

type ScanState = 'idle' | 'requesting' | 'scanning' | 'error' | 'insecure'

export function QRScanner({ onScan, onError, className }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastScannedRef = useRef<string | null>(null)

  const [scanState, setScanState] = useState<ScanState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Check HTTPS on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const isSecure =
      window.isSecureContext ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    if (!isSecure) {
      setScanState('insecure')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    lastScannedRef.current = null
  }, [])

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [stopCamera])

  const startScanLoop = useCallback(async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    // Dynamically import jsQR (CommonJS, no chunk issue)
    const jsQR = (await import('jsqr')).default

    const ctx = canvas.getContext('2d')!

    const tick = () => {
      if (!video || video.readyState < video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      })

      if (code && code.data && code.data !== lastScannedRef.current) {
        lastScannedRef.current = code.data
        stopCamera()
        setScanState('idle')
        onScan(code.data)
        return
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [onScan, stopCamera])

  const startCamera = useCallback(async () => {
    setScanState('requesting')
    setErrorMsg('')

    try {
      // Stop any previous stream
      stopCamera()

      // Prefer back camera on mobile
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      const video = videoRef.current
      if (!video) throw new Error('Video element not ready')

      video.srcObject = stream
      await video.play()
      setScanState('scanning')
      startScanLoop()
    } catch (err: any) {
      stopCamera()
      let msg = err?.message || 'Camera failed to start'

      if (err?.name === 'NotAllowedError' || msg.includes('Permission') || msg.includes('denied')) {
        msg = 'Camera permission denied. Tap Retry and allow camera access when prompted.'
      } else if (err?.name === 'NotFoundError' || msg.includes('Requested device not found')) {
        msg = 'No camera found on this device.'
      } else if (err?.name === 'NotReadableError') {
        msg = 'Camera is in use by another app. Close it and try again.'
      } else if (err?.name === 'OverconstrainedError') {
        // Retry without facingMode constraint
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          streamRef.current = stream
          const video = videoRef.current
          if (video) {
            video.srcObject = stream
            await video.play()
            setScanState('scanning')
            startScanLoop()
            return
          }
        } catch {
          msg = 'Camera not accessible on this device.'
        }
      } else if (msg.includes('getUserMedia') || msg.includes('insecure')) {
        msg = 'Camera requires HTTPS. Access via the secure Vercel URL.'
        setScanState('insecure')
        onError?.(msg)
        return
      }

      setErrorMsg(msg)
      setScanState('error')
      onError?.(msg)
    }
  }, [stopCamera, startScanLoop, onError])

  return (
    <div className={cn('overflow-hidden rounded-xl border border-border bg-surface', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-2 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          QR Scanner
        </span>
        {scanState === 'scanning' && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Live
          </span>
        )}
      </div>

      {/* INSECURE CONTEXT */}
      {scanState === 'insecure' && (
        <div className="px-5 py-8 text-center space-y-4">
          <div className="text-yellow-500 text-3xl">🔒</div>
          <p className="text-sm font-semibold text-foreground">HTTPS Required</p>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Camera access only works over HTTPS. Open this secure URL on your device:
          </p>
          <div className="bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-700 break-all font-mono">
            {typeof window !== 'undefined'
              ? window.location.href.replace('http://', 'https://')
              : 'https://...'}
          </div>
        </div>
      )}

      {/* IDLE */}
      {scanState === 'idle' && (
        <div className="flex flex-col items-center justify-center py-12 px-4 gap-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm text-foreground font-medium">Camera Inactive</p>
          <p className="text-xs text-muted-foreground text-center">
            Tap below to activate your camera to scan a QR code.
          </p>
          <button onClick={startCamera} className="h-btn mt-2">
            Activate Scanner
          </button>
        </div>
      )}

      {/* REQUESTING */}
      {scanState === 'requesting' && (
        <div className="flex flex-col items-center justify-center py-12 px-4 gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-foreground">Starting Camera...</p>
          <p className="text-xs text-muted-foreground text-center">
            Allow camera access when prompted by your browser.
          </p>
        </div>
      )}

      {/* ERROR */}
      {scanState === 'error' && (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <span className="text-red-500 text-2xl">⚠</span>
          </div>
          <p className="text-sm font-semibold text-foreground">Camera Unavailable</p>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed mx-auto">
            {errorMsg}
          </p>
          <button onClick={startCamera} className="h-btn mt-2">
            Retry
          </button>
        </div>
      )}

      {/* Live video feed */}
      <div className={cn('relative', scanState !== 'scanning' && 'hidden')}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full block"
        />
        {/* Hidden canvas for frame analysis */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Corner markers overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-52 h-52">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
          </div>
        </div>

        {/* Stop button */}
        <button
          onClick={() => { stopCamera(); setScanState('idle') }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs font-medium px-4 py-1.5 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors"
        >
          Stop Camera
        </button>
      </div>
    </div>
  )
}
