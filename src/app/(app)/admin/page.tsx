"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Send, Users, Bell, CheckCircle, Loader2, AlertCircle, ShieldAlert, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"

type UserRow = {
  id: string
  full_name: string | null
  role: string | null
  created_at: string
}

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)

  // Broadcast state
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsAdmin(false); setLoading(false); return }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const role = (profile as any)?.role
      setIsAdmin(role === 'ADMIN')

      if (role === 'ADMIN') {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, role, created_at')
          .order('created_at', { ascending: false })
        setUsers((data as UserRow[]) ?? [])
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleBroadcast = async () => {
    if (!title.trim() || !message.trim()) return
    setSending(true); setError(''); setSent(null)
    const res = await fetch('/api/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error ?? 'Failed to send'); setSending(false); return }
    setSent(json.sent)
    setTitle(''); setMessage('')
    setSending(false)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    const supabase = createClient()
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    setUsers(us => us.map(u => u.id === userId ? { ...u, role: newRole } : u))
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-[#1F5E4A]" /></div>
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <ShieldAlert className="w-12 h-12 text-gray-300" />
        <p className="text-gray-500 font-medium">Admin access required</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-[#222222] mb-1">Admin Panel</h1>
        <p className="text-gray-500 text-sm">Manage users and send community announcements</p>
      </motion.div>

      {/* Curriculum card */}
      <Link
        href="/admin/curriculum"
        className="flex items-center gap-3 bg-[#e8f4ef] rounded-2xl p-4 hover:bg-[#d4ece4] transition-colors group"
      >
        <div className="w-10 h-10 rounded-xl bg-[#1F5E4A]/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-[#1F5E4A]" />
        </div>
        <div>
          <p className="font-bold text-[#1F5E4A] text-sm">Curriculum Review</p>
          <p className="text-xs text-[#1F5E4A]/70">Manage and approve teaching resources</p>
        </div>
      </Link>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#e8f4ef] rounded-2xl p-4">
          <p className="text-3xl font-black text-[#1F5E4A]">{users.length}</p>
          <p className="text-sm text-[#1F5E4A] font-medium mt-0.5">Total Members</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4">
          <p className="text-3xl font-black text-amber-600">{users.filter(u => u.role === 'ADMIN').length}</p>
          <p className="text-sm text-amber-600 font-medium mt-0.5">Admins</p>
        </div>
      </div>

      {/* Broadcast panel */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#1F5E4A]" />
          <h2 className="font-bold text-[#222222]">Broadcast Message</h2>
          <span className="text-xs text-gray-400 ml-auto">Sends to all {users.length} members</span>
        </div>

        <AnimatePresence>
          {sent !== null && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl p-3">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Notification sent to {sent} member{sent !== 1 ? 's' : ''}!
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Title</label>
          <Input
            value={title}
            onChange={e => { setTitle(e.target.value); setSent(null) }}
            placeholder="e.g. Welcome to FORMED!"
            className="h-11"
            maxLength={80}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Message</label>
          <Textarea
            value={message}
            onChange={e => { setMessage(e.target.value); setSent(null) }}
            placeholder="Write your message to the community..."
            className="resize-none min-h-[100px] text-sm"
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{message.length}/500</p>
        </div>

        <Button
          onClick={handleBroadcast}
          disabled={sending || !title.trim() || !message.trim()}
          className="w-full h-11 bg-[#1F5E4A] hover:bg-[#174d3c] text-white font-semibold gap-2"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send size={15} /> Send to All Members</>}
        </Button>
      </section>

      {/* Members list */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-[#1F5E4A]" />
          <h2 className="font-bold text-[#222222]">Members</h2>
        </div>
        <div className="space-y-2">
          {users.map((u, i) => (
            <motion.div key={u.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
              <div className="w-9 h-9 rounded-full bg-[#1F5E4A]/10 flex items-center justify-center text-sm font-bold text-[#1F5E4A] flex-shrink-0">
                {(u.full_name ?? 'A').charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{u.full_name ?? 'Unnamed'}</p>
                <p className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <select
                value={u.role ?? 'BELIEVER'}
                onChange={e => handleRoleChange(u.id, e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#1F5E4A]"
              >
                <option value="BELIEVER">Believer</option>
                <option value="LEADER">Leader</option>
                <option value="ADMIN">Admin</option>
              </select>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
