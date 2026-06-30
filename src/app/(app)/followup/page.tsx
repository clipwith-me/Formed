"use client"

import React from "react"
import { motion } from "framer-motion"
import { Plus, Calendar, ChevronRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const STATS = [
  { label: "Active", count: 3, color: "#1F5E4A" },
  { label: "Completed", count: 12, color: "#D4A72C" },
  { label: "Pending", count: 2, color: "#6b7280" },
]

const BELIEVERS = [
  {
    name: "Emmanuel Okeke",
    daysSince: 14,
    status: "Active",
    progress: 32,
    lastContact: "2 days ago",
  },
  {
    name: "Fatima Abdullahi",
    daysSince: 7,
    status: "Active",
    progress: 18,
    lastContact: "Today",
  },
  {
    name: "Chidi Okonkwo",
    daysSince: 21,
    status: "Active",
    progress: 45,
    lastContact: "4 days ago",
  },
  {
    name: "Amaka Eze",
    daysSince: 5,
    status: "Pending",
    progress: 5,
    lastContact: "Yesterday",
  },
  {
    name: "Segun Adeyemi",
    daysSince: 3,
    status: "Pending",
    progress: 2,
    lastContact: "3 days ago",
  },
]

function statusVariant(status: string): "default" | "gold" | "muted" {
  if (status === "Active") return "default"
  if (status === "Completed") return "gold"
  return "muted"
}

export default function FollowUpPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-black text-[#222222] mb-1">Follow-up Hub</h1>
        <p className="text-gray-500 text-sm">Track and nurture new believers</p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="card-formed p-4 text-center"
          >
            <div
              className="text-3xl font-black mb-1"
              style={{ color: stat.color }}
            >
              {stat.count}
            </div>
            <div className="text-xs text-gray-400 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Believers list */}
      <section>
        <div className="section-header">
          <h2 className="section-title">Your Believers</h2>
        </div>

        <div className="space-y-3">
          {BELIEVERS.map((believer, i) => {
            const initials = believer.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()

            return (
              <motion.div
                key={believer.name}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="card-formed p-4 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="text-sm font-bold">{initials}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-[#222222] text-sm truncate">{believer.name}</p>
                      <Badge variant={statusVariant(believer.status)} className="text-[10px]">
                        {believer.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-2.5">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        Day {believer.daysSince}
                      </span>
                      <span>•</span>
                      <span>Last contact: {believer.lastContact}</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Journey progress</span>
                        <span className="font-semibold text-[#1F5E4A]">{believer.progress}%</span>
                      </div>
                      <Progress value={believer.progress} className="h-1.5" />
                    </div>
                  </div>

                  <ChevronRight size={16} className="text-gray-300 mt-1 shrink-0" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 w-14 h-14 rounded-full bg-[#1F5E4A] text-white shadow-[0_4px_20px_rgba(31,94,74,0.4)] flex items-center justify-center z-30"
      >
        <Plus size={24} />
      </motion.button>
    </div>
  )
}
