'use client'
import { useMemo } from 'react'
import { MetricCard } from '@/components/shared/MetricCard'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import { getISOWeek } from '@/lib/dates'
import { useTargets } from '@/contexts/TargetsContext'
import type { Deal, DealStage, Filters } from '@/types'

interface Props { deals: Deal[]; stages: DealStage[]; filters: Filters }

function inPeriod(dateStr: string, filters: Filters): boolean {
  if (filters.quarter === 'all') return true
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth()
  const qStart = (filters.quarter - 1) * 3
  const inQ = year === filters.year && month >= qStart && month < qStart + 3
  if (!inQ) return false
  if (filters.week === 'all') return true
  return getISOWeek(date) === filters.week
}

export function SectionA_Revenue({ deals, stages, filters }: Props) {
  const { quarter, year } = filters
  const { getTarget } = useTargets()

  const wonStageIds = useMemo(
    () => stages.filter((s) => s.is_won || s.name === 'Commited').map((s) => s.id),
    [stages]
  )
  const pipelineStageIds = useMemo(
    () => stages.filter((s) => !s.is_lost).map((s) => s.id),
    [stages]
  )

  const filteredDeals = useMemo(
    () => deals.filter((d) => inPeriod(d.created_at, filters)),
    [deals, filters]
  )

  const revenueCerrado = useMemo(
    () => filteredDeals.filter((d) => wonStageIds.includes(d.stage_id)).reduce((s, d) => s + (d.value ?? 0), 0),
    [filteredDeals, wonStageIds]
  )
  const revenuePipeline = useMemo(
    () => filteredDeals.filter((d) => pipelineStageIds.includes(d.stage_id)).reduce((s, d) => s + (d.value ?? 0), 0),
    [filteredDeals, pipelineStageIds]
  )

  const target = quarter !== 'all' ? getTarget(year, quarter) : 0
  const gap = target > 0 ? Math.max(0, target - revenueCerrado) : null
  const pctMeta = target > 0 ? (revenueCerrado / target) * 100 : null

  const periodLabel = quarter === 'all' ? 'Todos los Q' : `Q${quarter}`

  return (
    <div>
      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">Revenue y Metas</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Revenue Cerrado" value={formatCurrency(revenueCerrado)} sub={'Committed + Cierre ganado'} size="lg" />
        <MetricCard label="Revenue Pipeline" value={formatCurrency(revenuePipeline)} sub="Todas las etapas activas" size="lg" />
        <MetricCard
          label="Gap a Meta"
          value={gap !== null ? formatCurrency(gap) : '—'}
          sub={target > 0 ? `Meta ${periodLabel}: ${formatCurrency(target)}` : 'Sin meta definida para todo el año'}
          size="lg"
        />
        <MetricCard
          label="% Meta Ejecutado"
          value={pctMeta !== null ? formatPercent(pctMeta) : '—'}
          sub={target > 0 ? `${formatCurrency(revenueCerrado)} de ${formatCurrency(target)}` : 'Selecciona un Q para ver meta'}
          size="lg"
        >
          {pctMeta !== null && (
            <div className="mt-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min(100, pctMeta)}%` }} />
            </div>
          )}
        </MetricCard>
      </div>
    </div>
  )
}
