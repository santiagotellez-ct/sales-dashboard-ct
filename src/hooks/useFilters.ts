'use client'
import { useState, useCallback } from 'react'
import { getCurrentQuarter, getCurrentISOWeek, getWeeksInQuarter } from '@/lib/dates'
import type { Quarter, Filters } from '@/types'

export function useFilters() {
  const year = new Date().getFullYear()
  const currentQ = getCurrentQuarter()
  const currentWeek = getCurrentISOWeek()

  const [filters, setFilters] = useState<Filters>({
    year,
    quarter: currentQ,
    week: 'all',
  })

  const setQuarter = useCallback((q: Quarter | 'all') => {
    setFilters(prev => ({ ...prev, quarter: q, week: 'all' }))
  }, [])

  const setWeek = useCallback((week: number | 'all') => {
    setFilters(prev => ({ ...prev, week }))
  }, [])

  const availableWeeks = filters.quarter !== 'all'
    ? (() => {
        const all = getWeeksInQuarter(filters.year, filters.quarter)
        const isCurrentQ = filters.year === year && filters.quarter === currentQ
        return isCurrentQ ? all.filter(w => w <= currentWeek) : all
      })()
    : []

  return { filters, setQuarter, setWeek, availableWeeks }
}
