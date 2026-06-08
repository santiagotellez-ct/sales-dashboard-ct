'use client'
import { useMemo } from 'react'
import { MetricCard } from '@/components/shared/MetricCard'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import { getISOWeek } from '@/lib/dates'
import { STALLED_DEAL_DAYS } from '@/lib/constants'
import type { Deal, DealStage, Company, Filters } from '@/types'

interface Props { deals: Deal[]; stages: DealStage[]; companies: Company[]; filters: Filters }

function daysSince(d: string) { return Math.floor((Date.now() - new Date(d).getTime()) / 86400000) }

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

export function SectionD_Pipeline({ deals, stages, companies, filters }: Props) {
  const stageMap = useMemo(() => Object.fromEntries(stages.map((s) => [s.id, s])), [stages])

  const filteredDeals = useMemo(
    () => deals.filter((d) => inPeriod(d.created_at, filters)),
    [deals, filters]
  )
  const filteredCompanies = useMemo(
    () => companies.filter((c) => inPeriod(c.created_at, filters)),
    [companies, filters]
  )

  const activeDeals = useMemo(() => filteredDeals.filter((d) => stageMap[d.stage_id] && !stageMap[d.stage_id].is_lost), [filteredDeals, stageMap])
  const wonDeals = useMemo(() => filteredDeals.filter((d) => stageMap[d.stage_id]?.is_won), [filteredDeals, stageMap])
  const lostDeals = useMemo(() => filteredDeals.filter((d) => stageMap[d.stage_id]?.is_lost), [filteredDeals, stageMap])
  const stalledDeals = useMemo(() => activeDeals.filter((d) => !stageMap[d.stage_id]?.is_won && daysSince(d.updated_at) > STALLED_DEAL_DAYS), [activeDeals, stageMap])

  // Committed = deals en etapa Commited (alta probabilidad, no is_won aún)
  const committedDeals = useMemo(
    () => filteredDeals.filter((d) => stageMap[d.stage_id]?.name === 'Commited' && !stageMap[d.stage_id]?.is_won),
    [filteredDeals, stageMap]
  )
  // Win Rate = (Committed + Ganados) / todos los que no están perdidos
  const winNumerator = wonDeals.length + committedDeals.length
  const winDenominator = filteredDeals.filter((d) => !stageMap[d.stage_id]?.is_lost).length
  const winRate = winDenominator > 0 ? (winNumerator / winDenominator) * 100 : 0

  const porContactar = filteredCompanies.filter((c) => c.status === 'por_contactar').length
  const contactado = filteredCompanies.filter((c) => c.status === 'contactado').length
  const agendado = filteredCompanies.filter((c) => c.status === 'agendado').length

  const stageBreakdown = useMemo(() => {
    const totalValue = stages.filter((s) => !s.is_lost).reduce((sum, s) => {
      return sum + filteredDeals.filter((d) => d.stage_id === s.id).reduce((sv, d) => sv + (d.value ?? 0), 0)
    }, 0)
    const active = stages.filter((s) => !s.is_lost).sort((a, b) => a.order - b.order).map((stage) => {
      const sd = filteredDeals.filter((d) => d.stage_id === stage.id)
      const value = sd.reduce((s, d) => s + (d.value ?? 0), 0)
      return { stage, count: sd.length, value, pct: totalValue > 0 ? (value / totalValue) * 100 : 0, isLost: false }
    }).filter((r) => r.count > 0 || r.stage.is_won)
    const lost = stages.filter((s) => s.is_lost).sort((a, b) => a.order - b.order).map((stage) => {
      const sd = filteredDeals.filter((d) => d.stage_id === stage.id)
      const value = sd.reduce((s, d) => s + (d.value ?? 0), 0)
      return { stage, count: sd.length, value, pct: 0, isLost: true }
    }).filter((r) => r.count > 0)
    return [...active, ...lost]
  }, [stages, filteredDeals])

  return (
    <div>
      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">Pipeline por Etapa</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <MetricCard label="Win Rate" value={formatPercent(winRate, 1)} sub={`${winNumerator} committed+ganados / ${winDenominator} activos`}>
          <div className="mt-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, winRate)}%` }} />
          </div>
        </MetricCard>
        <MetricCard label="Deals Activos" value={activeDeals.length} sub="En pipeline" />
        <MetricCard label="Stand By" value={stalledDeals.length} sub={`+${STALLED_DEAL_DAYS} días sin movimiento`} />
        <MetricCard label="Perdidos" value={lostDeals.length} sub="Cierre perdido" />
      </div>

      <div className="bg-zinc-900 border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.04]">
          <p className="text-xs text-zinc-500">Detalle por Etapa</p>
        </div>
        <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-medium text-zinc-600 border-b border-white/[0.04] bg-white/[0.02]">
          <div className="col-span-5">Etapa</div>
          <div className="col-span-2 text-right">Deals</div>
          <div className="col-span-3 text-right">Valor</div>
          <div className="col-span-2 text-right">% Total</div>
        </div>

        {[
          { label: 'Por contactar', count: porContactar },
          { label: 'Contactado', count: contactado },
          { label: 'Agendado', count: agendado },
        ].map(({ label, count }) => (
          <div key={label} className="grid grid-cols-12 px-4 py-2.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
            <div className="col-span-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 flex-shrink-0" />
              <span className="text-[13px] text-zinc-500">{label}</span>
              <span className="text-[10px] text-zinc-700">empresas</span>
            </div>
            <div className="col-span-2 text-right text-[13px] text-zinc-300 font-medium">{count}</div>
            <div className="col-span-3 text-right text-[13px] text-zinc-700">—</div>
            <div className="col-span-2 text-right text-[13px] text-zinc-700">—</div>
          </div>
        ))}

        {stageBreakdown.map(({ stage, count, value, pct, isLost }) => {
          const dot = isLost ? 'bg-red-500/70' : stage.is_won ? 'bg-emerald-500' : stage.probability >= 65 ? 'bg-zinc-400' : 'bg-zinc-600'
          return (
            <div key={stage.id} className="grid grid-cols-12 px-4 py-2.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
              <div className="col-span-5 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />
                <span className="text-[13px] text-zinc-200">{stage.name}</span>
              </div>
              <div className="col-span-2 text-right text-[13px] font-medium text-white">{count}</div>
              <div className="col-span-3 text-right text-[13px] text-zinc-300">{value > 0 ? formatCurrency(value) : '—'}</div>
              <div className="col-span-2 text-right text-[13px] text-zinc-500">{pct > 0 ? formatPercent(pct, 0) : '—'}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
