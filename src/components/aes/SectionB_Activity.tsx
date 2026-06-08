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

export function SectionB_Activity({ deals, stages, filters, aes }: Props) {
  const { getAeTarget } = useTargets()
  const { year, quarter } = filters

  const stageMap = useMemo(() => Object.fromEntries(stages.map(s => [s.id, s])), [stages])

  const wonIds = useMemo(() => stages.filter(s => s.is_won || s.name === 'Commited').map(s => s.id), [stages])
  const lostIds = useMemo(() => stages.filter(s => s.is_lost).map(s => s.id), [stages])

  // Stage name helpers
  const stageIdByName = useMemo(() => {
    const map: Record<string, string> = {}
    stages.forEach(s => { map[s.name.toLowerCase()] = s.id })
    return map
  }, [stages])

  function stageId(name: string) { return stageIdByName[name.toLowerCase()] }

  const discoveryId = stageId('discovery realizada')
  const propPresentadaId = stageId('propuesta presentada')
  const committedId = stageId('commited')

  // "Deals abiertos" = not won, not committed, not lost
  const openIds = useMemo(
    () => stages.filter(s => !s.is_won && !s.is_lost && s.name !== 'Commited').map(s => s.id),
    [stages]
  )

  const aeData = useMemo(() => {
    const filtered = deals.filter(d => inPeriod(d.created_at, filters))
    return aes.map(ae => {
      const aeDeals = filtered.filter(d => d.account_executive === ae)
      const won = aeDeals.filter(d => stageMap[d.stage_id]?.is_won)
      const lost = aeDeals.filter(d => stageMap[d.stage_id]?.is_lost)
      const notLost = aeDeals.filter(d => !stageMap[d.stage_id]?.is_lost)
      const revenue = aeDeals.filter(d => wonIds.includes(d.stage_id)).reduce((s, d) => s + (d.value ?? 0), 0)
      const target = getAeTarget(year, quarter, ae)
      const pctMeta = target > 0 ? (revenue / target) * 100 : null
      const discovery = discoveryId ? aeDeals.filter(d => d.stage_id === discoveryId).length : 0
      const propPresentada = propPresentadaId ? aeDeals.filter(d => d.stage_id === propPresentadaId).length : 0
      const committed = committedId ? aeDeals.filter(d => d.stage_id === committedId).length : 0
      const cierreGanado = won.length
      const abiertos = aeDeals.filter(d => openIds.includes(d.stage_id)).length
      const winRate = notLost.length > 0 ? ((won.length + committed) / notLost.length) * 100 : 0
      return { ae, revenue, target, pctMeta, discovery, propPresentada, committed, cierreGanado, abiertos, winRate }
    }).sort((a, b) => b.revenue - a.revenue)
  }, [deals, filters, aes, stageMap, wonIds, openIds, discoveryId, propPresentadaId, committedId, year, quarter, getAeTarget])

  return (
    <div>
      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">
        Actividad por AE
      </p>
      <div className="bg-zinc-900 border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-medium text-zinc-600 border-b border-white/[0.04] bg-white/[0.02]">
          <div className="col-span-2">AE</div>
          <div className="col-span-2 text-right">Revenue</div>
          <div className="col-span-1 text-right">% Meta</div>
          <div className="col-span-1 text-right">Win Rate</div>
          <div className="col-span-1 text-right">Discovery</div>
          <div className="col-span-1 text-right">Propuestas</div>
          <div className="col-span-1 text-right">Committed</div>
          <div className="col-span-1 text-right">Ganados</div>
          <div className="col-span-2 text-right">Abiertos</div>
        </div>
        {aeData.map(({ ae, revenue, pctMeta, winRate, discovery, propPresentada, committed, cierreGanado, abiertos }) => (
          <div key={ae} className="grid grid-cols-12 px-4 py-2.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors items-center">
            <div className="col-span-2 text-[13px] text-zinc-200 font-medium">{ae}</div>
            <div className="col-span-2 text-right text-[13px] font-semibold text-white">{formatCurrency(revenue)}</div>
            <div className="col-span-1 text-right text-[13px] text-zinc-400">{pctMeta !== null ? formatPercent(pctMeta, 0) : '—'}</div>
            <div className="col-span-1 text-right text-[13px] text-zinc-400">{formatPercent(winRate, 1)}</div>
            <div className="col-span-1 text-right text-[13px] text-zinc-300">{discovery}</div>
            <div className="col-span-1 text-right text-[13px] text-zinc-300">{propPresentada}</div>
            <div className="col-span-1 text-right text-[13px] text-zinc-300">{committed}</div>
            <div className="col-span-1 text-right text-[13px] text-emerald-400 font-medium">{cierreGanado}</div>
            <div className="col-span-2 text-right text-[13px] text-zinc-400">{abiertos}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
