"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, Loader2, UserCheck, UserPlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

type Profile = {
  id: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  cover_url: string | null
  role: string | null
  church_name: string | null
  city: string | null
  country: string | null
  is_verified: boolean
}

type Post = {
  id: string
  type: string
  content: string
  image_url: string | null
  like_count: number
  comment_count: number
  created_at: string
}

const TYPE_LABELS: Record<string, string> = {
  TESTIMONY: '✝️ Testimony', PRAYER: '🙏 Prayer', QUESTION: '❓ Question',
  ARTICLE: '📖 Article', PRAISE: '🎉 Praise', MISSION_UPDATE: '🌍 Mission',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    if (!id) return
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id ?? null)
      if (user?.id === id) { setIsOwnProfile(true) }

      const [
        { data: prof },
        { data: userPosts },
        { count: followers },
        { count: following },
        { data: followRow },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('posts').select('id,type,content,image_url,like_count,comment_count,created_at')
          .eq('author_id', id).eq('is_published', true).order('created_at', { ascending: false }).limit(20),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', id),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', id),
        user ? supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', id).maybeSingle() : Promise.resolve({ data: null }),
      ])

      if (prof) setProfile(prof as Profile)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (userPosts) setPosts(userPosts as any[])
      setFollowerCount(followers ?? 0)
      setFollowingCount(following ?? 0)
      setIsFollowing(!!followRow)
      setLoading(false)
    }
    load()
  }, [id])

  const handleFollow = async () => {
    if (!currentUserId || !id || followLoading) return
    setFollowLoading(true)
    const supabase = createClient()
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', id)
      setIsFollowing(false)
      setFollowerCount(c => Math.max(0, c - 1))
    } else {
      await supabase.from('follows').insert({ follower_id: currentUserId, following_id: id })
      setIsFollowing(true)
      setFollowerCount(c => c + 1)
    }
    setFollowLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#1F5E4A]" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-4xl mb-3">👤</p>
        <p>Profile not found</p>
      </div>
    )
  }

  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="space-y-5 pb-10">
      {/* Back button */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1F5E4A] transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Cover + Avatar */}
      <div className="relative">
        <div
          className="h-36 rounded-2xl overflow-hidden"
          style={{ background: profile.cover_url ? `url(${profile.cover_url}) center/cover` : "linear-gradient(135deg, #1F5E4A 0%, #2d7a61 60%, #D4A72C 100%)" }}
        />
        <div className="absolute bottom-0 left-5 translate-y-1/2">
          <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
            <AvatarImage src={profile.avatar_url ?? ''} />
            <AvatarFallback className="text-2xl font-black bg-[#1F5E4A]/10 text-[#1F5E4A]">{initials}</AvatarFallback>
          </Avatar>
        </div>
        {/* Follow button */}
        {!isOwnProfile && currentUserId && (
          <div className="absolute bottom-3 right-3">
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow transition-all ${
                isFollowing
                  ? 'bg-white text-[#1F5E4A] border border-[#1F5E4A]'
                  : 'bg-[#1F5E4A] text-white'
              }`}
            >
              {followLoading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : isFollowing
                  ? <><UserCheck size={14} /> Following</>
                  : <><UserPlus size={14} /> Follow</>}
            </button>
          </div>
        )}
        {isOwnProfile && (
          <div className="absolute bottom-3 right-3">
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white border border-gray-200 text-gray-600 shadow"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* Profile info */}
      <div className="pt-10 px-1">
        <div className="flex items-start gap-2">
          <h1 className="text-xl font-black text-[#222222]">{profile.full_name ?? 'Anonymous'}</h1>
          {profile.is_verified && <CheckCircle size={18} className="text-[#1F5E4A] mt-1" />}
        </div>
        <Badge variant="default" className="mt-1 text-xs capitalize">{profile.role?.toLowerCase() ?? 'believer'}</Badge>

        {profile.bio && <p className="text-gray-500 text-sm mt-2 leading-relaxed">{profile.bio}</p>}

        <div className="flex gap-3 mt-2 text-xs text-gray-400 flex-wrap">
          {profile.church_name && <span>⛪ {profile.church_name}</span>}
          {profile.city && profile.country && <span>📍 {profile.city}, {profile.country}</span>}
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-4">
          <div className="text-center">
            <p className="font-black text-xl text-[#1F5E4A]">{posts.length}</p>
            <p className="text-xs text-gray-400">Posts</p>
          </div>
          <div className="text-center cursor-pointer">
            <p className="font-black text-xl text-[#1F5E4A]">{followerCount}</p>
            <p className="text-xs text-gray-400">Followers</p>
          </div>
          <div className="text-center cursor-pointer">
            <p className="font-black text-xl text-[#1F5E4A]">{followingCount}</p>
            <p className="text-xs text-gray-400">Following</p>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Posts</h2>
        {posts.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No posts yet</p>
        ) : (
          <div className="space-y-3">
            {posts.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                  <CardContent className="p-4">
                    <span className="text-xs text-[#1F5E4A] font-medium">{TYPE_LABELS[post.type] ?? post.type}</span>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed">{post.content}</p>
                    {post.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.image_url} alt="" className="mt-2 rounded-xl w-full max-h-60 object-cover" />
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>👍 {post.like_count}</span>
                      <span>💬 {post.comment_count}</span>
                      <span className="ml-auto">{timeAgo(post.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
