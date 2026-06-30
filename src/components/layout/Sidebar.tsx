"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, Heart, Users, User, Bell, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NAV_ITEMS } from "@/lib/constants"
import { cn } from "@/lib/utils"

const iconMap: Record<string, React.ReactNode> = {
  Home: <Home size={20} />,
  Compass: <Compass size={20} />,
  Heart: <Heart size={20} />,
  Users: <Users size={20} />,
  User: <User size={20} />,
}

export function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  return (
    <aside className="hidden lg:flex flex-col w-[240px] min-h-screen bg-white border-r border-gray-100 shadow-[2px_0_16px_rgba(31,94,74,0.05)] fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-6 border-b border-gray-100">
        <span className="text-2xl font-black tracking-tight text-[#1F5E4A]">
          FORMED
        </span>
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
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-2">
        <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-gray-500 hover:bg-[#e8f4ef] hover:text-[#1F5E4A] transition-all duration-200 text-sm font-medium">
          <Bell size={20} />
          <span>Notifications</span>
          <span className="ml-auto bg-[#1F5E4A] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            3
          </span>
        </button>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-gray-500 hover:bg-[#e8f4ef] hover:text-[#1F5E4A] transition-all duration-200 text-sm font-medium"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#e8f4ef] cursor-pointer transition-all duration-200">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback className="text-xs">JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#222222] truncate">John Doe</p>
            <p className="text-xs text-gray-400 truncate">Mentor</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
