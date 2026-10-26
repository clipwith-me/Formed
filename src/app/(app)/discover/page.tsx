"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search, BookOpen, Loader2, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { CURRICULUM, LEVEL_ORDER } from "@/lib/curriculum"
import { useRouter } from "next/navigation"

type Post = {
  id: string
  type: string
  content: string
  author_name: string
  created_at: string
}

type FlatLesson = {
  id: string
  title: string
  description: string
  level: string
  levelEmoji: string
  chapterTitle: string
}

const FILTER_TABS = ["All", "Lessons", "Testimonies", "Topics"]

const TRENDING_TOPICS = [
  "Prayer", "Grace", "Holy Spirit", "Marriage", "Purpose",
  "Faith", "Identity", "Healing", "Fasting", "New Believer",
  "Discipleship", "Worship", "Love",
]

function flattenCurriculum(): FlatLesson[] {
  const result: FlatLesson[] = []
  LEVEL_ORDER.forEach(level => {
    const levelData = CURRICULUM[level]
    levelData.chapters.forEach(chapter => {
      chapter.lessons.forEach(lesson => {
        result.push({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          level: levelData.label,
          levelEmoji: levelData.emoji,
          chapterTitle: chapter.title,
        })
      })
    })
  })
  return result
}

const ALL_LESSONS = flattenCurriculum()

export default function DiscoverPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("All")
  const [query, setQuery] = useState("")
  const [testimonies, setTestimonies] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: postRows } = await supabase
        .from('posts')
        .select('id, type, content, author_id, created_at')
        .eq('type', 'TESTIMONY')
        .order('created_at', { ascending: false })
        .limit(6)

      if (postRows && postRows.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const authorIds = [...new Set((postRows as any[]).map((p: any) => p.author_id))]
        const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', authorIds)
        const nameMap: Record<string, string> = {}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(profiles ?? []).forEach((p: any) => { nameMap[p.id] = p.full_name ?? 'Anonymous' })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setTestimonies((postRows as any[]).map((p: any) => ({
          id: p.id, type: p.type,
          content: p.content ?? '',
          author_name: nameMap[p.author_id] ?? 'Anonymous',
          created_at: p.created_at,
        })))
      }
      setLoading(false)
    }
    load()
  }, [])

  const filteredLessons = ALL_LESSONS.filter(l =>
    !query ||
    l.title.toLowerCase().includes(query.toLowerCase()) ||
    l.chapterTitle.toLowerCase().includes(query.toLowerCase()) ||
    l.level.toLowerCase().includes(query.toLowerCase())
  )

  const showLessons = activeTab === 'All' || activeTab === 'Lessons'
  const showTestimonies = activeTab === 'All' || activeTab === 'Testimonies'
  const showTopics = activeTab === 'All' || activeTab === 'Topics'
  const displayLessons = showLessons ? (activeTab === 'Lessons' ? filteredLessons : filteredLessons.slice(0, 6)) : []

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-black text-[#222222] mb-1">Discover</h1>
        <p className="text-gray-500 text-sm">Explore resources for your faith journey</p>
      </motion.div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search lessons, topics..."
          className="pl-10"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTER_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              activeTab === tab ? "bg-[#1F5E4A] text-white shadow-sm" : "bg-white text-gray-500 border border-gray-100"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Featured banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl h-44 cursor-pointer"
        style={{ background: "linear-gradient(135deg, #1F5E4A 0%, #0d3d2e 100%)" }}
        onClick={() => router.push('/journey')}
      >
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 70% 30%, rgba(212,167,44,0.4) 0%, transparent 60%)" }} />
        <div className="relative p-6 flex flex-col justify-end h-full">
          <span className="bg-[#D4A72C] text-white text-xs font-bold px-2.5 py-1 rounded-full w-fit mb-2">Your Journey</span>
          <h2 className="text-white font-black text-xl leading-tight mb-1">Structured Discipleship Curriculum</h2>
          <p className="text-white/70 text-sm">{ALL_LESSONS.length} lessons · Beginner → Advanced · Tap to start</p>
        </div>
      </motion.div>

      {loading && showTestimonies ? (
        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-[#1F5E4A]" /></div>
      ) : (
        <>
          {/* Lessons from curriculum */}
          {showLessons && displayLessons.length > 0 && (
            <section>
              <div className="section-header">
                <h2 className="section-title">Discipleship Lessons</h2>
                <button onClick={() => router.push('/journey')} className="see-all-link">See all</button>
              </div>
              <div className="space-y-2">
                {displayLessons.map((lesson, i) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => router.push('/journey')}
                    className="cursor-pointer"
                  >
                    <Card className="border-0 shadow-sm rounded-xl hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#1F5E4A]/10 flex items-center justify-center flex-shrink-0 text-xl">
                          {lesson.levelEmoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#1F5E4A] font-semibold mb-0.5">{lesson.level} · {lesson.chapterTitle}</p>
                          <p className="text-sm font-bold text-gray-800 truncate">{lesson.title}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{lesson.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Testimonies */}
          {showTestimonies && testimonies.length > 0 && (
            <section>
              <div className="section-header">
                <h2 className="section-title">Community Testimonies</h2>
                <button onClick={() => router.push('/community')} className="see-all-link">See all</button>
              </div>
              <div className="space-y-3">
                {testimonies.map((t, i) => (
                  <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="border-0 shadow-sm rounded-xl">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full bg-[#1F5E4A]/10 flex items-center justify-center text-xs font-bold text-[#1F5E4A]">
                            {t.author_name.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{t.author_name}</span>
                          <span className="text-xs text-[#D4A72C] font-medium ml-auto">✝️ Testimony</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{t.content}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Topics */}
          {showTopics && (
            <section>
              <div className="section-header">
                <h2 className="section-title">Trending Topics</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_TOPICS.filter(t => !query || t.toLowerCase().includes(query.toLowerCase())).map((topic, i) => (
                  <motion.button
                    key={topic}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                    onClick={() => { setQuery(topic); setActiveTab('Lessons') }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                      i % 3 === 0 ? "bg-[#1F5E4A] text-white"
                      : i % 3 === 1 ? "bg-[#D4A72C] text-white"
                      : "bg-[#e8f4ef] text-[#1F5E4A] border border-[#1F5E4A]/20"
                    }`}
                  >
                    #{topic}
                  </motion.button>
                ))}
              </div>
            </section>
          )}

          {/* Empty search state */}
          {query && displayLessons.length === 0 && testimonies.length === 0 && (
            <div className="text-center py-10">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-sm text-gray-400">No results for &ldquo;{query}&rdquo;</p>
              <button onClick={() => setQuery('')} className="text-xs text-[#1F5E4A] font-semibold mt-2 hover:underline">Clear search</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
