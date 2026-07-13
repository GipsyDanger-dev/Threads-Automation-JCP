import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Threads Pilot Dashboard',
  description: 'Dashboard untuk monitoring automation konten Threads',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-gray-950 text-white`}>
        <Sidebar />
        <main className="ml-64 min-h-screen p-8">
          {children}
        </main>
      </body>
    </html>
  )
}
