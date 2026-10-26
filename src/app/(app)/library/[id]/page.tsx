"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle2, BookOpen, Pen, MessageSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import VideoEmbed from "@/components/formed/VideoEmbed"
import {
  type TeachingResource,
  type ReflectionQuestion,
  getResourceById,
  getUserProgress,
  getLessonNote,
  getReflections,
  markLessonComplete,
  saveLessonNote,
  saveReflection,
  formatDuration,
} from "@/lib/video-library"
import { createClient } from "@/lib/supabase/client"

type Tab = "overview" | "reflection" | "notes"

export default function LessonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [resource, setResource] = useState<TeachingResource | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)
  const [note, setNote] = useState("")
  const [reflections, setReflections] = useState<Record<string, string>>({})
  const [tab, setTab] = useState<Tab>("overview")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [markingDone, setMarkingDone] = useState(false)
  const [mentorMessage, setMentorMessage] = useState("")
  const [mentorSent, setMentorSent] = useState(false)

  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reflectionTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUserId(user.id)

      const [res, progress, noteData] = await Promise.all([
        getResourceById(id),
        getUserProgress(user.id, id),
        getLessonNote(user.id, id),
      ])

      if (!res) { router.push("/library"); return }
      setResource(res)
      setCompleted(progress?.completed ?? false)
      setNote(noteData?.content ?? "")

      const questions = res.reflection_questions ?? []
      if (questions.length > 0) {
        const refs = await getReflections(user.id, questions.map((q: ReflectionQuestion) => q.id))
        setReflections(refs)
      }
      setLoading(false)
    }
    load()
  }, [id, router])

  const handleNoteChange = useCallback(
    (value: string) => {
      setNote(value)
      if (!userId) return
      if (noteTimer.current) clearTimeout(noteTimer.current)
      noteTimer.current = setTimeout(async () => {
        setSaving(true)
        await saveLessonNote(userId, id, value)
        setSaving(false)
      }, 800)
    },
    [userId, id]
  )

  const handleReflectionChange = useCallback(
    (questionId: string, value: string) => {
      setReflections((prev) => ({ ...prev, [questionId]: value }))
      if (!userId) return
      if (reflectionTimers.current[questionId]) clearTimeout(reflectionTimers.current[questionId])
      reflectionTimers.current[questionId] = setTimeout(async () => {
        await saveReflection(userId, questionId, value)
      }, 800)
    },
    [userId]
  )

  const handleMarkComplete = async () => {
    if (!userId || completed) return
    setMarkingDone(true)
    await markLessonComplete(userId, id)
    setCompleted(true)
    setMarkingDone(false)
  }

  const handleMentorSend = async () => {
    if (!mentorMessage.trim() || !userId || !resource) return
    const supabase = createClient()
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Message sent to mentor",
      body: `Re: "${resource.title}" — ${mentorMessage.slice(0, 100)}`,
      type: "GENERAL",
    })
    setMentorSent(true)
    setMentorMessage("")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#1F5E4A]" />
      </div>
    )
  }

  if (!resource) return null

  const questions = resource.reflection_questions ?? []
  const refs = resource.scripture_refs ?? []

  return (
    <div className="max-w-2xl space-y-5 pb-28">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1F5E4A] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Library
      </button>

      {/* Video */}
      <VideoEmbed resource={resource} />

      {/* Title block */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-xl font-black text-[#222222] leading-snug">{resource.title}</h1>
        <div className="flex items-center gap-2 flex-wrap text-sm text-gray-500">
          {resource.speaker && <span>{resource.speaker.name}</span>}
          {resource.ministry && (
            <span className="text-gray-300">·</span>
          )}
          {resource.ministry && <span>{resource.ministry.name}</span>}
          {resource.duration_seconds && (
            <>
              <span className="text-gray-300">·</span>
              <span>{formatDuration(resource.duration_seconds)}</span>
            </>
          )}
        </div>
      </motion.div>

      {/* Mark complete */}
      <Button
        onClick={handleMarkComplete}
        disabled={completed || markingDone}
        className={`w-full h-11 font-semibold gap-2 rounded-xl transition-all ${
          completed
            ? "bg-[#1F5E4A]/10 text-[#1F5E4A] cursor-default"
            : "bg-[#1F5E4A] text-white hover:bg-[#174d3c]"
        }`}
      >
        {markingDone ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CheckCircle2 className="w-4 h-4" />
        )}
        {completed ? "Completed" : "Mark as Complete"}
      </Button>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {([
          { key: "overview", label: "Overview", icon: BookOpen },
          { key: "reflection", label: "Reflect", icon: Pen },
          { key: "notes", label: "Notes", icon: MessageSquare },
        ] as { key: Tab; label: string; icon: typeof BookOpen }[]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === key
                ? "bg-white text-[#1F5E4A] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="space-y-4">
          {resource.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{resource.description}</p>
          )}
          {refs.length > 0 && (
            <div className="bg-[#1F5E4A]/5 rounded-xl p-4 space-y-1">
              <p className="text-xs font-bold text-[#1F5E4A] uppercase tracking-wide mb-2">Key Scriptures</p>
              {refs.map((ref) => (
                <p key={ref.id} className="text-sm text-[#1F5E4A] font-medium">{ref.display_ref}</p>
              ))}
            </div>
          )}
          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {resource.tags.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Mentor message box */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-amber-800">Have a question for your mentor?</p>
            <Textarea
              value={mentorMessage}
              onChange={(e) => setMentorMessage(e.target.value)}
              placeholder="Share what God is speaking to you or ask a question…"
              className="resize-none min-h-[80px] text-sm bg-white border-amber-200 focus:border-amber-400"
              maxLength={500}
              disabled={mentorSent}
            />
            {mentorSent ? (
              <p className="text-xs text-green-600 font-medium">Message sent to your mentor!</p>
            ) : (
              <Button
                onClick={handleMentorSend}
                disabled={!mentorMessage.trim()}
                size="sm"
                className="bg-[#D4A72C] hover:bg-[#c49828] text-white font-semibold rounded-lg"
              >
                Send to Mentor
              </Button>
            )}
          </div>
        </div>
      )}

      {tab === "reflection" && (
        <div className="space-y-5">
          {questions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No reflection questions for this lesson yet.</p>
          ) : (
            questions
              .sort((a: ReflectionQuestion, b: ReflectionQuestion) => a.sort_order - b.sort_order)
              .map((q: ReflectionQuestion, i: number) => (
                <div key={q.id} className="space-y-2">
                  <label className="text-sm font-semibold text-[#222222]">
                    {i + 1}. {q.question}
                  </label>
                  <Textarea
                    value={reflections[q.id] ?? ""}
                    onChange={(e) => handleReflectionChange(q.id, e.target.value)}
                    placeholder="Write your reflection…"
                    className="resize-none min-h-[100px] text-sm"
                  />
                </div>
              ))
          )}
        </div>
      )}

      {tab === "notes" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#222222]">Your Notes</p>
            {saving && <span className="text-xs text-gray-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving…</span>}
          </div>
          <Textarea
            value={note}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder="Take notes as you watch — they save automatically…"
            className="resize-none min-h-[240px] text-sm"
          />
        </div>
      )}
    </div>
  )
}
