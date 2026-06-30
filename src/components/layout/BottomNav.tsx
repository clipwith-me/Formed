"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, Heart, Users, User } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { label: "Home", path: "/home", icon: Home },
  { label: "Discover", path: "/discover", icon: Compass },
  { label: "Follow-up", path: "/followup", icon: Heart },
  { label: "Community", path: "/community", icon: Users },
  { label: "Profile", path: "/profile", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Blur background */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_24px_rgba(31,94,74,0.08)]" />

      <div className="relative flex items-center justify-around px-2 py-2 pb-safe">
        {NAV.map(({ label, path, icon: Icon }) => {
          const isActive = pathname === path || pathname.startsWith(path + "/")
          return (
            <Link
              key={path}
              href={path}
              className="flex flex-col items-center gap-0.5 px-3 py-1 relative group"
            >
              {/* Active indicator */}
              {isActive && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#1F5E4A]" />
              )}

              <Icon
                size={22}
                className={cn(
                  "transition-all duration-200",
                  isActive
                    ? "text-[#1F5E4A] scale-110"
                    : "text-gray-400 group-hover:text-[#1F5E4A]"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-semibold transition-colors duration-200",
                  isActive ? "text-[#1F5E4A]" : "text-gray-400 group-hover:text-[#1F5E4A]"
                )}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
