"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Bell, X, CheckCheck, CircleUser, User, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow } from "date-fns"

type Notif = {
  id: string
  title: string
  body: string
  is_read: boolean
  created_at: string
}

export function TopBar() {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [unread, setUnread] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const handleSignOut = async () => {
    setSigningOut(true)
    await createClient().auth.signOut()
    window.location.href = '/login'
  }

  useEffect(() => {
    loadNotifs()
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function loadNotifs() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('notifications')
      .select('id, title, body, is_read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setNotifs(data as any[])
      setUnread(data.filter((n: Notif) => !n.is_read).length)
    }
  }

  const markAllRead = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    setNotifs(ns => ns.map(n => ({ ...n, is_read: true })))
    setUnread(0)
  }

  const markRead = async (id: string) => {
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifs(ns => ns.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnread(u => Math.max(0, u - 1))
  }

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-[0_2px_12px_rgba(31,94,74,0.05)]">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Account menu"
            aria-expanded={menuOpen}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-[#e8f4ef] hover:text-[#1F5E4A] transition-colors"
          >
            <CircleUser size={22} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-11 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden py-1"
              >
                <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <User size={16} /> My profile
                </Link>
                <button onClick={handleSignOut} disabled={signingOut} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 border-t border-gray-100 disabled:opacity-60">
                  <LogOut size={16} /> {signingOut ? 'Signing out…' : 'Sign out'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xl font-black tracking-tight text-[#1F5E4A]">FORMED</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4A72C] mb-2.5 block" />
        </div>

        {/* Bell */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setOpen(o => !o)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#e8f4ef] text-gray-400 hover:text-[#1F5E4A] transition-all duration-200 relative"
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-[#1F5E4A] ring-2 ring-white text-[10px] text-white font-bold flex items-center justify-center px-0.5">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="font-bold text-sm text-gray-800">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unread > 0 && (
                      <button onClick={markAllRead} className="text-xs text-[#1F5E4A] font-medium flex items-center gap-1 hover:underline">
                        <CheckCheck size={12} /> Mark all read
                      </button>
                    )}
                    <button onClick={() => setOpen(false)} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <X size={12} />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifs.length === 0 ? (
                    <div className="py-10 text-center">
                      <p className="text-2xl mb-2">🔔</p>
                      <p className="text-sm text-gray-400">No notifications yet</p>
                    </div>
                  ) : (
                    notifs.map(n => (
                      <button
                        key={n.id}
                        onClick={() => { if (!n.is_read) markRead(n.id) }}
                        className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-[#f0f7f4]' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          {!n.is_read && <span className="w-2 h-2 bg-[#1F5E4A] rounded-full mt-1.5 flex-shrink-0" />}
                          <div className={!n.is_read ? '' : 'pl-4'}>
                            <p className="text-sm font-semibold text-gray-800 leading-snug">{n.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                            <p className="text-[11px] text-gray-400 mt-1">
                              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
