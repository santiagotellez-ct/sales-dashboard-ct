'use client'
import { useMemo } from 'react'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import { useTargets } from '@/contexts/TargetsContext'
import { HOT_DEAL_THRESHOLD } from '@/lib/constants'
import type { Deal, DealStage, Filters } from '@/types'

interface Props { deals: Deal[]; stages: DealStage[]; filters: Filters; aes: string[] }

function inPeriod(dateStr: string, filters: Filters): boolean {
  if (filters.quarter === 'all') return true
  const date = new Date(dateStr)
  const month = date.getMonth()
  const qStart = (filters.quarter - 1) * 3
  return date.getFullYear() === filters.year && month >= qStart && month < qStart + 3
}

const FUNNEL_STAGES = [
  'Discovery realizada',
  'Propuesta en construcción',
  'Propuesta presentada',
  'Propuesta revisada',
  'Propuesta en negociación',
  'Commited',
  'Cierre ganado',
]

export function SectionC_Individual({ deals, stages, filters, aes }: Props) {
  const { getAeTarget } = useTargets()
  const { year, quarter } = filters

  const stageMap = useMemo(() => Object.fromEntries(stages.map(s => [s.id, s])), [stages])
  const wonIds = useMemo(() => stages.filter(s => s.is_won || s.name === 'Commited').map(s => s.id), [stages])
  const openIds = useMemo(
    () => stages.filter(s => !s.is_won && !s.is_lost && s.name !== 'Commited').map(s => s.id),
    [stages]
  )

  const funnelStageObjs = useMemo(() => {
    return FUNNEL_STAGES.map(name => {
      const s = stages.find(st => st.name.toLowerCase() === name.toLowerCase() || (name === 'Cierre ganado' && st.is_won && st.name !== 'Commited'))
      return { name, stage: s }
    })
  }, [stages])

  const aeCards = useMemo(() => {
    const filtered = deals.filter(d => inPeriod(d.created_at, filters))
    return aes.map(ae => {
      const aeDeals = filtered.filter(d => d.account_executive === ae)
      const revenue = aeDeals.filter(d => wonIds.includes(d.stage_id)).reduce((s, d) => s + (d.value ?? 0), 0)
      const target = getAeTarget(year, quarter, ae)
      const pct = target > 0 ? Math.min(100, (revenue / target) * 100) : 0
      const won = aeDeals.filter(d => stageMap[d.stage_id]?.is_won && stageMap[d.stage_id]?.name !== 'Commited').length
      const abiertos = aeDeals.filter(d => openIds.includes(d.stage_id)).length
      const propuestas = aeDeals.filter(d => {
        const name = stageMap[d.stage_id]?.name?.toLowerCase() ?? ''
        return name.includes('propuesta')
      }).length
      const discoverys = aeDeals.filter(d => stageMap[d.stage_id]?.name?.toLowerCase().includes('discovery')).length
      const hotDeals = aeDeals.filter(d => !stageMap[d.stage_id]?.is_lost && (d.value ?? 0) >= HOT_DEAL_THRESHOLD)

      // Funnel per AE
      const totalAeDeals = aeDeals.length
      const funnel = funnelStageObjs.map(({ name, stage }) => {
        if (!stage) return { name, count: 0, pct: 0, value: 0 }
        const sd = aeDeals.filter(d => d.stage_id === stage.id)
        const count = sd.length
        const value = sd.reduce((s, d) => s + (d.value ?? 0), 0)
        return { name, count, pct: totalAeDeals > 0 ? (count / totalAeDeals) * 100 : 0, value }
      })

      return { ae, revenue, target, pct, won, abiertos, propuestas, discoverys, hotDeals, funnel }
    })
  }, [deals, filters, aes, stageMap, wonIds, openIds, funnelStageObjs, year, quarter, getAeTarget])

  return (
    <div>
      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">
        Detalle Individual por AE
      </p>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {aeCards.map(({ ae, revenue, target, pct, won, abiertos, propuestas, discoverys, hotDeals, funnel }) => (
          <div key={ae} className="bg-zinc-900 border border-white/[0.06] rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-white/[0.04]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">{ae}</span>
                <span className="text-sm font-bold text-white">{formatCurrency(revenue)}</span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background: pct >= 100 ? '#10b981' : pct >= 70 ? '#e4e4e7' : '#52525b'
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-600">
                <span>{formatPercent(pct, 1)} de la meta</span>
                <span>{target > 0 ? formatCurrency(target) : 'Sin meta'}</span>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-4 divide-x divide-white/[0.04] border-b border-white/[0.04]">
              {[
                { label: 'Ganados', value: won },
                { label: 'Abiertos', value: abiertos },
                { label: 'Propuestas', value: propuestas },
                { label: 'Discovery', value: discoverys },
              ].map(({ label, value }) => (
                <div key={label} className="px-3 py-2.5 text-center">
                  <p className="text-[11px] text-zinc-600 mb-0.5">{label}</p>
                  <p className="text-base font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>

            {/* Funnel */}
            <div className="px-4 py-3">
              <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider mb-2">Funnel de conversión</p>
              <div className="flex flex-col gap-1.5">
                {funnel.map(({ name, count, pct: fPct, value }) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-500 w-44 truncate">{name}</span>
                    <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-500 rounded-full" style={{ width: `${Math.min(100, fPct)}%` }} />
                    </div>
                    <span className="text-[11px] text-zinc-400 w-4 text-right">{count}</span>
                    <span className="text-[11px] text-zinc-600 w-8 text-right">{fPct > 0 ? formatPercent(fPct, 0) : '—'}</span>
                    <span className="text-[11px] text-zinc-500 w-20 text-right">{value > 0 ? formatCurrency(value) : ''}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hot deals */}
            {hotDeals.length > 0 && (
              <div className="px-4 pb-3 border-t border-white/[0.04] pt-3">
                <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider mb-2">
                  Hot Deals ({hotDeals.length})
                </p>
                <div className="flex flex-col gap-1">
                  {hotDeals.slice(0, 3).map(d => (
                    <div key={d.id} className="flex items-center justify-between">
                      <span className="text-[12px] text-zinc-400 truncate max-w-[180px]">{d.company_name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-zinc-500">{stageMap[d.stage_id]?.name}</span>
                        <span className="text-[12px] font-medium text-white">{formatCurrency(d.value ?? 0)}</span>
                      </div>
                    </div>
                  ))}
                  {hotDeals.length > 3 && (
                    <p className="text-[10px] text-zinc-700">+{hotDeals.length - 3} más</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
