'use client'
import { useMemo } from 'react'
import { formatPercent } from '@/lib/formatters'
import type { Deal, DealStage, Filters } from '@/types'

interface Props { deals: Deal[]; stages: DealStage[]; filters: Filters; memberFilter: string }

function inPeriod(dateStr: string, filters: Filters): boolean {
  if (filters.quarter === 'all') return true
  const date = new Date(dateStr)
  const month = date.getMonth()
  const qStart = (filters.quarter - 1) * 3
  return date.getFullYear() === filters.year && month >= qStart && month < qStart + 3
}

const FUNNEL_PAIRS = [
  ['Discovery realizada', 'Propuesta presentada', 'Discovery → Prop. Presentada'],
  ['Propuesta presentada', 'Propuesta revisada', 'Prop. Presentada → Prop. Revisión'],
  ['Propuesta revisada', 'Propuesta en negociación', 'Prop. Revisión → Negociación'],
  ['Propuesta en negociación', 'Commited', 'Negociación → Committed'],
  ['Commited', 'Cierre ganado', 'Committed → Ganado'],
]

export function SectionC_Conversion({ deals, stages, filters, memberFilter }: Props) {
  const stageByName = useMemo(() => {
    const m: Record<string, DealStage> = {}
    stages.forEach(s => { m[s.name.toLowerCase()] = s })
    return m
  }, [stages])

  const filtered = useMemo(() => {
    let d = deals.filter(d => inPeriod(d.created_at, filters))
    if (memberFilter !== 'all') d = d.filter(d => d.account_executive === memberFilter)
    return d
  }, [deals, filters, memberFilter])

  const rows = useMemo(() => FUNNEL_PAIRS.map(([from, to, label]) => {
    const fromStage = stageByName[from.toLowerCase()] ?? stageByName[from.replace('Cierre ganado', 'cierre ganado').toLowerCase()]
    const toStage = stageByName[to.toLowerCase()] ?? stages.find(s => s.is_won && s.name !== 'Commited')
    const fromCount = fromStage ? filtered.filter(d => d.stage_id === fromStage.id).length : 0
    const toCount = toStage ? filtered.filter(d => d.stage_id === toStage.id).length : 0
    const total = fromCount + toCount
    const rate = total > 0 ? (toCount / total) * 100 : 0
    return { label, fromCount, toCount, rate }
  }), [filtered, stageByName, stages])

  return (
    <div>
      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">Conversión entre Etapas</p>
      <div className="grid grid-cols-5 gap-3">
        {rows.map(({ label, fromCount, toCount, rate }) => (
          <div key={label} className="bg-zinc-900 border border-white/[0.06] rounded-xl p-4">
            <p className="text-[11px] text-zinc-600 leading-snug mb-3">{label}</p>
            <p className="text-2xl font-bold text-white mb-1">{formatPercent(rate, 0)}</p>
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mb-3">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${rate}%`, background: rate >= 50 ? '#e4e4e7' : '#52525b' }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-700">
              <span>{fromCount} origen</span>
              <span>{toCount} siguiente</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
