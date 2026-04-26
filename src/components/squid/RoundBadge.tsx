import React from 'react'
import { Check, X, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RoundBadgeProps {
  status: 'PENDING' | 'SURVIVED' | 'ELIMINATED' | 'LOCKED'
  className?: string
}

export function RoundBadge({ status, className }: RoundBadgeProps) {
  if (status === 'SURVIVED') {
    return (
      <span className={cn('badge-green', className)}>
        <Check className="w-3 h-3 mr-1 inline-block" /> Survived
      </span>
    )
  }
  if (status === 'ELIMINATED') {
    return (
      <span className={cn('badge-orange', className)}>
        <X className="w-3 h-3 mr-1 inline-block" /> Eliminated
      </span>
    )
  }
  return (
    <span className={cn('badge-gray', className)}>
      <Clock className="w-3 h-3 mr-1 inline-block" /> Pending
    </span>
  )
}
