'use client'
import { useMemo, useEffect } from 'react'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useFilters } from '@/hooks/useFilters'
import { useAeNames } from '@/contexts/AeNamesContext'
import { Header } from '@/components/layout/Header'
import { SectionA_RevenueVsMeta } from '@/components/aes/SectionA_RevenueVsMeta'
import { SectionB_Activity } from '@/components/aes/SectionB_Activity'
import { SectionC_Individual } from '@/components/aes/SectionC_Individual'

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded-xl animate-pulse ${className}`} />
}

export default function AEsPage() {
  const { data, loading, error, refetch } = useDashboardData()
  const { filters, setQuarter, setWeek, availableWeeks } = useFilters()
  const { setAeNames } = useAeNames()

  const aes = useMemo(() => {
    if (!data) return []
    return [...new Set(data.deals.map(d => d.account_executive).filter(Boolean))].sort() as string[]
  }, [data])

  useEffect(() => {
    if (aes.length > 0) setAeNames(aes)
  }, [aes, setAeNames])

  if (loading) {
    return (
      <div className="flex flex-col gap-8 p-6 pt-20">
        <SkeletonBlock className="h-60" />
        <SkeletonBlock className="h-40" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-80" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-zinc-500">{error}</p>
      </div>
    )
  }

  if (!data) return null

  const { deals, stages } = data

  return (
    <>
      <Header
        section="AEs"
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
          <SectionA_RevenueVsMeta deals={deals} stages={stages} filters={filters} aes={aes} />
          <SectionB_Activity deals={deals} stages={stages} filters={filters} aes={aes} />
          <SectionC_Individual deals={deals} stages={stages} filters={filters} aes={aes} />
        </div>
      </main>
    </>
  )
}
