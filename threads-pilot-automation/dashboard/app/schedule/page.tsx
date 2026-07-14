'use client'

import { useEffect, useState } from 'react'
import { Clock, TrendingUp, BarChart3 } from 'lucide-react'
import NotConfigured from '@/components/NotConfigured'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { AngleSchedule } from '@/types'

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
const slots = [
  { time: '08:00', label: 'Pagi', icon: '🌅' },
  { time: '12:00', label: 'Siang', icon: '☀️' },
  { time: '16:00', label: 'Sore', icon: '🌇' },
]

const angleConfig: Record<string, { bg: string; text: string; border: string; solid: string }> = {
  Serius: {
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    solid: 'bg-blue-500',
  },
  Lucu: {
    bg: 'bg-yellow-500/15',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
    solid: 'bg-yellow-500',
  },
  Horror: {
    bg: 'bg-purple-500/15',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    solid: 'bg-purple-500',
  },
  'Q&A': {
    bg: 'bg-green-500/15',
    text: 'text-green-400',
    border: 'border-green-500/30',
    solid: 'bg-green-500',
  },
  Rekap: {
    bg: 'bg-gray-500/15',
    text: 'text-gray-400',
    border: 'border-gray-500/30',
    solid: 'bg-gray-500',
  },
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<AngleSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [configured, setConfigured] = useState(false)

  useEffect(() => {
    const isConfigured = isSupabaseConfigured()
    setConfigured(isConfigured)

    if (!isConfigured) {
      setLoading(false)
      return
    }
    fetchSchedule()
  }, [])

  async function fetchSchedule() {
    const supabase = getSupabase()
    if (!supabase) return

    const { data } = await supabase
      .from('angle_schedule')
      .select('*')
      .order('day_of_week')

    setSchedule(data || [])
    setLoading(false)
  }

  if (!configured) {
    return <NotConfigured />
  }

  function getAngleForSlot(day: string, slot: string) {
    const entry = schedule.find(
      (s) => s.day_of_week.toLowerCase() === day.toLowerCase() && s.time_slot === slot
    )
    return entry?.angle || '-'
  }

  function getAngleStyle(angle: string) {
    for (const [key, value] of Object.entries(angleConfig)) {
      if (angle.toLowerCase().includes(key.toLowerCase())) {
        return value
      }
    }
    return { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/30', solid: 'bg-gray-500' }
  }

  // Calculate stats
  function getAngleStats() {
    const stats: Record<string, number> = {}
    days.forEach((day) => {
      slots.forEach((slot) => {
        const angle = getAngleForSlot(day, slot.time)
        if (angle !== '-') {
          stats[angle] = (stats[angle] || 0) + 1
        }
      })
    })
    return stats
  }

  function getSlotStats() {
    const stats: Record<string, number> = {}
    slots.forEach((slot) => {
      let count = 0
      days.forEach((day) => {
        const angle = getAngleForSlot(day, slot.time)
        if (angle !== '-') count++
      })
      stats[slot.label] = count
    })
    return stats
  }

  const angleStats = getAngleStats()
  const slotStats = getSlotStats()
  const totalSlots = Object.values(angleStats).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schedule</h1>
          <p className="text-gray-400 mt-1">Jadwal angle konten per hari dan jam</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>{totalSlots} slot terisi</span>
        </div>
      </div>

      {loading ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
          <div className="space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-20 h-10 bg-gray-700 rounded animate-pulse" />
                <div className="flex-1 h-10 bg-gray-700 rounded animate-pulse" />
                <div className="flex-1 h-10 bg-gray-700 rounded animate-pulse" />
                <div className="flex-1 h-10 bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Heatmap Grid */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            {/* Slot Headers */}
            <div className="grid grid-cols-[120px_repeat(3,1fr)] bg-gray-700/50 border-b border-gray-700">
              <div className="px-4 py-3 text-sm font-medium text-gray-300">Hari</div>
              {slots.map((slot) => (
                <div key={slot.time} className="px-4 py-3 text-center border-l border-gray-700">
                  <div className="flex items-center justify-center gap-2">
                    <span>{slot.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-300">{slot.time}</p>
                      <p className="text-xs text-gray-500">{slot.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Day Rows */}
            <div className="divide-y divide-gray-700">
              {days.map((day, dayIdx) => (
                <div
                  key={day}
                  className={`grid grid-cols-[120px_repeat(3,1fr)] ${
                    dayIdx % 2 === 0 ? 'bg-gray-700/10' : ''
                  }`}
                >
                  {/* Day Name */}
                  <div className="px-4 py-4 flex items-center">
                    <span className="font-medium text-gray-200">{day}</span>
                  </div>

                  {/* Slots */}
                  {slots.map((slot) => {
                    const angle = getAngleForSlot(day, slot.time)
                    const style = getAngleStyle(angle)

                    return (
                      <div
                        key={slot.time}
                        className="px-3 py-3 border-l border-gray-700 flex items-center justify-center"
                      >
                        {angle === '-' ? (
                          <div className="w-full h-12 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-gray-600">Kosong</span>
                          </div>
                        ) : (
                          <div
                            className={`w-full h-12 rounded-lg border ${style.bg} ${style.border} flex items-center justify-center transition-all hover:scale-105 cursor-default`}
                          >
                            <span className={`text-sm font-semibold ${style.text}`}>{angle}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Angle Distribution */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold">Distribusi Angle</h2>
              </div>
              <div className="space-y-3">
                {Object.entries(angleStats)
                  .sort(([, a], [, b]) => b - a)
                  .map(([angle, count]) => {
                    const style = getAngleStyle(angle)
                    const percentage = totalSlots > 0 ? (count / totalSlots) * 100 : 0

                    return (
                      <div key={angle} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${style.solid}`} />
                            <span className="text-sm text-gray-300">{angle}</span>
                          </div>
                          <span className="text-sm text-gray-400">
                            {count} slot ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${style.solid} rounded-full transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Slot Analysis */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold">Analisis per Slot Waktu</h2>
              </div>
              <div className="space-y-4">
                {slots.map((slot) => {
                  const count = slotStats[slot.label] || 0
                  const maxDays = days.length
                  const percentage = (count / maxDays) * 100

                  return (
                    <div key={slot.time} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{slot.icon}</span>
                          <span className="text-sm font-medium text-gray-300">
                            {slot.label} ({slot.time})
                          </span>
                        </div>
                        <span className="text-sm text-gray-400">
                          {count}/{maxDays} hari
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {days.map((day) => {
                          const angle = getAngleForSlot(day, slot.time)
                          const style = getAngleStyle(angle)

                          return (
                            <div
                              key={day}
                              className={`flex-1 h-6 rounded ${
                                angle === '-' ? 'bg-gray-700' : style.solid
                              }`}
                              title={`${day} ${slot.time}: ${angle}`}
                            />
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-500 mb-2">Legend hari:</p>
                <div className="flex gap-2 text-xs text-gray-400">
                  {days.map((day, i) => (
                    <span key={day}>
                      {day.slice(0, 2)}{i < days.length - 1 ? ' • ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Keterangan Warna</h2>
            <div className="flex flex-wrap gap-4">
              {Object.entries(angleConfig).map(([name, style]) => (
                <div key={name} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${style.solid}`} />
                  <span className="text-sm text-gray-300">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
