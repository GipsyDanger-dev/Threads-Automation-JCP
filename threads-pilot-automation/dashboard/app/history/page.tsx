'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import NotConfigured from '@/components/NotConfigured'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { History } from '@/types'

export default function HistoryPage() {
  const [history, setHistory] = useState<History[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [configured, setConfigured] = useState(false)

  useEffect(() => {
    const isConfigured = isSupabaseConfigured()
    setConfigured(isConfigured)

    if (!isConfigured) {
      setLoading(false)
      return
    }
    fetchHistory()
  }, [])

  async function fetchHistory() {
    const supabase = getSupabase()
    if (!supabase) return

    const { data } = await supabase
      .from('history')
      .select('*')
      .order('published_at', { ascending: false })

    setHistory(data || [])
    setLoading(false)
  }

  if (!configured) {
    return <NotConfigured />
  }

  const filteredHistory = history.filter(
    (item) =>
      item.topic.toLowerCase().includes(search.toLowerCase()) ||
      item.caption.toLowerCase().includes(search.toLowerCase()) ||
      item.angle.toLowerCase().includes(search.toLowerCase())
  )

  const angleColors: Record<string, string> = {
    Serius: 'bg-blue-500/20 text-blue-400',
    Lucu: 'bg-yellow-500/20 text-yellow-400',
    Horror: 'bg-purple-500/20 text-purple-400',
    'Q&A': 'bg-green-500/20 text-green-400',
    Rekap: 'bg-gray-500/20 text-gray-400',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">History</h1>
          <p className="text-gray-400 mt-1">Riwayat konten yang sudah dipublish</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari topik, angle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {search ? 'Tidak ada hasil pencarian' : 'Belum ada history'}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">Topic</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">Angle</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">Caption</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">Published</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium">{item.topic}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.pillar_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        angleColors[item.angle] || 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {item.angle}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-300 line-clamp-2 max-w-md">
                      {item.caption}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {item.published_at
                      ? new Date(item.published_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
