'use client'
import { createContext, useContext, useState } from 'react'

interface AeNamesCtx {
  aeNames: string[]
  setAeNames: (names: string[]) => void
}

const Ctx = createContext<AeNamesCtx>({ aeNames: [], setAeNames: () => {} })

export function AeNamesProvider({ children }: { children: React.ReactNode }) {
  const [aeNames, setAeNames] = useState<string[]>([])
  return <Ctx.Provider value={{ aeNames, setAeNames }}>{children}</Ctx.Provider>
}

export function useAeNames() { return useContext(Ctx) }
