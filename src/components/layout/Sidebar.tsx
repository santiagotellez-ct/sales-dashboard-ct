'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TrendingUp, Users, UserCheck, GitBranch, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TargetsPanel } from './TargetsPanel'
import { AeTargetsPanel } from './AeTargetsPanel'
import { SdrTargetsPanel } from './SdrTargetsPanel'

const navItems: { href: string; label: string; icon: React.ElementType; disabled?: boolean }[] = [
  { href: '/', label: 'Sales B2B', icon: TrendingUp },
  { href: '/aes', label: 'AEs', icon: Users },
  { href: '/sdrs', label: 'SDRs', icon: UserCheck },
  { href: '/pipeline', label: 'Pipeline Review', icon: GitBranch },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState<'q' | 'ae' | 'sdr' | null>(null)

  function toggle(panel: 'q' | 'ae' | 'sdr') { setOpen(p => p === panel ? null : panel) }

  return (
    <>
      <aside className="w-52 h-screen fixed left-0 top-0 flex flex-col border-r border-white/[0.06] bg-[#0d0d0f] z-40">
        <div className="flex items-center justify-center h-14 border-b border-white/[0.06] flex-shrink-0">
          <img src="/logo-ct.svg" alt="Colombia Tech" className="h-7 w-auto max-w-[calc(100%-2rem)] object-contain" />
        </div>

        <nav className="flex flex-col gap-0.5 p-2 flex-1 overflow-y-auto">
          <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider px-3 py-2">Secciones</p>
          {navItems.map(({ href, label, icon: Icon, disabled }) => {
            const isActive = pathname === href
            return (
              <Link key={href} href={disabled ? '#' : href} aria-disabled={disabled}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors select-none',
                  isActive ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50',
                  disabled && 'pointer-events-none opacity-30'
                )}
              >
                <Icon size={14} strokeWidth={1.75} />
                {label}
                {disabled && <span className="ml-auto text-[10px] text-zinc-600 font-normal">Pronto</span>}
              </Link>
            )
          })}

          <div className="mt-auto pt-4">
            <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider px-3 py-2">Configuración</p>
            {[
              { key: 'q' as const, icon: Target, label: 'Metas por Q' },
              { key: 'ae' as const, icon: Users, label: 'Metas AEs' },
              { key: 'sdr' as const, icon: UserCheck, label: 'Metas SDRs' },
            ].map(({ key, icon: Icon, label }) => (
              <button key={key} onClick={() => toggle(key)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors',
                  open === key ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
                )}
              >
                <Icon size={14} strokeWidth={1.75} />{label}
              </button>
            ))}
          </div>
        </nav>

        <div className="px-4 py-3 border-t border-white/[0.06] flex-shrink-0">
          <p className="text-[11px] text-zinc-600 font-medium">Colombia Tech</p>
        </div>
      </aside>

      <TargetsPanel open={open === 'q'} onClose={() => setOpen(null)} />
      <AeTargetsPanel open={open === 'ae'} onClose={() => setOpen(null)} />
      <SdrTargetsPanel open={open === 'sdr'} onClose={() => setOpen(null)} />
    </>
  )
}
