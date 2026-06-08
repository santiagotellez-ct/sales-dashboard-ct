'use client'
import { useMemo } from 'react'
import { formatCurrency } from '@/lib/formatters'
import { getISOWeek } from '@/lib/dates'
import type { Deal, DealStage } from '@/types'

interface Props { deals: Deal[]; stages: DealStage[]; memberFilter: string }

function daysSince(d: string) { return Math.floor((Date.now() - new Date(d).getTime()) / 86400000) }

export function SectionD_Cohort({ deals, stages, memberFilter }: Props) {
  const stageMap = useMemo(() => Object.fromEntries(stages.map(s => [s.id, s])), [stages])
  const currentWeek = getISOWeek(new Date())

  function weekOf(dateStr: string) {
    const d = new Date(dateStr)
    d.setHours(0,0,0,0); d.setDate(d.getDate()+3-((d.getDay()+6)%7))
    const w1 = new Date(d.getFullYear(),0,4)
    return 1+Math.round(((d.getTime()-w1.getTime())/86400000-3+((w1.getDay()+6)%7))/7)
  }

  const cohorts = useMemo(() => {
    let d = deals
    if (memberFilter !== 'all') d = d.filter(d => d.account_executive === memberFilter)
    const thisWeek = d.filter(deal => weekOf(deal.updated_at) === currentWeek)
    const lastWeek = d.filter(deal => weekOf(deal.updated_at) === currentWeek - 1)
    return [
      { label: 'Esta semana', deals: thisWeek },
      { label: 'Semana pasada', deals: lastWeek },
    ]
  }, [deals, memberFilter, currentWeek])

  function status(d: Deal): { label: string; color: string } {
    const stage = stageMap[d.stage_id]
    if (!stage) return { label: 'Sin etapa', color: 'text-zinc-600' }
    if (stage.is_won) return { label: 'Ganado', color: 'text-emerald-400' }
    if (stage.is_lost) return { label: 'Perdido', color: 'text-red-400' }
    if (stage.name === 'Commited') return { label: 'Committed', color: 'text-blue-400' }
    const days = daysSince(d.updated_at)
    if (days > 7) return { label: `Estancado (${days}d)`, color: 'text-amber-400' }
    return { label: 'Activo', color: 'text-zinc-400' }
  }

  return (
    <div>
      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">Cohort Semanal</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {cohorts.map(({ label, deals: cohortDeals }) => (
          <div key={label} className="bg-zinc-900 border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-400">{label}</p>
              <span className="text-[11px] text-zinc-600">{cohortDeals.length} deals</span>
            </div>
            {cohortDeals.length === 0 ? (
              <p className="text-sm text-zinc-700 px-4 py-6">Sin actividad</p>
            ) : (
              <div>
                <div className="grid grid-cols-12 px-4 py-2 text-[11px] text-zinc-600 border-b border-white/[0.03] bg-white/[0.01]">
                  <div className="col-span-4">Deal</div>
                  <div className="col-span-2">AE</div>
                  <div className="col-span-2">Stage</div>
                  <div className="col-span-2 text-right">Valor</div>
                  <div className="col-span-2 text-right">Estado</div>
                </div>
                {cohortDeals.slice(0, 10).map(d => {
                  const { label: sLabel, color } = status(d)
                  return (
                    <div key={d.id} className="grid grid-cols-12 px-4 py-2 border-b border-white/[0.02] last:border-0 hover:bg-white/[0.02] transition-colors items-center">
                      <div className="col-span-4 text-[12px] text-zinc-300 truncate">{d.company_name}</div>
                      <div className="col-span-2 text-[12px] text-zinc-500 truncate">{d.account_executive}</div>
                      <div className="col-span-2 text-[11px] text-zinc-600 truncate">{stageMap[d.stage_id]?.name ?? '—'}</div>
                      <div className="col-span-2 text-right text-[12px] text-zinc-300">{d.value ? formatCurrency(d.value) : '—'}</div>
                      <div className={`col-span-2 text-right text-[11px] ${color}`}>{sLabel}</div>
                    </div>
                  )
                })}
                {cohortDeals.length > 10 && (
                  <p className="text-[11px] text-zinc-700 px-4 py-2">+{cohortDeals.length - 10} más</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
