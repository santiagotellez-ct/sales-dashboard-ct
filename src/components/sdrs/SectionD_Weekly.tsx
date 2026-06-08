'use client'
import { useMemo } from 'react'
import { formatPercent } from '@/lib/formatters'
import { useTargets } from '@/contexts/TargetsContext'
import { getISOWeek, getWeeksInQuarter } from '@/lib/dates'
import type { Company, Contact, Activity, Filters } from '@/types'

interface Props { companies: Company[]; contacts: Contact[]; activities: Activity[]; filters: Filters; sdrs: string[] }

function inPeriod(dateStr: string, filters: Filters): boolean {
  if (filters.quarter === 'all') return true
  const date = new Date(dateStr)
  const month = date.getMonth()
  const qStart = (filters.quarter - 1) * 3
  const inQ = date.getFullYear() === filters.year && month >= qStart && month < qStart + 3
  if (!inQ) return false
  if (filters.week === 'all') return true
  return getISOWeek(date) === filters.week
}

export function SectionD_Weekly({ companies, contacts, activities, filters, sdrs }: Props) {
  const { getSdrMeta } = useTargets()

  const filteredCos = useMemo(() => companies.filter(c => inPeriod(c.created_at, filters)), [companies, filters])
  const filteredActs = useMemo(() => activities.filter(a => inPeriod(a.created_at, filters)), [activities, filters])

  const rows = useMemo(() => sdrs.map(sdr => {
    const sdrCos = filteredCos.filter(c => c.sdr === sdr)
    const sdrIds = new Set(sdrCos.map(c => c.id))
    const totalContactos = contacts.filter(ct => sdrIds.has(ct.company_id)).length
    const contactados = sdrCos.filter(c => c.status === 'contactado').length
    const agendados = sdrCos.filter(c => c.status === 'agendado').length
    const totalContacted = contactados + agendados
    const conversion = totalContacted > 0 ? (agendados / totalContacted) * 100 : 0
    const metaC = getSdrMeta(sdr, 'c')
    const metaA = getSdrMeta(sdr, 'a')
    return { sdr, totalContactos, contactados, agendados, conversion, metaC, metaA }
  }).sort((a, b) => b.agendados - a.agendados), [filteredCos, filteredActs, contacts, sdrs, getSdrMeta])

  const periodLabel = filters.quarter === 'all'
    ? `${filters.year}`
    : filters.week === 'all' ? `Q${filters.quarter} ${filters.year}` : `Semana ${filters.week}`

  return (
    <div>
      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">
        Comparación SDRs — {periodLabel}
      </p>
      <div className="bg-zinc-900 border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-medium text-zinc-600 border-b border-white/[0.04] bg-white/[0.02]">
          <div className="col-span-3">SDR</div>
          <div className="col-span-1 text-right">Contactos</div>
          <div className="col-span-2 text-right">Contactados</div>
          <div className="col-span-1 text-right text-zinc-700">Meta</div>
          <div className="col-span-2 text-right">Agendados</div>
          <div className="col-span-1 text-right text-zinc-700">Meta</div>
          <div className="col-span-2 text-right">Conversión</div>
        </div>
        {rows.map(({ sdr, totalContactos, contactados, agendados, conversion, metaC, metaA }) => {
          const pctC = metaC > 0 ? Math.min(100, (contactados / metaC) * 100) : 0
          const pctA = metaA > 0 ? Math.min(100, (agendados / metaA) * 100) : 0
          return (
            <div key={sdr} className="grid grid-cols-12 px-4 py-3 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors items-center">
              <div className="col-span-3 text-[13px] text-zinc-200 font-medium">{sdr}</div>
              <div className="col-span-1 text-right text-[13px] text-zinc-400">{totalContactos}</div>
              <div className="col-span-2 text-right">
                <span className="text-[13px] text-white font-medium">{contactados}</span>
                {metaC > 0 && <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mt-1"><div className="h-full rounded-full" style={{ width: `${pctC}%`, background: pctC >= 100 ? '#10b981' : '#52525b' }} /></div>}
              </div>
              <div className="col-span-1 text-right text-[12px] text-zinc-700">{metaC > 0 ? metaC : '—'}</div>
              <div className="col-span-2 text-right">
                <span className="text-[13px] text-white font-medium">{agendados}</span>
                {metaA > 0 && <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mt-1"><div className="h-full rounded-full" style={{ width: `${pctA}%`, background: pctA >= 100 ? '#10b981' : '#52525b' }} /></div>}
              </div>
              <div className="col-span-1 text-right text-[12px] text-zinc-700">{metaA > 0 ? metaA : '—'}</div>
              <div className="col-span-2 text-right text-[13px] text-zinc-400">{formatPercent(conversion, 1)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
