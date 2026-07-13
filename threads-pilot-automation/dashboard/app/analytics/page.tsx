'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import NotConfigured from '@/components/NotConfigured'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { History, Draft } from '@/types'

const COLORS = ['#3B82F6', '#EAB308', '#A855F7', '#22C55E', '#6B7280', '#EF4444']

export default function AnalyticsPage() {
  const [publishTrend, setPublishTrend] = useState<{ date: string; count: number }[]>([])
  const [angleDistribution, setAngleDistribution] = useState<{ name: string; value: number }[]>([])
  const [statusBreakdown, setStatusBreakdown] = useState<{ name: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [configured, setConfigured] = useState(false)

  useEffect(() => {
    const isConfigured = isSupabaseConfigured()
    setConfigured(isConfigured)

    if (!isConfigured) {
      setLoading(false)
      return
    }
    fetchAnalytics()
  }, [])

  async function fetchAnalytics() {
    const supabase = getSupabase()
    if (!supabase) return

    const [historyData, draftsData] = await Promise.all([
      supabase.from('history').select('*'),
      supabase.from('drafts').select('*'),
    ])

    const history = (historyData.data || []) as History[]
    const drafts = (draftsData.data || []) as Draft[]

    // Publish trend (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split('T')[0]
    })

    const trend = last7Days.map((date) => {
      const count = history.filter((h) => h.published_at?.startsWith(date)).length
      return {
        date: new Date(date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
        count,
      }
    })
    setPublishTrend(trend)

    // Angle distribution
    const angleCounts: Record<string, number> = {}
    history.forEach((h) => {
      angleCounts[h.angle] = (angleCounts[h.angle] || 0) + 1
    })
    const angleData = Object.entries(angleCounts).map(([name, value]) => ({ name, value }))
    setAngleDistribution(angleData)

    // Status breakdown
    const statusCounts: Record<string, number> = {}
    drafts.forEach((d) => {
      statusCounts[d.status] = (statusCounts[d.status] || 0) + 1
    })
    const statusData = Object.entries(statusCounts).map(([name, count]) => ({
      name: name.replace('_', ' '),
      count,
    }))
    setStatusBreakdown(statusData)

    setLoading(false)
  }

  if (!configured) {
    return <NotConfigured />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-gray-400 mt-1">Analisis performa konten</p>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center text-gray-400">
          Loading analytics...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-gray-400 mt-1">Analisis performa konten</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Publish Trend */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Publish Trend (7 Hari)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={publishTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
                name="Posts"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Angle Distribution */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Angle Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={angleDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {angleDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status Breakdown */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              <Bar dataKey="count" fill="#3B82F6" name="Drafts" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
