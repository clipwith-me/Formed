"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, MessageCircle, Loader2, AlertCircle, ImageIcon, Video, Search, Send, Share2, UserPlus, UserCheck } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

const REACTIONS = [
  { key: 'like',  emoji: '👍', label: 'Like',  color: '#1F5E4A' },
  { key: 'love',  emoji: '❤️', label: 'Love',  color: '#e11d48' },
  { key: 'pray',  emoji: '🙏', label: 'Pray',  color: '#7c3aed' },
  { key: 'fire',  emoji: '🔥', label: 'Fire',  color: '#ea580c' },
  { key: 'amen',  emoji: '🙌', label: 'Amen',  color: '#D4A72C' },
] as const

type ReactionKey = typeof REACTIONS[number]['key']

type Post = {
  id: string
  author_id: string
  type: string
  content: string
  image_url: string | null
  video_url: string | null
  like_count: number
  comment_count: number
  share_count: number
  created_at: string
  author_name?: string
  author_avatar?: string | null
}

type Comment = {
  id: string
  author_id: string
  content: string
  created_at: string
  author_name?: string
  reactions?: Record<ReactionKey, number>
}

const FILTER_TABS = ["All", "Testimonies", "Prayer", "Questions", "Articles"]

const TYPE_MAP: Record<string, string> = {
  All: '',
  Testimonies: 'TESTIMONY',
  Prayer: 'PRAYER',
  Questions: 'QUESTION',
  Articles: 'ARTICLE',
}

const TYPE_LABELS: Record<string, string> = {
  TESTIMONY: '✝️ Testimony',
  PRAYER: '🙏 Prayer',
  QUESTION: '❓ Question',
  ARTICLE: '📖 Article',
  PRAISE: '🎉 Praise',
  MISSION_UPDATE: '🌍 Mission',
}

const MAX_FILE_MB = 50

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [activeTab, setActiveTab] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [postText, setPostText] = useState("")
  const [postType, setPostType] = useState("TESTIMONY")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [userReactions, setUserReactions] = useState<Record<string, ReactionKey>>({})
  const [pickerPostId, setPickerPostId] = useState<string | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [error, setError] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [sheetH, setSheetH] = useState(600)

  // Comments state
  const [commentPostId, setCommentPostId] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [commentReactions, setCommentReactions] = useState<Record<string, Record<ReactionKey, number>>>({})
  const [myCommentReactions, setMyCommentReactions] = useState<Record<string, ReactionKey>>({})
  const [commentPickerId, setCommentPickerId] = useState<string | null>(null)
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())
  const [followLoading, setFollowLoading] = useState<Set<string>>(new Set())
  const [shareToast, setShareToast] = useState(false)

  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const openedAtRef = useRef<number>(0)
  const commentInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const NAV_H = window.innerWidth < 640 ? 65 : 0
    const measure = () => setSheetH(Math.floor(window.innerHeight * 0.92) - NAV_H)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Dismiss reaction pickers on outside click
  useEffect(() => {
    const handler = () => { setPickerPostId(null); setCommentPickerId(null) }
    document.addEventListener('click', handler, { capture: true })
    return () => document.removeEventListener('click', handler, { capture: true })
  }, [])

  // Load current user + follows
  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUserId(user.id)
      const { data: followRows } = await supabase.from('follows').select('following_id').eq('follower_id', user.id)
      if (followRows) setFollowingIds(new Set(followRows.map((f: { following_id: string }) => f.following_id)))
    }
    loadUserData()
  }, [])

  // Load persisted reactions keyed by user ID
  useEffect(() => {
    async function loadReactions() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      try {
        const saved = localStorage.getItem(`formed_reactions_${user.id}`)
        if (saved) {
          const parsed: Record<string, ReactionKey> = JSON.parse(saved)
          setUserReactions(parsed)
          // backfill likedIds for backwards compat
          setLikedIds(new Set(Object.keys(parsed)))
        }
      } catch {}
    }
    loadReactions()
  }, [])

  // iOS scroll lock — applies to both post modal and comment sheet
  const anySheetOpen = showModal || !!commentPostId
  useEffect(() => {
    if (anySheetOpen) {
      const y = window.scrollY
      document.body.dataset.scrollY = String(y)
      document.body.style.position = 'fixed'
      document.body.style.top = `-${y}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
    } else {
      const y = Number(document.body.dataset.scrollY ?? 0)
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      window.scrollTo(0, y)
    }
  }, [anySheetOpen])

  useEffect(() => {
    loadPosts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  async function loadPosts() {
    setLoading(true)
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(30)
    const typeFilter = TYPE_MAP[activeTab]
    if (typeFilter) query = query.eq('type', typeFilter)

    const { data: postRows, error: postErr } = await query
    if (postErr || !postRows || postRows.length === 0) { setPosts([]); setLoading(false); return }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const authorIds = [...new Set((postRows as any[]).map((p: any) => p.author_id).filter(Boolean))]
    const { data: profileRows } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', authorIds)
    const nameMap: Record<string, string> = {}
    const avatarMap: Record<string, string | null> = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(profileRows as any[] ?? []).forEach((p: any) => {
      nameMap[p.id] = p.full_name ?? 'Anonymous'
      avatarMap[p.id] = p.avatar_url ?? null
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setPosts((postRows as any[]).map((p: any) => ({
      id: p.id, author_id: p.author_id,
      type: p.type ?? 'TESTIMONY',
      content: p.content ?? '',
      image_url: p.image_url ?? null,
      video_url: p.video_url ?? null,
      like_count: p.like_count ?? 0,
      comment_count: p.comment_count ?? 0,
      share_count: p.share_count ?? 0,
      created_at: p.created_at,
      author_name: nameMap[p.author_id] ?? 'Anonymous',
      author_avatar: avatarMap[p.author_id] ?? null,
    })))
    setLoading(false)
  }

  async function openComments(post: Post) {
    setCommentPostId(post.id)
    setComments([])
    setCommentsLoading(true)
    setCommentText("")
    setReplyTo(null)

    const supabase = createClient()
    const { data: rows } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
      .limit(50)

    if (rows && rows.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const authorIds = [...new Set((rows as any[]).map((r: any) => r.author_id).filter(Boolean))]
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', authorIds)
      const nameMap: Record<string, string> = {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(profiles ?? []).forEach((p: any) => { nameMap[p.id] = p.full_name ?? 'Anonymous' })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setComments((rows as any[]).map((r: any) => ({
        id: r.id, author_id: r.author_id, content: r.content ?? '',
        created_at: r.created_at, author_name: nameMap[r.author_id] ?? 'Anonymous',
      })))
    }
    // Sync real count to DB and local state
    const actualCount = rows?.length ?? 0
    if (post.comment_count !== actualCount) {
      supabase.from('posts').update({ comment_count: actualCount }).eq('id', post.id)
      setPosts(ps => ps.map(p => p.id === post.id ? { ...p, comment_count: actualCount } : p))
    }
    setCommentsLoading(false)
    setTimeout(() => commentInputRef.current?.focus(), 300)
  }

  const closeComments = () => {
    setCommentPostId(null); setComments([]); setCommentText("")
    setCommentReactions({}); setMyCommentReactions({}); setCommentPickerId(null); setReplyTo(null)
  }

  const handleCommentReact = async (commentId: string, key: ReactionKey) => {
    setCommentPickerId(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const current = myCommentReactions[commentId]
    const nextMine = { ...myCommentReactions }
    setCommentReactions(prev => {
      const cur = prev[commentId] ?? {}
      const next = { ...cur }
      if (current) next[current] = Math.max(0, (next[current] ?? 1) - 1)
      if (current !== key) {
        next[key] = (next[key] ?? 0) + 1
        nextMine[commentId] = key
      } else {
        delete nextMine[commentId]
      }
      setMyCommentReactions(nextMine)
      try {
        const uid = user.id
        localStorage.setItem(`formed_creactions_${uid}`, JSON.stringify(nextMine))
      } catch {}
      return { ...prev, [commentId]: next }
    })
  }

  async function submitComment() {
    if (!commentText.trim() || !commentPostId) return
    setCommentSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setCommentSubmitting(false); return }

    const finalContent = replyTo
      ? `@${replyTo.name} ${commentText.trim()}`
      : commentText.trim()

    const { data } = await supabase.from('post_comments').insert({
      post_id: commentPostId,
      author_id: user.id,
      content: finalContent,
    }).select('*').single()

    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = data as any
      const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      setComments(cs => [...cs, {
        id: d.id, author_id: d.author_id, content: d.content,
        created_at: d.created_at,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        author_name: (prof as any)?.full_name ?? 'You',
      }])
      // Increment comment_count
      const post = posts.find(p => p.id === commentPostId)
      if (post) {
        await supabase.from('posts').update({ comment_count: post.comment_count + 1 }).eq('id', commentPostId)
        setPosts(ps => ps.map(p => p.id === commentPostId ? { ...p, comment_count: p.comment_count + 1 } : p))
      }
    }
    setCommentText("")
    setReplyTo(null)
    setCommentSubmitting(false)
  }

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_FILE_MB * 1024 * 1024) { setError(`Max ${MAX_FILE_MB}MB`); return }
    setMediaFile(file); setMediaType(type); setMediaPreview(URL.createObjectURL(file)); setError('')
  }

  const clearMedia = () => {
    setMediaFile(null); setMediaPreview(null); setMediaType(null)
    if (photoInputRef.current) photoInputRef.current.value = ''
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  const handleReact = async (postId: string, key: ReactionKey) => {
    setPickerPostId(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const post = posts.find(p => p.id === postId)!
    const current = userReactions[postId]
    const nextReactions = { ...userReactions }

    if (current === key) {
      // toggle off
      delete nextReactions[postId]
      await supabase.from('posts').update({ like_count: Math.max(0, post.like_count - 1) }).eq('id', postId)
      setPosts(ps => ps.map(p => p.id === postId ? { ...p, like_count: Math.max(0, p.like_count - 1) } : p))
    } else {
      const wasReacted = !!current
      nextReactions[postId] = key
      if (!wasReacted) {
        await supabase.from('posts').update({ like_count: post.like_count + 1 }).eq('id', postId)
        setPosts(ps => ps.map(p => p.id === postId ? { ...p, like_count: p.like_count + 1 } : p))
      }
    }
    setUserReactions(nextReactions)
    setLikedIds(new Set(Object.keys(nextReactions)))
    try {
      localStorage.setItem(`formed_reactions_${user.id}`, JSON.stringify(nextReactions))
    } catch {}
  }

  const handleFollow = async (authorId: string) => {
    if (!currentUserId || authorId === currentUserId) return
    setFollowLoading(prev => new Set([...prev, authorId]))
    const supabase = createClient()
    const isFollowing = followingIds.has(authorId)
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', authorId)
      setFollowingIds(prev => { const next = new Set(prev); next.delete(authorId); return next })
    } else {
      await supabase.from('follows').insert({ follower_id: currentUserId, following_id: authorId })
      setFollowingIds(prev => new Set([...prev, authorId]))
    }
    setFollowLoading(prev => { const next = new Set(prev); next.delete(authorId); return next })
  }

  const handleShare = async (post: Post) => {
    const url = `${window.location.origin}/community`
    const text = `"${post.content.slice(0, 120)}" — ${post.author_name} on FORMED`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'FORMED Community', text, url })
      } else {
        await navigator.clipboard.writeText(url)
        setShareToast(true)
        setTimeout(() => setShareToast(false), 2500)
      }
      const supabase = createClient()
      await supabase.from('posts').update({ share_count: (post.share_count ?? 0) + 1 }).eq('id', post.id)
      setPosts(ps => ps.map(p => p.id === post.id ? { ...p, share_count: (p.share_count ?? 0) + 1 } : p))
    } catch {}
  }

  const handlePost = async () => {
    if (!postText.trim()) return
    setSubmitting(true); setError(''); setUploadProgress(0)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('You must be signed in.'); setSubmitting(false); return }

    let image_url: string | null = null
    let video_url: string | null = null

    if (mediaFile && mediaType) {
      setUploadProgress(20)
      const fd = new FormData()
      fd.append('file', mediaFile)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Upload failed'); setSubmitting(false); return }
      setUploadProgress(80)
      if (mediaType === 'image') image_url = json.url
      else video_url = json.url
    }

    setUploadProgress(90)
    const { data, error: err } = await supabase.from('posts').insert({
      author_id: user.id, type: postType, content: postText, image_url, video_url,
    }).select('*').single()

    if (err) { setError(err.message); setSubmitting(false); return }
    setUploadProgress(100)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = data as any
    setPosts(ps => [{
      id: d.id, author_id: d.author_id, type: d.type ?? postType,
      content: d.content ?? postText, image_url: d.image_url ?? null,
      video_url: d.video_url ?? null, like_count: d.like_count ?? 0,
      comment_count: d.comment_count ?? 0, share_count: 0, created_at: d.created_at, author_name: 'You',
    }, ...ps])
    setPostText(''); clearMedia(); setShowModal(false); setSubmitting(false)
  }

  const openModal = () => { openedAtRef.current = Date.now(); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setPostText(''); setError(''); clearMedia() }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  const scrollAreaMaxH = Math.max(200, sheetH - 152)

  // Client-side search filter
  const visiblePosts = searchQuery.trim()
    ? posts.filter(p =>
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.author_name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts

  const commentPost = posts.find(p => p.id === commentPostId)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-black text-[#222222] mb-1">Community</h1>
        <p className="text-gray-500 text-sm">Share, pray, and grow together</p>
      </motion.div>

      {/* Search bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search posts..."
          className="pl-10"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTER_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              activeTab === tab ? "bg-[#1F5E4A] text-white shadow-sm" : "bg-white text-gray-500 border border-gray-100"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#1F5E4A]" /></div>
      ) : (
        <div className="space-y-3">
          {visiblePosts.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-10">
              {searchQuery ? `No posts matching "${searchQuery}"` : 'Nothing here yet — be the first to share!'}
            </p>
          )}
          {visiblePosts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Link href={`/profile/${post.author_id}`} className="flex-shrink-0">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={post.author_avatar ?? ''} />
                        <AvatarFallback className="bg-[#1F5E4A]/10 text-[#1F5E4A] text-xs font-bold">
                          {(post.author_name ?? 'A').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Link href={`/profile/${post.author_id}`} className="text-sm font-semibold text-gray-800 truncate hover:text-[#1F5E4A] transition-colors">{post.author_name}</Link>
                          {currentUserId && post.author_id !== currentUserId && (
                            <button
                              onClick={() => handleFollow(post.author_id)}
                              disabled={followLoading.has(post.author_id)}
                              className={`flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all flex-shrink-0 ${
                                followingIds.has(post.author_id)
                                  ? 'border-[#1F5E4A] text-[#1F5E4A] bg-[#1F5E4A]/5'
                                  : 'border-gray-300 text-gray-500 hover:border-[#1F5E4A] hover:text-[#1F5E4A]'
                              }`}
                            >
                              {followingIds.has(post.author_id)
                                ? <><UserCheck className="w-2.5 h-2.5" /> Following</>
                                : <><UserPlus className="w-2.5 h-2.5" /> Follow</>}
                            </button>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(post.created_at)}</span>
                      </div>
                      <span className="text-xs text-[#1F5E4A] font-medium">{TYPE_LABELS[post.type] ?? post.type}</span>
                      <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">{post.content}</p>
                    </div>
                  </div>
                  {post.image_url && (
                    <div className="mt-3 rounded-xl overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={post.image_url} alt="Post photo" className="w-full max-h-80 object-cover" />
                    </div>
                  )}
                  {post.video_url && (
                    <div className="mt-3 rounded-xl overflow-hidden bg-black">
                      <video src={post.video_url} controls className="w-full max-h-80" preload="metadata" />
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-3">
                    {/* Reaction button with LinkedIn-style picker */}
                    <div className="relative">
                      {/* Picker popup */}
                      <AnimatePresence>
                        {pickerPostId === post.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.85, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85, y: 8 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 400 }}
                            className="absolute bottom-8 left-0 flex items-center gap-1 bg-white border border-gray-100 rounded-full shadow-xl px-2 py-1.5 z-20"
                            onMouseLeave={() => setPickerPostId(null)}
                          >
                            {REACTIONS.map(r => (
                              <button
                                key={r.key}
                                onClick={() => handleReact(post.id, r.key)}
                                title={r.label}
                                className="flex flex-col items-center gap-0.5 hover:scale-125 transition-transform duration-150 px-1"
                              >
                                <span className="text-xl leading-none">{r.emoji}</span>
                                <span className="text-[9px] font-medium" style={{ color: r.color }}>{r.label}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Reaction trigger button */}
                      {(() => {
                        const reaction = userReactions[post.id]
                          ? REACTIONS.find(r => r.key === userReactions[post.id])
                          : null
                        return (
                          <button
                            onMouseEnter={() => setPickerPostId(post.id)}
                            onTouchStart={() => {
                              longPressTimer.current = setTimeout(() => setPickerPostId(post.id), 400)
                            }}
                            onTouchEnd={() => {
                              if (longPressTimer.current) clearTimeout(longPressTimer.current)
                            }}
                            onClick={() => {
                              if (pickerPostId === post.id) { setPickerPostId(null); return }
                              if (reaction) {
                                handleReact(post.id, reaction.key)
                              } else {
                                handleReact(post.id, 'like')
                              }
                            }}
                            className="flex items-center gap-1.5 text-xs font-medium transition-all select-none"
                            style={{ color: reaction ? reaction.color : '#9ca3af' }}
                          >
                            <span className="text-base leading-none">{reaction ? reaction.emoji : '👍'}</span>
                            <span>{post.like_count}</span>
                          </button>
                        )
                      })()}
                    </div>

                    <button
                      onClick={() => openComments(post)}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#1F5E4A] font-medium transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />{post.comment_count}
                    </button>
                    <button
                      onClick={() => handleShare(post)}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#1F5E4A] font-medium transition-colors ml-auto"
                    >
                      <Share2 className="w-4 h-4" />
                      {post.share_count > 0 && <span>{post.share_count}</span>}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Share toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-[#1F5E4A] text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg z-50"
          >
            Link copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
        onClick={openModal}
        className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 w-14 h-14 rounded-full bg-[#1F5E4A] text-white shadow-[0_4px_20px_rgba(31,94,74,0.4)] flex items-center justify-center z-30"
      >
        <Plus size={24} />
      </motion.button>

      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleMediaSelect(e, 'image')} />
      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={e => handleMediaSelect(e, 'video')} />

      {/* ───────────── POST MODAL ───────────── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={() => { if (Date.now() - openedAtRef.current > 400) closeModal() }}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="absolute bottom-[65px] sm:bottom-auto left-0 right-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl"
              style={{ maxHeight: sheetH }}
            >
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <h3 className="font-bold text-base text-[#222222]">Share with Community</h3>
                <button onClick={closeModal} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center" aria-label="Close">
                  <X size={16} />
                </button>
              </div>

              <div
                style={{ maxHeight: scrollAreaMaxH, overflowY: 'auto', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
                className="px-5 py-4 space-y-4"
              >
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />{error}
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Post type</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(TYPE_LABELS).map(([val, label]) => (
                      <button key={val} onClick={() => setPostType(val)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${postType === val ? 'bg-[#1F5E4A] text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">What&apos;s on your heart?</label>
                  <Textarea
                    placeholder="Share a testimony, prayer request, scripture..."
                    value={postText}
                    onChange={e => setPostText(e.target.value)}
                    className="min-h-[120px] resize-none text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Attach media (optional)</label>
                  {mediaPreview ? (
                    <div className="relative rounded-xl overflow-hidden bg-gray-100">
                      {mediaType === 'image'
                        ? <img src={mediaPreview} alt="preview" className="w-full max-h-48 object-cover" /> // eslint-disable-line @next/next/no-img-element
                        : <video src={mediaPreview} className="w-full max-h-48" controls preload="metadata" />
                      }
                      <button onClick={clearMedia} className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center">
                        <X size={14} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => photoInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <ImageIcon size={16} /> Photo
                      </button>
                      <button onClick={() => videoInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <Video size={16} /> Video
                      </button>
                    </div>
                  )}
                </div>

                {submitting && uploadProgress > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Uploading…</span><span>{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full bg-[#1F5E4A] rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
                <Button variant="secondary" onClick={closeModal} className="flex-1 h-11">Cancel</Button>
                <Button
                  onClick={handlePost}
                  disabled={submitting || !postText.trim()}
                  className="flex-1 h-11 bg-[#1F5E4A] hover:bg-[#174d3c] text-white font-semibold"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────── COMMENTS SHEET ───────────── */}
      <AnimatePresence>
        {commentPostId && (
          <div className="fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={closeComments}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="absolute bottom-[65px] sm:bottom-auto left-0 right-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl flex flex-col"
              style={{ maxHeight: sheetH }}
            >
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
                <div>
                  <h3 className="font-bold text-base text-[#222222]">Comments</h3>
                  {commentPost && (
                    <p className="text-xs text-gray-400 truncate max-w-[220px]">{commentPost.author_name}: {commentPost.content}</p>
                  )}
                </div>
                <button onClick={closeComments} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <X size={16} />
                </button>
              </div>

              {/* Comment list */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ overscrollBehavior: 'contain' }}>
                {commentsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[#1F5E4A]" /></div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-3xl mb-2">💬</p>
                    <p className="text-sm text-gray-400">No comments yet — be the first!</p>
                  </div>
                ) : (
                  comments.map((c, i) => (
                    <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#1F5E4A]/10 flex items-center justify-center text-xs font-bold text-[#1F5E4A] flex-shrink-0">
                        {(c.author_name ?? 'A').charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-50 rounded-xl px-3 py-2">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-gray-800">{c.author_name}</span>
                            <span className="text-[11px] text-gray-400 ml-auto">{timeAgo(c.created_at)}</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {c.content.startsWith('@')
                              ? <><span className="text-[#1F5E4A] font-semibold">{c.content.split(' ')[0]}</span>{' '}{c.content.split(' ').slice(1).join(' ')}</>
                              : c.content}
                          </p>
                        </div>
                        {/* Comment reactions */}
                        <div className="relative flex items-center gap-2 mt-1 ml-1">
                          {/* Reaction totals */}
                          {REACTIONS.map(r => {
                            const count = commentReactions[c.id]?.[r.key] ?? 0
                            if (!count) return null
                            return (
                              <button key={r.key} onClick={() => handleCommentReact(c.id, r.key)}
                                className="flex items-center gap-0.5 text-[11px] bg-white border border-gray-100 rounded-full px-1.5 py-0.5 shadow-sm"
                                style={{ color: myCommentReactions[c.id] === r.key ? r.color : '#6b7280' }}>
                                {r.emoji} {count}
                              </button>
                            )
                          })}
                          {/* Reply button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setReplyTo(replyTo?.id === c.id ? null : { id: c.id, name: c.author_name ?? 'User' }); setTimeout(() => commentInputRef.current?.focus(), 50) }}
                            className="text-[11px] text-gray-400 hover:text-[#1F5E4A] transition-colors px-1 font-medium"
                          >
                            Reply
                          </button>
                          {/* Add reaction button */}
                          <div className="relative">
                            <button onClick={(e) => { e.stopPropagation(); setCommentPickerId(commentPickerId === c.id ? null : c.id) }}
                              className="text-[11px] text-gray-400 hover:text-[#1F5E4A] transition-colors px-1">
                              😊 React
                            </button>
                            <AnimatePresence>
                              {commentPickerId === c.id && (
                                <motion.div
                                  onClick={(e) => e.stopPropagation()}
                                  initial={{ opacity: 0, scale: 0.85, y: 4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.85, y: 4 }}
                                  transition={{ type: 'spring', damping: 28, stiffness: 400 }}
                                  className="absolute bottom-7 left-0 flex items-center gap-1 bg-white border border-gray-100 rounded-full shadow-xl px-2 py-1.5 z-20 whitespace-nowrap"
                                >
                                  {REACTIONS.map(r => (
                                    <button key={r.key} onClick={(e) => { e.stopPropagation(); handleCommentReact(c.id, r.key) }}
                                      title={r.label}
                                      className="flex flex-col items-center gap-0.5 hover:scale-125 transition-transform duration-150 px-1">
                                      <span className="text-lg leading-none">{r.emoji}</span>
                                      <span className="text-[9px] font-medium" style={{ color: r.color }}>{r.label}</span>
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Comment input */}
              <div className="border-t border-gray-100 flex-shrink-0">
                {replyTo && (
                  <div className="flex items-center justify-between px-4 pt-2 pb-1">
                    <span className="text-xs text-[#1F5E4A] font-medium">Replying to @{replyTo.name}</span>
                    <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600">
                      <X size={13} />
                    </button>
                  </div>
                )}
              <div className="flex items-center gap-2 px-4 py-3">
                <Input
                  ref={commentInputRef}
                  placeholder={replyTo ? `Reply to @${replyTo.name}…` : "Write a comment…"}
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment() } }}
                  className="flex-1 h-10 text-sm"
                />
                <button
                  onClick={submitComment}
                  disabled={commentSubmitting || !commentText.trim()}
                  className="w-10 h-10 rounded-xl bg-[#1F5E4A] text-white flex items-center justify-center disabled:opacity-40 flex-shrink-0 transition-opacity"
                >
                  {commentSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
