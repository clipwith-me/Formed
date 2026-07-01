'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Phone, Mail, MapPin, Calendar, MessageSquare,
  PhoneCall, Video, Users, Clock, PlusCircle, Loader2, AlertCircle, ChevronLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import type { Believer, BelieverStatus, FollowupSession } from '@/lib/types'

const STATUS_STEPS: BelieverStatus[] = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'MENTORED', 'DISCIPLE_MAKER']
const STATUS_LABELS: Record<BelieverStatus, string> = {
  NEW: 'New', ASSIGNED: 'Assigned', IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed', MENTORED: 'Mentored', DISCIPLE_MAKER: 'Disciple Maker',
}
const STATUS_COLORS: Record<BelieverStatus, string> = {
  NEW: 'bg-gray-100 text-gray-600', ASSIGNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-green-100 text-green-700', COMPLETED: 'bg-[#D4A72C]/20 text-[#9a7820]',
  MENTORED: 'bg-purple-100 text-purple-700', DISCIPLE_MAKER: 'bg-[#1F5E4A]/20 text-[#1F5E4A]',
}
const SESSION_ICONS: Record<string, React.ReactNode> = {
  CALL: <PhoneCall className="w-4 h-4" />,
  CHAT: <MessageSquare className="w-4 h-4" />,
  IN_PERSON: <Users className="w-4 h-4" />,
  VIDEO: <Video className="w-4 h-4" />,
}
const TABS = ['Overview', 'Sessions', 'Notes', 'Progress']

export default function BelieverDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [believer, setBeliever] = useState<Believer | null>(null)
  const [sessions, setSessions] = useState<FollowupSession[]>([])
  const [notes, setNotes] = useState('')
  const [activeTab, setActiveTab] = useState('Overview')
  const [loading, setLoading] = useState(true)
  const [savingNotes, setSavingNotes] = useState(false)
  const [advancing, setAdvancing] = useState(false)
  const [showLogSession, setShowLogSession] = useState(false)
  const [sessionForm, setSessionForm] = useState({ type: 'CALL', duration: '', notes: '' })
  const [loggingSession, setLoggingSession] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: b }, { data: s }] = await Promise.all([
        supabase.from('believers').select('*').eq('id', id).single(),
        supabase.from('followup_sessions').select('*').eq('believer_id', id).order('session_date', { ascending: false }),
      ])
      if (b) { setBeliever(b as Believer); setNotes('') }
      if (s) setSessions(s as FollowupSession[])
      setLoading(false)
    }
    load()
  }, [id])

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    // Notes are stored as a session note for now
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user && notes.trim()) {
      await supabase.from('followup_sessions').insert({
        believer_id: id,
        volunteer_id: user.id,
        type: 'CHAT',
        notes,
        session_date: new Date().toISOString(),
      })
    }
    setSavingNotes(false)
    setNotes('')
  }

  const handleAdvance = async () => {
    if (!believer) return
    const currentIndex = STATUS_STEPS.indexOf(believer.status as BelieverStatus)
    if (currentIndex >= STATUS_STEPS.length - 1) return
    const nextStatus = STATUS_STEPS[currentIndex + 1]
    setAdvancing(true)
    const supabase = createClient()
    await supabase.from('believers').update({ status: nextStatus }).eq('id', id)
    setBeliever(b => b ? { ...b, status: nextStatus } : b)
    setAdvancing(false)
  }

  const handleLogSession = async () => {
    if (!sessionForm.notes.trim()) return
    setLoggingSession(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Sign in required.'); setLoggingSession(false); return }

    const { data, error: err } = await supabase.from('followup_sessions').insert({
      believer_id: id,
      volunteer_id: user.id,
      type: sessionForm.type,
      duration_minutes: sessionForm.duration ? parseInt(sessionForm.duration) : null,
      notes: sessionForm.notes,
      session_date: new Date().toISOString(),
    }).select().single()

    if (err) { setError(err.message); setLoggingSession(false); return }
    setSessions(s => [data as FollowupSession, ...s])
    setSessionForm({ type: 'CALL', duration: '', notes: '' })
    setShowLogSession(false)
    setLoggingSession(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-[#1F5E4A]" /></div>
  }

  if (!believer) {
    return <div className="text-center py-20 text-gray-400">Believer not found.</div>
  }

  const daysSince = believer.date_of_conversion
    ? Math.floor((Date.now() - new Date(believer.date_of_conversion).getTime()) / 86400000)
    : null
  const currentStepIndex = STATUS_STEPS.indexOf(believer.status as BelieverStatus)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#1F5E4A] to-[#2d7a61] text-white px-4 pt-12 pb-16">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-white/70 text-sm mb-4 hover:text-white">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-white/30">
              <AvatarFallback className="bg-white/20 text-white text-xl font-bold">{believer.full_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{believer.full_name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[believer.status as BelieverStatus]} bg-white/20 text-white`}>
                  {STATUS_LABELS[believer.status as BelieverStatus]}
                </span>
                {daysSince !== null && <span className="text-white/70 text-sm">• Day {daysSince} since conversion</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button size="sm" onClick={() => { setShowLogSession(true); setActiveTab('Sessions') }} className="bg-white/20 hover:bg-white/30 text-white border-0 gap-2">
              <PlusCircle className="w-4 h-4" /> Log Session
            </Button>
            {believer.phone && (
              <a href={`tel:${believer.phone}`}>
                <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 gap-2">
                  <Phone className="w-4 h-4" /> Call
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border-b sticky top-0 z-10 -mt-6 rounded-t-2xl shadow-sm">
        <div className="max-w-2xl mx-auto flex">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 text-sm font-medium transition-all border-b-2 ${activeTab === tab ? 'border-[#1F5E4A] text-[#1F5E4A]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{tab}</button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === 'Overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <Card className="border-0 shadow-sm rounded-xl">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Contact Info</h3>
                {believer.phone && <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-[#1F5E4A]" /><span>{believer.phone}</span></div>}
                {believer.email && <div className="flex items-center gap-3 text-sm"><Mail className="w-4 h-4 text-[#1F5E4A]" /><span>{believer.email}</span></div>}
                {(believer.city || believer.country) && <div className="flex items-center gap-3 text-sm"><MapPin className="w-4 h-4 text-[#1F5E4A]" /><span>{[believer.city, believer.country].filter(Boolean).join(', ')}</span></div>}
                {believer.date_of_conversion && <div className="flex items-center gap-3 text-sm"><Calendar className="w-4 h-4 text-[#1F5E4A]" /><span>Converted: {new Date(believer.date_of_conversion).toLocaleDateString()}</span></div>}
              </CardContent>
            </Card>
            {believer.prayer_needs && (
              <Card className="border-0 shadow-sm rounded-xl border-l-4 border-l-[#D4A72C]">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-800 text-sm mb-2">Prayer Needs</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{believer.prayer_needs}</p>
                </CardContent>
              </Card>
            )}
            {believer.how_came_to_christ && (
              <Card className="border-0 shadow-sm rounded-xl">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-800 text-sm mb-2">How They Came to Christ</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{believer.how_came_to_christ}</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {activeTab === 'Sessions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {showLogSession && (
              <Card className="border-[#1F5E4A]/20 shadow-sm rounded-xl">
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-gray-800 text-sm">Log a Session</h3>
                  {error && <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg p-2"><AlertCircle className="w-3 h-3" />{error}</div>}
                  <div className="flex gap-2">
                    {['CALL', 'IN_PERSON', 'VIDEO', 'CHAT'].map(t => (
                      <button key={t} onClick={() => setSessionForm(f => ({ ...f, type: t }))} className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${sessionForm.type === t ? 'bg-[#1F5E4A] text-white border-[#1F5E4A]' : 'border-gray-200 text-gray-600'}`}>{t.replace('_', ' ')}</button>
                    ))}
                  </div>
                  <input type="number" placeholder="Duration (mins)" value={sessionForm.duration} onChange={e => setSessionForm(f => ({ ...f, duration: e.target.value }))} className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:border-[#1F5E4A]" />
                  <Textarea placeholder="Session notes..." value={sessionForm.notes} onChange={e => setSessionForm(f => ({ ...f, notes: e.target.value }))} className="min-h-[80px] resize-none" />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowLogSession(false)} className="flex-1">Cancel</Button>
                    <Button size="sm" onClick={handleLogSession} disabled={loggingSession || !sessionForm.notes} className="flex-1 bg-[#1F5E4A] text-white hover:bg-[#174d3c]">
                      {loggingSession ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">{sessions.length} sessions recorded</p>
              {!showLogSession && (
                <Button size="sm" onClick={() => setShowLogSession(true)} className="bg-[#1F5E4A] text-white hover:bg-[#174d3c] gap-1 h-8 text-xs">
                  <PlusCircle className="w-3 h-3" /> Log
                </Button>
              )}
            </div>

            {sessions.length === 0 && !showLogSession && (
              <p className="text-center text-gray-400 text-sm py-8">No sessions logged yet.</p>
            )}

            {sessions.map(s => (
              <Card key={s.id} className="border-0 shadow-sm rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#1F5E4A]/10 flex items-center justify-center text-[#1F5E4A] flex-shrink-0">
                      {SESSION_ICONS[s.type] ?? <MessageSquare className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">{s.type.replace('_', ' ')}</span>
                        <span className="text-xs text-gray-400">{s.session_date ? new Date(s.session_date).toLocaleDateString() : ''}</span>
                      </div>
                      {s.duration_minutes && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5"><Clock className="w-3 h-3" />{s.duration_minutes} min</div>
                      )}
                      {s.notes && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{s.notes}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {activeTab === 'Notes' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <p className="text-sm text-gray-500">Write private notes about this believer's journey. Saved as a session note.</p>
            <Textarea placeholder="Write your notes here..." value={notes} onChange={e => setNotes(e.target.value)} className="min-h-[200px] resize-none border-gray-200 rounded-xl" />
            <Button onClick={handleSaveNotes} disabled={!notes.trim() || savingNotes} className="bg-[#1F5E4A] hover:bg-[#174d3c] text-white h-10 px-6 rounded-xl">
              {savingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Notes'}
            </Button>
          </motion.div>
        )}

        {activeTab === 'Progress' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="space-y-3">
              {STATUS_STEPS.map((status, i) => {
                const isCompleted = i < currentStepIndex
                const isCurrent = i === currentStepIndex
                return (
                  <div key={status} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold text-sm flex-shrink-0 transition-all ${isCompleted ? 'bg-[#1F5E4A] border-[#1F5E4A] text-white' : isCurrent ? 'border-[#1F5E4A] text-[#1F5E4A] bg-white ring-4 ring-[#1F5E4A]/10' : 'border-gray-200 text-gray-400 bg-white'}`}>
                      {isCompleted ? '✓' : i + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isCurrent ? 'text-[#1F5E4A]' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>{STATUS_LABELS[status]}</p>
                      {isCurrent && <p className="text-xs text-[#1F5E4A]/70 mt-0.5">Current stage</p>}
                    </div>
                    {isCurrent && <Badge className="bg-[#1F5E4A]/10 text-[#1F5E4A] border-0 text-xs">Active</Badge>}
                  </div>
                )
              })}
            </div>
            {currentStepIndex < STATUS_STEPS.length - 1 && (
              <Button onClick={handleAdvance} disabled={advancing} className="w-full h-11 bg-[#D4A72C] hover:bg-[#b88e24] text-white font-semibold rounded-xl">
                {advancing ? <Loader2 className="w-4 h-4 animate-spin" /> : `Advance to ${STATUS_LABELS[STATUS_STEPS[currentStepIndex + 1]]}`}
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
