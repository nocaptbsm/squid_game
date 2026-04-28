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

    const jsQR = (await import('jsqr')).default
    const ctx = canvas.getContext('2d', { alpha: false })!

    const tick = () => {
      if (!video || video.readyState < video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      // Optimize: Only scan a central square to save CPU
      const size = Math.min(video.videoWidth, video.videoHeight, 400)
      const sx = (video.videoWidth - size) / 2
      const sy = (video.videoHeight - size) / 2
      
      canvas.width = size
      canvas.height = size
      ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size)

      const imageData = ctx.getImageData(0, 0, size, size)
      const code = jsQR(imageData.data, size, size, {
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
      stopCamera()
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 640 },
          height: { ideal: 480 },
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
      setErrorMsg(err?.message || 'Camera failed')
      setScanState('error')
    }
  }, [stopCamera, startScanLoop])

  // Auto-start on mount if secure
  useEffect(() => {
    if (typeof window === 'undefined') return
    const isSecure =
      window.isSecureContext ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    
    if (isSecure) {
      startCamera()
    } else {
      setScanState('insecure')
    }
  }, [startCamera])

  return (
    <div className={cn('overflow-hidden rounded-xl border border-red-900/30 bg-[#0a2424] shadow-2xl', className)}>
      {/* Live video feed */}
      <div className={cn('relative aspect-square max-w-[280px] mx-auto overflow-hidden', scanState !== 'scanning' && 'hidden')}>
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Scan Frame */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-40 h-40">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-500" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-500" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-500" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-500" />
            <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
          </div>
        </div>
      </div>

      {scanState !== 'scanning' && (
        <div className="py-8 px-4 text-center">
           {scanState === 'requesting' ? (
             <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
           ) : (
             <button onClick={startCamera} className="h-btn-small">Retry Camera</button>
           )}
        </div>
      )}
    </div>
  )
}
