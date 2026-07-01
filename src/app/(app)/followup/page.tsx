"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Calendar, ChevronRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import type { Believer, BelieverStatus } from "@/lib/types"

const STATUS_VARIANT: Record<BelieverStatus, 'default' | 'gold' | 'muted'> = {
  NEW: 'muted',
  ASSIGNED: 'muted',
  IN_PROGRESS: 'default',
  COMPLETED: 'gold',
  MENTORED: 'gold',
  DISCIPLE_MAKER: 'gold',
}

const STATUS_PROGRESS: Record<BelieverStatus, number> = {
  NEW: 5, ASSIGNED: 15, IN_PROGRESS: 40, COMPLETED: 70, MENTORED: 85, DISCIPLE_MAKER: 100,
}

export default function FollowUpPage() {
  const router = useRouter()
  const [believers, setBelievers] = useState<Believer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('believers')
        .select('*')
        .or(`registered_by.eq.${user.id},assigned_to.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (data) setBelievers(data as Believer[])
      setLoading(false)
    }
    load()
  }, [])

  const stats = [
    { label: 'Active', count: believers.filter(b => b.status === 'IN_PROGRESS' || b.status === 'ASSIGNED').length, color: '#1F5E4A' },
    { label: 'Completed', count: believers.filter(b => b.status === 'COMPLETED' || b.status === 'MENTORED' || b.status === 'DISCIPLE_MAKER').length, color: '#D4A72C' },
    { label: 'New', count: believers.filter(b => b.status === 'NEW').length, color: '#6b7280' },
  ]

  function daysSince(dateStr: string | null) {
    if (!dateStr) return null
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-black text-[#222222] mb-1">Follow-up Hub</h1>
        <p className="text-gray-500 text-sm">Track and nurture new believers</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="card-formed p-4 text-center"
          >
            <div className="text-3xl font-black mb-1" style={{ color: stat.color }}>{stat.count}</div>
            <div className="text-xs text-gray-400 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <section>
        <div className="section-header">
          <h2 className="section-title">Your Believers</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#1F5E4A]" /></div>
        ) : believers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No believers yet.</p>
            <p className="text-xs mt-1">Tap + to register someone who gave their life to Christ.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {believers.map((believer, i) => {
              const initials = believer.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              const days = daysSince(believer.date_of_conversion ?? believer.created_at)
              const progress = STATUS_PROGRESS[believer.status as BelieverStatus] ?? 5

              return (
                <motion.div
                  key={believer.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => router.push(`/followup/${believer.id}`)}
                  className="card-formed p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="text-sm font-bold bg-[#1F5E4A]/10 text-[#1F5E4A]">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-[#222222] text-sm truncate">{believer.full_name}</p>
                        <Badge variant={STATUS_VARIANT[believer.status as BelieverStatus] ?? 'muted'} className="text-[10px]">
                          {believer.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-2.5">
                        {days !== null && (
                          <span className="flex items-center gap-1"><Calendar size={11} />Day {days}</span>
                        )}
                        {believer.city && <span>📍 {believer.city}</span>}
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Journey progress</span>
                          <span className="font-semibold text-[#1F5E4A]">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 mt-1 shrink-0" />
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/followup/register')}
        className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 w-14 h-14 rounded-full bg-[#1F5E4A] text-white shadow-[0_4px_20px_rgba(31,94,74,0.4)] flex items-center justify-center z-30"
      >
        <Plus size={24} />
      </motion.button>
    </div>
  )
}
