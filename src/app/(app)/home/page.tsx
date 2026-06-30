"use client"

import React from "react"
import { motion } from "framer-motion"
import { DailyVerse } from "@/components/formed/DailyVerse"
import { DiscipleshipProgress } from "@/components/formed/DiscipleshipProgress"
import { PrayerCard } from "@/components/formed/PrayerCard"
import { TestimonyCard } from "@/components/formed/TestimonyCard"
import { MentorCard } from "@/components/formed/MentorCard"

const MOCK_PRAYERS = [
  {
    id: "1",
    userName: "Adaeze Okonkwo",
    request: "Please pray for my mother's surgery next Tuesday. She's been battling kidney disease for two years and this is our last hope. Believing God for a miracle.",
    prayingCount: 34,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "2",
    userName: "Emeka Nwosu",
    request: "I have a job interview at a top tech firm tomorrow. Please stand with me in prayer. I've been unemployed for 6 months and trusting God for this breakthrough.",
    prayingCount: 57,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: "3",
    userName: "Grace Mensah",
    request: "Praying for peace in my marriage. My husband and I have been struggling. We are committed to making this work and need God's wisdom.",
    prayingCount: 21,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
]

const MOCK_TESTIMONIES = [
  {
    userName: "Samuel Adeleke",
    testimony: "God completely restored my relationship with my father after 10 years of silence. I followed the advice of my mentor here on FORMED, and last week we had a 3-hour conversation. God is faithful!",
    likes: 142,
    comments: 23,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isVerified: true,
  },
  {
    userName: "Blessing Okafor",
    testimony: "After 47 days on the discipleship journey, I finally understood what it means to truly surrender. The 'Identity in Christ' lesson changed everything for me. I am not who I was.",
    likes: 89,
    comments: 11,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
    isVerified: false,
  },
  {
    userName: "Pastor Tunde Bakare",
    testimony: "FORMED has transformed how I follow up with new believers. We went from losing 80% in the first month to retaining 70% past 6 months. This is kingdom technology.",
    likes: 310,
    comments: 47,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    isVerified: true,
  },
]

const MOCK_MENTORS = [
  {
    name: "Dr. Ngozi Adeyemi",
    specialties: ["New Believer Care", "Women's Ministry", "Prayer"],
    rating: 5,
    disciples: 24,
    isVerified: true,
  },
  {
    name: "Bro. Chukwuma Eze",
    specialties: ["Marriage", "Men's Discipleship", "Bible Study"],
    rating: 4,
    disciples: 18,
    isVerified: true,
  },
]

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-black text-[#222222]">
          Good morning, John 🌿
        </h1>
        <p className="text-gray-500 mt-1">Continue your discipleship journey</p>
      </motion.div>

      {/* Daily Verse */}
      <section>
        <DailyVerse />
      </section>

      {/* Discipleship Progress */}
      <section>
        <div className="section-header">
          <h2 className="section-title">Continue Journey</h2>
          <span className="see-all-link">View all</span>
        </div>
        <DiscipleshipProgress
          currentDay={7}
          totalDays={365}
          lessonTitle="Making Disciples"
          streak={7}
        />
      </section>

      {/* Prayer Wall */}
      <section>
        <div className="section-header">
          <h2 className="section-title">Prayer Wall 🙏</h2>
          <span className="see-all-link">See all</span>
        </div>
        <div className="space-y-3">
          {MOCK_PRAYERS.map((prayer, i) => (
            <PrayerCard key={prayer.id} {...prayer} index={i} />
          ))}
        </div>
      </section>

      {/* Community Testimonies */}
      <section>
        <div className="section-header">
          <h2 className="section-title">Community</h2>
          <span className="see-all-link">See all</span>
        </div>
        <div className="space-y-3">
          {MOCK_TESTIMONIES.map((t, i) => (
            <TestimonyCard key={i} {...t} index={i} />
          ))}
        </div>
      </section>

      {/* Suggested Mentors */}
      <section>
        <div className="section-header">
          <h2 className="section-title">Suggested Mentors</h2>
          <span className="see-all-link">See all</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MOCK_MENTORS.map((m, i) => (
            <MentorCard key={i} {...m} index={i} />
          ))}
        </div>
      </section>
    </div>
  )
}
