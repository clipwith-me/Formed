'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Phone, Mail, MapPin, Calendar, User, MessageSquare,
  PhoneCall, Video, Users, ChevronRight, Clock, PlusCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Believer, BelieverStatus } from '@/lib/types'

const mockBeliever: Believer = {
  id: '1',
  registered_by: 'vol-1',
  assigned_to: 'vol-2',
  full_name: 'Emmanuel Chukwu',
  phone: '+234 801 234 5678',
  email: 'emma@example.com',
  gender: 'Male',
  age: 28,
  country: 'Nigeria',
  city: 'Lagos',
  language: 'English',
  church: 'House on the Rock',
  date_of_conversion: '2026-05-15',
  how_came_to_christ: 'Gave his life to Christ at a street evangelism outreach on Lagos Island.',
  prayer_needs: 'Deliverance from addiction, family restoration, new job opportunity.',
  status: 'IN_PROGRESS',
  consent: true,
  created_at: '2026-05-15T10:00:00Z',
}

const mockSessions = [
  { id: '1', type: 'CALL', date: '2026-06-01', duration: 25, notes: 'Prayed together. Shared John 3:16.' },
  { id: '2', type: 'IN_PERSON', date: '2026-06-10', duration: 60, notes: 'Met at church. Went through Day 1-3 lessons.' },
  { id: '3', type: 'VIDEO', date: '2026-06-20', duration: 45, notes: 'Discussed the Holy Spirit. Encouraging progress.' },
]

const STATUS_STEPS: BelieverStatus[] = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'MENTORED', 'DISCIPLE_MAKER']
const STATUS_LABELS: Record<BelieverStatus, string> = {
  NEW: 'New',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  MENTORED: 'Mentored',
  DISCIPLE_MAKER: 'Disciple Maker',
}
const STATUS_COLORS: Record<BelieverStatus, string> = {
  NEW: 'bg-gray-100 text-gray-600',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-[#D4A72C]/20 text-[#9a7820]',
  MENTORED: 'bg-purple-100 text-purple-700',
  DISCIPLE_MAKER: 'bg-[#1F5E4A]/20 text-[#1F5E4A]',
}

const SESSION_ICONS: Record<string, React.ReactNode> = {
  CALL: <PhoneCall className="w-4 h-4" />,
  CHAT: <MessageSquare className="w-4 h-4" />,
  IN_PERSON: <Users className="w-4 h-4" />,
  VIDEO: <Video className="w-4 h-4" />,
}

const TABS = ['Overview', 'Sessions', 'Notes', 'Progress']

export default function BelieverDetailPage() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [notes, setNotes] = useState('')
  const believer = mockBeliever

  const daysSince = believer.date_of_conversion
    ? Math.floor((Date.now() - new Date(believer.date_of_conversion).getTime()) / 86400000)
    : null

  const currentStepIndex = STATUS_STEPS.indexOf(believer.status)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1F5E4A] to-[#2d7a61] text-white px-4 pt-12 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-white/30">
              <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                {believer.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{believer.full_name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[believer.status]} bg-white/20 text-white`}>
                  {STATUS_LABELS[believer.status]}
                </span>
                {daysSince !== null && (
                  <span className="text-white/70 text-sm">• Day {daysSince} since conversion</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 gap-2">
              <PlusCircle className="w-4 h-4" /> Log Session
            </Button>
            <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 gap-2">
              <MessageSquare className="w-4 h-4" /> Send Message
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="bg-white border-b sticky top-0 z-10 -mt-6 rounded-t-2xl shadow-sm">
        <div className="max-w-2xl mx-auto flex">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-sm font-medium transition-all border-b-2 ${
                activeTab === tab
                  ? 'border-[#1F5E4A] text-[#1F5E4A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === 'Overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Contact Info */}
            <Card className="border-0 shadow-sm rounded-xl">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Contact Info</h3>
                {believer.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-[#1F5E4A]" />
                    <span className="text-gray-700">{believer.phone}</span>
                  </div>
                )}
                {believer.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-[#1F5E4A]" />
                    <span className="text-gray-700">{believer.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-[#1F5E4A]" />
                  <span className="text-gray-700">{believer.city}, {believer.country}</span>
                </div>
                {believer.date_of_conversion && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-[#1F5E4A]" />
                    <span className="text-gray-700">Converted: {new Date(believer.date_of_conversion).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prayer Needs */}
            {believer.prayer_needs && (
              <Card className="border-0 shadow-sm rounded-xl border-l-4 border-l-[#D4A72C]">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-800 text-sm mb-2">Prayer Needs</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{believer.prayer_needs}</p>
                </CardContent>
              </Card>
            )}

            {/* How came to Christ */}
            {believer.how_came_to_christ && (
              <Card className="border-0 shadow-sm rounded-xl">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-800 text-sm mb-2">How They Came to Christ</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{believer.how_came_to_christ}</p>
                </CardContent>
              </Card>
            )}

            {/* Assigned Volunteer */}
            <Card className="border-0 shadow-sm rounded-xl">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-3">Assigned Volunteer</h3>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-[#1F5E4A]/10 text-[#1F5E4A] font-bold">AO</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Adaeze Okonkwo</p>
                    <p className="text-xs text-gray-500">Volunteer · Lagos</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'Sessions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-500">{mockSessions.length} sessions recorded</p>
              <Button size="sm" className="bg-[#1F5E4A] text-white hover:bg-[#174d3c] gap-1 h-8 text-xs">
                <PlusCircle className="w-3 h-3" /> Log
              </Button>
            </div>
            {mockSessions.map(s => (
              <Card key={s.id} className="border-0 shadow-sm rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#1F5E4A]/10 flex items-center justify-center text-[#1F5E4A] flex-shrink-0">
                      {SESSION_ICONS[s.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">{s.type.replace('_', ' ')}</span>
                        <span className="text-xs text-gray-400">{new Date(s.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <Clock className="w-3 h-3" /> {s.duration} min
                      </div>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{s.notes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {activeTab === 'Notes' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <p className="text-sm text-gray-500">Keep private notes about this believer's journey.</p>
            <Textarea
              placeholder="Write your notes here..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="min-h-[200px] resize-none border-gray-200 rounded-xl"
            />
            <Button className="bg-[#1F5E4A] hover:bg-[#174d3c] text-white h-10 px-6 rounded-xl">
              Save Notes
            </Button>
          </motion.div>
        )}

        {activeTab === 'Progress' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <p className="text-sm text-gray-500">Track this believer's discipleship progress</p>
            <div className="space-y-3">
              {STATUS_STEPS.map((status, i) => {
                const isCompleted = i < currentStepIndex
                const isCurrent = i === currentStepIndex
                return (
                  <div key={status} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold text-sm flex-shrink-0 transition-all ${
                      isCompleted
                        ? 'bg-[#1F5E4A] border-[#1F5E4A] text-white'
                        : isCurrent
                        ? 'border-[#1F5E4A] text-[#1F5E4A] bg-white ring-4 ring-[#1F5E4A]/10'
                        : 'border-gray-200 text-gray-400 bg-white'
                    }`}>
                      {isCompleted ? '✓' : i + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isCurrent ? 'text-[#1F5E4A]' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                        {STATUS_LABELS[status]}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-[#1F5E4A]/70 mt-0.5">Current stage</p>
                      )}
                    </div>
                    {isCurrent && (
                      <Badge className="bg-[#1F5E4A]/10 text-[#1F5E4A] border-0 text-xs">Active</Badge>
                    )}
                  </div>
                )
              })}
            </div>

            <Button className="w-full h-11 bg-[#D4A72C] hover:bg-[#b88e24] text-white font-semibold rounded-xl">
              Advance to Next Stage
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
