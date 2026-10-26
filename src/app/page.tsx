"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import {
  ArrowRight, ArrowUpRight, BookOpen, Users, HandHeart, UserPlus,
  MessageCircle, GraduationCap, Play, X, Menu, Check,
} from "lucide-react"

const C = {
  cream: "#F5F1E8",
  paper: "#FBF9F4",
  ink: "#1C2B25",
  green: "#1F5E4A",
  forest: "#123A2E",
  gold: "#C9A13B",
  muted: "#5E6B65",
  line: "#E4DDCC",
}

const serif = "font-[family-name:var(--font-cormorant)]"
const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.28em]"

const NAV = [
  { label: "The Film", href: "#film" },
  { label: "The Path", href: "#path" },
  { label: "Library", href: "#library" },
  { label: "Community", href: "#community" },
]

const PATH = [
  { level: "Beginner", topics: ["Salvation", "Who is God", "The Holy Trinity", "Prayer", "Baptism", "Identity in Christ"] },
  { level: "Intermediate", topics: ["Faith", "Worship", "Fasting", "Spiritual Warfare", "Grace", "Evangelism"] },
  { level: "Advanced", topics: ["The Holy Spirit", "Purpose & Calling", "Stewardship", "Marriage & Family"] },
]

const GROWTH = [
  { n: "01", title: "Create your account", body: "Free, in under a minute. New believer or church leader, FORMED meets you where you are." },
  { n: "02", title: "Start your journey", body: "Begin with Salvation and walk lesson by lesson, each one grounded in Scripture." },
  { n: "03", title: "Connect with community", body: "Share testimonies, pray with others, and message believers walking the same road." },
  { n: "04", title: "Grow into a disciple-maker", body: "Mature through Advanced lessons, then walk with someone else from their first prayer." },
]

const LIBRARY_PATHS = [
  { code: "A", title: "New Believer Foundations", note: "First steps, in order" },
  { code: "B", title: "Spiritual Growth", note: "Prayer, the Word, the Spirit" },
  { code: "C", title: "Evangelism & the Great Commission", note: "Sharing your faith" },
  { code: "D", title: "Becoming a Disciple-Maker", note: "Walking with others" },
]

const FEATURES = [
  { icon: BookOpen, title: "Discipleship Journey", body: "Twenty chapters across three levels, each with Scripture readings and a clear next step." },
  { icon: GraduationCap, title: "Curated Teaching Library", body: "Short lessons from established ministries, each one reviewed before it reaches you." },
  { icon: Users, title: "Community Feed", body: "Testimonies, photos and encouragement from believers — not an algorithm." },
  { icon: HandHeart, title: "Prayer Wall", body: "Submit requests, stand with others in prayer, and record what God has answered." },
  { icon: UserPlus, title: "New Believer Follow-Up", body: "Register converts after an outreach, assign a volunteer, and never lose track of anyone." },
  { icon: MessageCircle, title: "Messages", body: "Mentors and friends reach out one to one, so no one walks alone." },
]

function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 40" className={className} aria-hidden="true">
      <path d="M16 3c3 3.5 3 8 0 11.5C13 11 13 6.5 16 3Z" fill={C.gold} />
      <path d="M16 17v20M16 26 6 16v6l10 10M16 26l10-10v6L16 32" stroke={C.green} strokeWidth="3.2" fill="none" strokeLinejoin="round" />
    </svg>
  )
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <Mark className="h-7 w-auto" />
      <span className="text-[19px] font-bold tracking-[0.08em]" style={{ color: light ? "#fff" : C.green }}>FORMED</span>
    </span>
  )
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function FilmModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    videoRef.current?.play().catch(() => {})
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="FORMED welcome film"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button
            onClick={onClose}
            aria-label="Close film"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            style={{ top: "max(1rem, env(safe-area-inset-top))" }}
          >
            <X size={20} />
          </button>
          <motion.div
            initial={{ scale: 0.96, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-5xl overflow-hidden rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={videoRef}
              src="/film/formed-welcome.mp4"
              poster="/film/poster.jpg"
              controls
              playsInline
              preload="metadata"
              className="aspect-video w-full bg-black"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [filmOpen, setFilmOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const openFilm = useCallback(() => setFilmOpen(true), [])
  const closeFilm = useCallback(() => setFilmOpen(false), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: C.paper, color: C.ink }}>
      <FilmModal open={filmOpen} onClose={closeFilm} />

      {/* NAV */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b backdrop-blur-md" : ""}`}
        style={{ background: scrolled ? "rgba(251,249,244,0.92)" : "transparent", borderColor: C.line }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" aria-label="FORMED home"><Logo /></Link>
          <nav className="hidden items-center gap-9 md:flex">
            {NAV.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium transition-colors hover:text-[#1F5E4A]" style={{ color: C.muted }}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login" className="rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-black/5" style={{ color: C.ink }}>
              Sign in
            </Link>
            <Link href="/register" className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110" style={{ background: C.green }}>
              Begin free
            </Link>
          </div>
          <button
            className="rounded-lg p-2 md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t md:hidden"
              style={{ background: C.paper, borderColor: C.line }}
            >
              <div className="flex flex-col gap-1 px-5 py-4">
                {NAV.map((l) => (
                  <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="py-2.5 text-base font-medium">
                    {l.label}
                  </a>
                ))}
                <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-4" style={{ borderColor: C.line }}>
                  <Link href="/login" className="rounded-full border py-3 text-center text-sm font-semibold" style={{ borderColor: C.line }}>Sign in</Link>
                  <Link href="/register" className="rounded-full py-3 text-center text-sm font-semibold text-white" style={{ background: C.green }}>Begin free</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO */}
      <section id="film" className="relative px-5 pb-20 pt-32 sm:px-8 lg:pb-28 lg:pt-40" style={{ background: C.cream }}>
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <Reveal>
            <p className={eyebrow} style={{ color: C.gold }}>Scripture-grounded · Built for discipleship</p>
            <h1 className={`${serif} mt-6 text-[3.1rem] font-medium leading-[0.98] sm:text-7xl lg:text-[5.4rem]`} style={{ color: C.forest, textWrap: "balance" }}>
              Faith is a journey <em className="italic" style={{ color: C.green }}>of becoming.</em>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed" style={{ color: C.muted }}>
              Knowing where to begin is the hard part. FORMED walks every believer along a structured,
              Scripture-grounded path — from first prayer to making disciples — with teaching you can trust
              and a community that walks with you.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-full px-8 text-base font-semibold text-white shadow-[0_10px_30px_-10px_rgba(31,94,74,0.7)] transition hover:brightness-110"
                style={{ background: C.green }}
              >
                Begin your journey
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button
                onClick={openFilm}
                className="group inline-flex h-14 items-center justify-center gap-3 rounded-full px-6 text-base font-semibold transition hover:bg-black/5"
                style={{ color: C.forest }}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border" style={{ borderColor: C.gold }}>
                  <Play size={13} fill={C.gold} stroke={C.gold} className="ml-0.5" />
                </span>
                Watch the film · 60s
              </button>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm" style={{ color: C.muted }}>
              {["Free for every believer", "No card required", "Works on any phone"].map((t) => (
                <li key={t} className="flex items-center gap-2"><Check size={14} style={{ color: C.gold }} />{t}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.15}>
            <button
              onClick={openFilm}
              aria-label="Play the FORMED welcome film"
              className="group relative block w-full overflow-hidden rounded-2xl text-left shadow-[0_40px_80px_-30px_rgba(18,58,46,0.55)] ring-1 ring-black/5"
            >
              <video
                src="/film/hero-loop.mp4"
                poster="/film/poster.jpg"
                autoPlay={!reduceMotion}
                muted
                loop
                playsInline
                preload="metadata"
                className="aspect-video w-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.03]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-[#0d2a21]/70 via-transparent to-transparent" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 shadow-xl transition-transform duration-300 group-hover:scale-110">
                  <Play size={26} fill={C.green} stroke={C.green} className="ml-1" />
                </span>
              </span>
              <span className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white">
                <span>
                  <span className={`${eyebrow} block text-white/70`}>Welcome film</span>
                  <span className={`${serif} mt-1 block text-2xl italic`}>Welcome to FORMED.</span>
                </span>
                <span className="rounded-full bg-black/35 px-3 py-1 text-xs font-semibold backdrop-blur">1:00</span>
              </span>
            </button>
          </Reveal>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal className="max-w-3xl">
            <p className={eyebrow} style={{ color: C.gold }}>Why FORMED</p>
            <h2 className={`${serif} mt-5 text-4xl font-medium leading-[1.05] sm:text-6xl`} style={{ color: C.forest, textWrap: "balance" }}>
              Everyone has access to teaching. <em style={{ color: C.green }}>Few have a foundation.</em>
            </h2>
          </Reveal>
          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl sm:grid-cols-3" style={{ background: C.line }}>
            {[
              { k: "Unfiltered", t: "The feed rewards engagement, not truth", b: "New believers absorb fragments without context and build on whatever was trending last week." },
              { k: "Unstructured", t: "No path from first prayer to maturity", b: "A Bible app here, a podcast there. Nothing walks a believer through the foundations in order." },
              { k: "Unanchored", t: "Error spreads where roots are shallow", b: "Without sound doctrine, believers have nothing to measure new voices against." },
            ].map((x, i) => (
              <Reveal key={x.k} delay={i * 0.08} className="h-full">
                <div className="h-full p-8 sm:p-9" style={{ background: C.paper }}>
                  <span className={eyebrow} style={{ color: C.muted }}>0{i + 1} · {x.k}</span>
                  <h3 className={`${serif} mt-4 text-2xl font-semibold leading-snug`} style={{ color: C.forest }}>{x.t}</h3>
                  <p className="mt-3 leading-relaxed" style={{ color: C.muted }}>{x.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* STRUCTURED PATH */}
      <section id="path" className="px-5 py-24 sm:px-8 lg:py-32" style={{ background: C.cream }}>
        <div className="mx-auto max-w-6xl">
          <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className={eyebrow} style={{ color: C.gold }}>01 · Structured path</p>
              <h2 className="mt-4 text-3xl font-light uppercase tracking-[0.14em] sm:text-4xl" style={{ color: C.forest }}>
                Walk a structured path.
              </h2>
            </div>
            <p className="max-w-sm leading-relaxed" style={{ color: C.muted }}>
              Twenty chapters across three levels. Each unlocks the next, so foundations come before everything else.
            </p>
          </Reveal>

          <div className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
            <div className="absolute left-0 right-0 top-[5px] hidden h-px md:block" style={{ background: C.gold, opacity: 0.6 }} />
            {PATH.map((p, i) => (
              <Reveal key={p.level} delay={i * 0.1}>
                <span className="relative block h-[11px] w-[11px] rounded-full" style={{ background: C.gold }} />
                <p className={`${eyebrow} mt-6`} style={{ color: C.gold }}>{p.level}</p>
                <ul className={`${serif} mt-5 space-y-1.5 text-[1.35rem] italic`} style={{ color: C.forest }}>
                  {p.topics.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* LIBRARY */}
      <section id="library" className="px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className={eyebrow} style={{ color: C.gold }}>02 · Teaching you can trust</p>
            <h2 className={`${serif} mt-5 text-4xl font-medium leading-[1.05] sm:text-5xl`} style={{ color: C.forest, textWrap: "balance" }}>
              A curated library, <em style={{ color: C.green }}>reviewed before it reaches you.</em>
            </h2>
            <p className="mt-6 text-lg leading-relaxed" style={{ color: C.muted }}>
              Short video lessons from established ministries, organised into four learning paths. Every
              teaching passes a doctrinal review and a permissions check, and each lesson comes with
              Scripture references, reflection questions and a practical next step.
            </p>
            <ul className="mt-8 space-y-3">
              {["Most lessons under 20 minutes", "Reflection questions and private notes", "Share what you learned with your mentor"].map((t) => (
                <li key={t} className="flex items-center gap-3"><Check size={16} style={{ color: C.gold }} /><span>{t}</span></li>
              ))}
            </ul>
          </Reveal>
          <div className="grid gap-3">
            {LIBRARY_PATHS.map((p, i) => (
              <Reveal key={p.code} delay={i * 0.07}>
                <div className="group flex items-center gap-5 rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(18,58,46,0.5)]" style={{ borderColor: C.line, background: "#fff" }}>
                  <span className={`${serif} flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-3xl italic text-white`} style={{ background: i % 2 ? C.forest : C.green }}>
                    {p.code}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold" style={{ color: C.forest }}>{p.title}</span>
                    <span className="block text-sm" style={{ color: C.muted }}>{p.note}</span>
                  </span>
                  <ArrowUpRight size={18} className="shrink-0 opacity-40 transition group-hover:opacity-100" style={{ color: C.green }} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* VISIBLE GROWTH */}
      <section className="relative overflow-hidden px-5 py-24 text-white sm:px-8 lg:py-32" style={{ background: `linear-gradient(160deg, ${C.green}, ${C.forest} 70%)` }}>
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className={eyebrow} style={{ color: C.gold }}>03 · Visible growth</p>
            <h2 className="mt-4 text-3xl font-light uppercase tracking-[0.14em] sm:text-4xl">From first prayer to disciple-maker.</h2>
          </Reveal>
          <div className="relative mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <div className="absolute left-0 right-0 top-[6px] hidden h-px lg:block" style={{ background: C.gold, opacity: 0.55 }} />
            {GROWTH.map((g, i) => (
              <Reveal key={g.n} delay={i * 0.1}>
                <span className="relative block h-[13px] w-[13px] rounded-full" style={{ background: C.gold }} />
                <p className="mt-6 text-xs font-semibold tracking-[0.2em]" style={{ color: C.gold }}>{g.n}</p>
                <h3 className={`${serif} mt-2 text-2xl italic`}>{g.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">{g.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="community" className="px-5 py-24 sm:px-8 lg:py-32" style={{ background: C.cream }}>
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className={eyebrow} style={{ color: C.gold }}>Everything in one place</p>
            <h2 className={`${serif} mt-5 text-4xl font-medium leading-tight sm:text-5xl`} style={{ color: C.forest, textWrap: "balance" }}>
              Built around one question: <em style={{ color: C.green }}>does this help make disciples?</em>
            </h2>
          </Reveal>
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 0.08}>
                <div className="h-full rounded-2xl p-7 transition hover:shadow-[0_24px_50px_-30px_rgba(18,58,46,0.45)]" style={{ background: C.paper }}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "#E7EFEA" }}>
                    <f.icon size={20} style={{ color: C.green }} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold" style={{ color: C.forest }}>{f.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed" style={{ color: C.muted }}>{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SCRIPTURE + CTA */}
      <section className="px-5 py-28 sm:px-8 lg:py-36">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Mark className="mx-auto h-12 w-auto" />
          <blockquote className={`${serif} mt-10 text-3xl italic leading-snug sm:text-[2.6rem]`} style={{ color: C.forest, textWrap: "balance" }}>
            &ldquo;He who began a good work in you will carry it on to completion.&rdquo;
          </blockquote>
          <cite className={`${eyebrow} mt-6 block not-italic`} style={{ color: C.gold }}>Philippians 1:6</cite>
          <div className="mx-auto mt-14 h-px w-16" style={{ background: C.gold }} />
          <h2 className="mt-14 text-2xl font-semibold sm:text-3xl" style={{ color: C.forest }}>Your journey starts with one step.</h2>
          <p className="mt-3" style={{ color: C.muted }}>Free for every believer. Built for the global church.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register" className="inline-flex h-14 items-center justify-center gap-2 rounded-full px-9 font-semibold text-white transition hover:brightness-110" style={{ background: C.green }}>
              Create free account <ArrowRight size={18} />
            </Link>
            <button onClick={openFilm} className="inline-flex h-14 items-center justify-center gap-2 rounded-full border px-8 font-semibold transition hover:bg-black/5" style={{ borderColor: C.line, color: C.forest }}>
              <Play size={14} fill={C.gold} stroke={C.gold} /> Watch the film
            </button>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="px-5 pb-10 pt-16 text-white sm:px-8" style={{ background: C.forest }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Logo light />
              <p className={`${serif} mt-5 max-w-sm text-xl italic text-white/70`}>Scripture-grounded. Built for discipleship.</p>
            </div>
            <div>
              <h4 className={`${eyebrow} text-white/50`}>Platform</h4>
              <ul className="mt-5 space-y-3 text-sm text-white/75">
                {[["Discipleship Journey", "/journey"], ["Teaching Library", "/library"], ["Community", "/community"], ["Prayer Wall", "/prayer"], ["Follow-Up", "/followup"]].map(([l, h]) => (
                  <li key={h}><Link href={h} className="transition hover:text-white">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className={`${eyebrow} text-white/50`}>Account</h4>
              <ul className="mt-5 space-y-3 text-sm text-white/75">
                {[["Create account", "/register"], ["Sign in", "/login"], ["Reset password", "/forgot-password"]].map(([l, h]) => (
                  <li key={h}><Link href={h} className="transition hover:text-white">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-14 flex flex-col justify-between gap-3 border-t border-white/10 pt-8 text-sm text-white/45 sm:flex-row">
            <p>© {new Date().getFullYear()} FORMED. Built for the Kingdom.</p>
            <p className={`${serif} italic`}>&ldquo;Go and make disciples of all nations.&rdquo; — Matthew 28:19</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
