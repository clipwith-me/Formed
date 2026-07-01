"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Settings, Edit3, CheckCircle, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BADGES } from "@/lib/constants"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([])
  const [postCount, setPostCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: prof }, { data: badges }, { count }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('badges_earned').select('badge_key').eq('user_id', user.id),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
      ])

      if (prof) setProfile(prof as Profile)
      if (badges) setUnlockedBadges(badges.map((b: { badge_key: string }) => b.badge_key))
      if (count !== null) setPostCount(count)
      setLoading(false)
    }
    load()
  }, [])

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#1F5E4A]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cover + Avatar */}
      <div className="relative">
        <div
          className="h-36 rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1F5E4A 0%, #2d7a61 60%, #D4A72C 100%)" }}
        />

        <div className="absolute bottom-0 left-5 translate-y-1/2">
          <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
            <AvatarImage src={profile?.avatar_url ?? ''} />
            <AvatarFallback className="text-2xl font-black bg-[#1F5E4A]/10 text-[#1F5E4A]">{initials}</AvatarFallback>
          </Avatar>
        </div>

        <div className="absolute bottom-3 right-3 flex gap-2">
          <button className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white transition-colors">
            <Settings size={15} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Profile info */}
      <div className="pt-10 px-1">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#222222]">{profile?.full_name ?? 'Your Name'}</h1>
              {profile?.is_verified && <CheckCircle size={18} className="text-[#1F5E4A]" />}
            </div>
            <Badge variant="default" className="mt-1 text-xs capitalize">{profile?.role?.toLowerCase() ?? 'believer'}</Badge>
          </div>
          <Button variant="secondary" size="sm" className="gap-1.5">
            <Edit3 size={14} />
            Edit Profile
          </Button>
        </div>

        {profile?.bio ? (
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">{profile.bio}</p>
        ) : (
          <p className="text-gray-400 text-sm mt-2 italic">No bio yet — tap Edit Profile to add one.</p>
        )}

        <div className="flex gap-4 mt-3 text-xs text-gray-500 flex-wrap">
          {profile?.church_name && <span>⛪ {profile.church_name}</span>}
          {profile?.city && profile?.country && <span>📍 {profile.city}, {profile.country}</span>}
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-4">
          <div className="text-center">
            <p className="font-black text-xl text-[#1F5E4A]">{postCount}</p>
            <p className="text-xs text-gray-400">Posts</p>
          </div>
          <div className="text-center">
            <p className="font-black text-xl text-[#1F5E4A]">{profile?.prayer_streak ?? 0}</p>
            <p className="text-xs text-gray-400">Prayer Streak</p>
          </div>
          <div className="text-center">
            <p className="font-black text-xl text-[#1F5E4A]">{profile?.discipleship_day ?? 1}</p>
            <p className="text-xs text-gray-400">Journey Day</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Badges */}
      <section>
        <div className="section-header">
          <h2 className="section-title">Badges</h2>
          <span className="text-xs text-gray-400">{unlockedBadges.length}/{BADGES.length} earned</span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {BADGES.map((badge, i) => {
            const unlocked = unlockedBadges.includes(badge.id)
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all duration-200 ${
                  unlocked
                    ? "bg-[#e8f4ef] border-[#1F5E4A]/20 shadow-sm"
                    : "bg-gray-50 border-gray-100 opacity-40"
                }`}
              >
                <span className="text-2xl">{badge.icon}</span>
                <p className="text-[10px] font-semibold text-center leading-tight text-[#222222]">
                  {badge.label}
                </p>
              </motion.div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
