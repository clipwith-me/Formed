"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Hand, Plus, Filter, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

type Prayer = {
  id: string
  author_id: string
  title: string | null
  content: string
  is_answered: boolean
  is_public: boolean
  prayer_count: number
  created_at: string
  author_name?: string
}

const TABS = ["Prayer Requests", "Answered Prayers", "My Prayers"]
const FILTERS = ["All", "Personal", "Family", "Health", "Nations"]
const PRAYER_PROMPT = "Lord, let Your kingdom come and Your will be done — in my life and in the lives of those I pray for today."

export default function PrayerPage() {
  const [prayers, setPrayers] = useState<Prayer[]>([])
  const [activeTab, setActiveTab] = useState("Prayer Requests")
  const [activeFilter, setActiveFilter] = useState("All")
  const [showSubmit, setShowSubmit] = useState(false)
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set())
  const [newPrayer, setNewPrayer] = useState({ title: "", content: "" })
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    load()
  }, [])

  // Load persisted "prayed" state keyed by user ID
  useEffect(() => {
    async function loadPrayed() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      try {
        const key = `formed_prayed_${user.id}`
        const saved = localStorage.getItem(key)
        if (saved) setPrayedIds(new Set(JSON.parse(saved)))
      } catch {}
    }
    loadPrayed()
  }, [])

  async function load() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUserId(user.id)

    // Two-step: avoid FK join that requires a relationship definition
    const { data: rows } = await supabase
      .from("prayer_requests")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50)

    if (rows && rows.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const authorIds = [...new Set((rows as any[]).map((r: any) => r.author_id).filter(Boolean))]
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", authorIds)
      const nameMap: Record<string, string> = {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(profiles ?? []).forEach((p: any) => { nameMap[p.id] = p.full_name ?? "Anonymous" })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setPrayers((rows as any[]).map((r: any) => ({ ...r, author_name: nameMap[r.author_id] ?? "Anonymous" })))
    } else {
      setPrayers([])
    }
    setLoading(false)
  }

  const filtered = prayers.filter(p => {
    if (activeTab === "Answered Prayers") return p.is_answered
    if (activeTab === "My Prayers") return p.author_id === userId
    return !p.is_answered
  })

  const handlePray = async (id: string) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const next = new Set(prayedIds)
    const prayer = prayers.find(p => p.id === id)!
    if (next.has(id)) {
      next.delete(id)
      await supabase.from("prayer_requests").update({ prayer_count: Math.max(0, prayer.prayer_count - 1) }).eq("id", id)
      setPrayers(ps => ps.map(p => p.id === id ? { ...p, prayer_count: Math.max(0, p.prayer_count - 1) } : p))
    } else {
      next.add(id)
      await supabase.from("prayer_requests").update({ prayer_count: prayer.prayer_count + 1 }).eq("id", id)
      setPrayers(ps => ps.map(p => p.id === id ? { ...p, prayer_count: p.prayer_count + 1 } : p))
    }
    setPrayedIds(next)
    try {
      localStorage.setItem(`formed_prayed_${user.id}`, JSON.stringify([...next]))
    } catch {}
  }

  const handleMarkAnswered = async (id: string) => {
    const supabase = createClient()
    await supabase.from("prayer_requests").update({ is_answered: true }).eq("id", id)
    setPrayers(ps => ps.map(p => p.id === id ? { ...p, is_answered: true } : p))
  }

  const handleSubmit = async () => {
    if (!newPrayer.content.trim()) return
    setSubmitting(true)
    setError("")
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError("You must be signed in."); setSubmitting(false); return }

    const { data, error: err } = await supabase
      .from("prayer_requests")
      .insert({
        author_id: user.id,
        title: newPrayer.title.trim() || null,
        content: newPrayer.content.trim(),
        is_public: true,
        is_answered: false,
        prayer_count: 0,
      })
      .select("*")
      .single()

    if (err) { setError(err.message); setSubmitting(false); return }

    // Get user's name
    const { data: prof } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setPrayers(ps => [{ ...(data as any), author_name: (prof as any)?.full_name ?? "You" }, ...ps])
    setNewPrayer({ title: "", content: "" })
    setShowSubmit(false)
    setSubmitting(false)
  }

  const totalPrayers = prayers.reduce((s, p) => s + (p.prayer_count ?? 0), 0)

  return (
    <div className="pb-28">
      {/* Hero header */}
      <div
        className="-mx-4 -mt-6 lg:-mx-8 lg:-mt-8 px-4 lg:px-8 pt-8 pb-6 mb-6 text-white"
        style={{ background: "linear-gradient(135deg, #1F5E4A 0%, #2d7a61 100%)" }}
      >
        <h1 className="text-2xl font-black">Prayer Wall</h1>
        <p className="text-white/70 text-sm mt-0.5">Standing together in faith</p>
        <div className="flex gap-3 mt-4 flex-wrap">
          {[
            { label: "Prayers offered", value: totalPrayers },
            { label: "Active requests", value: prayers.filter(p => !p.is_answered).length },
            { label: "Answered", value: prayers.filter(p => p.is_answered).length },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 rounded-xl px-4 py-2 text-center min-w-[80px]">
              <p className="text-xl font-black">{stat.value}</p>
              <p className="text-white/60 text-[11px]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* Daily prompt */}
        <Card className="border-0 shadow-sm rounded-2xl" style={{ background: "linear-gradient(135deg, #fdf8ec, #fef5d8)" }}>
          <CardContent className="p-4">
            <span className="text-[#D4A72C] text-[10px] font-bold uppercase tracking-widest">Today&apos;s Prayer Prompt</span>
            <p className="text-gray-700 italic text-sm leading-relaxed mt-1.5">&ldquo;{PRAYER_PROMPT}&rdquo;</p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab ? "bg-[#1F5E4A] text-white shadow-sm" : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filters */}
        {activeTab === "Prayer Requests" && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-gray-400 mt-1.5 flex-shrink-0" />
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all ${
                  activeFilter === f ? "bg-[#1F5E4A] text-white" : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        {/* Prayer list */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#1F5E4A]" /></div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {filtered.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-10">
                  {activeTab === "My Prayers" ? "You haven't submitted any prayer requests yet." : "No prayer requests here yet."}
                </p>
              )}
              {filtered.map((prayer, i) => (
                <motion.div key={prayer.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-9 h-9 flex-shrink-0">
                          <AvatarFallback className="bg-[#1F5E4A]/10 text-[#1F5E4A] text-xs font-bold">
                            {(prayer.author_name ?? "A").charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-800">{prayer.author_name}</span>
                            {prayer.is_answered && (
                              <Badge className="text-[10px] border-0 bg-[#D4A72C]/15 text-[#9a7820] flex items-center gap-1 px-1.5">
                                <CheckCircle2 className="w-3 h-3" /> Answered
                              </Badge>
                            )}
                          </div>
                          {prayer.title && <p className="text-sm font-semibold text-gray-700 mt-1">{prayer.title}</p>}
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{prayer.content}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <button
                              onClick={() => handlePray(prayer.id)}
                              className={`flex items-center gap-1.5 text-xs font-semibold transition-all px-3 py-1.5 rounded-full ${
                                prayedIds.has(prayer.id)
                                  ? "bg-[#1F5E4A] text-white"
                                  : "bg-gray-100 text-gray-600 hover:bg-[#e8f4ef] hover:text-[#1F5E4A]"
                              }`}
                            >
                              <Hand className="w-3.5 h-3.5" />
                              {prayedIds.has(prayer.id) ? "Praying" : "Pray"} · {prayer.prayer_count ?? 0}
                            </button>
                            {prayer.author_id === userId && !prayer.is_answered && (
                              <button
                                onClick={() => handleMarkAnswered(prayer.id)}
                                className="text-xs text-[#D4A72C] font-semibold hover:underline"
                              >
                                Mark answered
                              </button>
                            )}
                            <span className="text-xs text-gray-300 ml-auto">
                              {new Date(prayer.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Submit prayer sheet */}
      <AnimatePresence>
        {showSubmit && (
          <div className="fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={() => setShowSubmit(false)}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="absolute bottom-[65px] sm:bottom-auto left-0 right-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl"
            >
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-base text-[#222222]">Submit Prayer Request</h3>
                <p className="text-xs text-gray-400 mt-0.5">Your community will stand with you in prayer</p>
              </div>
              <div className="px-5 py-4 space-y-3 overflow-y-auto" style={{ maxHeight: "60vh" }}>
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />{error}
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Title (optional)</label>
                  <Input
                    placeholder="e.g. Prayer for healing"
                    value={newPrayer.title}
                    onChange={e => setNewPrayer(p => ({ ...p, title: e.target.value }))}
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Your request</label>
                  <Textarea
                    placeholder="Share what's on your heart..."
                    value={newPrayer.content}
                    onChange={e => setNewPrayer(p => ({ ...p, content: e.target.value }))}
                    className="min-h-[110px] resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
                <Button variant="secondary" onClick={() => setShowSubmit(false)} className="flex-1 h-11">Cancel</Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!newPrayer.content.trim() || submitting}
                  className="flex-1 h-11 bg-[#1F5E4A] hover:bg-[#174d3c] text-white font-semibold"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "🙏 Submit"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
        onClick={() => setShowSubmit(true)}
        className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 w-14 h-14 rounded-full bg-[#1F5E4A] text-white shadow-[0_4px_20px_rgba(31,94,74,0.4)] flex items-center justify-center z-30"
      >
        <Plus size={24} />
      </motion.button>
    </div>
  )
}
