'use client'
import { useMemo } from 'react'
import { formatCurrency } from '@/lib/formatters'
import { getISOWeek } from '@/lib/dates'
import type { Deal, DealStage, Company, Contact, Filters } from '@/types'

interface Props { deals: Deal[]; stages: DealStage[]; companies: Company[]; contacts: Contact[]; filters: Filters }

const STATUSES = ['por_contactar', 'contactado', 'agendado'] as const
const STATUS_LABELS: Record<string, string> = { por_contactar: 'Por contactar', contactado: 'Contactado', agendado: 'Agendado' }
const STATUS_COLORS: Record<string, string> = { por_contactar: 'bg-zinc-700', contactado: 'bg-zinc-500', agendado: 'bg-white' }
const DOT_COLORS: Record<string, string> = { por_contactar: 'bg-zinc-700', contactado: 'bg-zinc-500', agendado: 'bg-white' }

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

export function SectionB_Team({ deals, stages, companies, contacts, filters }: Props) {
  const closedStageIds = useMemo(
    () => stages.filter((s) => s.is_won || s.name === 'Commited').map((s) => s.id),
    [stages]
  )

  const filteredDeals = useMemo(
    () => deals.filter((d) => inPeriod(d.created_at, filters)),
    [deals, filters]
  )

  const filteredCompanies = useMemo(
    () => companies.filter((c) => inPeriod(c.created_at, filters)),
    [companies, filters]
  )

  const aeRevenue = useMemo(() => {
    const map: Record<string, number> = {}
    filteredDeals.filter((d) => closedStageIds.includes(d.stage_id)).forEach((d) => {
      const ae = d.account_executive || 'Sin AE'
      map[ae] = (map[ae] ?? 0) + (d.value ?? 0)
    })
    return Object.entries(map).map(([ae, revenue]) => ({ ae, revenue })).sort((a, b) => b.revenue - a.revenue)
  }, [filteredDeals, closedStageIds])

  const maxRevenue = Math.max(...aeRevenue.map((r) => r.revenue), 1)

  const sdrStats = useMemo(() => {
    const sdrs = [...new Set(filteredCompanies.map((c) => c.sdr).filter(Boolean))] as string[]
    return sdrs.map((sdr) => {
      const sdrCos = filteredCompanies.filter((c) => c.sdr === sdr)
      const totalContacts = contacts.filter((ct) => sdrCos.map((c) => c.id).includes(ct.company_id)).length
      const breakdown = Object.fromEntries(STATUSES.map((s) => [s, sdrCos.filter((c) => c.status === s).length]))
      return { sdr, companies: sdrCos.length, contacts: totalContacts, breakdown }
    }).sort((a, b) => b.companies - a.companies)
  }, [filteredCompanies, contacts])

  return (
    <div>
      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">Resumen del Equipo</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="bg-zinc-900 border border-white/[0.06] rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-4">Revenue por AE — Committed + Ganado</p>
          {aeRevenue.length === 0 ? (
            <p className="text-sm text-zinc-600">Sin datos para este período</p>
          ) : (
            <div className="flex flex-col gap-4">
              {aeRevenue.map(({ ae, revenue }) => (
                <div key={ae}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-zinc-300">{ae}</span>
                    <span className="text-sm font-semibold text-white">{formatCurrency(revenue)}</span>
                  </div>
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: `${(revenue / maxRevenue) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-white/[0.06] rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-4">SDRs — Cobertura de Prospectos</p>
          {sdrStats.length === 0 ? (
            <p className="text-sm text-zinc-600">Sin SDRs asignados</p>
          ) : (
            <div className="flex flex-col gap-5">
              {sdrStats.map(({ sdr, companies: numCo, contacts: numCt, breakdown }) => (
                <div key={sdr}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-300">{sdr}</span>
                    <div className="flex items-center gap-3 text-xs text-zinc-600">
                      <span><strong className="text-zinc-300">{numCo}</strong> empresas</span>
                      <span><strong className="text-zinc-300">{numCt}</strong> contactos</span>
                    </div>
                  </div>
                  <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
                    {STATUSES.map((status) => {
                      const pct = numCo > 0 ? ((breakdown[status] ?? 0) / numCo) * 100 : 0
                      return pct > 0 ? (
                        <div key={status} className={STATUS_COLORS[status]} style={{ width: `${pct}%` }} title={`${STATUS_LABELS[status]}: ${breakdown[status]}`} />
                      ) : null
                    })}
                  </div>
                  <div className="flex gap-3 mt-1.5">
                    {STATUSES.map((status) => (
                      <span key={status} className="flex items-center gap-1 text-[10px] text-zinc-600">
                        <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[status]}`} />
                        {STATUS_LABELS[status]} {breakdown[status] ?? 0}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
