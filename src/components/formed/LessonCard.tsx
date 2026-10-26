"use client"

import Link from "next/link"
import { CheckCircle2, Clock, BookOpen, ExternalLink } from "lucide-react"
import { type TeachingResource, formatDuration, canLink, reviewStatusLabel } from "@/lib/video-library"

interface LessonCardProps {
  resource: TeachingResource
  completed?: boolean
  lessonNumber?: number
}

export default function LessonCard({ resource, completed, lessonNumber }: LessonCardProps) {
  const approved = canLink(resource.review_status)

  return (
    <Link
      href={approved ? `/library/${resource.id}` : "#"}
      className={`block rounded-2xl border bg-white shadow-sm transition-all ${
        approved ? "hover:shadow-md hover:-translate-y-0.5 cursor-pointer" : "opacity-60 cursor-default pointer-events-none"
      }`}
    >
      <div className="p-4 flex gap-3">
        {/* Thumbnail / placeholder */}
        <div className="relative flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden bg-[#1F5E4A]/10 flex items-center justify-center">
          {resource.thumbnail_url ? (
            <img src={resource.thumbnail_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="w-6 h-6 text-[#1F5E4A]/50" />
          )}
          {completed && (
            <div className="absolute inset-0 bg-[#1F5E4A]/60 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
          )}
          {lessonNumber !== undefined && (
            <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-[#D4A72C] flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">{lessonNumber}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-[#222222] leading-snug line-clamp-2">
              {resource.title}
            </h3>
            {approved && resource.source_url && !resource.embed_url && (
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-gray-400 mt-0.5" />
            )}
          </div>

          {resource.speaker && (
            <p className="text-xs text-gray-500 mt-0.5">{resource.speaker.name}</p>
          )}

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {resource.duration_seconds ? (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {formatDuration(resource.duration_seconds)}
              </span>
            ) : null}

            {resource.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#1F5E4A]/10 text-[#1F5E4A] font-medium capitalize"
              >
                {tag}
              </span>
            ))}

            {!approved && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                {reviewStatusLabel(resource.review_status)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
