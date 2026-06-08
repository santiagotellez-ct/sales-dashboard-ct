import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  children?: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function MetricCard({ label, value, sub, children, className, size = 'md' }: MetricCardProps) {
  return (
    <div className={cn('bg-zinc-900 border border-white/[0.06] rounded-xl p-4 flex flex-col gap-1.5', className)}>
      <p className="text-xs text-zinc-500 font-medium leading-none">{label}</p>
      <p className={cn(
        'font-semibold text-white leading-tight',
        size === 'lg' && 'text-3xl',
        size === 'md' && 'text-2xl',
        size === 'sm' && 'text-xl'
      )}>
        {value}
      </p>
      {sub && <p className="text-xs text-zinc-600">{sub}</p>}
      {children}
    </div>
  )
}
