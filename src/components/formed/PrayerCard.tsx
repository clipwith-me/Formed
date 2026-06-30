"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface PrayerCardProps {
  id: string
  userName: string
  userAvatar?: string
  request: string
  prayingCount: number
  createdAt: Date
  index?: number
}

export function PrayerCard({
  userName,
  userAvatar,
  request,
  prayingCount: initialCount,
  createdAt,
  index = 0,
}: PrayerCardProps) {
  const [count, setCount] = useState(initialCount)
  const [hasPrayed, setHasPrayed] = useState(false)

  const handlePray = () => {
    if (!hasPrayed) {
      setCount((c) => c + 1)
      setHasPrayed(true)
    }
  }

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: "easeOut" }}
      className="card-formed p-4"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={userAvatar} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[#222222]">{userName}</p>
          <p className="text-xs text-gray-400">
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Request */}
      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
        {request}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <span>🤲</span>
          <span className="font-medium text-[#1F5E4A]">{count}</span>
          <span>praying</span>
        </div>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handlePray}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
            hasPrayed
              ? "bg-[#1F5E4A] text-white shadow-sm"
              : "bg-[#e8f4ef] text-[#1F5E4A] hover:bg-[#1F5E4A] hover:text-white"
          }`}
        >
          🤲 {hasPrayed ? "Praying" : "Pray"}
        </motion.button>
      </div>
    </motion.div>
  )
}
