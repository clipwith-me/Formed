"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight, Users, Heart, Globe, CheckCircle, BookOpen,
  MessageCircle, Star, Menu, X, Play, TrendingUp, Zap, Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Testimonials", href: "#testimonials" },
]

const STATS = [
  { value: "50K+", label: "Believers Discipled" },
  { value: "120+", label: "Countries Reached" },
  { value: "2,800+", label: "Churches & Ministries" },
  { value: "1.2M", label: "Prayers Recorded" },
]

const FEATURES = [
  {
    icon: Heart,
    title: "Intelligent Follow-Up",
    description: "Never lose track of a new believer. Smart reminders, progress dashboards, and real-time status updates for every soul in your care.",
    color: "bg-rose-50",
    iconColor: "text-rose-500",
  },
  {
    icon: BookOpen,
    title: "365-Day Journey",
    description: "A Scripture-backed discipleship journey from Day 1 to Year 1. Lessons, reflections, quizzes, and action steps for every stage of growth.",
    color: "bg-[#e8f4ef]",
    iconColor: "text-[#1F5E4A]",
  },
  {
    icon: Users,
    title: "Mentorship Network",
    description: "Connect new believers with seasoned mentors. Private messaging, session logging, voice notes, and growth reports all in one place.",
    color: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  {
    icon: Globe,
    title: "Global Prayer Wall",
    description: "A living, breathing community of prayer. Post requests, pray for others, celebrate answered prayers, and build prayer partnerships.",
    color: "bg-indigo-50",
    iconColor: "text-indigo-500",
  },
  {
    icon: TrendingUp,
    title: "Church Analytics",
    description: "See your church's discipleship health at a glance. Track retention, volunteer activity, follow-up completion, and generational growth.",
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: Zap,
    title: "Community Feed",
    description: "A Spirit-filled social space for testimonies, encouragement, articles, and praise reports — designed for growth, not distraction.",
    color: "bg-purple-50",
    iconColor: "text-purple-500",
  },
]

const STEPS = [
  {
    number: "01",
    title: "Register a New Believer",
    description: "A volunteer captures a new believer's name, contact info, prayer needs, and how they came to Christ — in under 2 minutes.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
  },
  {
    number: "02",
    title: "Assign a Follow-Up Volunteer",
    description: "FORMED matches the believer with a compatible volunteer. The volunteer begins a guided conversation, check-in schedule, and prayer log.",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
  },
  {
    number: "03",
    title: "Walk the Discipleship Journey",
    description: "The believer progresses through a 365-day Scripture journey — daily lessons, reflections, and milestones tracked automatically.",
    image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80",
  },
  {
    number: "04",
    title: "Become a Disciple-Maker",
    description: "Matured disciples are equipped to lead others. The cycle continues — and the Great Commission advances, one life at a time.",
    image: "https://images.unsplash.com/photo-1543269664-56d93c1b41a6?w=800&q=80",
  },
]

const TESTIMONIALS = [
  {
    name: "Pastor Emmanuel Osei",
    role: "Lead Pastor, Grace Harvest Church — Accra, Ghana",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    quote: "FORMED transformed how we handle crusade follow-up. We used to lose 70% of new believers within 3 months. Now we're retaining over 80% and seeing them become leaders themselves.",
    rating: 5,
  },
  {
    name: "Aisha Mensah",
    role: "Campus Fellowship Director — University of Lagos",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80",
    quote: "I gave my life to Christ at a campus event. My follow-up volunteer found me on FORMED two days later. That connection changed everything. I'm now a mentor to 6 students.",
    rating: 5,
  },
  {
    name: "Rev. Sarah Kimani",
    role: "Missions Director, Nairobi Chapel — Kenya",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80",
    quote: "The church dashboard gives me a real-time picture of our discipleship health. I can see who needs attention, who's thriving, and where God is moving — all in one screen.",
    rating: 5,
  },
]

const VERSE_SLIDES = [
  {
    text: "Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit.",
    ref: "Matthew 28:19",
  },
  {
    text: "And the things you have heard me say in the presence of many witnesses entrust to reliable people who will also be qualified to teach others.",
    ref: "2 Timothy 2:2",
  },
  {
    text: "He who began a good work in you will carry it on to completion until the day of Christ Jesus.",
    ref: "Philippians 1:6",
  },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [verseIndex, setVerseIndex] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setVerseIndex((v) => (v + 1) % VERSE_SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white text-[#222222] overflow-x-hidden">

      {/* ── NAV ── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-black text-[#1F5E4A] tracking-tight">FORMED</span>
            <span className="w-2 h-2 rounded-full bg-[#D4A72C] mb-3 inline-block" />
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="text-sm font-medium text-gray-600 hover:text-[#1F5E4A] transition-colors">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-gray-600">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button variant="default" size="sm">Get Started Free</Button>
            </Link>
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100 px-5 py-4 flex flex-col gap-4"
            >
              {NAV_LINKS.map((link) => (
                <a key={link.label} href={link.href} className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                <Link href="/login"><Button variant="ghost" className="w-full justify-start">Sign in</Button></Link>
                <Link href="/register"><Button variant="default" className="w-full">Get Started Free</Button></Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=85"
            alt="Community worship"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1f17]/80 via-[#0a1f17]/70 to-[#0a1f17]/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1F5E4A]/30 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-5 pt-28 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#D4A72C] animate-pulse inline-block" />
              <span className="text-sm font-semibold text-white/90">Discipleship. Simplified.</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight">
              Every Believer Deserves{" "}
              <span className="text-[#D4A72C]">Someone Walking</span>{" "}
              With Them
            </h1>

            <p className="text-lg sm:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed">
              FORMED is the discipleship platform helping churches follow up with every new believer, walk them through Scripture, and multiply disciples across generations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link href="/register">
                <Button size="lg" className="gap-2 bg-[#D4A72C] hover:bg-[#c49a26] text-white border-0 h-14 px-8 text-base font-bold shadow-[0_8px_32px_rgba(212,167,44,0.4)] w-full sm:w-auto">
                  Start Free Today
                  <ArrowRight size={20} />
                </Button>
              </Link>
              <button className="flex items-center justify-center gap-3 text-white font-semibold text-base group">
                <div className="w-12 h-12 rounded-full border-2 border-white/40 flex items-center justify-center group-hover:border-white transition-colors backdrop-blur-sm">
                  <Play size={16} className="fill-white ml-0.5" />
                </div>
                Watch How It Works
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-sm text-white/60">
              {["Free to start", "No credit card needed", "Works for any church size"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-[#D4A72C]" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scrolling verse ticker */}
        <div className="absolute bottom-0 inset-x-0 z-10 bg-[#1F5E4A]/90 backdrop-blur-sm border-t border-white/10 py-4 px-5">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={verseIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center gap-3 text-center"
              >
                <span className="text-[#D4A72C] text-xs font-bold uppercase tracking-widest hidden sm:block">Daily Verse</span>
                <span className="text-white/80 text-sm font-serif italic leading-relaxed">
                  &ldquo;{VERSE_SLIDES[verseIndex].text}&rdquo;
                </span>
                <span className="text-[#D4A72C] text-xs font-semibold whitespace-nowrap hidden sm:block">— {VERSE_SLIDES[verseIndex].ref}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-[#1F5E4A] py-14">
        <div className="max-w-5xl mx-auto px-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-white/20">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center px-6"
              >
                <div className="text-3xl sm:text-4xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/60 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION STATEMENT ── */}
      <section className="py-24 px-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#FAFAF8]" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="w-16 h-1 bg-[#D4A72C] rounded-full mx-auto mb-8" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#222222] leading-tight mb-6">
              The Great Commission is not a suggestion.{" "}
              <span className="text-[#1F5E4A]">It&apos;s our mandate.</span>
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
              Millions come to faith every year. But without intentional follow-up, most drift away within weeks.
              FORMED exists to close that gap — so every new believer is known, loved, and walked all the way to maturity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-5 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-bold text-[#1F5E4A] uppercase tracking-widest">Everything You Need</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#222222] mt-2 mb-4">Built for the Great Commission</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Every feature answers one question: does this help make disciples?</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group rounded-2xl border border-gray-100 bg-white p-7 shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(31,94,74,0.12)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-5`}>
                  <f.icon size={22} className={f.iconColor} />
                </div>
                <h3 className="font-bold text-lg text-[#222222] mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-5 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-bold text-[#1F5E4A] uppercase tracking-widest">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#222222] mt-2 mb-4">From first prayer to disciple-maker</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Four steps that follow a believer all the way to multiplying disciples</p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-4 mb-10">
            {STEPS.map((step, i) => (
              <button
                key={step.number}
                onClick={() => setActiveStep(i)}
                className={`flex-1 text-left rounded-2xl p-5 transition-all duration-300 border-2 ${
                  activeStep === i
                    ? "border-[#1F5E4A] bg-[#1F5E4A] text-white shadow-[0_8px_32px_rgba(31,94,74,0.25)]"
                    : "border-gray-100 bg-white text-gray-600 hover:border-[#1F5E4A]/30"
                }`}
              >
                <div className={`text-xs font-black tracking-widest mb-2 ${activeStep === i ? "text-[#D4A72C]" : "text-[#1F5E4A]"}`}>
                  {step.number}
                </div>
                <div className={`font-bold text-sm sm:text-base ${activeStep === i ? "text-white" : "text-[#222222]"}`}>
                  {step.title}
                </div>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
            >
              <div>
                <div className="text-xs font-black text-[#D4A72C] uppercase tracking-widest mb-3">{STEPS[activeStep].number}</div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#222222] mb-4">{STEPS[activeStep].title}</h3>
                <p className="text-gray-500 leading-relaxed text-lg">{STEPS[activeStep].description}</p>
                <Link href="/register" className="inline-flex mt-6">
                  <Button variant="default" className="gap-2">
                    Get Started <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
              <div className="relative rounded-3xl overflow-hidden shadow-[0_24px_64px_rgba(31,94,74,0.18)] aspect-[4/3]">
                <img
                  src={STEPS[activeStep].image}
                  alt={STEPS[activeStep].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F5E4A]/40 to-transparent" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── PHONE MOCKUP ── */}
      <section className="py-24 px-5 bg-[#1F5E4A] overflow-hidden relative">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(212,167,44,0.6) 0%, transparent 60%)" }}
        />
        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-sm font-bold text-[#D4A72C] uppercase tracking-widest">Mobile-First</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 mb-5 leading-tight">
                Discipleship in your pocket, anywhere in the world
              </h2>
              <p className="text-white/70 leading-relaxed mb-8 text-lg">
                From rural Ghana to downtown Lagos — FORMED works on any smartphone. No internet? Daily verses and lessons are available offline, so no believer is ever left without the Word.
              </p>
              <div className="flex flex-col gap-4">
                {[
                  { icon: Shield, text: "Secure, private, end-to-end encrypted messages" },
                  { icon: Zap, text: "Works offline — full lesson access without data" },
                  { icon: Globe, text: "Available in 15+ languages with more coming" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <item.icon size={15} className="text-[#D4A72C]" />
                    </div>
                    <span className="text-white/80 text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="relative flex justify-center"
            >
              <div className="relative w-72 sm:w-80">
                {/* Phone frame */}
                <div className="rounded-[3rem] overflow-hidden border-8 border-white/20 shadow-[0_40px_80px_rgba(0,0,0,0.4)]">
                  <img
                    src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&q=80"
                    alt="FORMED app in use"
                    className="w-full aspect-[9/19] object-cover"
                  />
                  <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-transparent via-transparent to-[#1F5E4A]/60" />
                  {/* Floating UI card */}
                  <div className="absolute bottom-8 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl">
                    <div className="text-[10px] font-bold text-[#1F5E4A] uppercase tracking-widest mb-1">Day 7 · Matthew 28:19</div>
                    <div className="text-xs font-semibold text-[#222222] mb-2">Sharing Your Faith</div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                      <div className="bg-[#1F5E4A] h-1.5 rounded-full" style={{ width: "28%" }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">28% Complete</span>
                      <span className="text-[10px] font-bold text-[#D4A72C]">🔥 7 day streak</span>
                    </div>
                  </div>
                </div>
                {/* Floating notification */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2.5 min-w-[160px]"
                >
                  <div className="w-8 h-8 rounded-full bg-[#e8f4ef] flex items-center justify-center shrink-0">
                    <Heart size={14} className="text-[#1F5E4A]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[#222222]">New Prayer Partner</div>
                    <div className="text-[9px] text-gray-400">Amara is praying for you</div>
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-4 -left-6 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[#222222]">Milestone Unlocked!</div>
                    <div className="text-[9px] text-gray-400">First Week Complete 🎉</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-24 px-5 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-bold text-[#1F5E4A] uppercase tracking-widest">Stories</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#222222] mt-2 mb-4">Lives being changed</h2>
            <p className="text-gray-500 max-w-xl mx-auto">From new believers to church leaders — hear what FORMED means to them</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white rounded-2xl p-7 shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col"
              >
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star key={si} size={14} className="text-[#D4A72C] fill-[#D4A72C]" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed italic mb-6 flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover" />
                  <div>
                    <div className="font-bold text-sm text-[#222222]">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="relative py-28 px-5 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1543269664-56d93c1b41a6?w=1600&q=85"
            alt="Community"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#0a1f17]/85" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="w-16 h-1 bg-[#D4A72C] rounded-full mx-auto mb-8" />
            <blockquote className="font-serif italic text-white text-2xl sm:text-3xl lg:text-4xl leading-relaxed mb-4">
              &ldquo;And surely I am with you always, to the very end of the age.&rdquo;
            </blockquote>
            <cite className="text-[#D4A72C] font-semibold uppercase tracking-widest text-sm not-italic">Matthew 28:20</cite>
            <div className="mt-12">
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-4">
                Start making disciples today.
              </h3>
              <p className="text-white/65 mb-8 text-lg">Free for individuals. Built for the global church.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-[#D4A72C] hover:bg-[#c49a26] text-white h-14 px-10 text-base font-bold gap-2 border-0 w-full sm:w-auto shadow-[0_8px_32px_rgba(212,167,44,0.35)]">
                    Create Free Account
                    <ArrowRight size={20} />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="secondary" className="h-14 px-10 text-base font-bold border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>
              <p className="text-white/40 text-sm mt-5 flex items-center justify-center gap-2">
                <MessageCircle size={12} />
                Join 50,000+ believers already on FORMED
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0a1f17] py-14 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-1.5 mb-4">
                <span className="text-2xl font-black text-white tracking-tight">FORMED</span>
                <span className="w-2 h-2 rounded-full bg-[#D4A72C] mb-3 inline-block" />
              </div>
              <p className="text-white/50 text-sm leading-relaxed max-w-sm">
                The operating system for global discipleship. Empowering every believer to be followed up, discipled, and equipped to make disciples.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Platform</h4>
              <ul className="flex flex-col gap-3">
                {["Home Feed", "Discipleship Journey", "Follow-Up System", "Prayer Wall", "Mentorship"].map((item) => (
                  <li key={item}><a href="#" className="text-white/50 text-sm hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Company</h4>
              <ul className="flex flex-col gap-3">
                {["About", "Blog", "Careers", "Privacy Policy", "Terms of Service"].map((item) => (
                  <li key={item}><a href="#" className="text-white/50 text-sm hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-sm">© {new Date().getFullYear()} FORMED. Built for the Kingdom.</p>
            <p className="text-white/20 text-xs italic font-serif">
              &ldquo;Go therefore and make disciples of all nations.&rdquo; — Matthew 28:19
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
