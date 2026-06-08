'use client'
import { useState, useEffect, useCallback } from 'react'
import { fetchAllDashboardData } from '@/lib/queries'
import { REFRESH_INTERVAL } from '@/lib/constants'
import type { DashboardData } from '@/types'

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const result = await fetchAllDashboardData()
      setData({ ...result, lastUpdated: new Date() })
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
