"use client"

import React from "react"
import { Bell, Search } from "lucide-react"

export function TopBar() {
  return (
    <header className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-[0_2px_12px_rgba(31,94,74,0.05)]">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Search icon */}
        <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#e8f4ef] text-gray-400 hover:text-[#1F5E4A] transition-all duration-200">
          <Search size={20} />
        </button>

        {/* Wordmark centered */}
        <div className="flex items-center gap-1">
          <span className="text-xl font-black tracking-tight text-[#1F5E4A]">
            FORMED
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4A72C] mb-2.5 block" />
        </div>

        {/* Bell right */}
        <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#e8f4ef] text-gray-400 hover:text-[#1F5E4A] transition-all duration-200 relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#1F5E4A] ring-2 ring-white" />
        </button>
      </div>
    </header>
  )
}
