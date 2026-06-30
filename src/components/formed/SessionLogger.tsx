'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PhoneCall, MessageSquare, Users, Video, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { SessionType } from '@/lib/types'

interface Props {
  believerId: string
  open: boolean
  onClose: () => void
  onSave?: (session: {
    type: SessionType
    date: string
    duration: number
    notes: string
  }) => void
}

const SESSION_TYPES: { key: SessionType; label: string; icon: React.ReactNode }[] = [
  { key: 'CALL', label: 'Phone Call', icon: <PhoneCall className="w-5 h-5" /> },
  { key: 'CHAT', label: 'Chat', icon: <MessageSquare className="w-5 h-5" /> },
  { key: 'IN_PERSON', label: 'In Person', icon: <Users className="w-5 h-5" /> },
  { key: 'VIDEO', label: 'Video', icon: <Video className="w-5 h-5" /> },
]

export function SessionLogger({ open, onClose, onSave }: Props) {
  const [type, setType] = useState<SessionType>('CALL')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16))
  const [duration, setDuration] = useState('30')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    onSave?.({ type, date, duration: Number(duration), notes })
    setLoading(false)
    onClose()
    // Reset
    setNotes('')
    setDuration('30')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="bg-white w-full max-w-lg rounded-t-2xl p-6 space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Log Session</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Session type */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Session Type</label>
              <div className="grid grid-cols-2 gap-2">
                {SESSION_TYPES.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setType(t.key)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                      type === t.key
                        ? 'border-[#1F5E4A] bg-[#f0f7f4] text-[#1F5E4A]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className={type === t.key ? 'text-[#1F5E4A]' : 'text-gray-400'}>
                      {t.icon}
                    </span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date/time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Date & Time</label>
                <Input
                  type="datetime-local"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="h-11 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Duration (min)</label>
                <Input
                  type="number"
                  min="1"
                  max="480"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  placeholder="30"
                  className="h-11"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Notes</label>
              <Textarea
                placeholder="What did you discuss? Any prayer requests? Next steps?"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full h-11 bg-[#1F5E4A] hover:bg-[#174d3c] text-white font-semibold rounded-xl"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : 'Save Session'}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
