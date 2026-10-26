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

      // Fetch all base data in parallel — no FK joins to avoid 400 errors
      const [{ data: prof }, { data: prayerRows }, { data: postRows }] = await Promise.all([
        supabase.from('profiles').select('full_name, discipleship_day, prayer_streak').eq('id', user.id).single(),
        supabase.from('prayer_requests')
          .select('id, author_id, content, prayer_count, created_at')
          .eq('is_public', true).eq('is_answered', false)
          .order('created_at', { ascending: false }).limit(3),
        supabase.from('posts')
          .select('*')
          .eq('type', 'TESTIMONY')
          .order('created_at', { ascending: false }).limit(3),
      ])

      if (prof) {
        setProfile(prof as Profile)
        // discipleship_lessons may not exist yet — silently ignore 404
        const day = (prof as Profile).discipleship_day ?? 1
        const { data: lesson } = await supabase
          .from('discipleship_lessons')
          .select('title')
          .eq('day_number', day)
          .maybeSingle()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (lesson) setLessonTitle((lesson as any).title)
      }

      // Collect unique author IDs and fetch names in one query
      const prayerUserIds = (prayerRows ?? []).map(r => r.author_id).filter(Boolean)
      const postAuthorIds = (postRows ?? []).map(r => r.author_id).filter(Boolean)
      const allIds = [...new Set([...prayerUserIds, ...postAuthorIds])]

      const nameMap: Record<string, string> = {}
      if (allIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, is_verified')
          .in('id', allIds)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(profiles ?? []).forEach((p: any) => { nameMap[p.id] = p.full_name ?? 'Anonymous' })
      }

      if (prayerRows) {
        setPrayers(prayerRows.map(p => ({
          id: p.id,
          userName: nameMap[p.author_id] ?? 'Anonymous',
          request: p.content,
          prayingCount: p.prayer_count,
          createdAt: new Date(p.created_at),
        })))
      }

      if (postRows) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setTestimonies((postRows as any[]).map((p: any) => ({
          userName: nameMap[p.author_id] ?? 'Anonymous',
          testimony: p.content ?? '',
          likes: p.like_count ?? 0,
          comments: p.comment_count ?? 0,
          createdAt: new Date(p.created_at),
          isVerified: false,
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
