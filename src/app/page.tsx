"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Users, Heart, Globe, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const FEATURES = [
  {
    icon: <Heart size={28} className="text-[#1F5E4A]" />,
    title: "Follow Up",
    description: "Never lose a new believer again. Track every soul from first prayer to full discipleship with automated reminders and progress tracking.",
  },
  {
    icon: <Users size={28} className="text-[#1F5E4A]" />,
    title: "Disciple",
    description: "A proven 365-day discipleship journey backed by Scripture. Guide new believers through identity, prayer, community, and mission.",
  },
  {
    icon: <Globe size={28} className="text-[#1F5E4A]" />,
    title: "Multiply",
    description: "Watch your disciples become disciple-makers. Track spiritual generations and measure kingdom impact across your church and region.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-1.5">
          <span className="text-2xl font-black text-[#1F5E4A] tracking-tight">FORMED</span>
          <span className="w-2 h-2 rounded-full bg-[#D4A72C] mb-3 inline-block" />
        </div>
        <div className="flex items-center gap-3">
          <Link href="/home">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/home">
            <Button variant="default" size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 bg-[#e8f4ef] rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#1F5E4A] animate-pulse inline-block" />
            <span className="text-sm font-semibold text-[#1F5E4A]">
              Discipleship. Simplified.
            </span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-black text-[#222222] leading-tight mb-6">
            The Operating System for{" "}
            <span className="text-[#1F5E4A]">Global Discipleship</span>
          </h1>

          <p className="text-lg lg:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            FORMED empowers churches and leaders to follow up with new believers, walk them through a
            proven discipleship journey, and multiply disciples across generations — all in one beautiful app.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/home">
              <Button variant="default" size="lg" className="gap-2 w-full sm:w-auto">
                Get Started Free
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Learn More
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-10 text-sm text-gray-400">
            {["Free to start", "No credit card", "For churches of all sizes"].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-[#1F5E4A]" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        {/* App preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="mt-16 relative"
        >
          <div
            className="h-72 lg:h-96 rounded-3xl overflow-hidden shadow-[0_24px_80px_rgba(31,94,74,0.18)] relative"
            style={{ background: "linear-gradient(135deg, #1F5E4A 0%, #2d7a61 60%, #1a4d3a 100%)" }}
          >
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle at 70% 30%, rgba(212,167,44,0.5) 0%, transparent 60%)",
              }}
            />
            <div className="relative p-8 lg:p-12 text-left">
              <p className="text-[#D4A72C] text-xs font-bold uppercase tracking-widest mb-3">Verse of the Day</p>
              <p className="text-white/90 font-serif italic text-xl lg:text-2xl leading-relaxed mb-3 max-w-lg">
                &ldquo;Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit.&rdquo;
              </p>
              <p className="text-[#D4A72C] text-sm font-semibold">— Matthew 28:19</p>
            </div>
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#1F5E4A]/10 rounded-full blur-xl" />
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-black text-[#222222] mb-3">
            Built for the Great Commission
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Every feature is designed with one question in mind: does this help make disciples?
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_4px_24px_rgba(31,94,74,0.10)] transition-all duration-200 hover:shadow-[0_8px_32px_rgba(31,94,74,0.15)] hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#e8f4ef] flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-bold text-lg text-[#222222] mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Scripture Quote */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative px-8">
            <span className="absolute -top-6 -left-0 text-6xl text-[#1F5E4A]/10 font-serif leading-none">&ldquo;</span>
            <p className="font-serif italic text-2xl lg:text-3xl text-[#222222] leading-relaxed mb-4">
              Go and make disciples of all nations... And surely I am with you always, to the very end of the age.
            </p>
            <span className="absolute -bottom-10 right-0 text-6xl text-[#1F5E4A]/10 font-serif leading-none">&rdquo;</span>
          </div>
          <p className="text-[#D4A72C] font-semibold text-sm tracking-wider uppercase mt-6">
            Matthew 28:19-20
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black text-[#1F5E4A]">FORMED</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A72C] mb-2 inline-block" />
          </div>
          <p className="text-gray-400 text-sm text-center">
            © {new Date().getFullYear()} FORMED. Built for the Kingdom.
          </p>
          <div className="flex gap-4 text-sm text-gray-400">
            <a href="#" className="hover:text-[#1F5E4A] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#1F5E4A] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#1F5E4A] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
