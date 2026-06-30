"use client"

import React from "react"
import { motion } from "framer-motion"
import { Clock, BookOpen, Play } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface DevotionalCardProps {
  title: string
  author: string
  readTime: number
  progress?: number
  category?: string
  index?: number
}

export function DevotionalCard({
  title,
  author,
  readTime,
  progress,
  category = "Devotional",
  index = 0,
}: DevotionalCardProps) {
  const hasProgress = progress !== undefined && progress > 0
  const isCompleted = progress === 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className="card-formed group cursor-pointer"
    >
      {/* Cover image */}
      <div
        className="h-36 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, hsl(${(index * 47) % 360}, 50%, 35%) 0%, hsl(${(index * 47 + 40) % 360}, 40%, 25%) 100%)`,
        }}
      >
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)",
          }}
        />
        <div className="absolute bottom-3 left-3">
          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {category}
          </span>
        </div>
        {isCompleted && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#D4A72C] flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-[#222222] text-sm leading-tight mb-1 line-clamp-2 group-hover:text-[#1F5E4A] transition-colors">
          {title}
        </h3>
        <p className="text-xs text-gray-400 mb-3">by {author}</p>

        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <Clock size={12} />
          <span>{readTime} min read</span>
        </div>

        {hasProgress && !isCompleted && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{progress}% complete</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        <Button
          variant={hasProgress && !isCompleted ? "default" : "secondary"}
          size="sm"
          className="w-full gap-2 text-xs"
        >
          {isCompleted ? (
            <>
              <BookOpen size={13} />
              Read Again
            </>
          ) : hasProgress ? (
            <>
              <Play size={13} />
              Continue
            </>
          ) : (
            <>
              <BookOpen size={13} />
              Start Reading
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
