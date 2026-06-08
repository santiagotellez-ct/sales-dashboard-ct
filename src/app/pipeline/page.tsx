'use client'
import { useMemo, useState } from 'react'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useFilters } from '@/hooks/useFilters'
import { Header } from '@/components/layout/Header'
import { SectionA_KPIs } from '@/components/pipeline/SectionA_KPIs'
import { SectionB_ByStage } from '@/components/pipeline/SectionB_ByStage'
import { SectionC_Conversion } from '@/components/pipeline/SectionC_Conversion'
import { SectionD_Cohort } from '@/components/pipeline/SectionD_Cohort'
import { SectionE_KillOrAdvance } from '@/components/pipeline/SectionE_KillOrAdvance'

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded-xl animate-pulse ${className}`} />
}

export default function PipelinePage() {
  const { data, loading, error, refetch } = useDashboardData()
  const { filters, setQuarter, setWeek, availableWeeks } = useFilters()
  const [memberFilter, setMemberFilter] = useState('all')

  const aes = useMemo(() => {
    if (!data) return []
    return [...new Set(data.deals.map(d => d.account_executive).filter(Boolean))].sort() as string[]
  }, [data])

  if (loading) return (
    <div className="flex flex-col gap-8 p-6 pt-24">
      <div className="grid grid-cols-5 gap-3">{[...Array(5)].map((_, i) => <SkeletonBlock key={i} className="h-24" />)}</div>
      <SkeletonBlock className="h-60" /><SkeletonBlock className="h-40" /><SkeletonBlock className="h-60" />
    </div>
  )

  if (error) return <div className="flex items-center justify-center min-h-screen"><p className="text-sm text-zinc-500">{error}</p></div>
  if (!data) return null

  const { deals, stages } = data

  return (
    <>
      <Header
        section="Pipeline Review"
        filters={filters}
        availableWeeks={availableWeeks}
        onQuarterChange={setQuarter}
        onWeekChange={setWeek}
        lastUpdated={data.lastUpdated}
        onRefresh={refetch}
        loading={loading}
      />

      {/* Member filter bar */}
      <div className="fixed top-14 left-52 right-0 z-20 flex items-center gap-2 px-6 py-2.5 border-b border-white/[0.06] bg-zinc-950">
        <span className="text-[11px] text-zinc-600 uppercase tracking-wider">Vista:</span>
        {['all', ...aes].map(ae => (
          <button
            key={ae}
            onClick={() => setMemberFilter(ae)}
            className={`px-3 py-1 rounded-md text-[12px] transition-colors ${
              memberFilter === ae
                ? 'bg-zinc-800 text-white font-medium'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
          >
            {ae === 'all' ? 'General' : ae}
          </button>
        ))}
      </div>

      <main className="pt-[7.25rem] min-h-screen bg-zinc-950">
        <div className="max-w-screen-xl mx-auto px-6 py-6 flex flex-col gap-8">
          <SectionA_KPIs deals={deals} stages={stages} filters={filters} memberFilter={memberFilter} />
          <SectionB_ByStage deals={deals} stages={stages} filters={filters} memberFilter={memberFilter} />
          <SectionC_Conversion deals={deals} stages={stages} filters={filters} memberFilter={memberFilter} />
          <SectionD_Cohort deals={deals} stages={stages} memberFilter={memberFilter} />
          <SectionE_KillOrAdvance deals={deals} stages={stages} memberFilter={memberFilter} />
        </div>
      </main>
    </>
  )
}
