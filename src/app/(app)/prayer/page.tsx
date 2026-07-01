'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hand, Plus, Filter, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

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
  category?: string
}

const TABS = ['Prayer Requests', 'Answered Prayers', 'My Prayers']
const FILTERS = ['All', 'Personal', 'Family', 'Health', 'Nations']
const PRAYER_PROMPT = "Lord, let Your kingdom come and Your will be done — in my life and in the lives of those I pray for today."

export default function PrayerPage() {
  const [prayers, setPrayers] = useState<Prayer[]>([])
  const [activeTab, setActiveTab] = useState('Prayer Requests')
  const [activeFilter, setActiveFilter] = useState('All')
  const [showSubmit, setShowSubmit] = useState(false)
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set())
  const [newPrayer, setNewPrayer] = useState({ title: '', content: '', category: 'Personal' })
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const { data } = await supabase
        .from('prayer_requests')
        .select('*, profiles(full_name)')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) {
        setPrayers(data.map((p: Prayer & { profiles?: { full_name: string } }) => ({
          ...p,
          author_name: p.profiles?.full_name ?? 'Anonymous',
          category: 'Personal',
        })))
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = prayers.filter(p => {
    if (activeTab === 'Answered Prayers') return p.is_answered
    if (activeTab === 'My Prayers') return p.author_id === userId
    return !p.is_answered
  })

  const handlePray = async (id: string) => {
    const next = new Set(prayedIds)
    const supabase = createClient()
    if (next.has(id)) {
      next.delete(id)
      await supabase.from('prayer_requests').update({ prayer_count: prayers.find(p => p.id === id)!.prayer_count - 1 }).eq('id', id)
      setPrayers(ps => ps.map(p => p.id === id ? { ...p, prayer_count: p.prayer_count - 1 } : p))
    } else {
      next.add(id)
      await supabase.from('prayer_requests').update({ prayer_count: prayers.find(p => p.id === id)!.prayer_count + 1 }).eq('id', id)
      setPrayers(ps => ps.map(p => p.id === id ? { ...p, prayer_count: p.prayer_count + 1 } : p))
    }
    setPrayedIds(next)
  }

  const handleSubmit = async () => {
    if (!newPrayer.content.trim()) return
    setSubmitting(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('You must be signed in.'); setSubmitting(false); return }

    const { data, error: insertErr } = await supabase.from('prayer_requests').insert({
      author_id: user.id,
      title: newPrayer.title || null,
      content: newPrayer.content,
      is_public: true,
      is_answered: false,
      prayer_count: 0,
    }).select('*, profiles(full_name)').single()

    if (insertErr) { setError(insertErr.message); setSubmitting(false); return }

    const added = { ...data, author_name: data.profiles?.full_name ?? 'You', category: newPrayer.category }
    setPrayers(ps => [added, ...ps])
    setNewPrayer({ title: '', content: '', category: 'Personal' })
    setShowSubmit(false)
    setSubmitting(false)
  }

  const totalPrayers = prayers.reduce((s, p) => s + p.prayer_count, 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="bg-gradient-to-r from-[#1F5E4A] to-[#2d7a61] text-white px-4 pt-10 pb-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold">Prayer Wall</h1>
          <p className="text-white/70 text-sm mt-1">Standing together in faith</p>
          <div className="flex gap-4 mt-4">
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{totalPrayers}</p>
              <p className="text-white/60 text-xs">Prayers today</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{prayers.filter(p => !p.is_answered).length}</p>
              <p className="text-white/60 text-xs">Active requests</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{prayers.filter(p => p.is_answered).length}</p>
              <p className="text-white/60 text-xs">Answered</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <Card className="border-0 shadow-sm rounded-2xl bg-gradient-to-br from-[#fdf8ec] to-[#fef5d8]">
          <CardContent className="p-4">
            <span className="text-[#D4A72C] text-xs font-bold uppercase tracking-widest">Today's Prayer Prompt</span>
            <p className="text-gray-700 italic text-sm leading-relaxed mt-2">"{PRAYER_PROMPT}"</p>
          </CardContent>
        </Card>

        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                activeTab === tab ? 'bg-[#1F5E4A] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Prayer Requests' && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Filter className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 transition-all ${
                  activeFilter === f ? 'bg-[#1F5E4A] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1F5E4A]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#1F5E4A]" /></div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {filtered.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-10">No prayer requests here yet.</p>
              )}
              {filtered.map(prayer => (
                <Card key={prayer.id} className="border-0 shadow-sm rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-9 h-9 flex-shrink-0">
                        <AvatarFallback className="bg-[#1F5E4A]/10 text-[#1F5E4A] text-xs font-bold">
                          {(prayer.author_name ?? 'A').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-800">{prayer.author_name}</span>
                          {prayer.is_answered && (
                            <Badge className="text-xs border-0 bg-[#D4A72C]/20 text-[#9a7820] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Answered
                            </Badge>
                          )}
                        </div>
                        {prayer.title && <p className="text-sm font-medium text-gray-700 mt-1">{prayer.title}</p>}
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-3">{prayer.content}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <button
                            onClick={() => handlePray(prayer.id)}
                            className={`flex items-center gap-1.5 text-xs font-medium transition-all ${
                              prayedIds.has(prayer.id) ? 'text-[#1F5E4A]' : 'text-gray-400 hover:text-[#1F5E4A]'
                            }`}
                          >
                            <Hand className="w-4 h-4" />
                            {prayer.prayer_count} praying
                          </button>
                          <span className="text-xs text-gray-300">
                            {new Date(prayer.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {showSubmit && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowSubmit(false)}
          >
            <motion.div
              initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full max-w-lg mx-auto rounded-t-2xl p-6 space-y-3"
            >
              <h3 className="text-lg font-bold text-gray-800">Submit Prayer Request</h3>
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}
              <Input
                placeholder="Title (optional)"
                value={newPrayer.title}
                onChange={e => setNewPrayer(p => ({ ...p, title: e.target.value }))}
                className="h-11"
              />
              <Textarea
                placeholder="Share your prayer request..."
                value={newPrayer.content}
                onChange={e => setNewPrayer(p => ({ ...p, content: e.target.value }))}
                className="min-h-[100px] resize-none"
              />
              <Button
                onClick={handleSubmit}
                disabled={!newPrayer.content || submitting}
                className="w-full h-11 bg-[#1F5E4A] hover:bg-[#174d3c] text-white font-semibold rounded-xl"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Prayer Request'}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setShowSubmit(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-[#1F5E4A] text-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#174d3c] transition-all hover:scale-105 z-40"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}
