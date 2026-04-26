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
  const scannerRef = useRef<any>(null)
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // On mount, check if we're in a secure context
  useEffect(() => {
    const isSecure =
      typeof window !== 'undefined' &&
      (window.isSecureContext ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1')

    if (!isSecure) {
      setScanState('insecure')
    }
  }, [])

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop() } catch {}
      try { scannerRef.current.clear() } catch {}
      scannerRef.current = null
    }
  }, [])

  useEffect(() => () => { stopScanner() }, [stopScanner])

  const startCamera = useCallback(async () => {
    setScanState('requesting')
    setErrorMsg('')

    // Small delay so the #qr-reader div renders
    await new Promise(r => setTimeout(r, 100))

    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      await stopScanner()

      const scanner = new Html5Qrcode('qr-reader', { verbose: false } as any)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: { ideal: 'environment' } },
        { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 },
        (decodedText: string) => {
          stopScanner()
          setScanState('idle')
          onScan(decodedText)
        },
        () => {}
      )
      setScanState('scanning')
    } catch (err: any) {
      let msg = err?.message || 'Camera failed to start'
      if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
        msg = 'Camera permission denied. Tap RETRY and allow camera access.'
      } else if (msg.includes('NotFoundError') || msg.includes('Requested device not found')) {
        msg = 'No camera found on this device.'
      } else if (msg.includes('insecure') || msg.includes('getUserMedia')) {
        msg = 'Camera requires HTTPS. See instructions below.'
        setScanState('insecure')
        onError?.(msg)
        return
      }
      setErrorMsg(msg)
      setScanState('error')
      onError?.(msg)
    }
  }, [stopScanner, onScan, onError])

  return (
    <div className={cn('overflow-hidden border border-red-700/60 bg-[#3a1c1e] relative', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-red-800/40">
        <span className="text-[10px] tracking-[0.3em] text-[#d4b8b8] uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
          QR SCAN
        </span>
        {scanState === 'scanning' && (
          <span className="flex items-center gap-1.5 text-[10px] tracking-widest text-red-400 uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" style={{ boxShadow: '0 0 6px rgba(255,50,50,0.9)' }} />
            LIVE
          </span>
        )}
      </div>

      {/* ── INSECURE CONTEXT ── */}
      {scanState === 'insecure' && (
        <div className="px-5 py-8 text-center space-y-4">
          <div className="text-yellow-500 text-3xl">🔒</div>
          <p className="text-[11px] tracking-[0.25em] text-yellow-400 uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            HTTPS REQUIRED
          </p>
          <p className="text-[10px] text-[#d4b8b8] leading-relaxed" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            Camera access only works over HTTPS.<br />
            Open this URL on your device:
          </p>
          <div className="bg-[#522828] border border-red-700/50 rounded px-3 py-2 text-[11px] text-red-300 break-all" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            {typeof window !== 'undefined' ? window.location.href.replace('http://', 'https://') : 'https://...'}
          </div>
          <p className="text-[9px] text-[#a88080]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            Or run: npm run dev:https
          </p>
        </div>
      )}

      {/* ── IDLE ── */}
      {scanState === 'idle' && (
        <div className="flex flex-col items-center justify-center py-12 px-4 gap-5">
          <div className="text-5xl text-red-700/70" style={{ fontFamily: 'Share Tech Mono, monospace' }}>◉</div>
          <p className="text-[11px] tracking-[0.3em] text-[#d4b8b8] uppercase text-center" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            Tap to activate camera
          </p>
          <button onClick={startCamera} className="h-btn text-xs px-8">
            ACTIVATE SCANNER
          </button>
        </div>
      )}

      {/* ── REQUESTING ── */}
      {scanState === 'requesting' && (
        <div className="flex flex-col items-center justify-center py-12 px-4 gap-4">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] tracking-[0.3em] text-[#d4b8b8] uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            STARTING CAMERA...
          </p>
          <p className="text-[10px] text-[#a88080] text-center" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            Allow camera access when prompted
          </p>
        </div>
      )}

      {/* ── ERROR ── */}
      {scanState === 'error' && (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
          <div className="text-red-400 text-3xl">⚠</div>
          <p className="text-[11px] tracking-widest text-red-400 uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            CAMERA UNAVAILABLE
          </p>
          <p className="text-[10px] text-[#d4b8b8] max-w-xs leading-relaxed" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            {errorMsg}
          </p>
          <button onClick={startCamera} className="h-btn text-xs mt-2">
            RETRY
          </button>
        </div>
      )}

      {/* ── Camera view (hidden until scanning) ── */}
      <div className={cn('relative', scanState !== 'scanning' && 'hidden')}>
        <div id="qr-reader" className="w-full" style={{ filter: 'grayscale(20%) contrast(1.05)' }} />

        {/* Corner markers */}
        <div className="absolute inset-4 pointer-events-none">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-500" style={{ boxShadow: '-2px -2px 8px rgba(255,50,50,0.5)' }} />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-500" style={{ boxShadow: '2px -2px 8px rgba(255,50,50,0.5)' }} />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-500" style={{ boxShadow: '-2px 2px 8px rgba(255,50,50,0.5)' }} />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-500" style={{ boxShadow: '2px 2px 8px rgba(255,50,50,0.5)' }} />
          <div className="absolute left-0 right-0 h-[2px] bg-red-500" style={{ boxShadow: '0 0 10px rgba(255,50,50,1)', animation: 'scan-line 2.5s linear infinite', top: 0 }} />
        </div>

        <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 3px)' }} />
      </div>
    </div>
  )
}
