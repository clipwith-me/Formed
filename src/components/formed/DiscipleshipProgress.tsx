"use client"

import React from "react"
import { motion } from "framer-motion"
import { Flame, ChevronRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface DiscipleshipProgressProps {
  currentDay?: number
  totalDays?: number
  lessonTitle?: string
  streak?: number
}

export function DiscipleshipProgress({
  currentDay = 7,
  totalDays = 365,
  lessonTitle = "Making Disciples",
  streak = 7,
}: DiscipleshipProgressProps) {
  const progressPercent = Math.round((currentDay / totalDays) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="card-formed p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1F5E4A] mb-1">
            Your Journey
          </p>
          <h3 className="font-bold text-[#222222] text-base">{lessonTitle}</h3>
        </div>

        {/* Streak */}
        <div className="flex flex-col items-center bg-orange-50 rounded-xl px-3 py-2">
          <Flame size={20} className="text-orange-500" />
          <span className="text-lg font-black text-orange-500 leading-none">{streak}</span>
          <span className="text-[10px] text-orange-400 font-semibold">streak</span>
        </div>
      </div>

      {/* Day counter */}
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-3xl font-black text-[#1F5E4A]">Day {currentDay}</span>
        <span className="text-gray-400 font-medium">of {totalDays}</span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>{progressPercent}% complete</span>
          <span>{totalDays - currentDay} days left</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      <Button variant="default" size="sm" className="w-full gap-2">
        Continue Journey
        <ChevronRight size={16} />
      </Button>
    </motion.div>
  )
}
