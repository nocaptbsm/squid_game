'use client'

import React, { useState, useRef } from 'react'
import Papa from 'papaparse'
import { useRouter } from 'next/navigation'

export default function UploadPlayersPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError('')
    }
  }

  const processUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setProgress('Parsing CSV...')
    setError('')

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          setProgress(`Uploading ${results.data.length} records...`)
          
          const response = await fetch('/api/admin/upload-players', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ players: results.data }),
          })

          const data = await response.json()

          if (data.success) {
            setProgress('SUCCESS: DATA SEEDED.')
            setTimeout(() => router.push('/admin'), 1500)
          } else {
            setError(data.error || 'Upload failed')
            setIsUploading(false)
          }
        } catch (err) {
          setError('Network error during upload')
          setIsUploading(false)
        }
      },
      error: (err) => {
        setError('Failed to parse CSV file')
        setIsUploading(false)
      }
    })
  }
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-[0.3em] text-white">Upload Registered Players</h1>
        <p className="text-red-900/60 text-xs uppercase tracking-widest mt-2">Initialize player database for the current cycle</p>
      </div>

      <div className="bg-[#0a2424] border border-red-900/30 p-12 text-center shadow-2xl relative">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          accept=".csv" 
          className="hidden" 
        />
        
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 border-2 border-dashed border-red-900/50 rounded-none flex items-center justify-center mx-auto mb-6">
            <svg className={`w-8 h-8 ${file ? 'text-green-500' : 'text-red-900/50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          
          {file ? (
            <div className="mb-8">
              <h2 className="text-white font-bold uppercase tracking-widest mb-1">{file.name}</h2>
              <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">READY FOR INITIALIZATION</p>
            </div>
          ) : (
            <>
              <h2 className="text-white font-bold uppercase tracking-widest mb-4">Drop CSV File</h2>
              <p className="text-slate-500 text-xs mb-8">Upload the list of registered players to generate QR tokens and player numbers.</p>
            </>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-950/30 border border-red-500 text-red-500 text-xs font-bold uppercase tracking-widest">
              ERROR: {error}
            </div>
          )}

          {progress && (
            <div className="mb-6 p-4 bg-green-950/20 border border-green-500/50 text-green-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
              {progress}
            </div>
          )}
          
          <div className="flex gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1 border border-red-900/30 text-red-900 hover:bg-red-900/10 py-4 font-black uppercase tracking-widest text-[11px] transition-all"
            >
              Select File
            </button>
            {file && (
              <button 
                onClick={processUpload}
                disabled={isUploading}
                className="flex-1 bg-red-600 text-white hover:bg-red-700 py-4 font-black uppercase tracking-widest text-[11px] shadow-[0_0_20px_rgba(220,38,38,0.2)]"
              >
                {isUploading ? 'Seeding...' : 'Start Upload'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
