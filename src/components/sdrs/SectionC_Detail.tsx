'use client'
import { useMemo } from 'react'
import { formatPercent } from '@/lib/formatters'
import type { Company, Contact, Filters } from '@/types'

interface Props { companies: Company[]; contacts: Contact[]; filters: Filters; sdrs: string[] }

function inPeriod(dateStr: string, filters: Filters): boolean {
  if (filters.quarter === 'all') return true
  const date = new Date(dateStr)
  const month = date.getMonth()
  const qStart = (filters.quarter - 1) * 3
  return date.getFullYear() === filters.year && month >= qStart && month < qStart + 3
}

export function SectionC_Detail({ companies, contacts, filters, sdrs }: Props) {
  const filtered = useMemo(() => companies.filter(c => inPeriod(c.created_at, filters)), [companies, filters])

  const rows = useMemo(() => sdrs.map(sdr => {
    const sdrCos = filtered.filter(c => c.sdr === sdr)
    const sdrIds = new Set(sdrCos.map(c => c.id))
    const totalContactos = contacts.filter(ct => sdrIds.has(ct.company_id)).length
    const contactados = sdrCos.filter(c => c.status === 'contactado').length
    const agendados = sdrCos.filter(c => c.status === 'agendado').length
    const totalContacted = contactados + agendados
    const conversion = totalContacted > 0 ? (agendados / totalContacted) * 100 : 0
    return { sdr, totalContactos, contactados, agendados, conversion }
  }).sort((a, b) => b.agendados - a.agendados), [filtered, contacts, sdrs])

  return (
    <div>
      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">Detalle por SDR</p>
      <div className="bg-zinc-900 border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-medium text-zinc-600 border-b border-white/[0.04] bg-white/[0.02]">
          <div className="col-span-4">SDR</div>
          <div className="col-span-2 text-right">Contactos</div>
          <div className="col-span-2 text-right">Contactados</div>
          <div className="col-span-2 text-right">Agendados</div>
          <div className="col-span-2 text-right">% Conversión</div>
        </div>
        {rows.map(({ sdr, totalContactos, contactados, agendados, conversion }) => (
          <div key={sdr} className="grid grid-cols-12 px-4 py-2.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors items-center">
            <div className="col-span-4 text-[13px] text-zinc-200 font-medium">{sdr}</div>
            <div className="col-span-2 text-right text-[13px] text-zinc-400">{totalContactos}</div>
            <div className="col-span-2 text-right text-[13px] text-zinc-300">{contactados}</div>
            <div className="col-span-2 text-right text-[13px] text-white font-medium">{agendados}</div>
            <div className="col-span-2 text-right">
              <span className="text-[13px] text-zinc-400">{formatPercent(conversion, 1)}</span>
              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-zinc-500 rounded-full" style={{ width: `${Math.min(100, conversion)}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
