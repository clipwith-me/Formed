import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Calendar, ChevronRight } from 'lucide-react'
import type { Believer, BelieverStatus } from '@/lib/types'

interface Props {
  believer: Believer
  assignedVolunteerName?: string
}

const STATUS_CONFIG: Record<BelieverStatus, { label: string; color: string; progress: number }> = {
  NEW: { label: 'New', color: 'bg-gray-100 text-gray-600', progress: 10 },
  ASSIGNED: { label: 'Assigned', color: 'bg-blue-100 text-blue-700', progress: 25 },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-green-100 text-green-700', progress: 50 },
  COMPLETED: { label: 'Completed', color: 'bg-[#D4A72C]/20 text-[#9a7820]', progress: 75 },
  MENTORED: { label: 'Mentored', color: 'bg-purple-100 text-purple-700', progress: 90 },
  DISCIPLE_MAKER: { label: 'Disciple Maker', color: 'bg-[#1F5E4A]/15 text-[#1F5E4A]', progress: 100 },
}

export function BelieverCard({ believer, assignedVolunteerName }: Props) {
  const status = STATUS_CONFIG[believer.status]

  const daysSince = believer.date_of_conversion
    ? Math.floor((Date.now() - new Date(believer.date_of_conversion).getTime()) / 86400000)
    : null

  const lastContact = believer.created_at
    ? new Date(believer.created_at).toLocaleDateString()
    : null

  return (
    <Card className="border-0 shadow-sm rounded-xl hover:shadow-md transition-all group">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-11 h-11 flex-shrink-0">
            <AvatarFallback className="bg-[#1F5E4A]/10 text-[#1F5E4A] font-bold text-sm">
              {believer.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-gray-800 truncate">{believer.full_name}</h3>
              <Badge className={`text-xs border-0 flex-shrink-0 ${status.color}`}>
                {status.label}
              </Badge>
            </div>

            {daysSince !== null && (
              <p className="text-xs text-gray-500 mt-0.5">Day {daysSince} since conversion</p>
            )}

            <div className="mt-2 mb-1">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Journey progress</span>
                <span>{status.progress}%</span>
              </div>
              <Progress value={status.progress} className="h-1.5" />
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="w-3 h-3" />
                {lastContact ? `Last: ${lastContact}` : 'No contact yet'}
              </div>

              {assignedVolunteerName && (
                <div className="flex items-center gap-1.5">
                  <Avatar className="w-5 h-5">
                    <AvatarFallback className="bg-[#D4A72C]/20 text-[#9a7820] text-xs">
                      {assignedVolunteerName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-500">{assignedVolunteerName.split(' ')[0]}</span>
                </div>
              )}
            </div>
          </div>

          <Link
            href={`/followup/${believer.id}`}
            className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#1F5E4A] hover:text-white transition-all group-hover:bg-[#1F5E4A] group-hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
