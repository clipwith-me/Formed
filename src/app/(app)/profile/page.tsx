"use client"

import React from "react"
import { motion } from "framer-motion"
import { Settings, Edit3, CheckCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BADGES } from "@/lib/constants"

const UNLOCKED_BADGES = ["first_prayer", "first_followup", "first_disciple", "bible_100"]

const MOCK_ACTIVITY = [
  { text: "Prayed for Emmanuel Chukwu's healing", time: "2 hours ago", icon: "🙏" },
  { text: "Completed Day 7 of the Discipleship Journey", time: "Yesterday", icon: "✅" },
  { text: "Shared a testimony in Community", time: "2 days ago", icon: "✝️" },
  { text: "Registered Fatima Abdullahi as a new believer", time: "1 week ago", icon: "🌱" },
]

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Cover + Avatar */}
      <div className="relative">
        {/* Cover */}
        <div
          className="h-36 rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1F5E4A 0%, #2d7a61 60%, #D4A72C 100%)" }}
        >
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle at 30% 70%, rgba(255,255,255,0.3) 0%, transparent 50%)",
            }}
          />
        </div>

        {/* Avatar */}
        <div className="absolute bottom-0 left-5 translate-y-1/2">
          <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
            <AvatarImage src="" />
            <AvatarFallback className="text-2xl font-black">JD</AvatarFallback>
          </Avatar>
        </div>

        {/* Edit + Settings buttons */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white transition-colors">
            <Settings size={15} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Profile info */}
      <div className="pt-10 px-1">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#222222]">John Doe</h1>
              <CheckCircle size={18} className="text-[#1F5E4A]" />
            </div>
            <Badge variant="default" className="mt-1 text-xs">Mentor</Badge>
          </div>
          <Button variant="secondary" size="sm" className="gap-1.5">
            <Edit3 size={14} />
            Edit Profile
          </Button>
        </div>

        <p className="text-gray-500 text-sm mt-2 leading-relaxed">
          Passionate about making disciples. Serving at Redeemed Church Lagos. Follow-up leader & mentor.
        </p>

        {/* Stats */}
        <div className="flex gap-6 mt-4">
          {[
            { label: "Posts", value: "24" },
            { label: "Following", value: "89" },
            { label: "Followers", value: "143" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-black text-xl text-[#1F5E4A]">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Badges */}
      <section>
        <div className="section-header">
          <h2 className="section-title">Badges</h2>
          <span className="text-xs text-gray-400">{UNLOCKED_BADGES.length}/{BADGES.length} earned</span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {BADGES.map((badge, i) => {
            const unlocked = UNLOCKED_BADGES.includes(badge.id)
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all duration-200 ${
                  unlocked
                    ? "bg-[#e8f4ef] border-[#1F5E4A]/20 shadow-sm"
                    : "bg-gray-50 border-gray-100 opacity-40"
                }`}
              >
                <span className="text-2xl">{badge.icon}</span>
                <p className="text-[10px] font-semibold text-center leading-tight text-[#222222]">
                  {badge.label}
                </p>
              </motion.div>
            )
          })}
        </div>
      </section>

      <Separator />

      {/* Recent activity */}
      <section>
        <div className="section-header">
          <h2 className="section-title">Recent Activity</h2>
        </div>

        <div className="space-y-3">
          {MOCK_ACTIVITY.map((activity, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#e8f4ef]/50 transition-colors"
            >
              <span className="text-xl shrink-0">{activity.icon}</span>
              <div>
                <p className="text-sm text-[#222222] font-medium leading-tight">{activity.text}</p>
                <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
