import React from 'react'
import { cn } from '@/lib/utils'

export function Logo({ className, hideText = false }: { className?: string, hideText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex gap-1.5 items-center">
        <div className="w-3.5 h-3.5 rounded-full border-2 border-npPink shadow-npPinkGlow" />
        <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[12px] border-b-npGold shadow-npGoldGlow transform -translate-y-px" />
        <div className="w-3.5 h-3.5 border-2 border-npTeal shadow-npTealGlow" />
      </div>
      {!hideText && (
        <span className="font-heading font-black text-xl tracking-[0.25em] text-white uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          Paradox
        </span>
      )}
    </div>
  )
}
