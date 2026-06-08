'use client'
import { useState, useEffect } from 'react'
import { X, Users } from 'lucide-react'
import { useTargets } from '@/contexts/TargetsContext'
import { useAeNames } from '@/contexts/AeNamesContext'
import { formatCurrency } from '@/lib/formatters'

interface Props { open: boolean; onClose: () => void }

const QUARTERS = [1, 2, 3, 4] as const
const YEAR = 2026

export function AeTargetsPanel({ open, onClose }: Props) {
  const { getAeTarget, setAeTarget, getTarget } = useTargets()
  const { aeNames } = useAeNames()
  const [drafts, setDrafts] = useState<Record<string, string>>({}) // key: `${q}-${ae}`
  const [openQ, setOpenQ] = useState<number>(2)

  useEffect(() => {
    if (!open) return
    const initial: Record<string, string> = {}
    QUARTERS.forEach(q => {
      aeNames.forEach(ae => {
        const v = getAeTarget(YEAR, q, ae)
        initial[`${q}-${ae}`] = v > 0 ? String(v) : ''
      })
    })
    setDrafts(initial)
  }, [open, aeNames, getAeTarget])

  function handleBlur(q: number, ae: string) {
    const raw = (drafts[`${q}-${ae}`] ?? '').replace(/[^0-9]/g, '')
    const num = parseInt(raw, 10)
    setAeTarget(YEAR, q, ae, isNaN(num) ? 0 : num)
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed left-52 top-0 h-screen w-72 z-50 bg-[#111113] border-r border-white/[0.06] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 h-14 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-zinc-400" strokeWidth={1.75} />
            <span className="text-sm font-medium text-white">Metas AEs {YEAR}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {aeNames.length === 0 ? (
            <div className="p-4">
              <p className="text-xs text-zinc-600 leading-relaxed">
                Abre la vista de AEs para cargar los nombres del equipo.
              </p>
            </div>
          ) : (
            <div>
              {QUARTERS.map(q => {
                const qTarget = getTarget(YEAR, q)
                const aeSum = aeNames.reduce((s, ae) => s + getAeTarget(YEAR, q, ae), 0)
                const isOpen = openQ === q
                return (
                  <div key={q} className="border-b border-white/[0.04]">
                    {/* Q header */}
                    <button
                      onClick={() => setOpenQ(isOpen ? 0 : q)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
                    >
                      <span className="text-sm font-medium text-zinc-300">Q{q} {YEAR}</span>
                      <div className="flex items-center gap-2 text-[11px]">
                        {qTarget > 0 && (
                          <span className={aeSum > qTarget ? 'text-amber-500' : aeSum === qTarget ? 'text-emerald-500' : 'text-zinc-600'}>
                            {formatCurrency(aeSum)} / {formatCurrency(qTarget)}
                          </span>
                        )}
                        <span className="text-zinc-600">{isOpen ? '▲' : '▼'}</span>
                      </div>
                    </button>

                    {/* AE inputs */}
                    {isOpen && (
                      <div className="px-4 pb-4 flex flex-col gap-3">
                        {aeNames.map(ae => {
                          const saved = getAeTarget(YEAR, q, ae)
                          const k = `${q}-${ae}`
                          return (
                            <div key={ae}>
                              <label className="block text-[11px] text-zinc-500 mb-1">{ae}</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={drafts[k] ?? ''}
                                  onChange={e => setDrafts(prev => ({ ...prev, [k]: e.target.value }))}
                                  onBlur={() => handleBlur(q, ae)}
                                  placeholder="0"
                                  className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg pl-7 pr-3 py-2 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors"
                                />
                              </div>
                              {saved > 0 && (
                                <p className="text-[10px] text-zinc-600 mt-0.5">{formatCurrency(saved)}</p>
                              )}
                            </div>
                          )
                        })}

                        {qTarget > 0 && (
                          <div className="mt-1 pt-3 border-t border-white/[0.04]">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-zinc-600">Suma AEs</span>
                              <span className={aeSum > qTarget ? 'text-amber-400' : aeSum === qTarget ? 'text-emerald-400' : 'text-zinc-400'}>
                                {formatCurrency(aeSum)}
                              </span>
                            </div>
                            <div className="flex justify-between text-[11px] mt-0.5">
                              <span className="text-zinc-600">Meta Q{q}</span>
                              <span className="text-zinc-500">{formatCurrency(qTarget)}</span>
                            </div>
                            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mt-2">
                              <div
                                className={`h-full rounded-full transition-all ${aeSum > qTarget ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(100, qTarget > 0 ? (aeSum / qTarget) * 100 : 0)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-white/[0.06] flex-shrink-0">
          <p className="text-[10px] text-zinc-700">Guardado automático al salir del campo</p>
        </div>
      </div>
    </>
  )
}
