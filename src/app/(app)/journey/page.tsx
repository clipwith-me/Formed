"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, CheckCircle2, Lock, ChevronRight,
  BookOpen, Star, Trophy, Loader2, Play
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { ScriptureVideoPlayer } from "@/components/formed/ScriptureVideoPlayer"
import {
  CURRICULUM, LEVEL_ORDER, getAllLessons, getTotalLessons,
  isChapterUnlocked, isLevelUnlocked,
  type Level, type Chapter, type Lesson,
} from "@/lib/curriculum"

const STORAGE_KEY = 'formed_completed_lessons'

type ActiveLesson = {
  level: Level
  levelIdx: number
  chapter: Chapter
  chapterIdx: number
  lesson: Lesson
}

export default function JourneyPage() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [activeLevel, setActiveLevel] = useState<Level>('BEGINNER')
  const [openLesson, setOpenLesson] = useState<ActiveLesson | null>(null)
  const [videoWatched, setVideoWatched] = useState(false)
  const [marking, setMarking] = useState(false)
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const totalLessons = getTotalLessons()

  useEffect(() => {
    async function loadProgress() {
      // Optimistically load from localStorage first for instant render
      try {
        const cached = localStorage.getItem(STORAGE_KEY)
        if (cached) setCompletedIds(new Set(JSON.parse(cached)))
      } catch {}

      // Then fetch from DB and merge (DB is source of truth)
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('completed_lessons')
            .eq('id', user.id)
            .single()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const dbIds: string[] = (data as any)?.completed_lessons ?? []
          if (dbIds.length > 0) {
            const merged = new Set(dbIds)
            setCompletedIds(merged)
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...merged]))
          }
        }
      } catch {}

      setLoading(false)
    }
    loadProgress()
  }, [])

  const saveCompleted = async (ids: Set<string>) => {
    setCompletedIds(ids)
    // Always update localStorage immediately for responsiveness
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
    // Persist to DB for cross-device sync
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({
          completed_lessons: [...ids],
          discipleship_day: ids.size,
        }).eq('id', user.id)
      }
    } catch {}
  }

  const markComplete = async (lesson: Lesson) => {
    setMarking(true)
    const next = new Set(completedIds)
    next.add(lesson.id)
    await saveCompleted(next)
    setMarking(false)
  }

  const toggleChapter = (chId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev)
      next.has(chId) ? next.delete(chId) : next.add(chId)
      return next
    })
  }

  const openLessonView = (
    level: Level, levelIdx: number,
    chapter: Chapter, chapterIdx: number, lesson: Lesson
  ) => {
    setOpenLesson({ level, levelIdx, chapter, chapterIdx, lesson })
    setVideoWatched(false)
    window.scrollTo(0, 0)
  }

  const closeLesson = () => setOpenLesson(null)

  const handleMarkComplete = async () => {
    if (!openLesson) return
    await markComplete(openLesson.lesson)
    const all = getAllLessons()
    const idx = all.findIndex(x => x.lesson.id === openLesson.lesson.id)
    if (idx < all.length - 1) {
      const next = all[idx + 1]
      const nextLevelIdx = LEVEL_ORDER.indexOf(next.level)
      const nextChapterIdx = CURRICULUM[next.level].chapters.indexOf(next.chapter)
      setTimeout(() => {
        openLessonView(next.level, nextLevelIdx, next.chapter, nextChapterIdx, next.lesson)
      }, 300)
    } else {
      closeLesson()
    }
  }

  const chapterProgress = (chapter: Chapter) => {
    const done = chapter.lessons.filter(l => completedIds.has(l.id)).length
    return { done, total: chapter.lessons.length, pct: done / Math.max(chapter.lessons.length, 1) }
  }

  const levelProgress = (level: Level) => {
    const chapters = CURRICULUM[level].chapters
    const total = chapters.reduce((s, c) => s + c.lessons.length, 0)
    const done = chapters.reduce((s, c) => s + c.lessons.filter(l => completedIds.has(l.id)).length, 0)
    return { done, total, pct: done / Math.max(total, 1) }
  }

  // ─── Lesson Detail View ───────────────────────────────────────────────
  if (openLesson) {
    const { chapter, lesson, level } = openLesson
    const isComplete = completedIds.has(lesson.id)
    const levelData = CURRICULUM[level]

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={lesson.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="space-y-5 pb-8"
        >
          <button
            onClick={closeLesson}
            className="flex items-center gap-1.5 text-sm text-[#1F5E4A] font-semibold hover:opacity-70 transition-opacity -ml-0.5"
          >
            <ArrowLeft size={16} /> Back to Journey
          </button>

          <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
            <span>{levelData.emoji} {levelData.label}</span>
            <ChevronRight size={12} />
            <span>{chapter.emoji} {chapter.title}</span>
          </div>

          <div>
            <h1 className="text-xl font-black text-[#222222] leading-tight">{lesson.title}</h1>
            <p className="text-xs text-[#1F5E4A] font-semibold mt-1 uppercase tracking-wide">
              {chapter.title} · Scripture Series · {lesson.slides.length * 12}s
            </p>
          </div>

          <ScriptureVideoPlayer
            lessonTitle={lesson.title}
            chapterTitle={`${chapter.emoji} ${chapter.title}`}
            slides={lesson.slides}
            onComplete={() => setVideoWatched(true)}
          />

          {!videoWatched && !isComplete && (
            <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1.5">
              <BookOpen size={12} /> Press play to watch the scripture series
            </p>
          )}

          <div className="bg-[#f8faf9] border border-[#e8f0ed] rounded-2xl p-5">
            <h3 className="font-bold text-sm text-[#1F5E4A] mb-2 flex items-center gap-2">
              <BookOpen size={14} /> About this lesson
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{lesson.description}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-gray-700">Key Scriptures</h3>
            {lesson.slides.map((slide, i) => (
              <div key={i} className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-[#1F5E4A]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-[#1F5E4A]">{i + 1}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#D4A72C] mb-0.5">{slide.reference}</p>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 italic">&ldquo;{slide.text}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>

          {isComplete ? (
            <div className="flex items-center justify-center gap-2 py-3 bg-[#e8f4ef] rounded-2xl">
              <CheckCircle2 size={18} className="text-[#1F5E4A]" />
              <span className="text-sm font-bold text-[#1F5E4A]">Lesson Complete — Well done!</span>
            </div>
          ) : (
            <Button
              onClick={handleMarkComplete}
              disabled={marking}
              className="w-full h-12 bg-[#1F5E4A] hover:bg-[#174d3c] text-white font-bold rounded-2xl text-base gap-2"
            >
              {marking
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><CheckCircle2 size={18} /> Mark as Complete</>
              }
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
    )
  }

  // ─── Curriculum Overview ──────────────────────────────────────────────
  const overall = {
    done: completedIds.size,
    total: totalLessons,
    pct: completedIds.size / Math.max(totalLessons, 1),
  }

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-black text-[#222222] mb-1">My Journey</h1>
        <p className="text-gray-500 text-sm">Your discipleship curriculum — step by step</p>
      </motion.div>

      {/* Overall progress */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl p-5 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1F5E4A 0%, #0d3d2e 100%)' }}
        >
          <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
            <Trophy size={64} />
          </div>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1">Overall Progress</p>
              <p className="text-3xl font-black">
                {overall.done}
                <span className="text-lg font-medium text-white/50"> / {overall.total}</span>
              </p>
              <p className="text-white/60 text-sm mt-0.5">lessons completed</p>
            </div>
            <div className="ml-auto flex-shrink-0">
              <svg width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
                <circle
                  cx="28" cy="28" r="22" fill="none"
                  stroke="#D4A72C" strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  strokeDashoffset={`${2 * Math.PI * 22 * (1 - overall.pct)}`}
                  transform="rotate(-90 28 28)"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
                <text x="28" y="33" textAnchor="middle" fill="white" fontSize="11" fontWeight="800">
                  {Math.round(overall.pct * 100)}%
                </text>
              </svg>
            </div>
          </div>
          <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D4A72C] rounded-full transition-all duration-700"
              style={{ width: `${overall.pct * 100}%` }}
            />
          </div>
        </motion.div>
      )}

      {/* Level tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {LEVEL_ORDER.map((level, li) => {
          const data = CURRICULUM[level]
          const unlocked = isLevelUnlocked(li, completedIds)
          const prog = levelProgress(level)
          const isActive = activeLevel === level
          return (
            <button
              key={level}
              onClick={() => unlocked && setActiveLevel(level)}
              disabled={!unlocked}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                isActive
                  ? 'bg-[#1F5E4A] text-white shadow-md'
                  : unlocked
                  ? 'bg-white text-gray-600 border border-gray-100 hover:border-[#1F5E4A]/30'
                  : 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
              }`}
            >
              <span>{data.emoji}</span>
              <span>{data.label}</span>
              {!unlocked && <Lock size={12} />}
              {unlocked && prog.done > 0 && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#e8f4ef] text-[#1F5E4A]'
                }`}>
                  {prog.done}/{prog.total}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Level header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">{CURRICULUM[activeLevel].emoji}</span>
        <div>
          <h2 className="font-black text-[#222222] text-lg leading-tight">{CURRICULUM[activeLevel].label}</h2>
          <p className="text-xs text-gray-400">{CURRICULUM[activeLevel].subtitle}</p>
        </div>
      </div>

      {/* Chapters */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-[#1F5E4A]" />
        </div>
      ) : (
        <div className="space-y-3">
          {CURRICULUM[activeLevel].chapters.map((chapter, ci) => {
            const levelIdx = LEVEL_ORDER.indexOf(activeLevel)
            const unlocked = isChapterUnlocked(ci, levelIdx, completedIds)
            const { done, total, pct } = chapterProgress(chapter)
            const isComplete = done === total && total > 0
            const isExpanded = expandedChapters.has(chapter.id)

            return (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ci * 0.05 }}
              >
                <div
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    !unlocked
                      ? 'bg-gray-50 border-gray-100 opacity-60'
                      : isComplete
                      ? 'bg-[#f0f9f4] border-[#1F5E4A]/20 shadow-sm'
                      : 'bg-white border-gray-100 shadow-sm'
                  }`}
                >
                  {/* Chapter header — tappable */}
                  <button
                    onClick={() => unlocked && toggleChapter(chapter.id)}
                    disabled={!unlocked}
                    className="w-full text-left p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                        isComplete ? 'bg-[#1F5E4A]/10' : 'bg-gray-100'
                      }`}>
                        {unlocked ? chapter.emoji : <Lock size={18} className="text-gray-400" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-[#1F5E4A] font-bold uppercase tracking-wide">
                            Chapter {chapter.number}
                          </span>
                          {isComplete && (
                            <span className="flex items-center gap-0.5 text-[10px] text-[#1F5E4A] font-bold bg-[#1F5E4A]/10 px-1.5 py-0.5 rounded-full">
                              <CheckCircle2 size={9} /> Done
                            </span>
                          )}
                        </div>
                        <p className="font-black text-[#222222] text-sm mt-0.5">{chapter.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{chapter.description}</p>

                        {unlocked && (
                          <div className="flex items-center gap-2 mt-2.5">
                            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#1F5E4A] rounded-full transition-all duration-500"
                                style={{ width: `${pct * 100}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{done}/{total} lessons</span>
                          </div>
                        )}
                      </div>

                      {unlocked && (
                        <div className={`w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                          <ChevronRight size={14} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Expanded lessons */}
                  <AnimatePresence>
                    {isExpanded && unlocked && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-100 divide-y divide-gray-50">
                          {chapter.lessons.map((lesson) => {
                            const lComplete = completedIds.has(lesson.id)
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => openLessonView(activeLevel, levelIdx, chapter, ci, lesson)}
                                className="w-full text-left px-4 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors active:bg-gray-100"
                              >
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  lComplete ? 'bg-[#1F5E4A]' : 'bg-[#D4A72C]/10'
                                }`}>
                                  {lComplete
                                    ? <CheckCircle2 size={17} className="text-white" />
                                    : <Play size={15} className="text-[#D4A72C] ml-0.5" />
                                  }
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-semibold truncate ${
                                    lComplete ? 'text-gray-400' : 'text-[#222222]'
                                  }`}>
                                    {lesson.title}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {lesson.slides.length} scriptures · {lesson.slides.length * 12}s video
                                  </p>
                                </div>
                                {lComplete
                                  ? <Star size={14} className="text-[#D4A72C] fill-[#D4A72C] flex-shrink-0" />
                                  : <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                                }
                              </button>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
