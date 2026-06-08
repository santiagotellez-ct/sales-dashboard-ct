'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

type AllTargets = Record<number, Record<number, number>>
type AeAllTargets = Record<string, number>
type SdrTargets = Record<string, { c: number; a: number }> // sdr -> { contactados, agendados }

const STORAGE_KEY = 'ct_revenue_targets'
const AE_STORAGE_KEY = 'ct_ae_targets'
const SDR_STORAGE_KEY = 'ct_sdr_targets'
const DEFAULT: AllTargets = { 2026: { 1: 0, 2: 0, 3: 0, 4: 0 } }

interface TargetsCtx {
  targets: AllTargets
  getTarget: (year: number, quarter: number) => number
  setTarget: (year: number, quarter: number, value: number) => void
  getAeTarget: (year: number, quarter: number | 'all', ae: string) => number
  setAeTarget: (year: number, quarter: number | 'all', ae: string, value: number) => void
  getSdrMeta: (sdr: string, type: 'c' | 'a') => number
  setSdrMeta: (sdr: string, type: 'c' | 'a', value: number) => void
}

const Ctx = createContext<TargetsCtx | null>(null)

export function TargetsProvider({ children }: { children: React.ReactNode }) {
  const [targets, setTargets] = useState<AllTargets>(DEFAULT)
  const [aeTargets, setAeTargets] = useState<AeAllTargets>({})
  const [sdrTargets, setSdrTargets] = useState<SdrTargets>({})

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY); if (raw) setTargets(JSON.parse(raw))
      const aeRaw = localStorage.getItem(AE_STORAGE_KEY); if (aeRaw) setAeTargets(JSON.parse(aeRaw))
      const sdrRaw = localStorage.getItem(SDR_STORAGE_KEY); if (sdrRaw) setSdrTargets(JSON.parse(sdrRaw))
    } catch {}
  }, [])

  const setTarget = useCallback((year: number, quarter: number, value: number) => {
    setTargets(prev => { const next = { ...prev, [year]: { ...(prev[year] ?? {}), [quarter]: value } }; localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); return next })
  }, [])
  const getTarget = useCallback((year: number, quarter: number) => targets[year]?.[quarter] ?? 0, [targets])

  const setAeTarget = useCallback((year: number, quarter: number | 'all', ae: string, value: number) => {
    const key = `${year}-${quarter}-${ae}`
    setAeTargets(prev => { const next = { ...prev, [key]: value }; localStorage.setItem(AE_STORAGE_KEY, JSON.stringify(next)); return next })
  }, [])
  const getAeTarget = useCallback((year: number, quarter: number | 'all', ae: string) => aeTargets[`${year}-${quarter}-${ae}`] ?? 0, [aeTargets])

  const setSdrMeta = useCallback((sdr: string, type: 'c' | 'a', value: number) => {
    setSdrTargets(prev => { const next = { ...prev, [sdr]: { ...(prev[sdr] ?? { c: 0, a: 0 }), [type]: value } }; localStorage.setItem(SDR_STORAGE_KEY, JSON.stringify(next)); return next })
  }, [])
  const getSdrMeta = useCallback((sdr: string, type: 'c' | 'a') => sdrTargets[sdr]?.[type] ?? 0, [sdrTargets])

  return (
    <Ctx.Provider value={{ targets, getTarget, setTarget, getAeTarget, setAeTarget, getSdrMeta, setSdrMeta }}>
      {children}
    </Ctx.Provider>
  )
}

export function useTargets() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTargets outside TargetsProvider')
  return ctx
}
