import React from 'react'
import { cn } from '@/lib/utils'
import { motion, HTMLMotionProps } from 'framer-motion'

interface SquidButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'pink' | 'green' | 'red' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const SquidButton = React.forwardRef<HTMLButtonElement, SquidButtonProps>(
  ({ className, variant = 'pink', size = 'md', ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:pointer-events-none"
    
    const variants = {
      pink: "bg-sqPink text-white hover:bg-[#ff1a7a] hover:shadow-[0_0_20px_rgba(255,0,103,0.4)]",
      green: "bg-sqGreen/20 text-sqGreen border-2 border-sqGreen hover:bg-sqGreen hover:text-black hover:shadow-[0_0_20px_rgba(0,255,136,0.4)]",
      red: "bg-sqRed/20 text-sqRed border-2 border-sqRed hover:bg-sqRed hover:text-white hover:shadow-[0_0_20px_rgba(255,34,34,0.4)]",
      outline: "border-2 border-sqBorder text-sqText hover:bg-sqSurface",
    }

    const sizes = {
      sm: "h-9 px-4 text-xs",
      md: "h-11 px-6 text-sm",
      lg: "h-14 px-8 text-base",
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  }
)
SquidButton.displayName = 'SquidButton'
