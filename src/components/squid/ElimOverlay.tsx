'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ElimOverlayProps {
  isVisible: boolean
  onDismiss?: () => void
}

export function ElimOverlay({ isVisible, onDismiss }: ElimOverlayProps) {
  useEffect(() => {
    if (isVisible && onDismiss) {
      const timer = setTimeout(onDismiss, 2000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onDismiss])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-sqRed/90 backdrop-blur-sm cursor-pointer"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: 'spring', 
              damping: 12, 
              stiffness: 100, 
              delay: 0.1 
            }}
            className="flex flex-col items-center"
          >
            <X className="w-48 h-48 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]" />
            <h1 className="mt-8 text-5xl md:text-7xl font-black text-white tracking-[0.2em] drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] uppercase">
              Eliminated
            </h1>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
