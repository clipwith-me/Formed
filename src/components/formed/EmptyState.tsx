'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center text-center py-16 px-6"
    >
      <div className="w-20 h-20 rounded-full bg-[#1F5E4A]/10 flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-[#1F5E4A]" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm max-w-xs leading-relaxed">{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          className="mt-6 bg-[#1F5E4A] hover:bg-[#174d3c] text-white font-semibold px-6 h-10 rounded-xl"
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  )
}
