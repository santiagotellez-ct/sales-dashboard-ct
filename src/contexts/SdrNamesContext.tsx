'use client'
import { createContext, useContext, useState } from 'react'
interface SdrNamesCtx { sdrNames: string[]; setSdrNames: (n: string[]) => void }
const Ctx = createContext<SdrNamesCtx>({ sdrNames: [], setSdrNames: () => {} })
export function SdrNamesProvider({ children }: { children: React.ReactNode }) {
  const [sdrNames, setSdrNames] = useState<string[]>([])
  return <Ctx.Provider value={{ sdrNames, setSdrNames }}>{children}</Ctx.Provider>
}
export function useSdrNames() { return useContext(Ctx) }
