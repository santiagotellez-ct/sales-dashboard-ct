'use client'
import { useMemo } from 'react'
import { MetricCard } from '@/components/shared/MetricCard'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import { useTargets } from '@/contexts/TargetsContext'
import type { Deal, DealStage, Filters } from '@/types'

interface Props { deals: Deal[]; stages: DealStage[]; filters: Filters; memberFilter: string }

function inPeriod(dateStr: string, filters: Filters): boolean {
  if (filters.quarter === 'all') return true
  const date = new Date(dateStr)
  const month = date.getMonth()
  const qStart = (filters.quarter - 1) * 3
  return date.getFullYear() === filters.year && month >= qStart && month < qStart + 3
}

export function SectionA_KPIs({ deals, stages, filters, memberFilter }: Props) {
  const { getTarget } = useTargets()
  const { year, quarter } = filters

  const stageMap = useMemo(() => Object.fromEntries(stages.map(s => [s.id, s])), [stages])

  const filtered = useMemo(() => {
    let d = deals.filter(d => inPeriod(d.created_at, filters))
    if (memberFilter !== 'all') d = d.filter(d => d.account_executive === memberFilter)
    return d
  }, [deals, filters, memberFilter])

  const wonIds = useMemo(() => stages.filter(s => s.is_won || s.name === 'Commited').map(s => s.id), [stages])
  const activeIds = useMemo(() => stages.filter(s => !s.is_lost).map(s => s.id), [stages])

  const revenueCerrado = useMemo(() =>
    filtered.filter(d => wonIds.includes(d.stage_id)).reduce((s, d) => s + (d.value ?? 0), 0),
    [filtered, wonIds])

  const pipelineActivo = useMemo(() =>
    filtered.filter(d => activeIds.includes(d.stage_id) && !stageMap[d.stage_id]?.is_won).reduce((s, d) => s + (d.value ?? 0), 0),
    [filtered, activeIds, stageMap])

  const weightedPipeline = useMemo(() =>
    filtered.filter(d => !stageMap[d.stage_id]?.is_lost).reduce((s, d) => {
      const prob = stageMap[d.stage_id]?.probability ?? 0
      return s + (d.value ?? 0) * (prob / 100)
    }, 0),
    [filtered, stageMap])

  const target = quarter !== 'all' ? getTarget(year, quarter) : 0
  const coverage = target > 0 ? (pipelineActivo / target) * 100 : null
  const forecast = revenueCerrado + weightedPipeline

  return (
    <div>
      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">KPIs del Pipeline</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard label="Revenue Cerrado" value={formatCurrency(revenueCerrado)} sub="Committed + Ganado" size="lg" />
        <MetricCard label="Pipeline Activo" value={formatCurrency(pipelineActivo)} sub="Deals no cerrados ni perdidos" size="lg" />
        <MetricCard
          label="Pipeline Coverage"
          value={coverage !== null ? formatPercent(coverage, 0) : '—'}
          sub={target > 0 ? `vs meta ${formatCurrency(target)}` : 'Sin meta definida'}
          size="lg"
        >
          {coverage !== null && (
            <div className="mt-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, coverage)}%`, background: coverage >= 100 ? '#10b981' : coverage >= 70 ? '#e4e4e7' : '#52525b' }}
              />
            </div>
          )}
        </MetricCard>
        <MetricCard label="Weighted Pipeline" value={formatCurrency(weightedPipeline)} sub="Valor ponderado por probabilidad" size="lg" />
        <MetricCard label="Forecast" value={formatCurrency(forecast)} sub="Cerrado + Weighted pipeline" size="lg" />
      </div>
    </div>
  )
}
