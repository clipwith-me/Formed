"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowDown, ArrowLeft, ArrowUp, Eye, EyeOff, Loader2, Pencil, ShieldAlert, Trash2, Upload } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { safeLink, safeMedia, youtubeEmbed, type HomeSlide, type SlideType } from "@/lib/home-slides"

const TYPES: { key: SlideType; label: string; hint: string }[] = [
  { key: "DESIGN", label: "Design", hint: "An image or flyer you made" },
  { key: "VIDEO", label: "Video update", hint: "Upload a video or paste a YouTube link" },
  { key: "MESSAGE", label: "Message", hint: "An announcement in words" },
  { key: "SCRIPTURE", label: "Scripture", hint: "A verse and its reference" },
]

const EMPTY = { type: "DESIGN" as SlideType, title: "", body: "", media_url: "", link_url: "", link_label: "", starts_at: "", ends_at: "" }
const input = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#1F5E4A] focus:outline-none"
const fieldLabel = "mb-1 block text-xs font-semibold text-gray-600"

function toLocalInput(iso: string | null) {
  if (!iso) return ""
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

function scheduleLabel(s: HomeSlide) {
  const now = Date.now()
  if (!s.is_active) return "Hidden"
  if (s.starts_at && new Date(s.starts_at).getTime() > now) return `Starts ${new Date(s.starts_at).toLocaleString()}`
  if (s.ends_at && new Date(s.ends_at).getTime() <= now) return "Ended"
  return s.ends_at ? `Live until ${new Date(s.ends_at).toLocaleString()}` : "Live"
}

export default function AdminSlidesPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [userId, setUserId] = useState("")
  const [slides, setSlides] = useState<HomeSlide[]>([])
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const set = (k: keyof typeof EMPTY, v: string) => setForm(f => ({ ...f, [k]: v }))

  const load = useCallback(async () => {
    const { data, error: err } = await createClient().from("home_slides").select("*").order("sort_order").order("created_at")
    if (err) setError(/home_slides/.test(err.message) ? "The slides table isn't set up yet. Run formed-home-slides.sql in Supabase." : err.message)
    else setSlides((data ?? []) as HomeSlide[])
  }, [])

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setIsAdmin(false)
      const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single()
      const admin = (data as { role?: string } | null)?.role === "ADMIN"
      setIsAdmin(admin)
      setUserId(user.id)
      if (admin) load()
    }
    init()
  }, [load])

  const upload = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    setError("")
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin"
    const path = `${userId}/slides/${Date.now()}.${ext}`
    const supabase = createClient()
    const { error: err } = await supabase.storage.from("post-media").upload(path, file, { contentType: file.type })
    if (err) setError(`Upload failed: ${err.message}`)
    else set("media_url", supabase.storage.from("post-media").getPublicUrl(path).data.publicUrl)
    setUploading(false)
  }

  const validate = () => {
    const needsMedia = form.type === "DESIGN" || form.type === "VIDEO"
    if (needsMedia && !safeMedia(form.media_url)) return "Add a file, or a link that starts with https://."
    if (form.type === "VIDEO" && form.media_url.includes("youtu") && !youtubeEmbed(form.media_url)) return "That YouTube link isn't valid."
    if (form.type === "MESSAGE" && !form.title.trim()) return "Add a headline for your message."
    if (form.type === "SCRIPTURE" && (!form.body.trim() || !form.title.trim())) return "Add the verse and its reference."
    if (form.link_url.trim() && !safeLink(form.link_url)) return "Links must start with / or https://."
    if (form.starts_at && form.ends_at && new Date(form.ends_at) <= new Date(form.starts_at)) return "The end time must be after the start time."
    return ""
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const problem = validate()
    if (problem) return setError(problem)
    setBusy(true)
    setError("")
    const row = {
      type: form.type,
      title: form.title.trim() || null,
      body: form.body.trim() || null,
      media_url: form.media_url.trim() || null,
      link_url: form.link_url.trim() || null,
      link_label: form.link_label.trim() || null,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
    }
    const supabase = createClient()
    const { error: err } = editingId
      ? await supabase.from("home_slides").update(row).eq("id", editingId)
      : await supabase.from("home_slides").insert({ ...row, created_by: userId, sort_order: (slides.at(-1)?.sort_order ?? 0) + 1 })
    setBusy(false)
    if (err) return setError(err.message)
    setForm(EMPTY)
    setEditingId(null)
    load()
  }

  const edit = (s: HomeSlide) => {
    setEditingId(s.id)
    setError("")
    setForm({ type: s.type, title: s.title ?? "", body: s.body ?? "", media_url: s.media_url ?? "", link_url: s.link_url ?? "", link_label: s.link_label ?? "", starts_at: toLocalInput(s.starts_at), ends_at: toLocalInput(s.ends_at) })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const toggle = async (s: HomeSlide) => {
    await createClient().from("home_slides").update({ is_active: !s.is_active }).eq("id", s.id)
    load()
  }

  const remove = async (id: string) => {
    await createClient().from("home_slides").delete().eq("id", id)
    setConfirmDelete(null)
    load()
  }

  const move = async (i: number, dir: -1 | 1) => {
    const order = [...slides]
    const j = i + dir
    if (!order[j]) return
    ;[order[i], order[j]] = [order[j], order[i]]
    setSlides(order)
    const supabase = createClient()
    await Promise.all(order.map((s, n) => supabase.from("home_slides").update({ sort_order: n + 1 }).eq("id", s.id)))
    load()
  }

  if (isAdmin === null) return <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-[#1F5E4A]" /></div>
  if (!isAdmin) return (
    <div className="py-20 text-center text-gray-500">
      <ShieldAlert className="mx-auto mb-3 h-10 w-10 text-gray-300" />
      Admin access required
    </div>
  )

  const type = TYPES.find(t => t.key === form.type)!
  const showMedia = form.type === "DESIGN" || form.type === "VIDEO"

  return (
    <div className="space-y-6 pb-10">
      <div>
        <Link href="/admin" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1F5E4A]"><ArrowLeft size={16} /> Admin Panel</Link>
        <h1 className="text-2xl font-black text-[#222222]">Home Slides</h1>
        <p className="mt-1 text-sm text-gray-500">Post designs, messages, video updates and scriptures to every member&rsquo;s home page. Yours show first, followed by the built-in slides.</p>
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <form onSubmit={save} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-[#222222]">{editingId ? "Edit slide" : "New slide"}</h2>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TYPES.map(t => (
            <button key={t.key} type="button" aria-pressed={form.type === t.key} onClick={() => set("type", t.key)} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${form.type === t.key ? "border-[#1F5E4A] bg-[#e8f4ef] text-[#1F5E4A]" : "border-gray-200 text-gray-600"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">{type.hint}</p>

        {showMedia && (
          <div className="space-y-2">
            <label htmlFor="slide-file" className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 p-4 text-sm font-semibold text-gray-600 hover:border-[#1F5E4A]">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {uploading ? "Uploading…" : `Choose ${form.type === "DESIGN" ? "an image" : "a video"}`}
            </label>
            <input id="slide-file" type="file" className="sr-only" accept={form.type === "DESIGN" ? "image/jpeg,image/png,image/webp" : "video/mp4,video/webm"} onChange={e => upload(e.target.files?.[0])} />
            <label htmlFor="slide-media" className={fieldLabel}>{form.type === "VIDEO" ? "Or paste a video or YouTube link" : "Or paste an image link"}</label>
            <input id="slide-media" className={input} value={form.media_url} onChange={e => set("media_url", e.target.value)} placeholder="https://" />
            {form.type === "DESIGN" && safeMedia(form.media_url) && <img src={form.media_url} alt="Preview" className="max-h-48 rounded-xl" />}
          </div>
        )}

        <div>
          <label htmlFor="slide-title" className={fieldLabel}>{form.type === "SCRIPTURE" ? "Reference, e.g. John 3:16" : showMedia ? "Headline (optional)" : "Headline"}</label>
          <input id="slide-title" className={input} maxLength={120} value={form.title} onChange={e => set("title", e.target.value)} />
        </div>
        {!showMedia && (
          <div>
            <label htmlFor="slide-body" className={fieldLabel}>{form.type === "SCRIPTURE" ? "Verse" : "Message (optional)"}</label>
            <textarea id="slide-body" className={input} rows={3} maxLength={300} value={form.body} onChange={e => set("body", e.target.value)} />
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="slide-link" className={fieldLabel}>Button link (optional)</label>
            <input id="slide-link" className={input} value={form.link_url} onChange={e => set("link_url", e.target.value)} placeholder="/prayer or https://" />
          </div>
          <div>
            <label htmlFor="slide-link-label" className={fieldLabel}>Button text</label>
            <input id="slide-link-label" className={input} maxLength={30} value={form.link_label} onChange={e => set("link_label", e.target.value)} placeholder="Learn more" />
          </div>
          <div>
            <label htmlFor="slide-start" className={fieldLabel}>Start showing (optional)</label>
            <input id="slide-start" type="datetime-local" className={input} value={form.starts_at} onChange={e => set("starts_at", e.target.value)} />
          </div>
          <div>
            <label htmlFor="slide-end" className={fieldLabel}>Stop showing (optional)</label>
            <input id="slide-end" type="datetime-local" className={input} value={form.ends_at} onChange={e => set("ends_at", e.target.value)} />
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={busy || uploading} className="h-11 flex-1 rounded-xl bg-[#1F5E4A] text-sm font-bold text-white disabled:opacity-60">
            {busy ? "Saving…" : editingId ? "Save changes" : "Publish slide"}
          </button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY) }} className="h-11 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600">Cancel</button>}
        </div>
      </form>

      <section className="space-y-2">
        <h2 className="font-bold text-[#222222]">Your slides ({slides.length})</h2>
        {slides.length === 0 && <p className="rounded-2xl bg-gray-50 p-6 text-center text-sm text-gray-500">No slides yet. Members see the built-in slides until you publish one.</p>}
        {slides.map((s, i) => (
          <div key={s.id} className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#222222]">{s.title || s.body || `${TYPES.find(t => t.key === s.type)?.label} slide`}</p>
                <p className="truncate text-xs text-gray-500">{TYPES.find(t => t.key === s.type)?.label} · {scheduleLabel(s)}</p>
              </div>
              <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="p-1.5 text-gray-500 disabled:opacity-30"><ArrowUp size={16} /></button>
              <button onClick={() => move(i, 1)} disabled={i === slides.length - 1} aria-label="Move down" className="p-1.5 text-gray-500 disabled:opacity-30"><ArrowDown size={16} /></button>
              <button onClick={() => toggle(s)} aria-label={s.is_active ? "Hide slide" : "Show slide"} className="p-1.5 text-gray-500">{s.is_active ? <Eye size={16} /> : <EyeOff size={16} />}</button>
              <button onClick={() => edit(s)} aria-label="Edit slide" className="p-1.5 text-gray-500"><Pencil size={16} /></button>
              <button onClick={() => setConfirmDelete(s.id)} aria-label="Delete slide" className="p-1.5 text-red-500"><Trash2 size={16} /></button>
            </div>
            {confirmDelete === s.id && (
              <div className="mt-2 flex items-center justify-end gap-2 border-t border-gray-100 pt-2 text-sm">
                <span className="mr-auto text-gray-600">Delete this slide?</span>
                <button onClick={() => setConfirmDelete(null)} className="px-3 py-1 font-semibold text-gray-600">Keep</button>
                <button onClick={() => remove(s.id)} className="rounded-lg bg-red-600 px-3 py-1 font-semibold text-white">Delete</button>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  )
}
