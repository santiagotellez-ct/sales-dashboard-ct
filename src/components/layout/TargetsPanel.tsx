'use client'
import { useState, useEffect } from 'react'
import { X, Target } from 'lucide-react'
import { useTargets } from '@/contexts/TargetsContext'
import { formatCurrency } from '@/lib/formatters'

interface Props {
  open: boolean
  onClose: () => void
}

const QUARTERS = [1, 2, 3, 4] as const
const YEAR = 2026

export function TargetsPanel({ open, onClose }: Props) {
  const { getTarget, setTarget } = useTargets()
  const [drafts, setDrafts] = useState<Record<number, string>>({})

  useEffect(() => {
    if (open) {
      const initial: Record<number, string> = {}
      QUARTERS.forEach(q => {
        const v = getTarget(YEAR, q)
        initial[q] = v > 0 ? String(v) : ''
      })
      setDrafts(initial)
    }
  }, [open, getTarget])

  function handleBlur(q: number) {
    const raw = drafts[q]?.replace(/[^0-9]/g, '') ?? ''
    const num = parseInt(raw, 10)
    if (!isNaN(num)) setTarget(YEAR, q, num)
    else setTarget(YEAR, q, 0)
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed left-52 top-0 h-screen w-64 z-50 bg-[#111113] border-r border-white/[0.06] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 h-14 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-zinc-400" strokeWidth={1.75} />
            <span className="text-sm font-medium text-white">Metas {YEAR}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            Define el revenue objetivo por quarter. Los valores se guardan automáticamente.
          </p>

          {QUARTERS.map(q => {
            const saved = getTarget(YEAR, q)
            return (
              <div key={q}>
                <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                  Q{q} {YEAR}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={drafts[q] ?? ''}
                    onChange={e => setDrafts(prev => ({ ...prev, [q]: e.target.value }))}
                    onBlur={() => handleBlur(q)}
                    placeholder="0"
                    className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg pl-7 pr-3 py-2 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>
                {saved > 0 && (
                  <p className="text-[10px] text-zinc-600 mt-1">{formatCurrency(saved)}</p>
                )}
              </div>
            )
          })}
        </div>

        <div className="px-4 py-3 border-t border-white/[0.06] flex-shrink-0">
          <p className="text-[10px] text-zinc-700">Guardado automático al salir del campo</p>
        </div>
      </div>
    </>
  )
}
