'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Lock, Flame, BookOpen, Star, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { FormattedLessonContent } from '@/components/formed/FormattedLessonContent'
import { createClient } from '@/lib/supabase/client'
import type { DiscipleshipLesson } from '@/lib/types'

type LessonWithProgress = DiscipleshipLesson & { completed: boolean; progress_id?: string }

export default function JourneyPage() {
  const [lessons, setLessons] = useState<LessonWithProgress[]>([])
  const [currentDay, setCurrentDay] = useState(1)
  const [prayerStreak, setPrayerStreak] = useState(0)
  const [readingStreak, setReadingStreak] = useState(0)
  const [markingDone, setMarkingDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [{ data: prof }, { data: lessonsData }, { data: progressData }] = await Promise.all([
        supabase.from('profiles').select('discipleship_day, prayer_streak, reading_streak').eq('id', user.id).single(),
        supabase.from('discipleship_lessons').select('*').order('day_number'),
        supabase.from('lesson_progress').select('*').eq('user_id', user.id),
      ])

      const day = prof?.discipleship_day ?? 1
      setCurrentDay(day)
      setPrayerStreak(prof?.prayer_streak ?? 0)
      setReadingStreak(prof?.reading_streak ?? 0)

      const completedIds = new Set((progressData ?? []).filter((p: { completed: boolean }) => p.completed).map((p: { lesson_id: string }) => p.lesson_id))

      setLessons((lessonsData ?? []).map((l: DiscipleshipLesson) => ({
        ...l,
        completed: completedIds.has(l.id),
      })))

      setLoading(false)
    }
    load()
  }, [])

  const currentLesson = lessons.find(l => l.day_number === currentDay) ?? lessons[0]
  const alreadyCompleted = currentLesson?.completed ?? false

  const handleMarkComplete = async () => {
    if (!userId || !currentLesson || alreadyCompleted) return
    setMarkingDone(true)
    const supabase = createClient()

    await supabase.from('lesson_progress').upsert({
      user_id: userId,
      lesson_id: currentLesson.id,
      completed: true,
      completed_at: new Date().toISOString(),
    })

    const nextDay = currentDay + 1
    await supabase.from('profiles').update({
      discipleship_day: nextDay,
      reading_streak: readingStreak + 1,
    }).eq('id', userId)

    setLessons(ls => ls.map(l => l.id === currentLesson.id ? { ...l, completed: true } : l))
    setCurrentDay(nextDay)
    setReadingStreak(s => s + 1)
    setMarkingDone(false)
  }

  const TOTAL_DAYS = 365
  const completed = lessons.filter(l => l.completed).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#1F5E4A]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-[#1F5E4A] via-[#2d7a61] to-[#1a4d3d] text-white px-4 pt-10 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/60 text-xs uppercase tracking-widest font-medium">Your Journey</p>
              <h1 className="text-2xl font-bold mt-1">Day {currentDay} of {TOTAL_DAYS}</h1>
            </div>
            <div className="flex gap-3">
              <div className="text-center">
                <div className="flex items-center gap-1 text-[#D4A72C]">
                  <Flame className="w-4 h-4" />
                  <span className="font-bold text-lg">{prayerStreak}</span>
                </div>
                <p className="text-white/50 text-xs">Prayer</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-[#D4A72C]">
                  <BookOpen className="w-4 h-4" />
                  <span className="font-bold text-lg">{readingStreak}</span>
                </div>
                <p className="text-white/50 text-xs">Reading</p>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <Progress value={(completed / TOTAL_DAYS) * 100} className="h-2 bg-white/20" />
            <p className="text-white/50 text-xs mt-1">{completed} of {TOTAL_DAYS} lessons complete</p>
          </div>

          {currentLesson && (
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm mt-4">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-[#D4A72C]" />
                <span className="text-[#D4A72C] text-xs font-semibold uppercase tracking-wide">Today's Lesson</span>
              </div>
              <h2 className="text-xl font-bold">{currentLesson.title}</h2>
              <p className="text-white/70 text-sm mt-1">{currentLesson.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {currentLesson && <FormattedLessonContent lesson={currentLesson} />}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Button
            onClick={handleMarkComplete}
            disabled={alreadyCompleted || markingDone}
            className={`w-full h-12 font-semibold rounded-xl text-base transition-all ${
              alreadyCompleted ? 'bg-green-500 text-white cursor-default' : 'bg-[#1F5E4A] hover:bg-[#174d3c] text-white'
            }`}
          >
            {markingDone ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : alreadyCompleted ? (
              <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Lesson Complete!</span>
            ) : (
              <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Mark Complete</span>
            )}
          </Button>
        </motion.div>

        <div>
          <h3 className="font-bold text-gray-800 mb-3">All Lessons</h3>
          <div className="space-y-2">
            {lessons.map(lesson => {
              const isCurrent = lesson.day_number === currentDay
              const isLocked = lesson.day_number > currentDay
              return (
                <div
                  key={lesson.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isCurrent ? 'border-[#1F5E4A] bg-[#f0f7f4]'
                    : isLocked ? 'border-gray-100 bg-gray-50 opacity-60'
                    : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    lesson.completed ? 'bg-[#1F5E4A] text-white'
                    : isCurrent ? 'border-2 border-[#1F5E4A] text-[#1F5E4A]'
                    : 'bg-gray-100 text-gray-400'
                  }`}>
                    {lesson.completed ? <CheckCircle2 className="w-4 h-4" />
                    : isLocked ? <Lock className="w-3.5 h-3.5" />
                    : <span className="text-xs font-bold">{lesson.day_number}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isCurrent ? 'text-[#1F5E4A]' : 'text-gray-700'}`}>
                      Day {lesson.day_number} — {lesson.title}
                    </p>
                    {lesson.scripture_ref && (
                      <p className="text-xs text-gray-400 mt-0.5">{lesson.scripture_ref}</p>
                    )}
                  </div>
                  {isCurrent && <Badge className="bg-[#1F5E4A]/10 text-[#1F5E4A] border-0 text-xs flex-shrink-0">Today</Badge>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
