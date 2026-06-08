'use client'
import { useMemo } from 'react'
import { formatCurrency } from '@/lib/formatters'
import { STALLED_DEAL_DAYS } from '@/lib/constants'
import type { Deal, DealStage } from '@/types'

interface Props { deals: Deal[]; stages: DealStage[]; memberFilter: string }

function daysSince(d: string) { return Math.floor((Date.now() - new Date(d).getTime()) / 86400000) }

export function SectionE_KillOrAdvance({ deals, stages, memberFilter }: Props) {
  const stageMap = useMemo(() => Object.fromEntries(stages.map(s => [s.id, s])), [stages])

  const candidates = useMemo(() => {
    let d = deals.filter(deal => {
      const stage = stageMap[deal.stage_id]
      if (!stage || stage.is_won || stage.is_lost) return false
      return daysSince(deal.updated_at) >= STALLED_DEAL_DAYS
    })
    if (memberFilter !== 'all') d = d.filter(d => d.account_executive === memberFilter)
    return d.sort((a, b) => daysSince(b.updated_at) - daysSince(a.updated_at))
  }, [deals, stageMap, memberFilter])

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Kill or Advance</p>
        <span className="text-[10px] text-amber-500/70 bg-amber-500/10 px-2 py-0.5 rounded-full">
          {candidates.length} deals estancados
        </span>
        <span className="text-[10px] text-zinc-700 ml-auto">Pendiente de revisión con Nicolás</span>
      </div>
      <div className="bg-zinc-900 border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-medium text-zinc-600 border-b border-white/[0.04] bg-white/[0.02]">
          <div className="col-span-3">Deal</div>
          <div className="col-span-2">AE</div>
          <div className="col-span-3">Stage</div>
          <div className="col-span-1 text-right">Valor</div>
          <div className="col-span-1 text-right">Días</div>
          <div className="col-span-2 text-right">Acción</div>
        </div>
        {candidates.length === 0 ? (
          <p className="text-sm text-zinc-700 px-4 py-6">Sin deals estancados</p>
        ) : candidates.map(d => {
          const days = daysSince(d.updated_at)
          const urgent = days > 14
          return (
            <div key={d.id} className="grid grid-cols-12 px-4 py-2.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors items-center">
              <div className="col-span-3 text-[13px] text-zinc-200 truncate">{d.company_name}</div>
              <div className="col-span-2 text-[12px] text-zinc-500 truncate">{d.account_executive}</div>
              <div className="col-span-3 text-[12px] text-zinc-500 truncate">{stageMap[d.stage_id]?.name ?? '—'}</div>
              <div className="col-span-1 text-right text-[12px] text-zinc-300">{d.value ? formatCurrency(d.value) : '—'}</div>
              <div className={`col-span-1 text-right text-[12px] font-medium ${urgent ? 'text-red-400' : 'text-amber-400'}`}>{days}d</div>
              <div className="col-span-2 flex items-center justify-end gap-1.5">
                <button
                  disabled
                  title="Requiere integración con Nicolás"
                  className="px-2 py-0.5 text-[11px] rounded border border-red-500/30 text-red-500/50 cursor-not-allowed"
                >
                  Kill
                </button>
                <button
                  disabled
                  title="Requiere integración con Nicolás"
                  className="px-2 py-0.5 text-[11px] rounded border border-emerald-500/30 text-emerald-500/50 cursor-not-allowed"
                >
                  Advance
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
