import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: {
    direction: 'up' | 'down'
    value: string
  }
  accent?: 'green' | 'gold'
  description?: string
}

export function StatsCard({ label, value, icon: Icon, trend, accent = 'green', description }: Props) {
  const isGreen = accent === 'green'

  return (
    <Card className="border-0 shadow-sm rounded-xl hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-extrabold mt-1 ${isGreen ? 'text-[#1F5E4A]' : 'text-[#D4A72C]'}`}>
              {value}
            </p>
            {description && (
              <p className="text-xs text-gray-400 mt-1">{description}</p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${
                trend.direction === 'up' ? 'text-green-600' : 'text-red-500'
              }`}>
                {trend.direction === 'up'
                  ? <TrendingUp className="w-3.5 h-3.5" />
                  : <TrendingDown className="w-3.5 h-3.5" />
                }
                {trend.value} this week
              </div>
            )}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isGreen ? 'bg-[#1F5E4A]/10' : 'bg-[#D4A72C]/15'
          }`}>
            <Icon className={`w-5 h-5 ${isGreen ? 'text-[#1F5E4A]' : 'text-[#D4A72C]'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
