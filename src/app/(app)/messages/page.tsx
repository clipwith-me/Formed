"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send, Search, ArrowLeft, Plus, X, Loader2, MessageSquareDashed
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

type Profile = { id: string; full_name: string | null }

type Conversation = {
  id: string
  other_user_id: string
  other_name: string
  last_message: string | null
  last_message_at: string | null
  unread: number
}

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

function timeLabel(iso: string | null) {
  if (!iso) return ""
  const d = new Date(iso)
  const diffMs = Date.now() - d.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" })
  return d.toLocaleDateString([], { month: "short", day: "numeric" })
}

function initials(name: string) {
  return name.split(" ").map(n => n[0] ?? "").join("").toUpperCase().slice(0, 2)
}

export default function MessagesPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)

  // New conversation
  const [showNew, setShowNew] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [searching, setSearching] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelRef = useRef<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setCurrentUserId(user.id); loadConversations(user.id) }
    })
    return () => { channelRef.current?.unsubscribe() }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function loadConversations(uid: string) {
    setLoadingConvs(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant1_id.eq.${uid},participant2_id.eq.${uid}`)
      .order("last_message_at", { ascending: false, nullsFirst: false })

    if (!data || data.length === 0) { setConversations([]); setLoadingConvs(false); return }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const otherIds = (data as any[]).map((c: any) =>
      c.participant1_id === uid ? c.participant2_id : c.participant1_id
    )
    const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", otherIds)
    const nameMap: Record<string, string> = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(profiles ?? []).forEach((p: any) => { nameMap[p.id] = p.full_name ?? "Unknown" })

    const convIds = data.map((c: { id: string }) => c.id)
    const { data: unreadRows } = await supabase
      .from("messages")
      .select("conversation_id")
      .in("conversation_id", convIds)
      .eq("is_read", false)
      .neq("sender_id", uid)

    const unreadMap: Record<string, number> = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(unreadRows ?? []).forEach((r: any) => {
      unreadMap[r.conversation_id] = (unreadMap[r.conversation_id] ?? 0) + 1
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setConversations((data as any[]).map((c: any) => {
      const otherId = c.participant1_id === uid ? c.participant2_id : c.participant1_id
      return {
        id: c.id,
        other_user_id: otherId,
        other_name: nameMap[otherId] ?? "Unknown",
        last_message: c.last_message ?? null,
        last_message_at: c.last_message_at ?? null,
        unread: unreadMap[c.id] ?? 0,
      }
    }))
    setLoadingConvs(false)
  }

  async function openConversation(conv: Conversation) {
    setSelectedConv(conv)
    setMessages([])
    setLoadingMsgs(true)
    setInput("")
    const supabase = createClient()

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true })
      .limit(100)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setMessages((data ?? []) as any[])
    setLoadingMsgs(false)

    if (currentUserId) {
      await supabase.from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conv.id)
        .neq("sender_id", currentUserId)
        .eq("is_read", false)
      setConversations(cs => cs.map(c => c.id === conv.id ? { ...c, unread: 0 } : c))
    }

    channelRef.current?.unsubscribe()
    channelRef.current = supabase
      .channel(`conv-${conv.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `conversation_id=eq.${conv.id}`,
      }, (payload) => {
        const msg = payload.new as Message
        setMessages(ms => ms.find(m => m.id === msg.id) ? ms : [...ms, msg])
        if (msg.sender_id !== currentUserId) {
          supabase.from("messages").update({ is_read: true }).eq("id", msg.id)
        }
        setConversations(cs => cs.map(c =>
          c.id === conv.id ? { ...c, last_message: msg.content, last_message_at: msg.created_at } : c
        ))
      })
      .subscribe()

    setTimeout(() => inputRef.current?.focus(), 300)
  }

  async function sendMessage() {
    if (!input.trim() || !selectedConv || !currentUserId || sending) return
    const text = input.trim()
    setInput("")
    setSending(true)
    const supabase = createClient()

    const { data } = await supabase.from("messages").insert({
      conversation_id: selectedConv.id,
      sender_id: currentUserId,
      content: text,
      is_read: false,
    }).select("*").single()

    if (data) {
      const msg = data as Message
      setMessages(ms => ms.find(m => m.id === msg.id) ? ms : [...ms, msg])
      await supabase.from("conversations")
        .update({ last_message: text, last_message_at: new Date().toISOString() })
        .eq("id", selectedConv.id)
      setConversations(cs => cs.map(c =>
        c.id === selectedConv.id
          ? { ...c, last_message: text, last_message_at: new Date().toISOString() }
          : c
      ))
    }
    setSending(false)
  }

  // Debounced member search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      const supabase = createClient()
      const { data } = await supabase
        .from("profiles").select("id, full_name")
        .ilike("full_name", `%${searchQuery}%`)
        .neq("id", currentUserId ?? "")
        .limit(10)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSearchResults((data ?? []) as any[])
      setSearching(false)
    }, 350)
    return () => clearTimeout(t)
  }, [searchQuery, currentUserId])

  async function startConversation(other: Profile) {
    if (!currentUserId) return
    const supabase = createClient()

    const { data: existing } = await supabase
      .from("conversations").select("*")
      .or(
        `and(participant1_id.eq.${currentUserId},participant2_id.eq.${other.id}),` +
        `and(participant1_id.eq.${other.id},participant2_id.eq.${currentUserId})`
      )
      .maybeSingle()

    let conv: Conversation
    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = existing as any
      conv = { id: e.id, other_user_id: other.id, other_name: other.full_name ?? "Unknown", last_message: e.last_message ?? null, last_message_at: e.last_message_at ?? null, unread: 0 }
    } else {
      const { data: created } = await supabase
        .from("conversations")
        .insert({ participant1_id: currentUserId, participant2_id: other.id })
        .select("*").single()
      if (!created) return
      conv = {
        id: (created as { id: string }).id, other_user_id: other.id,
        other_name: other.full_name ?? "Unknown", last_message: null, last_message_at: null, unread: 0,
      }
      setConversations(cs => [conv, ...cs])
    }
    setShowNew(false); setSearchQuery("")
    openConversation(conv)
  }

  // ─── Thread view ───────────────────────────────────────────────────────
  if (selectedConv) {
    return (
      <div className="flex flex-col -mx-4 -my-6 lg:-mx-8 lg:-my-8" style={{ height: "calc(100vh - 65px)" }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
          <button onClick={() => { setSelectedConv(null); channelRef.current?.unsubscribe() }}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarFallback className="bg-[#1F5E4A]/10 text-[#1F5E4A] text-xs font-bold">
              {initials(selectedConv.other_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-[#222222] truncate">{selectedConv.other_name}</p>
            <p className="text-[11px] text-[#1F5E4A] font-medium">FORMED member</p>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-[#f8faf9]">
          {loadingMsgs ? (
            <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-[#1F5E4A]" /></div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-4xl mb-3">👋</div>
              <p className="text-sm font-semibold text-gray-700">Start the conversation</p>
              <p className="text-xs text-gray-400 mt-1">Say hello to {selectedConv.other_name.split(" ")[0]}</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.sender_id === currentUserId
              const prev = messages[i - 1]
              const showTime = !prev || new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() > 5 * 60 * 1000
              return (
                <div key={msg.id}>
                  {showTime && (
                    <p className="text-center text-[10px] text-gray-400 my-3">{timeLabel(msg.created_at)}</p>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1`}
                  >
                    <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                      isMe
                        ? "bg-[#1F5E4A] text-white rounded-br-md"
                        : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md"
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2.5 px-3 py-3 bg-white border-t border-gray-100 flex-shrink-0">
          <Input
            ref={inputRef}
            placeholder={`Message ${selectedConv.other_name.split(" ")[0]}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            className="flex-1 h-10 text-sm rounded-full bg-gray-50 border-gray-200"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-full bg-[#1F5E4A] flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all active:scale-95"
          >
            {sending ? <Loader2 size={16} className="text-white animate-spin" /> : <Send size={16} className="text-white" />}
          </button>
        </div>
      </div>
    )
  }

  // ─── Conversation list ─────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#222222]">Messages</h1>
          <p className="text-gray-500 text-sm">Connect with your community</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="w-10 h-10 rounded-xl bg-[#1F5E4A] text-white flex items-center justify-center shadow-sm hover:bg-[#174d3c] transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      {loadingConvs ? (
        <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[#1F5E4A]" /></div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MessageSquareDashed size={48} className="text-gray-200 mb-4" />
          <p className="font-bold text-gray-600">No conversations yet</p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs leading-relaxed">
            Tap the + button to start a conversation with another FORMED member
          </p>
          <button onClick={() => setShowNew(true)}
            className="mt-5 px-5 py-2.5 bg-[#1F5E4A] text-white text-sm font-semibold rounded-xl shadow-sm">
            Start a conversation
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {conversations.map((conv, i) => (
            <motion.button key={conv.id}
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => openConversation(conv)}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-[#f8faf9] transition-colors text-left"
            >
              <div className="relative flex-shrink-0">
                <Avatar className="w-11 h-11">
                  <AvatarFallback className="bg-[#1F5E4A]/10 text-[#1F5E4A] font-bold text-sm">
                    {initials(conv.other_name)}
                  </AvatarFallback>
                </Avatar>
                {conv.unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-[#1F5E4A] rounded-full text-[10px] text-white font-bold flex items-center justify-center px-1 ring-2 ring-white">
                    {conv.unread > 9 ? "9+" : conv.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={`text-sm truncate ${conv.unread > 0 ? "font-bold text-[#222222]" : "font-semibold text-gray-700"}`}>
                    {conv.other_name}
                  </p>
                  <span className="text-[11px] text-gray-400 flex-shrink-0">{timeLabel(conv.last_message_at)}</span>
                </div>
                <p className={`text-xs truncate mt-0.5 ${conv.unread > 0 ? "text-[#1F5E4A] font-medium" : "text-gray-400"}`}>
                  {conv.last_message ?? "Start the conversation"}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* New message sheet */}
      <AnimatePresence>
        {showNew && (
          <div className="fixed inset-0 z-50">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={() => { setShowNew(false); setSearchQuery("") }}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="absolute bottom-[65px] sm:bottom-auto left-0 right-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl"
              style={{ maxHeight: "80vh" }}
            >
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-base text-[#222222]">New Message</h3>
                <button onClick={() => { setShowNew(false); setSearchQuery("") }}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X size={16} />
                </button>
              </div>
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input autoFocus placeholder="Search members by name..."
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 text-sm" />
                </div>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: "50vh" }}>
                {searching ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-4 h-4 animate-spin text-[#1F5E4A]" /></div>
                ) : searchQuery && searchResults.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-8">No members found</p>
                ) : searchQuery ? (
                  searchResults.map(p => (
                    <button key={p.id} onClick={() => startConversation(p)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className="bg-[#1F5E4A]/10 text-[#1F5E4A] font-bold text-sm">
                          {initials(p.full_name ?? "U")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{p.full_name}</p>
                        <p className="text-xs text-gray-400">FORMED member</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center py-10 text-center px-6">
                    <Search size={32} className="text-gray-200 mb-3" />
                    <p className="text-sm text-gray-400">Search for a member by name to start chatting</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
