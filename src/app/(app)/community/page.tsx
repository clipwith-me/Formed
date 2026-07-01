"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, Heart, MessageCircle, Loader2, AlertCircle, ImageIcon, Video, Play } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

type Post = {
  id: string
  author_id: string
  type: string
  content: string
  image_url: string | null
  video_url: string | null
  like_count: number
  comment_count: number
  created_at: string
  author_name?: string
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
  const [showModal, setShowModal] = useState(false)
  const [postText, setPostText] = useState("")
  const [postType, setPostType] = useState("TESTIMONY")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadPosts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  async function loadPosts() {
    setLoading(true)
    const supabase = createClient()
    let query = supabase
      .from('posts')
      .select('*, profiles(full_name)')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(30)

    const typeFilter = TYPE_MAP[activeTab]
    if (typeFilter) query = query.eq('type', typeFilter)

    const { data } = await query
    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setPosts((data as any[]).map(p => ({
        ...p,
        author_name: Array.isArray(p.profiles) ? p.profiles[0]?.full_name ?? 'Anonymous' : p.profiles?.full_name ?? 'Anonymous',
      })))
    }
    setLoading(false)
  }

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${MAX_FILE_MB}MB.`)
      return
    }

    setMediaFile(file)
    setMediaType(type)
    setMediaPreview(URL.createObjectURL(file))
    setError('')
  }

  const clearMedia = () => {
    setMediaFile(null)
    setMediaPreview(null)
    setMediaType(null)
    if (photoInputRef.current) photoInputRef.current.value = ''
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  const handleLike = async (id: string) => {
    const supabase = createClient()
    const next = new Set(likedIds)
    const post = posts.find(p => p.id === id)!
    if (next.has(id)) {
      next.delete(id)
      await supabase.from('posts').update({ like_count: post.like_count - 1 }).eq('id', id)
      setPosts(ps => ps.map(p => p.id === id ? { ...p, like_count: p.like_count - 1 } : p))
    } else {
      next.add(id)
      await supabase.from('posts').update({ like_count: post.like_count + 1 }).eq('id', id)
      setPosts(ps => ps.map(p => p.id === id ? { ...p, like_count: p.like_count + 1 } : p))
    }
    setLikedIds(next)
  }

  const handlePost = async () => {
    if (!postText.trim()) return
    setSubmitting(true)
    setError('')
    setUploadProgress(0)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('You must be signed in.'); setSubmitting(false); return }

    let image_url: string | null = null
    let video_url: string | null = null

    if (mediaFile && mediaType) {
      const ext = mediaFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      setUploadProgress(20)

      const { error: uploadErr } = await supabase.storage
        .from('post-media')
        .upload(path, mediaFile, { upsert: false })

      if (uploadErr) { setError(uploadErr.message); setSubmitting(false); return }

      setUploadProgress(80)

      const { data: urlData } = supabase.storage.from('post-media').getPublicUrl(path)

      if (mediaType === 'image') image_url = urlData.publicUrl
      else video_url = urlData.publicUrl
    }

    setUploadProgress(90)

    const { data, error: err } = await supabase.from('posts').insert({
      author_id: user.id,
      type: postType,
      content: postText,
      image_url,
      video_url,
      is_published: true,
      like_count: 0,
      comment_count: 0,
    }).select('*, profiles(full_name)').single()

    if (err) { setError(err.message); setSubmitting(false); return }

    setUploadProgress(100)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newPost: Post = {
      ...data,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      author_name: Array.isArray((data as any).profiles) ? (data as any).profiles[0]?.full_name ?? 'You' : (data as any).profiles?.full_name ?? 'You',
    }
    setPosts(ps => [newPost, ...ps])
    setPostText('')
    clearMedia()
    setShowModal(false)
    setSubmitting(false)
  }

  const closeModal = () => {
    setShowModal(false)
    setPostText('')
    setError('')
    clearMedia()
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-black text-[#222222] mb-1">Community</h1>
        <p className="text-gray-500 text-sm">Share, pray, and grow together</p>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              activeTab === tab
                ? "bg-[#1F5E4A] text-white shadow-sm"
                : "bg-white text-gray-500 border border-gray-100 hover:border-[#1F5E4A] hover:text-[#1F5E4A]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#1F5E4A]" /></div>
      ) : (
        <div className="space-y-3">
          {posts.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-10">Nothing here yet — be the first to share!</p>
          )}
          {posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-9 h-9 flex-shrink-0">
                      <AvatarFallback className="bg-[#1F5E4A]/10 text-[#1F5E4A] text-xs font-bold">
                        {(post.author_name ?? 'A').charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-800">{post.author_name}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(post.created_at)}</span>
                      </div>
                      <span className="text-xs text-[#1F5E4A] font-medium">{TYPE_LABELS[post.type] ?? post.type}</span>
                      <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">{post.content}</p>
                    </div>
                  </div>

                  {/* Media */}
                  {post.image_url && (
                    <div className="mt-3 rounded-xl overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.image_url}
                        alt="Post photo"
                        className="w-full max-h-80 object-cover"
                      />
                    </div>
                  )}
                  {post.video_url && (
                    <div className="mt-3 rounded-xl overflow-hidden bg-black">
                      <video
                        src={post.video_url}
                        controls
                        className="w-full max-h-80"
                        preload="metadata"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-all ${
                        likedIds.has(post.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                      }`}
                    >
                      <Heart className="w-4 h-4" fill={likedIds.has(post.id) ? 'currentColor' : 'none'} />
                      {post.like_count}
                    </button>
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      <MessageCircle className="w-4 h-4" />{post.comment_count}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 w-14 h-14 rounded-full bg-[#1F5E4A] text-white shadow-[0_4px_20px_rgba(31,94,74,0.4)] flex items-center justify-center z-30"
      >
        <Plus size={24} />
      </motion.button>

      {/* Hidden file inputs */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => handleMediaSelect(e, 'image')}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={e => handleMediaSelect(e, 'video')}
      />

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-[#222222]">Share with Community</h3>
                <button onClick={closeModal} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                  <X size={16} />
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}

              {/* Post type selector */}
              <div className="flex gap-2 flex-wrap">
                {['TESTIMONY', 'PRAYER', 'QUESTION', 'ARTICLE'].map(t => (
                  <button
                    key={t}
                    onClick={() => setPostType(t)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      postType === t ? 'bg-[#1F5E4A] text-white border-[#1F5E4A]' : 'text-gray-500 border-gray-200 hover:border-[#1F5E4A]'
                    }`}
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>

              <Textarea
                placeholder="Share a testimony, prayer request, or question..."
                value={postText}
                onChange={e => setPostText(e.target.value)}
                className="min-h-[100px] resize-none"
              />

              {/* Media preview */}
              {mediaPreview && mediaType && (
                <div className="relative rounded-xl overflow-hidden bg-gray-100">
                  {mediaType === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaPreview} alt="Preview" className="w-full max-h-48 object-cover" />
                  ) : (
                    <div className="relative">
                      <video src={mediaPreview} className="w-full max-h-48 object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                          <Play className="w-5 h-5 text-white ml-1" />
                        </div>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={clearMedia}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <X size={14} className="text-white" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full capitalize">
                    {mediaType} • {(mediaFile!.size / (1024 * 1024)).toFixed(1)}MB
                  </div>
                </div>
              )}

              {/* Upload progress */}
              {submitting && mediaFile && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Uploading {mediaType}…</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#1F5E4A] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Media attach buttons */}
              {!mediaFile && (
                <div className="flex gap-2">
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-[#1F5E4A] hover:text-[#1F5E4A] transition-all"
                  >
                    <ImageIcon className="w-4 h-4" /> Add Photo
                  </button>
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-[#1F5E4A] hover:text-[#1F5E4A] transition-all"
                  >
                    <Video className="w-4 h-4" /> Add Video
                  </button>
                  <span className="text-xs text-gray-400 self-center ml-auto">Max {MAX_FILE_MB}MB</span>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" size="sm" onClick={closeModal} className="flex-1">Cancel</Button>
                <Button
                  size="sm"
                  onClick={handlePost}
                  disabled={!postText.trim() || submitting}
                  className="flex-1 bg-[#1F5E4A] hover:bg-[#174d3c] text-white"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
