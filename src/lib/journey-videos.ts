import type { TeachingResource } from "@/lib/video-library"

// Journey lesson id -> YouTube ids, in teaching order. Only approved videos are ever returned to users.
export const JOURNEY_VIDEOS: Record<string, string[]> = {
  "b-l1": ["HT41M013X3A", "aNOZ7ocLD74", "_unHmAf7INk", "Vb24Lk1Oh5M", "jrszqUvf7-M", "dXUCjW_yvPE"],
  "b-l2": ["qJEtyAiAQik", "UfbyFLgs_NM"],
  "b-l3": ["eAvYmE2YYIU", "oNNZO9i1Gjc"],
  "b-l4": ["ak06MSETeo4", "EILdUm0e9zI"],
  "b-l5": ["n_vEB11XKSE", "FtIXlVMdKVk"],
  "b-l6": ["CGbNw855ksw"],
  "b-l7": ["0k4GbvZUPuo"],
  "b-l8": ["uib2G8GkG60", "b5aAGTNWNBA"],
  "i-l1": ["SDbR300WaZI"],
  "i-l3": ["kDmBkTLpmjo"],
  "i-l5": ["Vtdk1p1bvZ0"],
  "i-l6": ["98g8-KXP_dU"],
  "i-l7": ["U2-p24xbEQM", "aVU6nekKSbk", "E6Yl42niTSA"],
  "i-l8": ["AIyOoFM0xY0", "gIZ7OULmxbg", "takEeHtRrMw", "7RoqnGcEjcs"],
  "a-l1": ["JQhkWmFJKnA", "3ZxXfX1BYI0", "dv_PFQlpdeY", "xUiEiWzrNrQ", "O2g8Z8S60zE"],
}

function youtubeId(resource: TeachingResource) {
  return resource.source_url?.match(/[?&]v=([\w-]+)/)?.[1] ?? null
}

export function videosForLesson(lessonId: string, approved: TeachingResource[]) {
  const byId = new Map(approved.map(r => [youtubeId(r), r]))
  return (JOURNEY_VIDEOS[lessonId] ?? []).flatMap(id => byId.get(id) ?? [])
}
