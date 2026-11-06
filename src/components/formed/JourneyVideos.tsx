"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, ChevronRight, Circle, Clock, PlayCircle } from "lucide-react"
import VideoEmbed from "@/components/formed/VideoEmbed"
import type { TeachingResource } from "@/lib/video-library"

interface Props {
  videos: TeachingResource[]
  watchedIds: Set<string>
  onMarkWatched: (resourceId: string) => void
}

export function JourneyVideos({ videos, watchedIds, onMarkWatched }: Props) {
  const [openId, setOpenId] = useState<string | null>(videos[0]?.id ?? null)
  if (videos.length === 0) return null

  return (
    <section className="space-y-2" aria-label="Teaching videos">
      <h3 className="font-bold text-sm text-gray-700 flex items-center gap-2">
        <PlayCircle size={15} className="text-[#1F5E4A]" /> Teach me more
      </h3>
      {videos.map(video => {
        const open = openId === video.id
        const watched = watchedIds.has(video.id)
        const minutes = video.duration_seconds ? Math.max(1, Math.round(video.duration_seconds / 60)) : null
        return (
          <div key={video.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setOpenId(open ? null : video.id)}
              aria-expanded={open}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50"
            >
              {watched
                ? <CheckCircle2 size={18} className="text-[#1F5E4A] flex-shrink-0" />
                : <PlayCircle size={18} className="text-[#D4A72C] flex-shrink-0" />}
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-[#222222] line-clamp-2">{video.title}</span>
                <span className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  {video.speaker?.name ?? video.ministry?.name}
                  {minutes && <><Clock size={10} className="ml-1" /> {minutes} min</>}
                </span>
              </span>
              <ChevronRight size={14} className={`text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-90" : ""}`} />
            </button>
            {open && (
              <div className="px-3 pb-3 space-y-3">
                <VideoEmbed resource={video} />
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => onMarkWatched(video.id)}
                    disabled={watched}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#1F5E4A] disabled:opacity-70"
                  >
                    {watched ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                    {watched ? "Watched" : "Mark as watched"}
                  </button>
                  <Link href={`/library/${video.id}`} className="text-xs font-semibold text-[#1F5E4A] underline">
                    Reflect and take notes
                  </Link>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </section>
  )
}
