export type UserRole = 'GUEST' | 'BELIEVER' | 'VOLUNTEER' | 'MENTOR' | 'CHURCH_ADMIN' | 'ADMIN'
export type PostType = 'TESTIMONY' | 'ARTICLE' | 'PRAYER' | 'QUESTION' | 'PRAISE' | 'MISSION_UPDATE'
export type BelieverStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'MENTORED' | 'DISCIPLE_MAKER'
export type MentorshipStatus = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED'
export type SessionType = 'CALL' | 'CHAT' | 'IN_PERSON' | 'VIDEO'

export interface Profile {
  id: string
  full_name: string | null
  username: string | null
  bio: string | null
  avatar_url: string | null
  cover_url: string | null
  role: UserRole
  church_name: string | null
  country: string | null
  city: string | null
  date_of_conversion: string | null
  discipleship_day: number
  prayer_streak: number
  reading_streak: number
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  author_id: string
  type: PostType
  title: string | null
  content: string
  image_url: string | null
  is_published: boolean
  like_count: number
  comment_count: number
  prayer_count: number
  created_at: string
  author?: Profile
}

export interface Believer {
  id: string
  registered_by: string
  assigned_to: string | null
  full_name: string
  phone: string | null
  email: string | null
  gender: string | null
  age: number | null
  country: string | null
  city: string | null
  language: string
  church: string | null
  date_of_conversion: string | null
  how_came_to_christ: string | null
  prayer_needs: string | null
  status: BelieverStatus
  consent: boolean
  created_at: string
}

export interface PrayerRequest {
  id: string
  author_id: string
  title: string | null
  content: string
  is_answered: boolean
  is_public: boolean
  prayer_count: number
  created_at: string
  author?: Profile
}

export interface DiscipleshipLesson {
  id: string
  day_number: number
  title: string
  description: string | null
  content: string | null
  scripture: string | null
  scripture_ref: string | null
  reflection_question: string | null
  action_step: string | null
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  link: string | null
  is_read: boolean
  created_at: string
}

export interface Badge {
  key: string
  label: string
  description: string
  icon: string
  earned_at?: string
}

export interface FollowupSession {
  id: string
  believer_id: string
  volunteer_id: string
  session_date: string
  type: SessionType
  notes: string | null
  duration_minutes: number | null
  created_at: string
}

export interface Mentorship {
  id: string
  mentor_id: string
  mentee_id: string
  status: MentorshipStatus
  started_at: string | null
  created_at: string
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  completed: boolean
  completed_at: string | null
  notes: string | null
}
