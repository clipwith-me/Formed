'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Plus, Hand, Filter, CheckCircle2, Globe, Users, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import type { PrayerRequest } from '@/lib/types'

const MOCK_PRAYERS: (PrayerRequest & { author_name: string; category: string })[] = [
  {
    id: '1', author_id: 'u1', author_name: 'Grace Eze',
    title: 'Healing for my mother', content: 'Please pray for my mother who was diagnosed with cancer. Believing God for a miracle.',
    is_answered: false, is_public: true, prayer_count: 24, created_at: '2026-06-28T08:00:00Z', category: 'Health',
  },
  {
    id: '2', author_id: 'u2', author_name: 'David Mensah',
    title: 'Job provision', content: 'I have been believing God for employment for 3 months. Please stand with me in faith.',
    is_answered: false, is_public: true, prayer_count: 18, created_at: '2026-06-27T14:00:00Z', category: 'Personal',
  },
  {
    id: '3', author_id: 'u3', author_name: 'Amina Yusuf',
    title: 'Prodigal son returns', content: 'My son left the faith 2 years ago. I am believing God will bring him back.',
    is_answered: false, is_public: true, prayer_count: 32, created_at: '2026-06-26T10:00:00Z', category: 'Family',
  },
  {
    id: '4', author_id: 'u4', author_name: 'Pastor James',
    title: 'Revival in Nigeria', content: 'Praying for a national spiritual awakening across Nigeria. Join us!',
    is_answered: false, is_public: true, prayer_count: 87, created_at: '2026-06-25T09:00:00Z', category: 'Nations',
  },
  {
    id: '5', author_id: 'u5', author_name: 'Ruth Osei',
    title: 'GOD PROVIDED THE JOB! 🎉', content: 'After 3 months of prayers from this community, I got the job! God is faithful!',
    is_answered: true, is_public: true, prayer_count: 56, created_at: '2026-06-20T11:00:00Z', category: 'Personal',
  },
]

const TABS = ['Prayer Requests', 'Answered Prayers', 'My Prayers']
const FILTERS = ['All', 'Urgent', 'Personal', 'Family', 'Health', 'Nations']
const PRAYER_PROMPT = "Lord, let Your kingdom come and Your will be done — in my life and in the lives of those I pray for today."

export default function PrayerPage() {
  const [activeTab, setActiveTab] = useState('Prayer Requests')
  const [activeFilter, setActiveFilter] = useState('All')
  const [showSubmit, setShowSubmit] = useState(false)
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set())
  const [newPrayer, setNewPrayer] = useState({ title: '', content: '' })

  const filtered = MOCK_PRAYERS.filter(p => {
    if (activeTab === 'Answered Prayers') return p.is_answered
    if (activeTab === 'My Prayers') return p.author_id === 'u1'
    return !p.is_answered && (activeFilter === 'All' || p.category === activeFilter)
  })

  const totalPrayersToday = MOCK_PRAYERS.reduce((sum, p) => sum + p.prayer_count, 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1F5E4A] to-[#2d7a61] text-white px-4 pt-10 pb-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold">Prayer Wall</h1>
          <p className="text-white/70 text-sm mt-1">Standing together in faith</p>

          {/* Stats */}
          <div className="flex gap-4 mt-4">
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{totalPrayersToday}</p>
              <p className="text-white/60 text-xs">Prayers today</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{MOCK_PRAYERS.filter(p => !p.is_answered).length}</p>
              <p className="text-white/60 text-xs">Active requests</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{MOCK_PRAYERS.filter(p => p.is_answered).length}</p>
              <p className="text-white/60 text-xs">Answered</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Today's Prayer Prompt */}
        <Card className="border-0 shadow-sm rounded-2xl bg-gradient-to-br from-[#fdf8ec] to-[#fef5d8] border-l-4 border-l-[#D4A72C]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#D4A72C] text-xs font-bold uppercase tracking-widest">Today's Prayer Prompt</span>
            </div>
            <p className="text-gray-700 italic text-sm leading-relaxed">"{PRAYER_PROMPT}"</p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-[#1F5E4A] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filters (only on main tab) */}
        {activeTab === 'Prayer Requests' && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Filter className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 transition-all ${
                  activeFilter === f
                    ? 'bg-[#1F5E4A] text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1F5E4A]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        {/* Prayer cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {filtered.map(prayer => (
              <Card key={prayer.id} className="border-0 shadow-sm rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-9 h-9 flex-shrink-0">
                      <AvatarFallback className="bg-[#1F5E4A]/10 text-[#1F5E4A] text-xs font-bold">
                        {prayer.author_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800">{prayer.author_name}</span>
                        <Badge className={`text-xs border-0 ${prayer.is_answered ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {prayer.category}
                        </Badge>
                        {prayer.is_answered && (
                          <Badge className="text-xs border-0 bg-[#D4A72C]/20 text-[#9a7820] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Answered
                          </Badge>
                        )}
                      </div>
                      {prayer.title && (
                        <p className="text-sm font-medium text-gray-700 mt-1">{prayer.title}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-3">{prayer.content}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <button
                          onClick={() => {
                            const next = new Set(prayedIds)
                            if (next.has(prayer.id)) next.delete(prayer.id)
                            else next.add(prayer.id)
                            setPrayedIds(next)
                          }}
                          className={`flex items-center gap-1.5 text-xs font-medium transition-all ${
                            prayedIds.has(prayer.id) ? 'text-[#1F5E4A]' : 'text-gray-400 hover:text-[#1F5E4A]'
                          }`}
                        >
                          <Hand className="w-4 h-4" />
                          {prayer.prayer_count + (prayedIds.has(prayer.id) ? 1 : 0)} praying
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
      </div>

      {/* Submit Prayer Modal */}
      <AnimatePresence>
        {showSubmit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowSubmit(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full max-w-lg mx-auto rounded-t-2xl p-6"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">Submit Prayer Request</h3>
              <div className="space-y-3">
                <Input
                  placeholder="Title (optional)"
                  value={newPrayer.title}
                  onChange={e => setNewPrayer(p => ({ ...p, title: e.target.value }))}
                  className="h-11"
                />
                <Textarea
                  placeholder="Share your prayer request with the community..."
                  value={newPrayer.content}
                  onChange={e => setNewPrayer(p => ({ ...p, content: e.target.value }))}
                  className="min-h-[100px] resize-none"
                />
                <Button
                  onClick={() => setShowSubmit(false)}
                  disabled={!newPrayer.content}
                  className="w-full h-11 bg-[#1F5E4A] hover:bg-[#174d3c] text-white font-semibold rounded-xl"
                >
                  Submit Prayer Request
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <button
        onClick={() => setShowSubmit(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-[#1F5E4A] text-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#174d3c] transition-all hover:scale-105 z-40"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}
