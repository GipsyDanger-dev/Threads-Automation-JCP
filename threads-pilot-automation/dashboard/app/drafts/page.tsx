'use client'

import { useEffect, useState } from 'react'
import { Filter, ChevronDown, ChevronUp } from 'lucide-react'
import NotConfigured from '@/components/NotConfigured'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Draft, ThreadPost } from '@/types'

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending_approval', label: 'Pending' },
  { value: 'published', label: 'Published' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'awaiting_edit', label: 'Awaiting Edit' },
]

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [posts, setPosts] = useState<Record<string, ThreadPost[]>>({})
  const [loading, setLoading] = useState(true)
  const [configured, setConfigured] = useState(false)

  useEffect(() => {
    const isConfigured = isSupabaseConfigured()
    setConfigured(isConfigured)

    if (!isConfigured) {
      setLoading(false)
      return
    }
    fetchDrafts()
  }, [filter])

  async function fetchDrafts() {
    const supabase = getSupabase()
    if (!supabase) return

    setLoading(true)
    let query = supabase
      .from('drafts')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data } = await query
    setDrafts(data || [])
    setLoading(false)
  }

  async function toggleExpand(draftId: string) {
    if (expandedId === draftId) {
      setExpandedId(null)
      return
    }

    setExpandedId(draftId)

    if (!posts[draftId]) {
      const supabase = getSupabase()
      if (!supabase) return

      const { data } = await supabase
        .from('thread_posts')
        .select('*')
        .eq('draft_id', draftId)
        .order('post_order')

      setPosts((prev) => ({ ...prev, [draftId]: data || [] }))
    }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Drafts</h1>
          <p className="text-gray-400 mt-1">Kelola semua draft konten</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : drafts.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Tidak ada draft ditemukan</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">Topic</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">Angle</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">Created</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">Posts</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {drafts.map((draft) => (
                <>
                  <tr key={draft.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium">{draft.topic || '-'}</p>
                      <p className="text-xs text-gray-500 mt-1">{draft.pillar_name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{draft.angle}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusColors[draft.status] || 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {draft.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(draft.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {posts[draft.id]?.length || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleExpand(draft.id)}
                        className="p-1 hover:bg-gray-600 rounded"
                      >
                        {expandedId === draft.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                  {expandedId === draft.id && posts[draft.id] && (
                    <tr key={`${draft.id}-detail`}>
                      <td colSpan={6} className="px-6 py-4 bg-gray-700/30">
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-300">Thread Posts:</p>
                          {posts[draft.id].map((post) => (
                            <div
                              key={post.id}
                              className="bg-gray-800 rounded-lg p-3 border border-gray-600"
                            >
                              <p className="text-xs text-gray-500 mb-1">Post {post.post_order + 1}</p>
                              <p className="text-sm">{post.content}</p>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
