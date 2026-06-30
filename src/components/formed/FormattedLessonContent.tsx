import { Lightbulb, CheckSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { DiscipleshipLesson } from '@/lib/types'

interface Props {
  lesson: DiscipleshipLesson
}

export function FormattedLessonContent({ lesson }: Props) {
  return (
    <div className="space-y-5">
      {/* Scripture */}
      {lesson.scripture && (
        <div className="border-l-4 border-[#D4A72C] bg-[#fdf8ec] rounded-r-xl pl-5 pr-4 py-4">
          <p className="text-gray-700 italic text-base leading-relaxed font-serif">
            "{lesson.scripture}"
          </p>
          {lesson.scripture_ref && (
            <p className="mt-2 text-[#9a7820] text-xs font-semibold uppercase tracking-widest">
              — {lesson.scripture_ref}
            </p>
          )}
        </div>
      )}

      {/* Description */}
      {lesson.description && (
        <p className="text-gray-600 text-sm leading-relaxed">{lesson.description}</p>
      )}

      {/* Content */}
      {lesson.content && (
        <p className="text-gray-700 text-sm leading-relaxed">{lesson.content}</p>
      )}

      {/* Reflection Question */}
      {lesson.reflection_question && (
        <Card className="border border-amber-100 bg-amber-50 rounded-xl shadow-none">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#D4A72C]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4 text-[#D4A72C]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#9a7820] uppercase tracking-widest mb-1">
                  Reflection
                </p>
                <p className="text-gray-700 text-sm leading-relaxed">{lesson.reflection_question}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Step */}
      {lesson.action_step && (
        <Card className="border border-[#1F5E4A]/20 bg-[#f0f7f4] rounded-xl shadow-none">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1F5E4A]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckSquare className="w-4 h-4 text-[#1F5E4A]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1F5E4A] uppercase tracking-widest mb-1">
                  Action Step
                </p>
                <p className="text-gray-700 text-sm leading-relaxed">{lesson.action_step}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
