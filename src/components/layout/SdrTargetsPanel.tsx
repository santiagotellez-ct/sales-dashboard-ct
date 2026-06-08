'use client'
import { useState, useEffect } from 'react'
import { X, UserCheck } from 'lucide-react'
import { useTargets } from '@/contexts/TargetsContext'
import { useSdrNames } from '@/contexts/SdrNamesContext'
import { formatNumber } from '@/lib/formatters'

interface Props { open: boolean; onClose: () => void }

export function SdrTargetsPanel({ open, onClose }: Props) {
  const { getSdrMeta, setSdrMeta } = useTargets()
  const { sdrNames } = useSdrNames()
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    const init: Record<string, string> = {}
    sdrNames.forEach(sdr => {
      const c = getSdrMeta(sdr, 'c'); const a = getSdrMeta(sdr, 'a')
      init[`${sdr}-c`] = c > 0 ? String(c) : ''
      init[`${sdr}-a`] = a > 0 ? String(a) : ''
    })
    setDrafts(init)
  }, [open, sdrNames, getSdrMeta])

  function commit(sdr: string, type: 'c' | 'a') {
    const raw = (drafts[`${sdr}-${type}`] ?? '').replace(/[^0-9]/g, '')
    const num = parseInt(raw, 10)
    setSdrMeta(sdr, type, isNaN(num) ? 0 : num)
  }

  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed left-52 top-0 h-screen w-72 z-50 bg-[#111113] border-r border-white/[0.06] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 h-14 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-2">
            <UserCheck size={14} className="text-zinc-400" strokeWidth={1.75} />
            <span className="text-sm font-medium text-white">Metas SDRs (semanal)</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"><X size={14} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
          {sdrNames.length === 0 ? (
            <p className="text-xs text-zinc-600 leading-relaxed">Abre la vista de SDRs para cargar el equipo.</p>
          ) : sdrNames.map(sdr => {
            const cMeta = getSdrMeta(sdr, 'c'); const aMeta = getSdrMeta(sdr, 'a')
            return (
              <div key={sdr}>
                <p className="text-[11px] font-medium text-zinc-300 mb-2">{sdr}</p>
                <div className="grid grid-cols-2 gap-2">
                  {([['c', 'Contactados'] , ['a', 'Agendados']] as const).map(([type, label]) => {
                    const k = `${sdr}-${type}`
                    const saved = type === 'c' ? cMeta : aMeta
                    return (
                      <div key={type}>
                        <label className="block text-[10px] text-zinc-600 mb-1">{label}</label>
                        <input
                          type="text" inputMode="numeric"
                          value={drafts[k] ?? ''}
                          onChange={e => setDrafts(p => ({ ...p, [k]: e.target.value }))}
                          onBlur={() => commit(sdr, type)}
                          placeholder="0"
                          className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors"
                        />
                        {saved > 0 && <p className="text-[10px] text-zinc-600 mt-0.5">{formatNumber(saved)}/sem</p>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        <div className="px-4 py-3 border-t border-white/[0.06] flex-shrink-0">
          <p className="text-[10px] text-zinc-700">Metas semanales · Guardado automático</p>
        </div>
      </div>
    </>
  )
}
