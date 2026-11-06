export type SlideType = "DESIGN" | "VIDEO" | "MESSAGE" | "SCRIPTURE"

export interface HomeSlide {
  id: string
  type: SlideType
  title: string | null
  body: string | null
  media_url: string | null
  link_url: string | null
  link_label: string | null
  sort_order: number
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
}

export function safeLink(url: string | null | undefined) {
  const u = url?.trim()
  if (!u) return null
  if (u.startsWith("/") && !u.startsWith("//") && !u.startsWith("/\\")) return u
  return u.startsWith("https://") ? u : null
}

export function safeMedia(url: string | null | undefined) {
  const u = url?.trim()
  return u?.startsWith("https://") ? u : null
}

export function youtubeEmbed(url: string | null | undefined) {
  const m = url?.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/)
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1` : null
}

export function youtubeThumb(url: string | null | undefined) {
  const id = youtubeEmbed(url)?.match(/embed\/([\w-]+)/)?.[1]
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null
}
