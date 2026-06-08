'use client'
import { useMemo } from 'react'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import { useTargets } from '@/contexts/TargetsContext'
import type { Deal, DealStage, Filters } from '@/types'

interface Props { deals: Deal[]; stages: DealStage[]; filters: Filters; aes: string[] }

function inPeriod(dateStr: string, filters: Filters): boolean {
  if (filters.quarter === 'all') return true
  const date = new Date(dateStr)
  const month = date.getMonth()
  const qStart = (filters.quarter - 1) * 3
  return date.getFullYear() === filters.year && month >= qStart && month < qStart + 3
}

export function SectionA_RevenueVsMeta({ deals, stages, filters, aes }: Props) {
  const { getAeTarget } = useTargets()
  const { year, quarter } = filters

  const wonIds = useMemo(() => stages.filter(s => s.is_won || s.name === 'Commited').map(s => s.id), [stages])

  const aeData = useMemo(() => {
    const filtered = deals.filter(d => inPeriod(d.created_at, filters))
    return aes.map(ae => {
      const revenue = filtered
        .filter(d => d.account_executive === ae && wonIds.includes(d.stage_id))
        .reduce((s, d) => s + (d.value ?? 0), 0)
      const target = getAeTarget(year, quarter, ae)
      const pct = target > 0 ? Math.min(100, (revenue / target) * 100) : 0
      return { ae, revenue, target, pct }
    }).sort((a, b) => b.revenue - a.revenue)
  }, [deals, filters, aes, wonIds, year, quarter, getAeTarget])

  const maxRevenue = Math.max(...aeData.map(d => d.revenue), 1)
  const periodLabel = quarter === 'all' ? `${year}` : `Q${quarter} ${year}`

  return (
    <div>
      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">
        Revenue vs Meta por AE — {periodLabel}
      </p>
      <div className="bg-zinc-900 border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-medium text-zinc-600 border-b border-white/[0.04] bg-white/[0.02]">
          <div className="col-span-3">AE</div>
          <div className="col-span-2 text-right">Revenue</div>
          <div className="col-span-2 text-right">% Meta</div>
          <div className="col-span-4 px-3">Progreso</div>
          <div className="col-span-1 text-right">Meta</div>
        </div>
        {aeData.map(({ ae, revenue, target, pct }) => (
          <div key={ae} className="grid grid-cols-12 px-4 py-3 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors items-center">
            <div className="col-span-3 text-[13px] text-zinc-200 font-medium">{ae}</div>
            <div className="col-span-2 text-right text-[13px] font-semibold text-white">{formatCurrency(revenue)}</div>
            <div className="col-span-2 text-right text-[13px] text-zinc-400">
              {target > 0 ? formatPercent(pct, 1) : '—'}
            </div>
            <div className="col-span-4 px-3">
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${target > 0 ? pct : (revenue / maxRevenue) * 100}%`,
                    background: pct >= 100 ? '#10b981' : pct >= 70 ? '#e4e4e7' : '#52525b'
                  }}
                />
              </div>
            </div>
            <div className="col-span-1 text-right text-[11px] text-zinc-600">
              {target > 0 ? formatCurrency(target) : '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
