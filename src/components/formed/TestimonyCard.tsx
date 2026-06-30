"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Heart, MessageCircle, Share2, CheckCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

interface TestimonyCardProps {
  userName: string
  userAvatar?: string
  testimony: string
  likes: number
  comments: number
  createdAt: Date
  isVerified?: boolean
  index?: number
}

export function TestimonyCard({
  userName,
  userAvatar,
  testimony,
  likes: initialLikes,
  comments,
  createdAt,
  isVerified = false,
  index = 0,
}: TestimonyCardProps) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(initialLikes)

  const handleLike = () => {
    setLiked(!liked)
    setLikes((l) => (liked ? l - 1 : l + 1))
  }

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className="card-formed p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={userAvatar} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-sm text-[#222222] truncate">{userName}</p>
            {isVerified && (
              <CheckCircle size={14} className="text-[#1F5E4A] shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-400">
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Quote decoration */}
      <div className="relative pl-4 mb-4 border-l-2 border-[#D4A72C]">
        <span className="absolute -top-1 -left-1 text-[#D4A72C] text-3xl font-serif leading-none opacity-50">&ldquo;</span>
        <p className="text-sm text-gray-700 leading-relaxed italic pl-3">
          {testimony}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-50">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors duration-200 ${
            liked ? "text-red-500" : "text-gray-400 hover:text-red-500"
          }`}
        >
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
          <span className="font-medium">{likes}</span>
        </motion.button>

        <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1F5E4A] transition-colors duration-200">
          <MessageCircle size={16} />
          <span className="font-medium">{comments}</span>
        </button>

        <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1F5E4A] transition-colors duration-200 ml-auto">
          <Share2 size={16} />
          <span className="font-medium">Share</span>
        </button>
      </div>
    </motion.div>
  )
}
