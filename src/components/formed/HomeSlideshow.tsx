"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight, HandHeart, Play, Share2 } from "lucide-react"
import { getAllLessons } from "@/lib/curriculum"
import { getApprovedResources, type TeachingResource } from "@/lib/video-library"
import { createClient } from "@/lib/supabase/client"
import { safeLink, safeMedia, youtubeEmbed, youtubeThumb, type HomeSlide } from "@/lib/home-slides"

const SLIDE_MS = 7000
const serif = "font-[family-name:var(--font-cormorant)]"
const label = "text-[11px] font-bold uppercase tracking-[0.2em]"
const action = "inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold transition hover:brightness-110"

interface Testimony {
  userName: string
  testimony: string
}

interface Props {
  lessonTitle: string
  testimony?: Testimony
}

function allVerses() {
  const seen = new Set<string>()
  return getAllLessons().flatMap(l => l.lesson.slides).filter(s => {
    if (seen.has(s.reference)) return false
    seen.add(s.reference)
    return true
  })
}

function dayOfYear() {
  const now = new Date()
  return Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
}

async function shareVerse(text: string, reference: string) {
  const body = `"${text}" (${reference})`
  try {
    if (navigator.share) await navigator.share({ text: body, url: window.location.origin })
    else await navigator.clipboard.writeText(body)
  } catch {}
}

function SlideButton({ slide, light }: { slide: HomeSlide; light?: boolean }) {
  const href = safeLink(slide.link_url)
  if (!href) return null
  return (
    <Link
      href={href}
      {...(href.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${action} mt-4 w-fit ${light ? "bg-white text-[#123A2E]" : "bg-[#1F5E4A] text-white"}`}
    >
      {slide.link_label || "Learn more"} <ArrowRight size={15} />
    </Link>
  )
}

function renderCustom(s: HomeSlide, isPlaying: boolean, play: () => void, stop: () => void): React.ReactNode {
  const media = safeMedia(s.media_url)
  if (s.type === "DESIGN") {
    if (!media) return null
    const image = (
      <span className="relative block h-full w-full overflow-hidden bg-[#123A2E]">
        <img src={media} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-xl" />
        <img src={media} alt={s.title ?? "FORMED announcement"} className="relative h-full w-full object-contain" />
      </span>
    )
    const href = safeLink(s.link_url)
    if (!href) return image
    return <Link href={href} {...(href.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="block h-full w-full">{image}</Link>
  }
  if (s.type === "VIDEO") {
    if (!media) return null
    const embed = youtubeEmbed(media)
    if (isPlaying) {
      return embed
        ? <iframe src={embed} title={s.title ?? "Video update"} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="h-full w-full border-0 bg-black" />
        : <video src={media} controls autoPlay playsInline onEnded={stop} className="h-full w-full bg-black object-contain" />
    }
    const thumb = youtubeThumb(media)
    return (
      <button onClick={play} aria-label={`Play ${s.title ?? "video update"}`} className="relative block h-full w-full bg-[#123A2E] text-left text-white">
        {thumb && <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        {!thumb && <video src={`${media}#t=0.5`} muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />}
        <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <span className="absolute left-1/2 top-[38%] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90">
          <Play size={22} fill="#1F5E4A" stroke="#1F5E4A" className="ml-1" />
        </span>
        <span className="absolute bottom-10 left-6 right-6 sm:left-10">
          <span className={`${label} block`} style={{ color: "#E2BE5C" }}>Video update</span>
          {s.title && <span className="mt-1 line-clamp-2 block text-xl font-bold">{s.title}</span>}
        </span>
      </button>
    )
  }
  if (s.type === "SCRIPTURE") {
    return (
      <div className="flex h-full flex-col justify-center p-6 pb-12 text-white sm:p-10 sm:pb-12" style={{ background: "linear-gradient(145deg,#1F5E4A,#123A2E 75%)" }}>
        <blockquote className={`${serif} line-clamp-5 text-2xl leading-snug sm:text-[2rem]`}>&ldquo;{s.body}&rdquo;</blockquote>
        <p className="mt-2 text-sm font-semibold" style={{ color: "#E2BE5C" }}>{s.title}</p>
        <SlideButton slide={s} light />
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col justify-center p-6 pb-12 sm:p-10 sm:pb-12" style={{ background: "#F5F1E8", color: "#123A2E" }}>
      <p className={label} style={{ color: "#8C6B14" }}>From FORMED</p>
      <h2 className={`${serif} mt-3 line-clamp-2 text-3xl font-medium leading-tight sm:text-4xl`}>{s.title}</h2>
      {s.body && <p className="mt-2 line-clamp-3 max-w-md text-sm" style={{ color: "#5E6B65" }}>{s.body}</p>}
      <SlideButton slide={s} />
    </div>
  )
}

export function HomeSlideshow({ lessonTitle, testimony }: Props) {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)
  const [playing, setPlaying] = useState<string | null>(null)
  const filmPlaying = playing !== null
  const setFilmPlaying = (on: boolean) => setPlaying(on ? "film" : null)
  const [day, setDay] = useState(0)
  const [teaching, setTeaching] = useState<TeachingResource | null>(null)
  const [custom, setCustom] = useState<HomeSlide[]>([])

  useEffect(() => {
    setDay(dayOfYear())
    getApprovedResources({ limit: 1 }).then(r => setTeaching(r[0] ?? null)).catch(() => {})
    // Row security returns only live slides to members, but admins can read all, so re-check here.
    createClient().from("home_slides").select("*").order("sort_order").then(({ data }) => {
      const now = Date.now()
      setCustom(((data ?? []) as HomeSlide[]).filter(s =>
        s.is_active &&
        (!s.starts_at || new Date(s.starts_at).getTime() <= now) &&
        (!s.ends_at || new Date(s.ends_at).getTime() > now)
      ))
    })
  }, [])

  const verses = useMemo(allVerses, [])
  const verse = verses[day % verses.length]
  const verse2 = verses[(day + 7) % verses.length]

  const slides = useMemo(() => {
    const list: { key: string; node: React.ReactNode }[] = [
      ...custom.flatMap(s => {
        const node = renderCustom(s, playing === s.id, () => setPlaying(s.id), () => setPlaying(null))
        return node ? [{ key: s.id, node }] : []
      }),
      {
        key: "verse",
        node: (
          <div className="flex h-full flex-col justify-center p-6 pb-12 text-white sm:p-10 sm:pb-12" style={{ background: "linear-gradient(145deg,#1F5E4A,#123A2E 75%)" }}>
            <p className={label} style={{ color: "#E2BE5C" }}>Verse of the day</p>
            <blockquote className={`${serif} mt-3 line-clamp-5 text-2xl leading-snug sm:text-[2rem]`}>&ldquo;{verse.text}&rdquo;</blockquote>
            <p className="mt-2 text-sm font-semibold" style={{ color: "#E2BE5C" }}>{verse.reference}</p>
            <div className="mt-4 flex items-center gap-3">
              <Link href="/journey" className={`${action} bg-white text-[#123A2E]`}><BookOpen size={15} /> Study</Link>
              <button onClick={() => shareVerse(verse.text, verse.reference)} className="inline-flex h-10 items-center gap-2 px-2 text-sm font-semibold text-white/85 hover:text-white">
                <Share2 size={15} /> Share
              </button>
            </div>
          </div>
        ),
      },
      {
        key: "film",
        node: playing === "film" ? (
          <video
            src="/film/formed-welcome.mp4"
            poster="/film/poster.jpg"
            controls
            autoPlay
            playsInline
            onEnded={() => setFilmPlaying(false)}
            className="h-full w-full bg-black object-contain"
          />
        ) : (
          <button onClick={() => setFilmPlaying(true)} className="relative block h-full w-full text-left text-white" aria-label="Play the FORMED welcome film">
            <img src="/film/auth.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-[#0d2a21]/90 via-[#0d2a21]/25 to-transparent" />
            <span className="absolute left-1/2 top-[38%] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90">
              <Play size={22} fill="#1F5E4A" stroke="#1F5E4A" className="ml-1" />
            </span>
            <span className="absolute bottom-10 left-6 right-6 sm:left-10">
              <span className={`${label} block`} style={{ color: "#E2BE5C" }}>Watch · 1 minute</span>
              <span className={`${serif} mt-1 block text-3xl`}>Welcome to FORMED</span>
            </span>
          </button>
        ),
      },
    ]

    if (teaching) {
      list.push({
        key: "teaching",
        node: (
          <Link href={`/library/${teaching.id}`} className="relative block h-full w-full text-white">
            {teaching.thumbnail_url && <img src={teaching.thumbnail_url} alt="" className="absolute inset-0 h-full w-full object-cover" />}
            <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
            <span className="absolute bottom-10 left-6 right-6 sm:left-10">
              <span className={`${label} block`} style={{ color: "#E2BE5C" }}>New in the library</span>
              <span className="mt-1 line-clamp-2 block text-xl font-bold sm:text-2xl">{teaching.title}</span>
              <span className="mt-1 block text-sm text-white/75">{teaching.speaker?.name ?? teaching.ministry?.name}</span>
            </span>
          </Link>
        ),
      })
    }

    list.push({
      key: "journey",
      node: (
        <div className="flex h-full flex-col justify-center p-6 pb-12 sm:p-10 sm:pb-12" style={{ background: "#F5F1E8", color: "#123A2E" }}>
          <p className={label} style={{ color: "#8C6B14" }}>Your next step</p>
          <h2 className={`${serif} mt-3 text-3xl font-medium leading-tight sm:text-4xl`}>{lessonTitle}</h2>
          <p className="mt-2 max-w-md text-sm" style={{ color: "#5E6B65" }}>A few minutes in the Word today keeps your journey moving.</p>
          <Link href="/journey" className={`${action} mt-5 w-fit bg-[#1F5E4A] text-white`}>Continue <ArrowRight size={15} /></Link>
        </div>
      ),
    })

    list.push({
      key: "scripture-photo",
      node: (
        <div className="relative h-full w-full text-white">
          <img src="/film/auth.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-bottom" />
          <div className="absolute inset-0 bg-[#0d2a21]/65" />
          <div className="relative flex h-full flex-col items-center justify-center p-6 pb-12 text-center sm:p-10">
            <blockquote className={`${serif} line-clamp-5 max-w-xl text-2xl italic leading-snug sm:text-3xl`}>&ldquo;{verse2.text}&rdquo;</blockquote>
            <p className={`${label} mt-4`} style={{ color: "#E2BE5C" }}>{verse2.reference}</p>
          </div>
        </div>
      ),
    })

    if (testimony) {
      list.push({
        key: "testimony",
        node: (
          <Link href="/community" className="flex h-full flex-col justify-center p-6 pb-12 text-white sm:p-10 sm:pb-12" style={{ background: "linear-gradient(145deg,#7A5A12,#3F2E08)" }}>
            <span className={label} style={{ color: "#F0D68A" }}>Testimony</span>
            <span className={`${serif} mt-3 line-clamp-4 block text-2xl leading-snug sm:text-3xl`}>&ldquo;{testimony.testimony}&rdquo;</span>
            <span className="mt-3 block text-sm font-semibold text-white/80">{testimony.userName}</span>
          </Link>
        ),
      })
    }

    list.push({
      key: "prayer",
      node: (
        <div className="flex h-full flex-col justify-center p-6 pb-12 sm:p-10 sm:pb-12" style={{ background: "#E7EFEA", color: "#123A2E" }}>
          <HandHeart size={28} className="text-[#1F5E4A]" />
          <h2 className={`${serif} mt-3 text-3xl font-medium leading-tight sm:text-4xl`}>No one prays alone here.</h2>
          <p className="mt-2 max-w-md text-sm" style={{ color: "#5E6B65" }}>Share a request or stand with another believer today.</p>
          <Link href="/prayer" className={`${action} mt-5 w-fit bg-[#1F5E4A] text-white`}>Open the Prayer Wall <ArrowRight size={15} /></Link>
        </div>
      ),
    })
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verse, verse2, playing, teaching, lessonTitle, testimony, custom])

  const count = slides.length
  const current = index % count

  const go = useCallback((next: number, dir: number) => {
    setPlaying(null)
    setDirection(dir)
    setIndex((next + count) % count)
  }, [count])

  useEffect(() => {
    if (paused || filmPlaying || reduceMotion) return
    const timer = setInterval(() => {
      if (document.hidden) return
      setDirection(1)
      setIndex(i => (i + 1) % count)
    }, SLIDE_MS)
    return () => clearInterval(timer)
  }, [paused, filmPlaying, reduceMotion, count])

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Today on FORMED"
      className="group relative h-[340px] overflow-hidden rounded-2xl shadow-[0_18px_40px_-24px_rgba(18,58,46,0.6)] sm:h-[380px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={slides[current].key}
          custom={direction}
          initial={reduceMotion ? { opacity: 0 } : { x: `${direction * 100}%` }}
          animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { x: `${direction * -100}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          drag={filmPlaying ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) go(current + 1, 1)
            else if (info.offset.x > 60) go(current - 1, -1)
          }}
          className="absolute inset-0"
          aria-label={`Slide ${current + 1} of ${count}`}
        >
          {slides[current].node}
        </motion.div>
      </AnimatePresence>

      {!filmPlaying && (
        <>
          <button onClick={() => go(current - 1, -1)} aria-label="Previous slide" className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100 sm:flex">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => go(current + 1, 1)} aria-label="Next slide" className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100 sm:flex">
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center rounded-full bg-black/25 px-1.5 backdrop-blur-sm">
            {slides.map((s, i) => (
              <button key={s.key} onClick={() => go(i, i > current ? 1 : -1)} aria-label={`Go to slide ${i + 1}`} aria-current={i === current} className="flex h-6 w-5 items-center justify-center">
                <span className={`h-1.5 rounded-full transition-all ${i === current ? "w-4 bg-white" : "w-1.5 bg-white/55"}`} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
