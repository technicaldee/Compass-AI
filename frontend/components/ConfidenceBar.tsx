'use client'

import { motion } from 'framer-motion'

interface ConfidenceBarProps {
  value: number // 0-1
  label?: string
  showLabel?: boolean
}

export function ConfidenceBar({ value, label, showLabel = true }: ConfidenceBarProps) {
  const percentage = Math.round(value * 100)

  return (
    <div className="w-full">
      {showLabel && label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[var(--color-foreground)]">{label}</span>
          <span className="text-sm font-mono font-semibold text-[var(--color-primary)]">{percentage}%</span>
        </div>
      )}
      <div className="h-2 bg-[var(--color-muted)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"
        />
      </div>
    </div>
  )
}

