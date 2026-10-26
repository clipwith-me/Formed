"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Settings, Edit3, CheckCircle, Loader2, X, Save, LogOut, Camera } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BADGES } from "@/lib/constants"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Profile } from "@/lib/types"

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [postCount, setPostCount] = useState(0)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({ full_name: '', bio: '', church_name: '', city: '', country: '' })
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: prof }, { data: badges }, { count }, { count: followers }, { count: following }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('badges_earned').select('badge_key').eq('user_id', user.id),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id),
      ])

      if (prof) {
        setProfile(prof as Profile)
        setEditForm({
          full_name: prof.full_name ?? '',
          bio: prof.bio ?? '',
          church_name: prof.church_name ?? '',
          city: prof.city ?? '',
          country: prof.country ?? '',
        })
      }
      if (badges) setUnlockedBadges(badges.map((b: { badge_key: string }) => b.badge_key))
      if (count !== null) setPostCount(count)
      if (followers !== null) setFollowerCount(followers)
      if (following !== null) setFollowingCount(following)
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .update({
        full_name: editForm.full_name,
        bio: editForm.bio || null,
        church_name: editForm.church_name || null,
        city: editForm.city || null,
        country: editForm.country || null,
      })
      .eq('id', user.id)
      .select('*')
      .single()

    if (data) setProfile(data as Profile)
    setSaving(false)
    setShowEdit(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert('Max 10MB'); return }
    setAvatarUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const json = await res.json()
    if (res.ok && json.url) {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({ avatar_url: json.url }).eq('id', user.id)
        setProfile(p => p ? { ...p, avatar_url: json.url } : p)
      }
    }
    setAvatarUploading(false)
    if (avatarInputRef.current) avatarInputRef.current.value = ''
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

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
          <div className="relative group">
            <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
              <AvatarImage src={profile?.avatar_url ?? ''} />
              <AvatarFallback className="text-2xl font-black bg-[#1F5E4A]/10 text-[#1F5E4A]">{initials}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="Change photo"
            >
              {avatarUploading
                ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                : <Camera className="w-5 h-5 text-white" />}
            </button>
          </div>
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            onClick={handleLogout}
            className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white transition-colors"
            title="Sign out"
          >
            <LogOut size={14} className="text-gray-600" />
          </button>
          <button
            onClick={() => setShowEdit(true)}
            className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white transition-colors"
            title="Edit profile"
          >
            <Settings size={14} className="text-gray-600" />
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
          <Button variant="secondary" size="sm" className="gap-1.5" onClick={() => setShowEdit(true)}>
            <Edit3 size={14} /> Edit Profile
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

        <div className="flex gap-6 mt-4">
          <div className="text-center">
            <p className="font-black text-xl text-[#1F5E4A]">{postCount}</p>
            <p className="text-xs text-gray-400">Posts</p>
          </div>
          <div className="text-center">
            <p className="font-black text-xl text-[#1F5E4A]">{followerCount}</p>
            <p className="text-xs text-gray-400">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-black text-xl text-[#1F5E4A]">{followingCount}</p>
            <p className="text-xs text-gray-400">Following</p>
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
                  unlocked ? "bg-[#e8f4ef] border-[#1F5E4A]/20 shadow-sm" : "bg-gray-50 border-gray-100 opacity-40"
                }`}
              >
                <span className="text-2xl">{badge.icon}</span>
                <p className="text-[10px] font-semibold text-center leading-tight text-[#222222]">{badge.label}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Edit profile modal */}
      <AnimatePresence>
        {showEdit && (
          <div className="fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={() => setShowEdit(false)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="absolute bottom-[65px] sm:bottom-auto left-0 right-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-base text-[#222222]">Edit Profile</h3>
                <button onClick={() => setShowEdit(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X size={16} />
                </button>
              </div>

              <div className="px-5 py-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 140px)' }}>
                {/* Avatar upload row */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 ring-2 ring-[#1F5E4A]/20">
                    <AvatarImage src={profile?.avatar_url ?? ''} />
                    <AvatarFallback className="text-lg font-black bg-[#1F5E4A]/10 text-[#1F5E4A]">{initials}</AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="flex items-center gap-2 text-sm font-semibold text-[#1F5E4A] border border-[#1F5E4A]/30 rounded-xl px-4 py-2 hover:bg-[#1F5E4A]/5 transition-colors"
                  >
                    {avatarUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera size={15} />}
                    {avatarUploading ? 'Uploading…' : 'Change Photo'}
                  </button>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Full Name</label>
                  <Input value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Your full name" className="h-11" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Bio</label>
                  <Textarea value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell the community about yourself..." className="resize-none min-h-[80px]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Church</label>
                  <Input value={editForm.church_name} onChange={e => setEditForm(f => ({ ...f, church_name: e.target.value }))} placeholder="Your church name" className="h-11" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">City</label>
                    <Input value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))} placeholder="Lagos" className="h-11" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Country</label>
                    <Input value={editForm.country} onChange={e => setEditForm(f => ({ ...f, country: e.target.value }))} placeholder="Nigeria" className="h-11" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
                <Button variant="secondary" onClick={() => setShowEdit(false)} className="flex-1 h-11">Cancel</Button>
                <Button onClick={handleSave} disabled={saving || !editForm.full_name.trim()} className="flex-1 h-11 bg-[#1F5E4A] hover:bg-[#174d3c] text-white font-semibold gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save size={15} /> Save</>}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
