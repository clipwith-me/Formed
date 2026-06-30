"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DevotionalCard } from "@/components/formed/DevotionalCard"

const FILTER_TABS = ["All", "Devotionals", "People", "Bible Plans", "Events"]

const MOCK_DEVOTIONALS = [
  { title: "Walking in the Spirit: A 7-Day Journey", author: "Pastor Chris Oyakhilome", readTime: 8, progress: 45, category: "Holy Spirit" },
  { title: "The Prayer That Changes Everything", author: "E.M. Bounds", readTime: 12, progress: 0, category: "Prayer" },
  { title: "Knowing God's Voice in a Noisy World", author: "Dr. Charles Stanley", readTime: 10, progress: 100, category: "Hearing God" },
  { title: "Grace: Not What You Think", author: "Philip Yancey", readTime: 15, progress: 20, category: "Grace" },
  { title: "Fasting for Breakthrough", author: "Jentezen Franklin", readTime: 9, progress: 0, category: "Fasting" },
  { title: "Purpose Driven Life — The Essentials", author: "Rick Warren", readTime: 11, progress: 60, category: "Purpose" },
]

const TRENDING_TOPICS = [
  "Prayer", "Grace", "Holy Spirit", "Marriage", "Purpose",
  "Faith", "Identity", "Healing", "Fasting", "New Believer",
  "Discipleship", "Worship", "Tithing", "End Times", "Love",
]

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState("All")
  const [query, setQuery] = useState("")

  const filtered = MOCK_DEVOTIONALS.filter((d) =>
    query === "" || d.title.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-black text-[#222222] mb-1">Discover</h1>
        <p className="text-gray-500 text-sm">Explore resources for your faith journey</p>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search devotionals, people, topics..."
          className="pl-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              activeTab === tab
                ? "bg-[#1F5E4A] text-white shadow-sm"
                : "bg-white text-gray-500 border border-gray-100 hover:border-[#1F5E4A] hover:text-[#1F5E4A]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Featured card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl h-48 cursor-pointer"
        style={{ background: "linear-gradient(135deg, #1F5E4A 0%, #0d3d2e 100%)" }}
      >
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 70% 30%, rgba(212,167,44,0.4) 0%, transparent 60%)",
          }}
        />
        <div className="relative p-6 flex flex-col justify-end h-full">
          <span className="bg-[#D4A72C] text-white text-xs font-bold px-2.5 py-1 rounded-full w-fit mb-2">
            Featured
          </span>
          <h2 className="text-white font-black text-xl leading-tight mb-1">
            The Discipleship Blueprint
          </h2>
          <p className="text-white/70 text-sm">30 days · Bishop David Oyedepo</p>
        </div>
      </motion.div>

      {/* Devotionals grid */}
      <section>
        <div className="section-header">
          <h2 className="section-title">Devotionals</h2>
          <span className="see-all-link">See all</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((d, i) => (
            <DevotionalCard key={i} {...d} index={i} />
          ))}
        </div>
      </section>

      {/* Trending Topics */}
      <section>
        <div className="section-header">
          <h2 className="section-title">Trending Topics</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {TRENDING_TOPICS.map((topic, i) => (
            <motion.button
              key={topic}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                i % 3 === 0
                  ? "bg-[#1F5E4A] text-white"
                  : i % 3 === 1
                  ? "bg-[#D4A72C] text-white"
                  : "bg-[#e8f4ef] text-[#1F5E4A] border border-[#1F5E4A]/20"
              }`}
            >
              #{topic}
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  )
}
