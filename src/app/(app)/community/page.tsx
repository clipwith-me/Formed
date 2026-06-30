"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X } from "lucide-react"
import { TestimonyCard } from "@/components/formed/TestimonyCard"
import { PrayerCard } from "@/components/formed/PrayerCard"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const FILTER_TABS = ["All", "Testimonies", "Prayer", "Questions", "Articles"]

const MOCK_FEED = [
  {
    type: "testimony",
    userName: "Chioma Obi",
    testimony: "After years of struggling with anxiety, I finally found peace through the breathing prayer technique I learned in the 'Prayer Without Ceasing' devotional. God is so faithful!",
    likes: 98,
    comments: 15,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    isVerified: false,
  },
  {
    type: "prayer",
    id: "c1",
    userName: "Pastor Felix Amu",
    request: "Please join me in praying for our youth camp this weekend. We are expecting 500 young people and trusting God for genuine salvation and encounter.",
    prayingCount: 89,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
  },
  {
    type: "testimony",
    userName: "Yetunde Balogun",
    testimony: "My husband gave his life to Christ last Sunday after 12 years of marriage! I never stopped believing. If you are trusting God for your spouse's salvation — don't give up. He is faithful.",
    likes: 445,
    comments: 62,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    isVerified: true,
  },
  {
    type: "prayer",
    id: "c2",
    userName: "David Nkomo",
    request: "Believed God for a scholarship to study medicine in the UK. The interview is this Friday. Please agree with me for favour and wisdom before the panel.",
    prayingCount: 43,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
  },
  {
    type: "testimony",
    userName: "Apostle Kingsley Osei",
    testimony: "FORMED's follow-up system helped our church retain 85 new converts this quarter. Kingdom technology for kingdom results. Grateful to God.",
    likes: 231,
    comments: 34,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    isVerified: true,
  },
]

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("All")
  const [showModal, setShowModal] = useState(false)
  const [postText, setPostText] = useState("")

  const filtered = MOCK_FEED.filter((item) => {
    if (activeTab === "All") return true
    if (activeTab === "Testimonies") return item.type === "testimony"
    if (activeTab === "Prayer") return item.type === "prayer"
    return true
  })

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-black text-[#222222] mb-1">Community</h1>
        <p className="text-gray-500 text-sm">Share, pray, and grow together</p>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
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

      {/* Feed */}
      <div className="space-y-3">
        {filtered.map((item, i) =>
          item.type === "testimony" ? (
            <TestimonyCard
              key={i}
              userName={item.userName}
              testimony={item.testimony!}
              likes={item.likes!}
              comments={item.comments!}
              createdAt={item.createdAt}
              isVerified={item.isVerified}
              index={i}
            />
          ) : (
            <PrayerCard
              key={i}
              id={item.id!}
              userName={item.userName}
              request={item.request!}
              prayingCount={item.prayingCount!}
              createdAt={item.createdAt}
              index={i}
            />
          )
        )}
      </div>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 w-14 h-14 rounded-full bg-[#1F5E4A] text-white shadow-[0_4px_20px_rgba(31,94,74,0.4)] flex items-center justify-center z-30"
      >
        <Plus size={24} />
      </motion.button>

      {/* Post modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-[#222222]">Share with Community</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <Textarea
                placeholder="Share a testimony, prayer request, or question..."
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                className="mb-4 min-h-[120px]"
              />
              <div className="flex gap-3">
                <Button variant="secondary" size="sm" onClick={() => setShowModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="default" size="sm" className="flex-1" onClick={() => setShowModal(false)}>
                  Post
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
