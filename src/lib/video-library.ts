import { createBrowserClient } from "@supabase/ssr"

// ─── Review Status ─────────────────────────────────────────────────────────────
export const REVIEW_STATUS = {
  RESEARCH_CANDIDATE: "RESEARCH_CANDIDATE",
  UNDER_DOCTRINAL_REVIEW: "UNDER_DOCTRINAL_REVIEW",
  UNDER_COPYRIGHT_REVIEW: "UNDER_COPYRIGHT_REVIEW",
  AWAITING_PERMISSION: "AWAITING_PERMISSION",
  APPROVED_EXTERNAL_LINK: "APPROVED_EXTERNAL_LINK",
  APPROVED_EMBED: "APPROVED_EMBED",
  LICENSED_HOSTED: "LICENSED_HOSTED",
  REJECTED: "REJECTED",
  UNAVAILABLE: "UNAVAILABLE",
} as const

export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS]

export const EMBEDDABLE_STATUSES: ReviewStatus[] = [
  REVIEW_STATUS.APPROVED_EMBED,
  REVIEW_STATUS.LICENSED_HOSTED,
]

export const LINKABLE_STATUSES: ReviewStatus[] = [
  REVIEW_STATUS.APPROVED_EXTERNAL_LINK,
  ...EMBEDDABLE_STATUSES,
]

export function canEmbed(status: ReviewStatus): boolean {
  return EMBEDDABLE_STATUSES.includes(status)
}

export function canLink(status: ReviewStatus): boolean {
  return LINKABLE_STATUSES.includes(status)
}

export function reviewStatusLabel(status: ReviewStatus): string {
  const labels: Record<ReviewStatus, string> = {
    RESEARCH_CANDIDATE: "Research Candidate",
    UNDER_DOCTRINAL_REVIEW: "Doctrinal Review",
    UNDER_COPYRIGHT_REVIEW: "Copyright Review",
    AWAITING_PERMISSION: "Awaiting Permission",
    APPROVED_EXTERNAL_LINK: "Approved (Link)",
    APPROVED_EMBED: "Approved (Embed)",
    LICENSED_HOSTED: "Licensed & Hosted",
    REJECTED: "Rejected",
    UNAVAILABLE: "Unavailable",
  }
  return labels[status] ?? status
}

export function reviewStatusColor(status: ReviewStatus): string {
  const colors: Record<ReviewStatus, string> = {
    RESEARCH_CANDIDATE: "bg-gray-100 text-gray-600",
    UNDER_DOCTRINAL_REVIEW: "bg-yellow-100 text-yellow-700",
    UNDER_COPYRIGHT_REVIEW: "bg-orange-100 text-orange-700",
    AWAITING_PERMISSION: "bg-blue-100 text-blue-700",
    APPROVED_EXTERNAL_LINK: "bg-green-100 text-green-700",
    APPROVED_EMBED: "bg-emerald-100 text-emerald-700",
    LICENSED_HOSTED: "bg-teal-100 text-teal-700",
    REJECTED: "bg-red-100 text-red-700",
    UNAVAILABLE: "bg-gray-100 text-gray-500",
  }
  return colors[status] ?? "bg-gray-100 text-gray-600"
}

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface Ministry {
  id: string
  name: string
  website_url: string | null
  logo_url: string | null
  description: string | null
}

export interface Speaker {
  id: string
  name: string
  bio: string | null
  photo_url: string | null
  ministry_id: string | null
  ministry?: Ministry
}

export interface ScriptureRef {
  id: string
  display_ref: string
  book: string
  chapter: number | null
  verse_start: number | null
  verse_end: number | null
}

export interface ReflectionQuestion {
  id: string
  sort_order: number
  question: string
}

export interface TeachingResource {
  id: string
  title: string
  description: string | null
  speaker_id: string | null
  ministry_id: string | null
  source_url: string | null
  embed_url: string | null
  thumbnail_url: string | null
  duration_seconds: number | null
  review_status: ReviewStatus
  tags: string[] | null
  language: string
  published_year: number | null
  created_at: string
  updated_at: string
  speaker?: Speaker
  ministry?: Ministry
  scripture_refs?: ScriptureRef[]
  reflection_questions?: ReflectionQuestion[]
}

export interface CurriculumPath {
  id: string
  code: string
  title: string
  description: string | null
  sort_order: number
  lessons?: CurriculumPathLesson[]
}

export interface CurriculumPathLesson {
  id: string
  path_id: string
  resource_id: string
  lesson_number: number
  lesson_title: string | null
  resource?: TeachingResource
}

export interface LessonProgress {
  id: string
  user_id: string
  resource_id: string
  completed: boolean
  completed_at: string | null
  watch_seconds: number
}

export interface LessonNote {
  id: string
  user_id: string
  resource_id: string
  content: string
  updated_at: string
}

export interface LessonReflection {
  id: string
  user_id: string
  question_id: string
  answer: string
  updated_at: string
}

export interface ReviewRecord {
  id: string
  resource_id: string
  reviewer_id: string | null
  from_status: string | null
  to_status: string
  note: string | null
  created_at: string
}

// ─── Library Query Helpers ─────────────────────────────────────────────────────
function supabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function getApprovedResources(opts?: {
  search?: string
  tags?: string[]
  pathCode?: string
  limit?: number
  offset?: number
}): Promise<TeachingResource[]> {
  const db = supabase()
  let query = db
    .from("teaching_resources")
    .select(`
      *,
      speaker:speakers(id, name, bio, photo_url),
      ministry:ministries(id, name, website_url),
      scripture_refs:resource_scripture_refs(id, display_ref, book, chapter, verse_start, verse_end)
    `)
    .in("review_status", LINKABLE_STATUSES)
    .order("created_at", { ascending: false })

  if (opts?.search) {
    query = query.or(
      `title.ilike.%${opts.search}%,description.ilike.%${opts.search}%`
    )
  }
  if (opts?.tags?.length) {
    query = query.overlaps("tags", opts.tags)
  }
  if (opts?.limit) query = query.limit(opts.limit)
  if (opts?.offset) query = query.range(opts.offset, (opts.offset + (opts.limit ?? 20)) - 1)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as TeachingResource[]
}

export async function getResourceById(id: string): Promise<TeachingResource | null> {
  const { data, error } = await supabase()
    .from("teaching_resources")
    .select(`
      *,
      speaker:speakers(id, name, bio, photo_url),
      ministry:ministries(id, name, website_url),
      scripture_refs:resource_scripture_refs(id, display_ref, book, chapter, verse_start, verse_end),
      reflection_questions:resource_reflection_questions(id, sort_order, question)
    `)
    .eq("id", id)
    .single()

  if (error) return null
  return data as TeachingResource
}

export async function getCurriculumPaths(): Promise<CurriculumPath[]> {
  const { data, error } = await supabase()
    .from("curriculum_paths")
    .select(`
      *,
      lessons:curriculum_path_lessons(
        id, lesson_number, lesson_title, resource_id,
        resource:teaching_resources(id, title, description, review_status, tags, thumbnail_url, duration_seconds,
          speaker:speakers(id, name))
      )
    `)
    .order("sort_order")

  if (error) throw error
  return (data ?? []) as CurriculumPath[]
}

export async function getAdminResources(opts?: {
  status?: ReviewStatus
  search?: string
}): Promise<TeachingResource[]> {
  const db = supabase()
  let query = db
    .from("teaching_resources")
    .select(`
      *,
      speaker:speakers(id, name),
      ministry:ministries(id, name)
    `)
    .order("created_at", { ascending: false })

  if (opts?.status) query = query.eq("review_status", opts.status)
  if (opts?.search) {
    query = query.or(`title.ilike.%${opts.search}%,description.ilike.%${opts.search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as TeachingResource[]
}

// ─── Progress Helpers ──────────────────────────────────────────────────────────
export async function getUserProgress(userId: string, resourceId: string): Promise<LessonProgress | null> {
  const { data } = await supabase()
    .from("video_lesson_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("resource_id", resourceId)
    .maybeSingle()
  return data as LessonProgress | null
}

export async function markLessonComplete(userId: string, resourceId: string): Promise<void> {
  await supabase()
    .from("video_lesson_progress")
    .upsert({
      user_id: userId,
      resource_id: resourceId,
      completed: true,
      completed_at: new Date().toISOString(),
    }, { onConflict: "user_id,resource_id" })
}

export async function getUserCompletedIds(userId: string): Promise<string[]> {
  const { data } = await supabase()
    .from("video_lesson_progress")
    .select("resource_id")
    .eq("user_id", userId)
    .eq("completed", true)
  return (data ?? []).map((r: { resource_id: string }) => r.resource_id)
}

// ─── Notes Helpers ─────────────────────────────────────────────────────────────
export async function getLessonNote(userId: string, resourceId: string): Promise<LessonNote | null> {
  const { data } = await supabase()
    .from("video_lesson_notes")
    .select("*")
    .eq("user_id", userId)
    .eq("resource_id", resourceId)
    .maybeSingle()
  return data as LessonNote | null
}

export async function saveLessonNote(userId: string, resourceId: string, content: string): Promise<void> {
  await supabase()
    .from("video_lesson_notes")
    .upsert({ user_id: userId, resource_id: resourceId, content }, { onConflict: "user_id,resource_id" })
}

// ─── Reflections Helpers ───────────────────────────────────────────────────────
export async function getReflections(userId: string, questionIds: string[]): Promise<Record<string, string>> {
  if (!questionIds.length) return {}
  const { data } = await supabase()
    .from("video_lesson_reflections")
    .select("question_id, answer")
    .eq("user_id", userId)
    .in("question_id", questionIds)
  const map: Record<string, string> = {}
  for (const row of data ?? []) {
    map[(row as { question_id: string; answer: string }).question_id] = (row as { question_id: string; answer: string }).answer
  }
  return map
}

export async function saveReflection(userId: string, questionId: string, answer: string): Promise<void> {
  await supabase()
    .from("video_lesson_reflections")
    .upsert({ user_id: userId, question_id: questionId, answer }, { onConflict: "user_id,question_id" })
}

// ─── Admin Review Helper ───────────────────────────────────────────────────────
export async function updateReviewStatus(
  resourceId: string,
  reviewerId: string,
  fromStatus: ReviewStatus,
  toStatus: ReviewStatus,
  note?: string
): Promise<void> {
  const db = supabase()
  await db.from("teaching_resources").update({ review_status: toStatus }).eq("id", resourceId)
  await db.from("resource_review_records").insert({
    resource_id: resourceId,
    reviewer_id: reviewerId,
    from_status: fromStatus,
    to_status: toStatus,
    note: note ?? null,
  })
}

export async function getReviewHistory(resourceId: string): Promise<ReviewRecord[]> {
  const { data } = await supabase()
    .from("resource_review_records")
    .select("*")
    .eq("resource_id", resourceId)
    .order("created_at", { ascending: false })
  return (data ?? []) as ReviewRecord[]
}

// ─── Utility ───────────────────────────────────────────────────────────────────
export function formatDuration(seconds: number | null): string {
  if (!seconds) return ""
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${m}:${String(s).padStart(2, "0")}`
}
