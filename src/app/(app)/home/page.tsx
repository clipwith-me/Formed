"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { DailyVerse } from "@/components/formed/DailyVerse"
import { DiscipleshipProgress } from "@/components/formed/DiscipleshipProgress"
import { PrayerCard } from "@/components/formed/PrayerCard"
import { TestimonyCard } from "@/components/formed/TestimonyCard"
import { createClient } from "@/lib/supabase/client"

type PrayerItem = {
  id: string
  userName: string
  request: string
  prayingCount: number
  createdAt: Date
}

type TestimonyItem = {
  userName: string
  testimony: string
  likes: number
  comments: number
  createdAt: Date
  isVerified: boolean
}

type Profile = {
  full_name: string | null
  discipleship_day: number
  prayer_streak: number
}

type LessonRow = { title: string; day_number: number }

export default function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [lessonTitle, setLessonTitle] = useState('Your Journey Continues')
  const [prayers, setPrayers] = useState<PrayerItem[]>([])
  const [testimonies, setTestimonies] = useState<TestimonyItem[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: prof }, { data: prayerData }, { data: postData }] = await Promise.all([
        supabase.from('profiles').select('full_name, discipleship_day, prayer_streak').eq('id', user.id).single(),
        supabase.from('prayer_requests').select('id, content, prayer_count, created_at, profiles(full_name)').eq('is_public', true).eq('is_answered', false).order('created_at', { ascending: false }).limit(3),
        supabase.from('posts').select('id, content, like_count, comment_count, created_at, profiles(full_name, is_verified)').eq('type', 'TESTIMONY').eq('is_published', true).order('created_at', { ascending: false }).limit(3),
      ])

      if (prof) {
        setProfile(prof as Profile)
        const day = prof.discipleship_day ?? 1
        const { data: lesson } = await supabase.from('discipleship_lessons').select('title, day_number').eq('day_number', day).single()
        if (lesson) setLessonTitle((lesson as LessonRow).title)
      }

      if (prayerData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setPrayers((prayerData as any[]).map(p => ({
          id: p.id,
          userName: Array.isArray(p.profiles) ? p.profiles[0]?.full_name ?? 'Anonymous' : p.profiles?.full_name ?? 'Anonymous',
          request: p.content,
          prayingCount: p.prayer_count,
          createdAt: new Date(p.created_at),
        })))
      }

      if (postData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setTestimonies((postData as any[]).map(p => ({
          userName: Array.isArray(p.profiles) ? p.profiles[0]?.full_name ?? 'Anonymous' : p.profiles?.full_name ?? 'Anonymous',
          testimony: p.content,
          likes: p.like_count,
          comments: p.comment_count,
          createdAt: new Date(p.created_at),
          isVerified: Array.isArray(p.profiles) ? p.profiles[0]?.is_verified ?? false : p.profiles?.is_verified ?? false,
        })))
      }
    }
    load()
  }, [])

  const firstName = profile?.full_name?.split(' ')[0] ?? 'friend'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-black text-[#222222]">
          {greeting}, {firstName} 🌿
        </h1>
        <p className="text-gray-500 mt-1">Continue your discipleship journey</p>
      </motion.div>

      <section>
        <DailyVerse />
      </section>

      <section>
        <div className="section-header">
          <h2 className="section-title">Continue Journey</h2>
          <a href="/journey" className="see-all-link">View all</a>
        </div>
        <DiscipleshipProgress
          currentDay={profile?.discipleship_day ?? 1}
          totalDays={365}
          lessonTitle={lessonTitle}
          streak={profile?.prayer_streak ?? 0}
        />
      </section>

      {prayers.length > 0 && (
        <section>
          <div className="section-header">
            <h2 className="section-title">Prayer Wall 🙏</h2>
            <a href="/prayer" className="see-all-link">See all</a>
          </div>
          <div className="space-y-3">
            {prayers.map((prayer, i) => (
              <PrayerCard key={prayer.id} {...prayer} index={i} />
            ))}
          </div>
        </section>
      )}

      {testimonies.length > 0 && (
        <section>
          <div className="section-header">
            <h2 className="section-title">Community</h2>
            <a href="/community" className="see-all-link">See all</a>
          </div>
          <div className="space-y-3">
            {testimonies.map((t, i) => (
              <TestimonyCard key={i} {...t} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
