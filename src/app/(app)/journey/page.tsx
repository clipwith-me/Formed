'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Lock, Flame, BookOpen, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { FormattedLessonContent } from '@/components/formed/FormattedLessonContent'
import type { DiscipleshipLesson } from '@/lib/types'

const LESSONS: (DiscipleshipLesson & { completed?: boolean })[] = [
  {
    id: '1', day_number: 1, title: 'Welcome to the Family',
    description: 'You have made the most important decision of your life.',
    scripture: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    scripture_ref: 'John 3:16',
    reflection_question: 'What does it mean to you personally that God loves you enough to send His Son?',
    action_step: 'Write a short prayer thanking God for your salvation today.',
    content: null,
    completed: true,
  },
  {
    id: '2', day_number: 2, title: 'Assurance of Salvation',
    description: 'Ground yourself in the certainty of your salvation.',
    scripture: 'I write these things to you who believe in the name of the Son of God so that you may know that you have eternal life.',
    scripture_ref: '1 John 5:13',
    reflection_question: 'Have you ever doubted your salvation? What does 1 John 5:13 say to that doubt?',
    action_step: 'Memorize 1 John 5:13 today.',
    content: null,
    completed: true,
  },
  {
    id: '3', day_number: 3, title: 'The Power of Prayer',
    description: 'Prayer is simply talking with God — the most natural thing.',
    scripture: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.',
    scripture_ref: 'Philippians 4:6',
    reflection_question: 'What areas of your life do you need to surrender to God in prayer?',
    action_step: 'Set a daily alarm for prayer — morning, noon, and night.',
    content: null,
    completed: false,
  },
  {
    id: '4', day_number: 4, title: 'Reading the Bible',
    description: "The Bible is God's love letter to you.",
    scripture: 'Your word is a lamp for my feet, a light on my path.',
    scripture_ref: 'Psalm 119:105',
    reflection_question: 'Which part of the Bible are you most curious to explore?',
    action_step: 'Download a Bible app and read one chapter of John today.',
    content: null,
    completed: false,
  },
  {
    id: '5', day_number: 5, title: 'The Holy Spirit',
    description: 'You are not alone. The Holy Spirit lives inside you.',
    scripture: 'But the Advocate, the Holy Spirit, whom the Father will send in my name, will teach you all things.',
    scripture_ref: 'John 14:26',
    reflection_question: "In what ways have you already felt the Holy Spirit's guidance in your life?",
    action_step: 'Ask the Holy Spirit to guide you through one decision today.',
    content: null,
    completed: false,
  },
]

const CURRENT_DAY = 3
const TOTAL_DAYS = 365
const PRAYER_STREAK = 5
const READING_STREAK = 3

export default function JourneyPage() {
  const [completed, setCompleted] = useState(false)
  const currentLesson = LESSONS.find(l => l.day_number === CURRENT_DAY) ?? LESSONS[0]

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Hero Card */}
      <div className="bg-gradient-to-br from-[#1F5E4A] via-[#2d7a61] to-[#1a4d3d] text-white px-4 pt-10 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/60 text-xs uppercase tracking-widest font-medium">Your Journey</p>
              <h1 className="text-2xl font-bold mt-1">Day {CURRENT_DAY} of {TOTAL_DAYS}</h1>
            </div>
            <div className="flex gap-3">
              <div className="text-center">
                <div className="flex items-center gap-1 text-[#D4A72C]">
                  <Flame className="w-4 h-4" />
                  <span className="font-bold text-lg">{PRAYER_STREAK}</span>
                </div>
                <p className="text-white/50 text-xs">Prayer</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-[#D4A72C]">
                  <BookOpen className="w-4 h-4" />
                  <span className="font-bold text-lg">{READING_STREAK}</span>
                </div>
                <p className="text-white/50 text-xs">Reading</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <Progress value={(CURRENT_DAY / TOTAL_DAYS) * 100} className="h-2 bg-white/20" />
            <p className="text-white/50 text-xs mt-1">{Math.round((CURRENT_DAY / TOTAL_DAYS) * 100)}% complete</p>
          </div>

          {/* Current lesson title */}
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm mt-4">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-[#D4A72C]" />
              <span className="text-[#D4A72C] text-xs font-semibold uppercase tracking-wide">Today's Lesson</span>
            </div>
            <h2 className="text-xl font-bold">{currentLesson.title}</h2>
            <p className="text-white/70 text-sm mt-1">{currentLesson.description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Lesson content */}
        <FormattedLessonContent lesson={currentLesson} />

        {/* Mark Complete */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={() => setCompleted(true)}
            disabled={completed}
            className={`w-full h-12 font-semibold rounded-xl text-base transition-all ${
              completed
                ? 'bg-green-500 text-white cursor-default'
                : 'bg-[#1F5E4A] hover:bg-[#174d3c] text-white'
            }`}
          >
            {completed ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Lesson Complete! Great job.
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Mark Complete
              </span>
            )}
          </Button>
        </motion.div>

        {/* Lesson list */}
        <div>
          <h3 className="font-bold text-gray-800 mb-3">All Lessons</h3>
          <div className="space-y-2">
            {LESSONS.map(lesson => {
              const isCurrent = lesson.day_number === CURRENT_DAY
              const isLocked = lesson.day_number > CURRENT_DAY

              return (
                <div
                  key={lesson.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-[#1F5E4A] bg-[#f0f7f4]'
                      : isLocked
                      ? 'border-gray-100 bg-gray-50 opacity-60'
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    lesson.completed
                      ? 'bg-[#1F5E4A] text-white'
                      : isCurrent
                      ? 'border-2 border-[#1F5E4A] text-[#1F5E4A]'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {lesson.completed ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isLocked ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-xs font-bold">{lesson.day_number}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isCurrent ? 'text-[#1F5E4A]' : 'text-gray-700'}`}>
                      Day {lesson.day_number} — {lesson.title}
                    </p>
                    {lesson.scripture_ref && (
                      <p className="text-xs text-gray-400 mt-0.5">{lesson.scripture_ref}</p>
                    )}
                  </div>

                  {isCurrent && (
                    <Badge className="bg-[#1F5E4A]/10 text-[#1F5E4A] border-0 text-xs flex-shrink-0">Today</Badge>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
