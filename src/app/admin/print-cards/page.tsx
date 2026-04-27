'use client'

import React, { useState, useEffect } from 'react'
import { Download, Loader2 } from 'lucide-react'

export default function PrintCards() {
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    fetch('/api/players?limit=1000')
      .then(res => res.json())
      .then(data => {
        if (data.players) setPlayers(data.players)
        setLoading(false)
      })
  }, [])

  // Fetch a QR image and return it as a base64 data URL
  const fetchQRBase64 = async (token: string): Promise<string> => {
    const res = await fetch(`/api/qr/${token}`)
    const blob = await res.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  const downloadPDF = async () => {
    setGenerating(true)
    setProgress(0)

    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import('jspdf')).default

      // A4 dimensions in mm
      const PAGE_W = 210
      const PAGE_H = 297

      // Layout: 4 columns × 3 rows = 12 per page
      const COLS = 4
      const ROWS = 3
      const MARGIN = 10        // mm, outer margin
      const GAP = 4            // mm, gap between cells
      const LABEL_H = 8        // mm, height reserved for player number text

      const cellW = (PAGE_W - 2 * MARGIN - (COLS - 1) * GAP) / COLS
      const cellH = (PAGE_H - 2 * MARGIN - (ROWS - 1) * GAP) / ROWS
      const qrSize = Math.min(cellW, cellH - LABEL_H)

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      pdf.setFont('helvetica', 'bold')

      for (let i = 0; i < players.length; i++) {
        const player = players[i]
        const pageIndex = Math.floor(i / (COLS * ROWS))
        const cellIndex = i % (COLS * ROWS)
        const col = cellIndex % COLS
        const row = Math.floor(cellIndex / COLS)

        // Add new page (not for the first cell)
        if (i > 0 && cellIndex === 0) {
          pdf.addPage()
        }

        const x = MARGIN + col * (cellW + GAP)
        const y = MARGIN + row * (cellH + GAP)

        // Center QR within cell
        const qrX = x + (cellW - qrSize) / 2
        const qrY = y

        // Fetch QR code image
        const qrBase64 = await fetchQRBase64(player.qrToken)
        pdf.addImage(qrBase64, 'PNG', qrX, qrY, qrSize, qrSize)

        // Player number label below QR
        pdf.setFontSize(9)
        pdf.setTextColor(30, 30, 30)
        pdf.text(
          `#${player.playerNumber}`,
          x + cellW / 2,
          qrY + qrSize + 5,
          { align: 'center' }
        )

        // Thin border around cell
        pdf.setDrawColor(220, 220, 220)
        pdf.setLineWidth(0.2)
        pdf.rect(x, y, cellW, cellH - LABEL_H + LABEL_H)

        // Update progress
        setProgress(Math.round(((i + 1) / players.length) * 100))
      }

      pdf.save('paradox-qr-codes.pdf')
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setGenerating(false)
      setProgress(0)
    }
  }

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center text-muted-foreground gap-3">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading players...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">QR Code Cards</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {players.length} player QR codes · A4 PDF · 12 per page
          </p>
        </div>

        <button
          onClick={downloadPDF}
          disabled={generating || players.length === 0}
          className="h-btn flex items-center gap-2 min-w-[180px] justify-center"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {progress > 0 ? `Generating... ${progress}%` : 'Starting...'}
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download PDF
            </>
          )}
        </button>
      </div>

      {/* Progress bar */}
      {generating && (
        <div className="h-card p-4">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className="text-muted-foreground">Fetching QR codes...</span>
            <span className="text-foreground">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            This may take a moment for {players.length} players. Please wait.
          </p>
        </div>
      )}

      {/* Preview grid */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Preview
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
          {players.map(player => (
            <div
              key={player.id}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border border-border bg-surface hover:border-primary/40 transition-colors"
            >
              {/* QR Image */}
              <img
                src={`/api/qr/${player.qrToken}`}
                alt={`QR for ${player.playerNumber}`}
                className="w-full aspect-square object-contain"
                loading="lazy"
              />
              {/* Player number */}
              <span className="text-[10px] font-bold font-mono text-foreground">
                #{player.playerNumber}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
