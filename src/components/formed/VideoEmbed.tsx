"use client"

import { ExternalLink, ShieldAlert } from "lucide-react"
import { type TeachingResource, canEmbed, canLink } from "@/lib/video-library"

interface VideoEmbedProps {
  resource: TeachingResource
}

export default function VideoEmbed({ resource }: VideoEmbedProps) {
  // Never embed unverified content
  if (canEmbed(resource.review_status) && resource.embed_url) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
        <iframe
          src={resource.embed_url}
          title={resource.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    )
  }

  // Approved external link — show a click-through card
  if (canLink(resource.review_status) && resource.source_url) {
    return (
      <div className="w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-[#1F5E4A]/10 to-[#D4A72C]/10 flex flex-col items-center justify-center gap-4 border border-[#1F5E4A]/20 p-6">
        {resource.thumbnail_url ? (
          <img
            src={resource.thumbnail_url}
            alt={resource.title}
            className="w-full h-full object-cover absolute inset-0 opacity-10 rounded-2xl"
          />
        ) : null}
        <div className="relative text-center">
          <p className="text-sm text-gray-600 mb-4">
            This teaching is available on the ministry&apos;s website.
          </p>
          <a
            href={resource.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1F5E4A] text-white text-sm font-semibold hover:bg-[#1F5E4A]/90 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Watch on {resource.ministry?.name ?? "Ministry Website"}
          </a>
        </div>
      </div>
    )
  }

  // Not yet approved — show a notice, never the content
  return (
    <div className="w-full aspect-video rounded-2xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-3 p-6">
      <ShieldAlert className="w-8 h-8 text-gray-300" />
      <p className="text-sm text-gray-400 text-center max-w-xs">
        This resource is currently under review and is not yet available.
      </p>
    </div>
  )
}
