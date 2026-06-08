'use client'
import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { MetricCard } from '@/components/shared/MetricCard'
import { formatPercent } from '@/lib/formatters'
import { getISOWeek, getWeeksInQuarter } from '@/lib/dates'
import type { Company, Activity, Filters } from '@/types'

interface Props { companies: Company[]; activities: Activity[]; filters: Filters }

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

export function SectionC_SdrFlow({ companies, activities, filters }: Props) {
  const periodLabel = filters.quarter === 'all'
    ? 'Todo'
    : filters.week === 'all'
      ? `Q${filters.quarter} ${filters.year}`
      : `Semana ${filters.week}`

  const filtered = useMemo(
    () => companies.filter((c) => inPeriod(c.created_at, filters)),
    [companies, filters]
  )

  const porContactar = useMemo(
    () => filtered.filter((c) => c.status === 'por_contactar').length,
    [filtered]
  )

  const contactados = useMemo(
    () => filtered.filter((c) => c.status === 'contactado').length,
    [filtered]
  )

  const agendados = useMemo(
    () => filtered.filter((c) => c.status === 'agendado').length,
    [filtered]
  )

  // Gap = contactados que aún no pasaron a agendado (status = contactado)
  const gap = contactados
  // Conversión = agendados / (contactados + agendados)
  const totalContactedEver = contactados + agendados
  const conversion = totalContactedEver > 0 ? (agendados / totalContactedEver) * 100 : 0

  // Trend: weekly breakdown within the selected quarter (or all quarters)
  const trendData = useMemo(() => {
    if (filters.quarter === 'all') {
      return ([1, 2, 3, 4] as const).map((q) => {
        const qCos = companies.filter((c) => {
          const d = new Date(c.created_at)
          const month = d.getMonth()
          const qStart = (q - 1) * 3
          return d.getFullYear() === filters.year && month >= qStart && month < qStart + 3
        })
        return {
          week: `Q${q}`,
          contactados: qCos.filter((c) => c.status === 'contactado').length,
          agendados: qCos.filter((c) => c.status === 'agendado').length,
        }
      })
    }

    const weeks = getWeeksInQuarter(filters.year, filters.quarter)
    const currentWeek = getISOWeek(new Date())
    const isCurrentQ =
      filters.year === new Date().getFullYear() &&
      filters.quarter === Math.ceil((new Date().getMonth() + 1) / 3)

    return weeks
      .filter((w) => !isCurrentQ || w <= currentWeek)
      .map((w) => {
        const wCos = companies.filter((c) => {
          const d = new Date(c.created_at)
          const month = d.getMonth()
          const qStart = (filters.quarter as number - 1) * 3
          const inQ = d.getFullYear() === filters.year && month >= qStart && month < qStart + 3
          return inQ && getISOWeek(d) === w
        })
        return {
          week: `S${w}`,
          contactados: wCos.filter((c) => c.status === 'contactado').length,
          agendados: wCos.filter((c) => c.status === 'agendado').length,
        }
      })
  }, [companies, filters])

  return (
    <div>
      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">
        Flujo SDR–AE — {periodLabel}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <MetricCard label="Por contactar" value={porContactar} sub={periodLabel} />
        <MetricCard label="Contactados" value={contactados} sub="Status actual" />
        <MetricCard label="Agendados" value={agendados} sub="Status actual" />
        <MetricCard label="Gap (sin agendar)" value={gap} sub="Contactados no convertidos" />
        <MetricCard label="Conversión" value={formatPercent(conversion, 1)} sub="Contactados → Agendados">
          <div className="mt-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, conversion)}%` }} />
          </div>
        </MetricCard>
      </div>

      <div className="bg-zinc-900 border border-white/[0.06] rounded-xl p-4">
        <p className="text-xs text-zinc-500 mb-4">
          {filters.quarter === 'all'
            ? `Por quarter ${filters.year} — Contactados vs Agendados`
            : `Semana a semana — Contactados vs Agendados · Q${filters.quarter} ${filters.year}`}
        </p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={trendData} barSize={14} barGap={4}>
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#52525b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#52525b' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#141417', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#a1a1aa' }}
              itemStyle={{ color: '#e4e4e7' }}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: '#52525b' }} />
            <Bar dataKey="contactados" name="Contactados" fill="#3f3f46" radius={[3, 3, 0, 0]} />
            <Bar dataKey="agendados" name="Agendados" fill="#e4e4e7" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
