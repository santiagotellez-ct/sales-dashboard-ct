'use client'
import { useMemo } from 'react'
import { MetricCard } from '@/components/shared/MetricCard'
import { formatPercent } from '@/lib/formatters'
import type { Company, Contact, Filters } from '@/types'

interface Props { companies: Company[]; contacts: Contact[]; filters: Filters }

function inPeriod(dateStr: string, filters: Filters): boolean {
  if (filters.quarter === 'all') return true
  const date = new Date(dateStr)
  const month = date.getMonth()
  const qStart = (filters.quarter - 1) * 3
  return date.getFullYear() === filters.year && month >= qStart && month < qStart + 3
}

export function SectionA_MeetingTitans({ companies, contacts, filters }: Props) {
  const filtered = useMemo(() => companies.filter(c => inPeriod(c.created_at, filters)), [companies, filters])
  const companyIds = useMemo(() => new Set(filtered.map(c => c.id)), [filtered])

  const totalContactos = useMemo(
    () => contacts.filter(ct => companyIds.has(ct.company_id)).length,
    [contacts, companyIds]
  )
  const contactados = useMemo(() => filtered.filter(c => c.status === 'contactado').length, [filtered])
  const agendados = useMemo(() => filtered.filter(c => c.status === 'agendado').length, [filtered])
  const totalContacted = contactados + agendados
  const conversion = totalContacted > 0 ? (agendados / totalContacted) * 100 : 0

  const periodLabel = filters.quarter === 'all' ? `${filters.year}` : `Q${filters.quarter} ${filters.year}`

  return (
    <div>
      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">
        Meeting Titans — {periodLabel}
      </p>
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Total Contactos" value={totalContactos} sub="Registros en el CRM" size="lg" />
        <MetricCard label="Contactados" value={contactados} sub="En proceso — status contactado" size="lg" />
        <MetricCard label="Agendados" value={agendados} sub={`${formatPercent(conversion, 1)} de conversión vs contactados`} size="lg">
          <div className="mt-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, conversion)}%` }} />
          </div>
        </MetricCard>
      </div>
    </div>
  )
}
