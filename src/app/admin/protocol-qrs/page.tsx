'use client'

import React, { useState, useEffect } from 'react'
import { Download, Loader2, Plus, Trash2, Printer } from 'lucide-react'

export default function ProtocolQRsPage() {
  const [tokens, setTokens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [clearing, setClearing] = useState(false)

  const fetchTokens = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/generate-tokens')
      const data = await res.json()
      setTokens(data.tokens || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTokens()
  }, [])

  const generateTokens = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/admin/generate-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 350 })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      fetchTokens()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const clearTokens = async () => {
    if (!confirm('Are you sure you want to delete all blank tokens? This will not affect registered players.')) return
    setClearing(true)
    try {
      const res = await fetch('/api/admin/generate-tokens', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to clear tokens')
      setTokens([])
    } catch (err: any) {
      alert(err.message)
    } finally {
      setClearing(false)
    }
  }

  const downloadAll = async () => {
    if (tokens.length === 0) return
    setLoading(true)
    try {
      const JSZip = (await import('jszip')).default
      const saveAs = (await import('file-saver')).saveAs
      const zip = new JSZip()
      const folder = zip.folder('protocol_qrs')

      // Fetch all images in parallel (chunks of 20 to avoid overwhelming)
      const chunkSize = 20
      for (let i = 0; i < tokens.length; i += chunkSize) {
        const chunk = tokens.slice(i, i + chunkSize)
        await Promise.all(chunk.map(async (t, idx) => {
          const response = await fetch(`/api/qr/${t.token}`)
          const blob = await response.blob()
          const filename = `qr_${String(i + idx + 1).padStart(3, '0')}_${t.token.substring(0, 8)}.png`
          folder?.file(filename, blob)
        }))
      }

      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `squid_game_protocol_qrs_${new Date().getTime()}.zip`)
    } catch (err) {
      console.error(err)
      alert('Failed to generate ZIP')
    } finally {
      setLoading(false)
    }
  }

  const printQRs = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center text-muted-foreground gap-3">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Processing Registry...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Protocol <span className="text-red-600">QRs</span></h1>
          <p className="text-sm text-red-900/60 font-bold uppercase tracking-widest mt-1">
            Authorized Blank Token Registry ({tokens.length} / 350)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {tokens.length === 0 ? (
            <button
              onClick={generateTokens}
              disabled={generating}
              className="h-btn flex items-center gap-2 !bg-red-600"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Generate 350 Tokens
            </button>
          ) : (
            <>
              <button
                onClick={clearTokens}
                disabled={clearing}
                className="h-btn-ghost text-red-900/60 hover:text-red-600 border-red-900/20"
              >
                {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Clear Registry
              </button>
              <button
                onClick={downloadAll}
                className="h-btn-ghost flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download ZIP
              </button>
              <button
                onClick={printQRs}
                className="h-btn flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Labels
              </button>
            </>
          )}
        </div>
      </div>

      {tokens.length === 0 ? (
        <div className="h-card p-20 text-center space-y-4 no-print">
          <div className="w-16 h-16 bg-red-950/20 border-2 border-dashed border-red-900/30 rounded-none flex items-center justify-center mx-auto">
            <Box className="w-8 h-8 text-red-900/40" />
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No tokens in registry</p>
          <p className="text-xs text-slate-600 max-w-xs mx-auto italic">
            Generate 350 unique protocol tokens to authorize your physical QR cards.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 print:grid-cols-4 print:gap-4">
          {tokens.map((t, i) => (
            <div 
              key={t.id} 
              className={`
                flex flex-col items-center p-2 border transition-all
                ${t.isUsed 
                  ? 'bg-green-500/5 border-green-500/20 opacity-50' 
                  : 'bg-red-950/10 border-red-900/20 hover:border-red-500/40'}
                print:border-slate-200 print:bg-white print:p-4
              `}
            >
              <img 
                src={`/api/qr/${t.token}`} 
                alt="QR" 
                className="w-full aspect-square object-contain print:w-32"
              />
              <div className="mt-2 text-center">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter block print:text-black">
                  #{String(i + 1).padStart(3, '0')}
                </span>
                {t.isUsed && (
                  <span className="text-[8px] font-black text-green-500 uppercase tracking-widest mt-1 block print:hidden">
                    USED
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; background: white !important; }
          .print-grid, .print-grid * { visibility: visible; }
          .grid { visibility: visible !important; display: grid !important; }
          .no-print { display: none !important; }
          header, nav, aside { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; width: 100% !important; }
          .fixed { position: static !important; }
          .max-w-7xl { max-width: 100% !important; }
        }
      `}</style>
    </div>
  )
}

function Box({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m7.5 4.27 9 5.15"/>
      <path d="M3.29 7L12 12l8.71-5"/>
      <path d="M12 22V12"/>
    </svg>
  )
}
