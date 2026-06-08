'use client'

import { useDashboardData } from '@/hooks/useDashboardData'
import { useFilters } from '@/hooks/useFilters'
import { Header } from '@/components/layout/Header'
import { SectionA_Revenue } from '@/components/sales-b2b/SectionA_Revenue'
import { SectionB_Team } from '@/components/sales-b2b/SectionB_Team'
import { SectionC_SdrFlow } from '@/components/sales-b2b/SectionC_SdrFlow'
import { SectionD_Pipeline } from '@/components/sales-b2b/SectionD_Pipeline'
import { SectionF_Chart } from '@/components/sales-b2b/SectionF_Chart'

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded-xl animate-pulse ${className}`} />
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-8 p-6 pt-20">
      <div className="grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-24" />)}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <SkeletonBlock className="h-40" />
        <SkeletonBlock className="h-40" />
      </div>
      <div className="grid grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => <SkeletonBlock key={i} className="h-20" />)}
      </div>
      <SkeletonBlock className="h-52" />
    </div>
  )
}

export default function SalesDashboard() {
  const { data, loading, error, refetch } = useDashboardData()
  const { filters, setQuarter, setWeek, availableWeeks } = useFilters()

  if (loading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-sm font-medium text-white mb-1">Error al cargar datos</p>
          <p className="text-xs text-zinc-500 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="text-xs px-4 py-2 bg-white text-zinc-900 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { deals, stages, companies, contacts, activities } = data

  return (
    <>
      <Header
        section="Sales B2B"
        filters={filters}
        availableWeeks={availableWeeks}
        onQuarterChange={setQuarter}
        onWeekChange={setWeek}
        lastUpdated={data.lastUpdated}
        onRefresh={refetch}
        loading={loading}
      />

      <main className="pt-14 min-h-screen bg-zinc-950">
        <div className="max-w-screen-xl mx-auto px-6 py-6 flex flex-col gap-8">

          <SectionA_Revenue deals={deals} stages={stages} filters={filters} />

          <SectionF_Chart deals={deals} stages={stages} filters={filters} />

          <SectionB_Team
            deals={deals}
            stages={stages}
            companies={companies}
            contacts={contacts}
            filters={filters}
          />

          <SectionC_SdrFlow companies={companies} activities={activities} filters={filters} />

          <SectionD_Pipeline deals={deals} stages={stages} companies={companies} filters={filters} />

        </div>
      </main>
    </>
  )
}
