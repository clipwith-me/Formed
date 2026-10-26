"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, RotateCcw, BookOpen } from "lucide-react"
import type { ScriptureSlide } from "@/lib/curriculum"

const SLIDE_DURATION_MS = 12000 // 12 seconds per slide = 60s for 5 slides

export function ScriptureVideoPlayer({
  lessonTitle,
  chapterTitle,
  slides,
  onComplete,
}: {
  lessonTitle: string
  chapterTitle: string
  slides: ScriptureSlide[]
  onComplete?: () => void
}) {
  const [totalElapsed, setTotalElapsed] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const [prevIdx, setPrevIdx] = useState(-1)

  const playingRef = useRef(false)
  const startTimeRef = useRef(0)
  const startElapsedRef = useRef(0)
  const totalMs = slides.length * SLIDE_DURATION_MS

  const currentIdx = Math.min(Math.floor(totalElapsed / SLIDE_DURATION_MS), slides.length - 1)
  const slideElapsed = totalElapsed % SLIDE_DURATION_MS
  const overallProgress = Math.min(totalElapsed / totalMs, 1)
  const slideProgress = slideElapsed / SLIDE_DURATION_MS

  // Track when slide changes to trigger fade-in
  const [fadeKey, setFadeKey] = useState(0)
  useEffect(() => {
    if (currentIdx !== prevIdx) {
      setPrevIdx(currentIdx)
      setFadeKey(k => k + 1)
    }
  }, [currentIdx, prevIdx])

  // Opacity: fade in 0-12%, full 12-82%, fade out 82-100%
  const textOpacity =
    slideProgress < 0.12
      ? slideProgress / 0.12
      : slideProgress > 0.82
      ? Math.max(0, 1 - (slideProgress - 0.82) / 0.18)
      : 1

  const textY = slideProgress < 0.12 ? (1 - slideProgress / 0.12) * 14 : 0

  useEffect(() => {
    if (!playing || done) return
    playingRef.current = true
    startTimeRef.current = performance.now()
    startElapsedRef.current = totalElapsed

    let raf: number
    const tick = (now: number) => {
      if (!playingRef.current) return
      const elapsed = startElapsedRef.current + (now - startTimeRef.current)
      if (elapsed >= totalMs) {
        setTotalElapsed(totalMs)
        setPlaying(false)
        setDone(true)
        playingRef.current = false
        onComplete?.()
        return
      }
      setTotalElapsed(elapsed)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      playingRef.current = false
      cancelAnimationFrame(raf)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing])

  const restart = () => {
    playingRef.current = false
    setTotalElapsed(0)
    setPlaying(false)
    setDone(false)
    setPrevIdx(-1)
    setFadeKey(k => k + 1)
  }

  const togglePlay = () => {
    if (done) { restart(); setTimeout(() => setPlaying(true), 80); return }
    setPlaying(p => !p)
  }

  const slide = slides[currentIdx] ?? slides[0]
  const totalSecs = Math.floor((totalMs - totalElapsed) / 1000)
  const mins = Math.floor(totalSecs / 60)
  const secs = totalSecs % 60

  if (!slide) return null

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden select-none"
      style={{
        background: 'linear-gradient(160deg, #07140f 0%, #0a1a13 45%, #071410 100%)',
        aspectRatio: '16/9',
        minHeight: 200,
      }}
    >
      {/* Animated ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: '55%', height: '55%',
            background: 'radial-gradient(circle, rgba(31,94,74,0.35) 0%, transparent 70%)',
            top: '5%', left: '10%',
            transform: `translate(${Math.sin(totalElapsed / 3200) * 18}px, ${Math.cos(totalElapsed / 4100) * 12}px)`,
            transition: 'transform 0.6s ease-out',
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: '40%', height: '40%',
            background: 'radial-gradient(circle, rgba(212,167,44,0.2) 0%, transparent 70%)',
            bottom: '10%', right: '8%',
            transform: `translate(${Math.cos(totalElapsed / 3800) * 14}px, ${Math.sin(totalElapsed / 2900) * 18}px)`,
            transition: 'transform 0.6s ease-out',
          }}
        />
      </div>

      {/* Subtle cross pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 px-4 pt-3 flex items-center justify-between z-10">
        <div className="min-w-0">
          <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-semibold truncate">{chapterTitle}</p>
          <p className="text-[11px] text-white/55 font-medium truncate">{lessonTitle}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white/8 backdrop-blur-sm rounded-full px-2.5 py-1 flex-shrink-0 ml-2"
          style={{ background: 'rgba(255,255,255,0.07)' }}>
          <BookOpen size={9} className="text-[#D4A72C]" />
          <span className="text-[10px] text-white/50 font-medium">{currentIdx + 1} / {slides.length}</span>
        </div>
      </div>

      {/* Scripture text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-7 sm:px-12 py-14">
        <div
          key={fadeKey}
          style={{
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
          className="text-center max-w-lg"
        >
          <p
            className="text-white/90 font-light leading-relaxed text-sm sm:text-base md:text-lg"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              textShadow: '0 2px 20px rgba(0,0,0,0.5)',
            }}
          >
            &ldquo;{slide.text}&rdquo;
          </p>
          <p
            className="font-semibold text-xs sm:text-sm mt-4 tracking-wide"
            style={{
              color: '#D4A72C',
              textShadow: '0 0 24px rgba(212,167,44,0.5)',
            }}
          >
            — {slide.reference}
          </p>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-3.5 z-10">
        {/* Overall progress bar */}
        <div className="h-[2px] bg-white/15 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${overallProgress * 100}%`,
              background: 'linear-gradient(90deg, #1F5E4A, #D4A72C)',
              transition: 'width 0.1s linear',
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          {/* Slide dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-400"
                style={{
                  width: i === currentIdx ? 16 : 6,
                  height: 5,
                  background:
                    i === currentIdx ? '#D4A72C'
                    : i < currentIdx ? 'rgba(255,255,255,0.55)'
                    : 'rgba(255,255,255,0.18)',
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {playing && totalElapsed > 0 && (
              <span className="text-[10px] text-white/35 tabular-nums">
                {mins}:{String(secs).padStart(2, '0')}
              </span>
            )}
            <button
              onClick={restart}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <RotateCcw size={11} className="text-white/70" />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95"
              style={{ background: '#D4A72C', boxShadow: '0 0 20px rgba(212,167,44,0.4)' }}
            >
              {playing
                ? <Pause size={16} className="text-white" />
                : <Play size={16} className="text-white ml-0.5" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Not-started overlay */}
      {!playing && totalElapsed === 0 && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center z-20 cursor-pointer"
          style={{ background: 'rgba(0,0,0,0.35)' }}
          onClick={togglePlay}
        >
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center"
            style={{
              background: '#D4A72C',
              boxShadow: '0 0 0 8px rgba(212,167,44,0.18), 0 4px 30px rgba(212,167,44,0.45)',
            }}
          >
            <Play size={28} className="text-white ml-1" />
          </div>
          <p className="text-white/60 text-xs mt-3 font-medium">Tap to play · {slides.length * 12}s</p>
        </div>
      )}

      {/* Paused overlay (subtle) */}
      {!playing && totalElapsed > 0 && !done && (
        <div
          className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer"
          style={{ background: 'rgba(0,0,0,0.2)' }}
          onClick={togglePlay}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
            <Play size={20} className="text-white ml-0.5" />
          </div>
        </div>
      )}

      {/* Done overlay */}
      {done && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center z-20"
          style={{ background: 'rgba(7,20,16,0.85)', backdropFilter: 'blur(4px)' }}
        >
          <div className="text-4xl mb-3">✝️</div>
          <p className="text-white font-bold text-lg">Scripture Complete</p>
          <p className="text-white/50 text-sm mt-1">You have meditated on God&apos;s Word</p>
          <button
            onClick={restart}
            className="mt-4 flex items-center gap-1.5 text-[#D4A72C] text-xs font-semibold hover:opacity-80 transition-opacity"
          >
            <RotateCcw size={12} /> Watch again
          </button>
        </div>
      )}
    </div>
  )
}
