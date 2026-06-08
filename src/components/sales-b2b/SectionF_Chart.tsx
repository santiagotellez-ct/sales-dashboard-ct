'use client'
import { useMemo } from 'react'
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { formatCurrency } from '@/lib/formatters'
import { getWeeksInQuarter, getISOWeek } from '@/lib/dates'
import { useTargets } from '@/contexts/TargetsContext'
import type { Deal, DealStage, Filters } from '@/types'

interface Props { deals: Deal[]; stages: DealStage[]; filters: Filters }

export function SectionF_Chart({ deals, stages, filters }: Props) {
  const { quarter, year } = filters
  const { getTarget } = useTargets()

  const closedStageIds = useMemo(
    () => stages.filter((s) => s.is_won || s.name === 'Commited').map((s) => s.id),
    [stages]
  )

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-[#141417] border border-white/10 rounded-lg p-3 text-xs shadow-xl">
        <p className="font-medium text-zinc-400 mb-1.5">{label}</p>
        {payload.map((p: any) =>
          p.value != null && (
            <p key={p.dataKey} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              <span style={{ color: p.color }}>{p.name}:</span>
              <span className="text-white font-medium">{formatCurrency(p.value)}</span>
            </p>
          )
        )}
      </div>
    )
  }

  // "Todo" view: bar chart per quarter
  const allQuartersData = useMemo(() => {
    if (quarter !== 'all') return []
    return ([1, 2, 3, 4] as const).map((q) => {
      const revenue = deals
        .filter((d) => {
          if (!closedStageIds.includes(d.stage_id)) return false
          const date = new Date(d.created_at)
          const month = date.getMonth()
          const qStart = (q - 1) * 3
          return date.getFullYear() === year && month >= qStart && month < qStart + 3
        })
        .reduce((s, d) => s + (d.value ?? 0), 0)
      const target = getTarget(year, q)
      return { quarter: `Q${q}`, real: revenue, target: target > 0 ? target : null }
    })
  }, [deals, closedStageIds, year, quarter, getTarget])

  // Single-quarter cumulative view
  const weeklyData = useMemo(() => {
    if (quarter === 'all') return []
    const target = getTarget(year, quarter)
    const quarterWeeks = getWeeksInQuarter(year, quarter)
    const weeklyRevenue: Record<number, number> = {}
    quarterWeeks.forEach((w) => { weeklyRevenue[w] = 0 })

    deals.filter((d) => closedStageIds.includes(d.stage_id)).forEach((d) => {
      const date = new Date(d.created_at)
      const month = date.getMonth()
      const qStart = (quarter - 1) * 3
      if (date.getFullYear() === year && month >= qStart && month < qStart + 3) {
        const week = getISOWeek(date)
        if (week in weeklyRevenue) weeklyRevenue[week] += d.value ?? 0
      }
    })

    const currentWeek = getISOWeek(new Date())
    let cumulative = 0
    const weeklyTarget = target > 0 ? target / quarterWeeks.length : null

    return quarterWeeks.map((w, idx) => {
      const isPast = w <= currentWeek
      cumulative += isPast ? (weeklyRevenue[w] ?? 0) : 0
      return {
        week: `S${w}`,
        real: isPast ? cumulative : null,
        target: weeklyTarget !== null ? Math.round((idx + 1) * weeklyTarget) : null,
      }
    })
  }, [deals, closedStageIds, year, quarter, getTarget])

  const singleTarget = quarter !== 'all' ? getTarget(year, quarter) : 0

  return (
    <div>
      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">
        {quarter === 'all'
          ? `Revenue por Quarter — ${year}`
          : `Revenue Progress — Acumulado vs Target Q${quarter}`}
      </p>
      <div className="bg-zinc-900 border border-white/[0.06] rounded-xl p-4">
        {quarter !== 'all' && singleTarget === 0 && (
          <p className="text-xs text-zinc-600 mb-3">Configura la meta Q{quarter} en el sidebar para ver la línea de target.</p>
        )}
        <ResponsiveContainer width="100%" height={200}>
          {quarter === 'all' ? (
            <BarChart data={allQuartersData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: '#52525b' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: '#52525b' }} />
              <Bar dataKey="real" name="Revenue cerrado" fill="#e4e4e7" radius={[3, 3, 0, 0]} />
              <Bar dataKey="target" name="Target" fill="#3f3f46" radius={[3, 3, 0, 0]} />
            </BarChart>
          ) : (
            <ComposedChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#52525b' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: '#52525b' }} />
              <Area
                type="monotone" dataKey="real" name="Revenue cerrado"
                fill="rgba(255,255,255,0.04)" stroke="#e4e4e7" strokeWidth={2}
                dot={{ fill: '#e4e4e7', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 4, fill: '#fff' }}
                connectNulls={false}
              />
              {singleTarget > 0 && (
                <Line
                  type="monotone" dataKey="target" name="Target"
                  stroke="#3f3f46" strokeWidth={1.5} strokeDasharray="4 4" dot={false}
                />
              )}
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
