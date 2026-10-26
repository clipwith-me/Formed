"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Search, GraduationCap, BookOpen, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import LessonCard from "@/components/formed/LessonCard"
import {
  type TeachingResource,
  type CurriculumPath,
  getApprovedResources,
  getCurriculumPaths,
  getUserCompletedIds,
  canLink,
} from "@/lib/video-library"
import { createClient } from "@/lib/supabase/client"

const PATH_COLORS: Record<string, string> = {
  A: "bg-emerald-50 border-emerald-200 text-emerald-700",
  B: "bg-blue-50 border-blue-200 text-blue-700",
  C: "bg-amber-50 border-amber-200 text-amber-700",
  D: "bg-purple-50 border-purple-200 text-purple-700",
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border bg-white shadow-sm p-4 flex gap-3 animate-pulse">
      <div className="w-20 h-14 rounded-xl bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="flex gap-1 mt-1">
          <div className="h-4 w-12 bg-gray-100 rounded-full" />
          <div className="h-4 w-16 bg-gray-100 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export default function LibraryPage() {
  const [paths, setPaths] = useState<CurriculumPath[]>([])
  const [resources, setResources] = useState<TeachingResource[]>([])
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<"paths" | "browse">("paths")
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const [pathData, resourceData] = await Promise.all([
        getCurriculumPaths(),
        getApprovedResources({ limit: 40 }),
      ])
      setPaths(pathData)
      setResources(resourceData)

      if (user) {
        const ids = await getUserCompletedIds(user.id)
        setCompletedIds(new Set(ids))
      }
      setLoading(false)
    }
    load()
  }, [])

  const filteredResources = resources.filter((r) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      r.title.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.speaker?.name.toLowerCase().includes(q) ||
      r.tags?.some((t) => t.toLowerCase().includes(q))
    )
  })

  const handleSearch = useCallback(
    async (value: string) => {
      setSearch(value)
      if (value.length < 2) return
      const results = await getApprovedResources({ search: value, limit: 30 })
      setResources(results)
    },
    []
  )

  return (
    <div className="space-y-6 max-w-2xl pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-6 h-6 text-[#1F5E4A]" />
          <h1 className="text-2xl font-black text-[#222222]">Library</h1>
        </div>
        <p className="text-gray-500 text-sm">Curated teaching resources for your discipleship journey</p>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search teachings, speakers, topics…"
          className="pl-10 h-11 rounded-xl border-gray-200 focus:border-[#1F5E4A]"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("paths")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === "paths"
              ? "bg-white text-[#1F5E4A] shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Curriculum Paths
        </button>
        <button
          onClick={() => setActiveTab("browse")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === "browse"
              ? "bg-white text-[#1F5E4A] shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Browse All
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : activeTab === "paths" ? (
        <div className="space-y-6">
          {paths.length === 0 ? (
            <EmptyState />
          ) : (
            paths.map((path) => {
              const approvedLessons = (path.lessons ?? []).filter(
                (l) => l.resource && canLink(l.resource.review_status)
              )
              const completedCount = approvedLessons.filter(
                (l) => completedIds.has(l.resource_id)
              ).length

              return (
                <motion.section
                  key={path.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {/* Path header */}
                  <div className={`rounded-xl border p-3 flex items-center gap-3 ${PATH_COLORS[path.code] ?? "bg-gray-50 border-gray-200 text-gray-700"}`}>
                    <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center font-black text-sm">
                      {path.code}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{path.title}</p>
                      {path.description && (
                        <p className="text-xs opacity-70 truncate">{path.description}</p>
                      )}
                    </div>
                    {approvedLessons.length > 0 && (
                      <span className="text-xs font-semibold opacity-70 flex-shrink-0">
                        {completedCount}/{approvedLessons.length}
                      </span>
                    )}
                  </div>

                  {/* Lessons */}
                  {approvedLessons.length === 0 ? (
                    <div className="text-center py-6 text-sm text-gray-400 bg-gray-50 rounded-xl">
                      Teachings are being curated for this path.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {approvedLessons
                        .sort((a, b) => a.lesson_number - b.lesson_number)
                        .map((lesson) => (
                          <LessonCard
                            key={lesson.id}
                            resource={lesson.resource!}
                            completed={completedIds.has(lesson.resource_id)}
                            lessonNumber={lesson.lesson_number}
                          />
                        ))}
                    </div>
                  )}
                </motion.section>
              )
            })
          )}
        </div>
      ) : (
        /* Browse tab */
        <div className="space-y-2">
          {filteredResources.length === 0 ? (
            search ? (
              <div className="text-center py-12">
                <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No teachings match &ldquo;{search}&rdquo;</p>
              </div>
            ) : (
              <EmptyState />
            )
          ) : (
            filteredResources.map((r) => (
              <LessonCard
                key={r.id}
                resource={r}
                completed={completedIds.has(r.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16 space-y-3">
      <BookOpen className="w-12 h-12 text-gray-200 mx-auto" />
      <p className="text-gray-400 font-medium">Teachings coming soon</p>
      <p className="text-gray-300 text-sm max-w-xs mx-auto">
        Our team is carefully reviewing resources to ensure they meet our doctrinal standards.
      </p>
    </div>
  )
}
