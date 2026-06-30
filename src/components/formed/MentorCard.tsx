"use client"

import React from "react"
import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface MentorCardProps {
  name: string
  avatar?: string
  specialties: string[]
  rating: number
  disciples: number
  isVerified?: boolean
  index?: number
}

export function MentorCard({
  name,
  avatar,
  specialties,
  rating,
  disciples,
  isVerified = true,
  index = 0,
}: MentorCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      className="card-formed p-5"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatar} />
          <AvatarFallback className="text-sm font-bold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-[#222222]">{name}</p>
            {isVerified && (
              <CheckCircle size={15} className="text-[#1F5E4A]" />
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
            <span>{disciples} disciples</span>
            <span>•</span>
            {/* Rating dots */}
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i < rating ? "bg-[#D4A72C]" : "bg-gray-200"
                  }`}
                />
              ))}
            </span>
          </div>
        </div>
      </div>

      {/* Specialties */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {specialties.map((s) => (
          <Badge key={s} variant="outline" className="text-xs">
            {s}
          </Badge>
        ))}
      </div>

      <Button variant="default" size="sm" className="w-full">
        Request Mentor
      </Button>
    </motion.div>
  )
}
