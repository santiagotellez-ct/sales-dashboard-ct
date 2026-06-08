'use client'
import { useMemo, useEffect } from 'react'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useFilters } from '@/hooks/useFilters'
import { useSdrNames } from '@/contexts/SdrNamesContext'
import { Header } from '@/components/layout/Header'
import { SectionA_MeetingTitans } from '@/components/sdrs/SectionA_MeetingTitans'
import { SectionB_Distribution } from '@/components/sdrs/SectionB_Distribution'
import { SectionC_Detail } from '@/components/sdrs/SectionC_Detail'
import { SectionD_Weekly } from '@/components/sdrs/SectionD_Weekly'

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded-xl animate-pulse ${className}`} />
}

export default function SDRsPage() {
  const { data, loading, error, refetch } = useDashboardData()
  const { filters, setQuarter, setWeek, availableWeeks } = useFilters()
  const { setSdrNames } = useSdrNames()

  const sdrs = useMemo(() => {
    if (!data) return []
    return [...new Set(data.companies.map(c => c.sdr).filter(Boolean))].sort() as string[]
  }, [data])

  useEffect(() => { if (sdrs.length > 0) setSdrNames(sdrs) }, [sdrs, setSdrNames])

  if (loading) return (
    <div className="flex flex-col gap-8 p-6 pt-20">
      <div className="grid grid-cols-3 gap-3">{[...Array(3)].map((_, i) => <SkeletonBlock key={i} className="h-24" />)}</div>
      <SkeletonBlock className="h-60" />
      <SkeletonBlock className="h-48" />
      <SkeletonBlock className="h-48" />
    </div>
  )

  if (error) return <div className="flex items-center justify-center min-h-screen"><p className="text-sm text-zinc-500">{error}</p></div>
  if (!data) return null

  const { companies, contacts, activities } = data

  return (
    <>
      <Header
        section="SDRs"
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
          <SectionA_MeetingTitans companies={companies} contacts={contacts} filters={filters} />
          <SectionB_Distribution companies={companies} filters={filters} />
          <SectionC_Detail companies={companies} contacts={contacts} filters={filters} sdrs={sdrs} />
          <SectionD_Weekly companies={companies} contacts={contacts} activities={activities} filters={filters} sdrs={sdrs} />
        </div>
      </main>
    </>
  )
}
