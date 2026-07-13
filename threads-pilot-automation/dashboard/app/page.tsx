'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react'
import StatsCard from '@/components/StatsCard'
import NotConfigured from '@/components/NotConfigured'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Draft } from '@/types'

interface Stats {
  totalPublished: number
  totalPending: number
  totalRejected: number
  totalDrafts: number
  totalPosts: number
}

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats>({
    totalPublished: 0,
    totalPending: 0,
    totalRejected: 0,
    totalDrafts: 0,
    totalPosts: 0,
  })
  const [recentDrafts, setRecentDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [configured, setConfigured] = useState(false)

  useEffect(() => {
    const isConfigured = isSupabaseConfigured()
    setConfigured(isConfigured)

    if (!isConfigured) {
      setLoading(false)
      return
    }

    fetchStats()
    fetchRecentDrafts()

    const supabase = getSupabase()
    if (supabase) {
      const channel = supabase
        .channel('drafts-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'drafts' }, () => {
          fetchStats()
          fetchRecentDrafts()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  async function fetchStats() {
    const supabase = getSupabase()
    if (!supabase) return

    const [published, pending, rejected, total, posts] = await Promise.all([
      supabase.from('drafts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('drafts').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval'),
      supabase.from('drafts').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabase.from('drafts').select('*', { count: 'exact', head: true }),
      supabase.from('thread_posts').select('*', { count: 'exact', head: true }),
    ])

    setStats({
      totalPublished: published.count || 0,
      totalPending: pending.count || 0,
      totalRejected: rejected.count || 0,
      totalDrafts: total.count || 0,
      totalPosts: posts.count || 0,
    })
  }

  async function fetchRecentDrafts() {
    const supabase = getSupabase()
    if (!supabase) return

    const { data } = await supabase
      .from('drafts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    setRecentDrafts(data || [])
    setLoading(false)
  }

  if (!configured) {
    return <NotConfigured />
  }

  const statusColors: Record<string, string> = {
    published: 'bg-green-500/20 text-green-400',
    pending_approval: 'bg-yellow-500/20 text-yellow-400',
    rejected: 'bg-red-500/20 text-red-400',
    awaiting_edit: 'bg-blue-500/20 text-blue-400',
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="text-gray-400 mt-1">Monitor automation konten Threads Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Published"
          value={stats.totalPublished}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Pending Approval"
          value={stats.totalPending}
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="Rejected"
          value={stats.totalRejected}
          icon={XCircle}
          color="red"
        />
        <StatsCard
          title="Total Posts"
          value={stats.totalPosts}
          icon={MessageSquare}
          color="blue"
        />
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Recent Drafts</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : recentDrafts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Belum ada draft</div>
          ) : (
            <div className="space-y-4">
              {recentDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{draft.topic || draft.angle}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {draft.pillar_name} • {draft.angle}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">
                      {new Date(draft.created_at).toLocaleDateString('id-ID')}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[draft.status] || 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {draft.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
