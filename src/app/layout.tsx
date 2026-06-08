import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { TargetsProvider } from '@/contexts/TargetsContext'
import { AeNamesProvider } from '@/contexts/AeNamesContext'
import { SdrNamesProvider } from '@/contexts/SdrNamesContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: 'Sales Dashboard - Colombia Tech',
  description: 'Pipeline de ventas B2B',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} h-full dark`}>
      <body className="min-h-full bg-zinc-950 text-white antialiased font-[family-name:var(--font-inter)]">
        <TargetsProvider>
          <AeNamesProvider>
            <SdrNamesProvider>
              <Sidebar />
              <div className="pl-52">{children}</div>
            </SdrNamesProvider>
          </AeNamesProvider>
        </TargetsProvider>
      </body>
    </html>
  )
}
