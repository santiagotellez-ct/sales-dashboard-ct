'use client'
import { useMemo } from 'react'
import { formatCurrency } from '@/lib/formatters'
import type { Deal, DealStage, Filters } from '@/types'

interface Props { deals: Deal[]; stages: DealStage[]; filters: Filters; memberFilter: string }

function inPeriod(dateStr: string, filters: Filters): boolean {
  if (filters.quarter === 'all') return true
  const date = new Date(dateStr)
  const month = date.getMonth()
  const qStart = (filters.quarter - 1) * 3
  return date.getFullYear() === filters.year && month >= qStart && month < qStart + 3
}

function daysSince(d: string) { return Math.floor((Date.now() - new Date(d).getTime()) / 86400000) }

export function SectionB_ByStage({ deals, stages, filters, memberFilter }: Props) {
  const filtered = useMemo(() => {
    let d = deals.filter(d => inPeriod(d.created_at, filters))
    if (memberFilter !== 'all') d = d.filter(d => d.account_executive === memberFilter)
    return d
  }, [deals, filters, memberFilter])

  const rows = useMemo(() => {
    const totalValue = filtered.reduce((s, d) => s + (d.value ?? 0), 0)
    return stages.sort((a, b) => a.order - b.order).map(stage => {
      const sd = filtered.filter(d => d.stage_id === stage.id)
      const total = sd.reduce((s, d) => s + (d.value ?? 0), 0)
      const avg = sd.length > 0 ? total / sd.length : 0
      const avgDays = sd.length > 0 ? Math.round(sd.reduce((s, d) => s + daysSince(d.updated_at), 0) / sd.length) : 0
      return { stage, count: sd.length, total, avg, avgDays, pct: totalValue > 0 ? (total / totalValue) * 100 : 0 }
    }).filter(r => r.count > 0)
  }, [filtered, stages])

  return (
    <div>
      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">Pipeline por Etapa</p>
      <div className="bg-zinc-900 border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-medium text-zinc-600 border-b border-white/[0.04] bg-white/[0.02]">
          <div className="col-span-4">Stage</div>
          <div className="col-span-2 text-right">Total</div>
          <div className="col-span-1 text-right">Deals</div>
          <div className="col-span-2 text-right">Promedio</div>
          <div className="col-span-1 text-right">Avg Días</div>
          <div className="col-span-2 px-2">Distribución</div>
        </div>
        {rows.map(({ stage, count, total, avg, avgDays, pct }) => {
          const dot = stage.is_won ? 'bg-emerald-500' : stage.is_lost ? 'bg-red-500/70' : 'bg-zinc-600'
          return (
            <div key={stage.id} className="grid grid-cols-12 px-4 py-2.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors items-center">
              <div className="col-span-4 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />
                <span className="text-[13px] text-zinc-200">{stage.name}</span>
              </div>
              <div className="col-span-2 text-right text-[13px] font-semibold text-white">{total > 0 ? formatCurrency(total) : '—'}</div>
              <div className="col-span-1 text-right text-[13px] font-medium text-white">{count}</div>
              <div className="col-span-2 text-right text-[13px] text-zinc-400">{avg > 0 ? formatCurrency(avg) : '—'}</div>
              <div className="col-span-1 text-right text-[13px] text-zinc-500">{avgDays > 0 ? `${avgDays}d` : '—'}</div>
              <div className="col-span-2 px-2">
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
