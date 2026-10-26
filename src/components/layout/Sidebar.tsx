"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Compass, Heart, Users, User, Bell, Sun, Moon, LogOut, MessageCircle, BookOpen, GraduationCap, ShieldCheck } from "lucide-react"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NAV_ITEMS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const iconMap: Record<string, React.ReactNode> = {
  Home: <Home size={20} />,
  Compass: <Compass size={20} />,
  Heart: <Heart size={20} />,
  Users: <Users size={20} />,
  User: <User size={20} />,
  MessageCircle: <MessageCircle size={20} />,
  BookOpen: <BookOpen size={20} />,
}

type SidebarUser = {
  full_name: string | null
  avatar_url: string | null
  role: string | null
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<SidebarUser | null>(null)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const [{ data: profile }, { count }] = await Promise.all([
        supabase.from('profiles').select('full_name, avatar_url, role').eq('id', authUser.id).single(),
        supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', authUser.id).eq('is_read', false),
      ])

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (profile) setUser(profile as any)
      if (count !== null) setUnread(count)
    }
    load()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const displayName = user?.full_name ?? 'Loading…'
  const role = user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : 'Believer'
  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <aside className="hidden lg:flex flex-col w-[240px] min-h-screen bg-white border-r border-gray-100 shadow-[2px_0_16px_rgba(31,94,74,0.05)] fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-6 border-b border-gray-100">
        <span className="text-2xl font-black tracking-tight text-[#1F5E4A]">FORMED</span>
        <span className="w-2 h-2 rounded-full bg-[#D4A72C] mb-3 block" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + "/")
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group",
                isActive
                  ? "bg-[#1F5E4A] text-white shadow-[0_2px_8px_rgba(31,94,74,0.25)]"
                  : "text-gray-500 hover:bg-[#e8f4ef] hover:text-[#1F5E4A]"
              )}
            >
              <span className={cn(
                "transition-colors duration-200",
                isActive ? "text-white" : "text-gray-400 group-hover:text-[#1F5E4A]"
              )}>
                {iconMap[item.icon]}
              </span>
              {item.label}
            </Link>
          )
        })}

        {/* Messages link */}
        <Link
          href="/messages"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group",
            pathname.startsWith('/messages')
              ? "bg-[#1F5E4A] text-white shadow-[0_2px_8px_rgba(31,94,74,0.25)]"
              : "text-gray-500 hover:bg-[#e8f4ef] hover:text-[#1F5E4A]"
          )}
        >
          <span className={cn("transition-colors duration-200", pathname.startsWith('/messages') ? "text-white" : "text-gray-400 group-hover:text-[#1F5E4A]")}>
            <MessageCircle size={20} />
          </span>
          Messages
        </Link>

        {/* Journey link */}
        <Link
          href="/journey"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group",
            pathname.startsWith('/journey')
              ? "bg-[#1F5E4A] text-white shadow-[0_2px_8px_rgba(31,94,74,0.25)]"
              : "text-gray-500 hover:bg-[#e8f4ef] hover:text-[#1F5E4A]"
          )}
        >
          <span className={cn("transition-colors duration-200", pathname.startsWith('/journey') ? "text-white" : "text-gray-400 group-hover:text-[#1F5E4A]")}>
            <BookOpen size={20} />
          </span>
          Journey
        </Link>

        {/* Library link */}
        <Link
          href="/library"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group",
            pathname.startsWith('/library')
              ? "bg-[#1F5E4A] text-white shadow-[0_2px_8px_rgba(31,94,74,0.25)]"
              : "text-gray-500 hover:bg-[#e8f4ef] hover:text-[#1F5E4A]"
          )}
        >
          <span className={cn("transition-colors duration-200", pathname.startsWith('/library') ? "text-white" : "text-gray-400 group-hover:text-[#1F5E4A]")}>
            <GraduationCap size={20} />
          </span>
          Library
        </Link>

        {/* Admin link — visible only to ADMIN role */}
        {user?.role === 'ADMIN' && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group",
              pathname.startsWith('/admin')
                ? "bg-amber-600 text-white shadow-[0_2px_8px_rgba(217,119,6,0.3)]"
                : "text-amber-600 hover:bg-amber-50"
            )}
          >
            <span className={cn("transition-colors duration-200", pathname.startsWith('/admin') ? "text-white" : "text-amber-500")}>
              <ShieldCheck size={20} />
            </span>
            Admin
          </Link>
        )}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        {/* Notifications */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 text-sm font-medium">
          <Bell size={20} />
          <span>Notifications</span>
          {unread > 0 && (
            <span className="ml-auto bg-[#1F5E4A] text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold px-1">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-gray-500 hover:bg-[#e8f4ef] hover:text-[#1F5E4A] transition-all duration-200 text-sm font-medium"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all duration-200 text-sm font-medium"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>

        {/* User chip */}
        <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#e8f4ef] cursor-pointer transition-all duration-200 mt-1">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={user?.avatar_url ?? ''} />
            <AvatarFallback className="text-xs bg-[#1F5E4A]/10 text-[#1F5E4A] font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#222222] truncate">{displayName}</p>
            <p className="text-xs text-gray-400 truncate">{role}</p>
          </div>
        </Link>
      </div>
    </aside>
  )
}
