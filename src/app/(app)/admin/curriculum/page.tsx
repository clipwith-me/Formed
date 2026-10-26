"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ShieldAlert, Loader2, ChevronDown, Search, BookOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import {
  type TeachingResource,
  type ReviewStatus,
  REVIEW_STATUS,
  getAdminResources,
  updateReviewStatus,
  reviewStatusLabel,
  reviewStatusColor,
} from "@/lib/video-library"

const STATUS_OPTIONS: ReviewStatus[] = [
  REVIEW_STATUS.RESEARCH_CANDIDATE,
  REVIEW_STATUS.UNDER_DOCTRINAL_REVIEW,
  REVIEW_STATUS.UNDER_COPYRIGHT_REVIEW,
  REVIEW_STATUS.AWAITING_PERMISSION,
  REVIEW_STATUS.APPROVED_EXTERNAL_LINK,
  REVIEW_STATUS.APPROVED_EMBED,
  REVIEW_STATUS.LICENSED_HOSTED,
  REVIEW_STATUS.REJECTED,
  REVIEW_STATUS.UNAVAILABLE,
]

export default function CurriculumAdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [resources, setResources] = useState<TeachingResource[]>([])
  const [filtered, setFiltered] = useState<TeachingResource[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<ReviewStatus | "ALL">("ALL")
  const [updating, setUpdating] = useState<string | null>(null)
  const [noteMap, setNoteMap] = useState<Record<string, string>>({})

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsAdmin(false); setLoading(false); return }
      setUserId(user.id)

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const role = (profile as any)?.role
      setIsAdmin(role === "ADMIN" || role === "CHURCH_ADMIN")

      if (role === "ADMIN" || role === "CHURCH_ADMIN") {
        const data = await getAdminResources()
        setResources(data)
        setFiltered(data)
      }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    let result = resources
    if (filterStatus !== "ALL") result = result.filter((r) => r.review_status === filterStatus)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.speaker?.name.toLowerCase().includes(q) ||
          r.ministry?.name.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [resources, search, filterStatus])

  const handleStatusChange = async (resource: TeachingResource, newStatus: ReviewStatus) => {
    if (!userId || newStatus === resource.review_status) return
    setUpdating(resource.id)
    await updateReviewStatus(
      resource.id,
      userId,
      resource.review_status,
      newStatus,
      noteMap[resource.id] ?? undefined
    )
    setResources((prev) =>
      prev.map((r) => (r.id === resource.id ? { ...r, review_status: newStatus } : r))
    )
    setNoteMap((prev) => ({ ...prev, [resource.id]: "" }))
    setUpdating(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#1F5E4A]" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <ShieldAlert className="w-12 h-12 text-gray-300" />
        <p className="text-gray-500 font-medium">Admin access required</p>
      </div>
    )
  }

  const counts = STATUS_OPTIONS.reduce<Record<string, number>>((acc, s) => {
    acc[s] = resources.filter((r) => r.review_status === s).length
    return acc
  }, {})

  return (
    <div className="space-y-6 max-w-3xl pb-28">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-6 h-6 text-[#1F5E4A]" />
          <h1 className="text-2xl font-black text-[#222222]">Curriculum Review</h1>
        </div>
        <p className="text-gray-500 text-sm">Review and approve teaching resources for the library</p>
      </motion.div>

      {/* Status overview chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus("ALL")}
          className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-all ${
            filterStatus === "ALL"
              ? "bg-[#1F5E4A] text-white border-[#1F5E4A]"
              : "bg-white text-gray-600 border-gray-200 hover:border-[#1F5E4A]"
          }`}
        >
          All ({resources.length})
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-all ${
              filterStatus === s
                ? "bg-[#1F5E4A] text-white border-[#1F5E4A]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#1F5E4A]"
            }`}
          >
            {reviewStatusLabel(s)} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search resources…"
          className="pl-10 h-11 rounded-xl border-gray-200"
        />
      </div>

      {/* Resource list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No resources match this filter.</div>
        ) : (
          filtered.map((resource) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#222222] leading-snug">{resource.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 flex-wrap">
                    {resource.speaker && <span>{resource.speaker.name}</span>}
                    {resource.ministry && <span className="text-gray-300">·</span>}
                    {resource.ministry && <span>{resource.ministry.name}</span>}
                    {resource.source_url && (
                      <>
                        <span className="text-gray-300">·</span>
                        <a href={resource.source_url} target="_blank" rel="noopener noreferrer" className="text-[#1F5E4A] hover:underline">
                          Source
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${reviewStatusColor(resource.review_status)}`}>
                  {reviewStatusLabel(resource.review_status)}
                </span>
              </div>

              {/* Review note input */}
              <input
                type="text"
                value={noteMap[resource.id] ?? ""}
                onChange={(e) => setNoteMap((prev) => ({ ...prev, [resource.id]: e.target.value }))}
                placeholder="Optional review note…"
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1F5E4A]"
              />

              {/* Status change */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    value={resource.review_status}
                    onChange={(e) => handleStatusChange(resource, e.target.value as ReviewStatus)}
                    disabled={updating === resource.id}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 pr-8 bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#1F5E4A] text-gray-700"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{reviewStatusLabel(s)}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
                {updating === resource.id && (
                  <Loader2 className="w-4 h-4 animate-spin text-[#1F5E4A] flex-shrink-0" />
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
