export interface PersonaPillar {
  id: string
  pillar_name: string
  persona_text: string
  tone_rules: string | null
  style_examples: string | null
  updated_at: string
}

export interface AngleSchedule {
  id: string
  pillar_name: string
  day_of_week: string
  time_slot: string
  angle: string
}

export interface Draft {
  id: string
  pillar_name: string
  angle: string
  topic: string | null
  status: string
  scheduled_time: string | null
  actual_publish_time: string | null
  telegram_message_id: string | null
  reminder_count: number
  created_at: string
  edit_mode: string | null
}

export interface History {
  id: string
  pillar_name: string
  angle: string
  topic: string
  caption: string
  published_at: string | null
}

export interface ThreadPost {
  id: string
  draft_id: string
  post_order: number
  content: string
  created_at: string
}

export interface StatsOverview {
  totalPublished: number
  totalPending: number
  totalRejected: number
  totalDrafts: number
  totalPosts: number
}
