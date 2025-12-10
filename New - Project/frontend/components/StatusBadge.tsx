'use client'

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info'
  children: React.ReactNode
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const styles = {
    success: 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border-[var(--color-primary)]/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    error: 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border-[var(--color-accent)]/30',
    info: 'bg-[var(--color-secondary)]/20 text-[var(--color-secondary)] border-[var(--color-secondary)]/30',
  }

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
      {children}
    </span>
  )
}

