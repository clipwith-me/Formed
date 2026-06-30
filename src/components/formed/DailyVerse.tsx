"use client"

import React from "react"
import { motion } from "framer-motion"
import { Share2, BookOpen, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DailyVerseProps {
  verse?: string
  reference?: string
}

export function DailyVerse({
  verse = "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
  reference = "Jeremiah 29:11",
}: DailyVerseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(135deg, #1F5E4A 0%, #2d7a61 60%, #1a4d3a 100%)",
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 bg-white transform translate-x-16 -translate-y-16" />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 bg-white transform -translate-x-10 translate-y-10" />
      <div className="absolute top-4 left-4 opacity-20">
        <Sparkles size={32} className="text-[#D4A72C]" />
      </div>

      <div className="relative p-6 lg:p-8">
        {/* Label */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4A72C] opacity-90">
            Verse of the Day
          </span>
        </div>

        {/* Verse */}
        <blockquote className="verse-text mb-4 text-white/95">
          &ldquo;{verse}&rdquo;
        </blockquote>

        {/* Reference */}
        <p className="scripture-ref mb-6">— {reference}</p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="gold"
            size="sm"
            className="gap-2"
          >
            <BookOpen size={15} />
            Reflect
          </Button>
          <button className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors duration-200">
            <Share2 size={15} />
            Share
          </button>
        </div>
      </div>
    </motion.div>
  )
}
