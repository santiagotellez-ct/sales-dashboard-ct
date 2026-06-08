'use client'
import { useMemo } from 'react'
import type { Company, Filters } from '@/types'

interface Props { companies: Company[]; filters: Filters }

const STATUS_LABELS: Record<string, string> = {
  por_contactar: 'Por contactar',
  contactado: 'Contactado',
  agendado: 'Agendado',
  en_conversacion: 'En conversación',
  reagendar: 'Reagendar',
  unqualified: 'Unqualified',
  unqualified_post_reunion: 'Unqualified post reunión',
  no_stage: 'No stage',
}

function inPeriod(dateStr: string, filters: Filters): boolean {
  if (filters.quarter === 'all') return true
  const date = new Date(dateStr)
  const month = date.getMonth()
  const qStart = (filters.quarter - 1) * 3
  return date.getFullYear() === filters.year && month >= qStart && month < qStart + 3
}

export function SectionB_Distribution({ companies, filters }: Props) {
  const filtered = useMemo(() => companies.filter(c => inPeriod(c.created_at, filters)), [companies, filters])

  const distribution = useMemo(() => {
    const counts: Record<string, number> = {}
    filtered.forEach(c => {
      const key = c.status ?? 'no_stage'
      counts[key] = (counts[key] ?? 0) + 1
    })
    const total = filtered.length
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([status, count]) => ({
        status,
        label: STATUS_LABELS[status] ?? status,
        count,
        pct: total > 0 ? (count / total) * 100 : 0
      }))
  }, [filtered])

  const total = filtered.length

  return (
    <div>
      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">
        Distribución por Etapa — {total} empresas
      </p>
      <div className="bg-zinc-900 border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-medium text-zinc-600 border-b border-white/[0.04] bg-white/[0.02]">
          <div className="col-span-5">Etapa</div>
          <div className="col-span-4 px-3">Distribución</div>
          <div className="col-span-2 text-right">Empresas</div>
          <div className="col-span-1 text-right">%</div>
        </div>
        {distribution.map(({ status, label, count, pct }) => (
          <div key={status} className="grid grid-cols-12 px-4 py-2.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors items-center">
            <div className="col-span-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 flex-shrink-0" />
              <span className="text-[13px] text-zinc-300">{label}</span>
            </div>
            <div className="col-span-4 px-3">
              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-500 rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div className="col-span-2 text-right text-[13px] font-medium text-white">{count}</div>
            <div className="col-span-1 text-right text-[13px] text-zinc-500">{pct.toFixed(0)}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}
