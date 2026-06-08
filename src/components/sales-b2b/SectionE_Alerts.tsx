'use client'
import { useMemo } from 'react'
import { AlertTriangle, TrendingDown, Zap } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'
import { HOT_DEAL_THRESHOLD, STALLED_DEAL_DAYS } from '@/lib/constants'
import type { Deal, DealStage, Filters } from '@/types'

interface Props { deals: Deal[]; stages: DealStage[]; filters: Filters }

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

// Not currently rendered — kept for future use
export function SectionE_Alerts({ deals, stages, filters }: Props) {
  const stageMap = useMemo(() => Object.fromEntries(stages.map((s) => [s.id, s])), [stages])
  const activeDeals = useMemo(() => deals.filter((d) => stageMap[d.stage_id] && !stageMap[d.stage_id]?.is_lost && !stageMap[d.stage_id]?.is_won), [deals, stageMap])
  const stalledDeals = activeDeals.filter((d) => daysSince(d.updated_at) > STALLED_DEAL_DAYS)
  const hotDeals = activeDeals.filter((d) => (d.value ?? 0) >= HOT_DEAL_THRESHOLD)

  return (
    <div>
      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">Alertas</p>
      <div className="flex flex-col gap-2">
        {stalledDeals.length > 0 && (
          <div className="flex items-start gap-3 p-3 rounded-lg border border-white/[0.06] bg-zinc-900">
            <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[13px] font-medium text-white leading-none mb-0.5">Deals estancados</p>
              <p className="text-xs text-zinc-500">{stalledDeals.length} deals sin movimiento por +{STALLED_DEAL_DAYS} dias</p>
            </div>
          </div>
        )}
        {hotDeals.length > 0 && (
          <div className="flex items-start gap-3 p-3 rounded-lg border border-white/[0.06] bg-zinc-900">
            <Zap size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[13px] font-medium text-white leading-none mb-0.5">Deals calientes</p>
              <p className="text-xs text-zinc-500">{hotDeals.length} deals con valor mayor a {formatCurrency(HOT_DEAL_THRESHOLD)}</p>
            </div>
          </div>
        )}
        {stalledDeals.length === 0 && hotDeals.length === 0 && (
          <p className="text-sm text-zinc-600">Sin alertas activas</p>
        )}
      </div>
    </div>
  )
}
