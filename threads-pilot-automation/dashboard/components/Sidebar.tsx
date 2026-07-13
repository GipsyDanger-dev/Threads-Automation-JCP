'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, History, Calendar, BarChart3, Plane } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/drafts', label: 'Drafts', icon: FileText },
  { href: '/history', label: 'History', icon: History },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Plane className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="font-bold text-lg">Threads Pilot</h1>
            <p className="text-xs text-gray-400">Automation Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">v1.0 - Demo Showcase</p>
      </div>
    </aside>
  )
}
