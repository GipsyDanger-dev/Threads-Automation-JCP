'use client'

import { useEffect, useState } from 'react'
import { Filter, ChevronDown, ChevronUp, CheckCircle, XCircle, ExternalLink, Loader2 } from 'lucide-react'
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

const statusColors: Record<string, string> = {
  published: 'bg-green-500/20 text-green-400',
  pending_approval: 'bg-yellow-500/20 text-yellow-400',
  rejected: 'bg-red-500/20 text-red-400',
  awaiting_edit: 'bg-blue-500/20 text-blue-400',
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [posts, setPosts] = useState<Record<string, ThreadPost[]>>({})
  const [loading, setLoading] = useState(true)
  const [configured, setConfigured] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const isConfigured = isSupabaseConfigured()
    setConfigured(isConfigured)

    if (!isConfigured) {
      setLoading(false)
      return
    }
    fetchDrafts()
  }, [filter])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

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

  async function handleApprove(draftId: string) {
    const supabase = getSupabase()
    if (!supabase) return

    setActionLoading(draftId)
    setConfirmAction(null)

    try {
      // 1. Get draft data
      const { data: draft, error: draftError } = await supabase
        .from('drafts')
        .select('*')
        .eq('id', draftId)
        .single()

      if (draftError || !draft) throw new Error('Gagal mengambil data draft')

      // 2. Get thread posts
      const { data: threadPosts, error: postsError } = await supabase
        .from('thread_posts')
        .select('*')
        .eq('draft_id', draftId)
        .order('post_order')

      if (postsError || !threadPosts || threadPosts.length === 0) {
        throw new Error('Tidak ada thread posts untuk draft ini')
      }

      // 3. Prepare Zernio payload
      const content = threadPosts[0].content
      const threadItems = threadPosts.slice(1).map((p) => ({ content: p.content }))

      const zernioPayload = {
        content,
        platforms: [
          {
            platform: 'threads',
            accountId: '6a4769089d9472faae61f262',
            platformSpecificData: { threadItems },
          },
        ],
        publishNow: true,
      }

      // 4. Call API route (handles Zernio securely)
      const zernioRes = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          threadItems,
          accountId: '6a4769089d9472faae61f262',
        }),
      })

      if (!zernioRes.ok) {
        const errData = await zernioRes.json().catch(() => ({}))
        throw new Error(errData.message || `Zernio API error: ${zernioRes.status}`)
      }

      // 5. Update draft status
      await supabase
        .from('drafts')
        .update({
          status: 'published',
          actual_publish_time: new Date().toISOString(),
        })
        .eq('id', draftId)

      // 6. Insert to history
      await supabase.from('history').insert({
        pillar_name: draft.pillar_name,
        angle: draft.angle,
        topic: draft.topic || draft.angle,
        caption: threadPosts.map((p) => p.content).join('\n\n'),
        published_at: new Date().toISOString(),
      })

      setToast({ message: 'Berhasil dipublish ke Threads!', type: 'success' })
      fetchDrafts()
    } catch (error) {
      console.error('Approve error:', error)
      setToast({
        message: error instanceof Error ? error.message : 'Gagal publish',
        type: 'error',
      })
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(draftId: string) {
    const supabase = getSupabase()
    if (!supabase) return

    setActionLoading(draftId)
    setConfirmAction(null)

    try {
      const { error } = await supabase
        .from('drafts')
        .update({ status: 'rejected' })
        .eq('id', draftId)

      if (error) throw error

      setToast({ message: 'Draft ditolak', type: 'success' })
      fetchDrafts()
    } catch (error) {
      console.error('Reject error:', error)
      setToast({ message: 'Gagal menolak draft', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  if (!configured) {
    return <NotConfigured />
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">
              {confirmAction.action === 'approve' ? 'Publish ke Threads?' : 'Tolak Draft?'}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {confirmAction.action === 'approve'
                ? 'Draft akan dipublish langsung ke Threads. Pastikan konten sudah sesuai.'
                : 'Draft akan ditolak dan tidak jadi dipublish.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() =>
                  confirmAction.action === 'approve'
                    ? handleApprove(confirmAction.id)
                    : handleReject(confirmAction.id)
                }
                disabled={actionLoading !== null}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  confirmAction.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } disabled:opacity-50`}
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : confirmAction.action === 'approve' ? (
                  'Publish'
                ) : (
                  'Tolak'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
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

      {/* Table */}
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
                <th className="text-center px-6 py-4 text-sm font-medium text-gray-300">Actions</th>
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
                      <div className="flex items-center justify-center gap-2">
                        {draft.status === 'pending_approval' && (
                          <>
                            <button
                              onClick={() =>
                                setConfirmAction({ id: draft.id, action: 'approve' })
                              }
                              disabled={actionLoading === draft.id}
                              className="p-1.5 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors disabled:opacity-50"
                              title="Approve & Publish"
                            >
                              {actionLoading === draft.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                setConfirmAction({ id: draft.id, action: 'reject' })
                              }
                              disabled={actionLoading === draft.id}
                              className="p-1.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => toggleExpand(draft.id)}
                          className="p-1.5 hover:bg-gray-600 rounded-lg transition-colors"
                          title="Expand"
                        >
                          {expandedId === draft.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === draft.id && posts[draft.id] && (
                    <tr key={`${draft.id}-detail`}>
                      <td colSpan={6} className="px-6 py-4 bg-gray-700/30">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-300">Thread Posts:</p>
                            {draft.status === 'published' && draft.actual_publish_time && (
                              <span className="text-xs text-green-400 flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" />
                                Published {new Date(draft.actual_publish_time).toLocaleString('id-ID')}
                              </span>
                            )}
                          </div>
                          {posts[draft.id].map((post) => (
                            <div
                              key={post.id}
                              className="bg-gray-800 rounded-lg p-3 border border-gray-600"
                            >
                              <p className="text-xs text-gray-500 mb-1">Post {post.post_order + 1}</p>
                              <p className="text-sm whitespace-pre-wrap">{post.content}</p>
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
