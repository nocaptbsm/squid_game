import React from 'react'
import { cn } from '@/lib/utils'

interface ShapeIconProps extends React.SVGProps<SVGSVGElement> {
  shape: 'circle' | 'triangle' | 'square'
  size?: number
  color?: string
}

export function ShapeIcon({ shape, size = 24, color, className, ...props }: ShapeIconProps) {
  const defaultColors = {
    circle: 'var(--sq-pink)',
    triangle: 'var(--sq-gold)',
    square: 'var(--sq-green)',
  }

  const fill = color || defaultColors[shape]

  if (shape === 'circle') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn(className)} {...props}>
        <circle cx="12" cy="12" r="9" stroke={fill} strokeWidth="3" fill="none" />
      </svg>
    )
  }

  if (shape === 'triangle') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn(className)} {...props}>
        <path d="M12 3L22 20H2L12 3Z" stroke={fill} strokeWidth="3" fill="none" strokeLinejoin="round" />
      </svg>
    )
  }

  // square
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn(className)} {...props}>
      <rect x="3" y="3" width="18" height="18" stroke={fill} strokeWidth="3" fill="none" />
    </svg>
  )
}
