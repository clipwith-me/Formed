"use client"

import { useEffect, useRef, useState } from "react"
import { Bell, CheckCheck, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/client"

type Notif = { id: string; title: string; body: string; is_read: boolean; created_at: string }

export function SidebarNotifications() {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const rootRef = useRef<HTMLDivElement>(null)
  const unread = notifs.filter(n => !n.is_read).length

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from("notifications")
        .select("id, title, body, is_read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)
      if (data) setNotifs(data as Notif[])
    }
    load()
  }, [])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const markRead = async (id: string) => {
    setNotifs(ns => ns.map(n => (n.id === id ? { ...n, is_read: true } : n)))
    await createClient().from("notifications").update({ is_read: true }).eq("id", id)
  }

  const markAllRead = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setNotifs(ns => ns.map(n => ({ ...n, is_read: true })))
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false)
  }

  return (
    <div ref={rootRef}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition-all duration-200 hover:bg-[#e8f4ef] hover:text-[#1F5E4A]"
      >
        <Bell size={20} />
        <span>Notifications</span>
        {unread > 0 && (
          <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#1F5E4A] px-1 text-xs font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div role="dialog" aria-label="Notifications" className="fixed bottom-4 left-[248px] z-50 w-96 max-w-[calc(100vw-264px)] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1 text-xs font-medium text-[#1F5E4A] hover:underline">
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} aria-label="Close notifications" className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                <X size={12} />
              </button>
            </div>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {notifs.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-400">No notifications yet</p>
            ) : (
              notifs.map(n => (
                <button
                  key={n.id}
                  onClick={() => { if (!n.is_read) markRead(n.id) }}
                  className={`w-full border-b border-gray-50 px-4 py-3 text-left transition-colors last:border-0 hover:bg-gray-50 ${n.is_read ? "" : "bg-[#f0f7f4]"}`}
                >
                  <p className="text-sm font-semibold leading-snug text-gray-800">{n.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{n.body}</p>
                  <p className="mt-1 text-[11px] text-gray-400">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
