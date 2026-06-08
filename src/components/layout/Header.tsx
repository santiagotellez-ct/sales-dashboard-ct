'use client'
import { RefreshCw } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatTime } from '@/lib/formatters'
import type { Filters, Quarter } from '@/types'

interface HeaderProps {
  section: string
  filters: Filters
  availableWeeks: number[]
  onQuarterChange: (q: Quarter | 'all') => void
  onWeekChange: (w: number | 'all') => void
  lastUpdated: Date | null
  onRefresh: () => void
  loading?: boolean
}

export function Header({ section, filters, availableWeeks, onQuarterChange, onWeekChange, lastUpdated, onRefresh, loading }: HeaderProps) {
  return (
    <header className="h-14 fixed top-0 left-52 right-0 flex items-center justify-between px-6 border-b border-white/[0.06] bg-[#0d0d0f] z-30">
      <span className="text-sm font-semibold text-white">{section}</span>

      <div className="flex items-center gap-2">
        {lastUpdated && (
          <span className="text-xs text-zinc-600 mr-1">
            {formatTime(lastUpdated)}
          </span>
        )}

        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 transition-colors disabled:opacity-40"
          title="Actualizar"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>

        {filters.quarter !== 'all' && (
          <Select
            value={String(filters.week)}
            onValueChange={(v) => onWeekChange(v === 'all' ? 'all' : Number(v))}
          >
            <SelectTrigger className="h-8 w-40 text-xs bg-zinc-900 border-zinc-700 text-zinc-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las semanas</SelectItem>
              {availableWeeks.map((w) => (
                <SelectItem key={w} value={String(w)}>Semana {w}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={String(filters.quarter)}
          onValueChange={(v) => onQuarterChange(v === 'all' ? 'all' : Number(v) as Quarter)}
        >
          <SelectTrigger className="h-8 w-24 text-xs bg-zinc-900 border-zinc-700 text-zinc-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo</SelectItem>
            {([1, 2, 3, 4] as Quarter[]).map((q) => (
              <SelectItem key={q} value={String(q)}>Q{q}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  )
}
