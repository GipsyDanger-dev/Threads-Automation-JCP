'use client'

import { useEffect, useState } from 'react'
import NotConfigured from '@/components/NotConfigured'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { AngleSchedule } from '@/types'

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
const slots = ['08:00', '12:00', '16:00']

const angleColors: Record<string, { bg: string; text: string }> = {
  Serius: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  Lucu: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  Horror: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  'Q&A': { bg: 'bg-green-500/20', text: 'text-green-400' },
  Rekap: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
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
    for (const [key, value] of Object.entries(angleColors)) {
      if (angle.toLowerCase().includes(key.toLowerCase())) {
        return value
      }
    }
    return { bg: 'bg-gray-500/20', text: 'text-gray-400' }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Schedule</h1>
        <p className="text-gray-400 mt-1">Jadwal angle konten per hari dan jam</p>
      </div>

      {loading ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center text-gray-400">
          Loading...
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-300 w-32">Hari</th>
                {slots.map((slot) => (
                  <th key={slot} className="text-center px-6 py-4 text-sm font-medium text-gray-300">
                    {slot}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {days.map((day, idx) => (
                <tr key={day} className={idx % 2 === 0 ? 'bg-gray-700/20' : ''}>
                  <td className="px-6 py-4 font-medium">{day}</td>
                  {slots.map((slot) => {
                    const angle = getAngleForSlot(day, slot)
                    const style = getAngleStyle(angle)
                    return (
                      <td key={slot} className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${style.bg} ${style.text}`}
                        >
                          {angle}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Legend</h2>
        <div className="flex flex-wrap gap-4">
          {Object.entries(angleColors).map(([name, style]) => (
            <div key={name} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${style.bg.replace('/20', '')}`}></span>
              <span className="text-sm text-gray-300">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
