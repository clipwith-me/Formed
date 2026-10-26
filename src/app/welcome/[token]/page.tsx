'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Church, Heart, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'

export default function WelcomePage() {
  const { token } = useParams<{ token: string }>()
  const [believerId, setBelieverId] = useState<string | null>(null)
  const [believerName, setBelieverName] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    age: '',
    gender: '',
    country: '',
    city: '',
    church: '',
    date_of_conversion: '',
    how_came_to_christ: '',
    prayer_needs: '',
    language: 'English',
  })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('believers')
        .select('id, full_name, profile_completed')
        .eq('invite_token', token)
        .single()

      if (error || !data) { setNotFound(true); setLoading(false); return }
      if (data.profile_completed) { setAlreadyDone(true); setLoading(false); return }

      setBelieverId(data.id)
      setBelieverName(data.full_name)
      setLoading(false)
    }
    load()
  }, [token])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    const supabase = createClient()

    const { error: err } = await supabase
      .from('believers')
      .update({
        age: form.age ? parseInt(form.age) : null,
        gender: form.gender || null,
        country: form.country || null,
        city: form.city || null,
        church: form.church || null,
        date_of_conversion: form.date_of_conversion || null,
        how_came_to_christ: form.how_came_to_christ || null,
        prayer_needs: form.prayer_needs || null,
        language: form.language,
        profile_completed: true,
      })
      .eq('id', believerId)

    if (err) { setError(err.message); setSaving(false); return }
    setDone(true)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f7f4] to-white">
        <div className="w-8 h-8 border-2 border-[#1F5E4A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f0f7f4] to-white px-6 text-center">
        <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-lg font-bold text-gray-700">Link not found</h2>
        <p className="text-gray-500 text-sm mt-2">This invite link is invalid or has expired.</p>
      </div>
    )
  }

  if (alreadyDone || done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f0f7f4] to-white px-6 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-20 h-20 bg-[#1F5E4A] rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#1F5E4A]">
            {alreadyDone ? 'Profile already set up!' : `Welcome, ${believerName}!`}
          </h2>
          <p className="text-gray-500 text-sm mt-3 max-w-xs mx-auto">
            {alreadyDone
              ? 'Your profile has already been completed. Your discipler has been notified.'
              : 'Your profile is set up. Your discipler will be in touch to walk with you on this journey. 🙏'}
          </p>
        </motion.div>
      </div>
    )
  }

  const slide = { enter: { x: 40, opacity: 0 }, center: { x: 0, opacity: 1 }, exit: { x: -40, opacity: 0 } }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7f4] to-white px-4 py-10">
      <div className="max-w-sm mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#1F5E4A] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">F</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1F5E4A]">Hi, {believerName}! 👋</h1>
          <p className="text-gray-500 text-sm mt-1.5">
            Help us know you better — it only takes a minute.
          </p>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2].map(n => (
            <div key={n} className={`rounded-full transition-all duration-300 ${
              n === step ? 'w-6 h-2 bg-[#1F5E4A]' : n < step ? 'w-2 h-2 bg-[#1F5E4A]' : 'w-2 h-2 bg-gray-200'
            }`} />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <AnimatePresence mode="wait">

            {/* Step 1 — Where are you from? */}
            {step === 1 && (
              <motion.div key="s1" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }} className="space-y-4">
                <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#1F5E4A]" /> A bit about you
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Age</label>
                    <Input type="number" placeholder="25" value={form.age} onChange={e => set('age', e.target.value)} className="h-10" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Gender</label>
                    <select value={form.gender} onChange={e => set('gender', e.target.value)} className="w-full h-10 border border-gray-200 rounded-md text-sm bg-white px-3 focus:outline-none focus:border-[#1F5E4A]">
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Country</label>
                    <Input placeholder="Nigeria" value={form.country} onChange={e => set('country', e.target.value)} className="h-10" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">City</label>
                    <Input placeholder="Lagos" value={form.city} onChange={e => set('city', e.target.value)} className="h-10" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Church (if any)</label>
                  <div className="relative">
                    <Church className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <Input placeholder="Your local church" value={form.church} onChange={e => set('church', e.target.value)} className="pl-8 h-10" />
                  </div>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full h-11 bg-[#1F5E4A] hover:bg-[#174d3c] text-white font-semibold rounded-xl flex items-center justify-center gap-1.5"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* Step 2 — Faith story */}
            {step === 2 && (
              <motion.div key="s2" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }} className="space-y-4">
                <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#1F5E4A]" /> Your faith story
                </h2>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Date you gave your life to Christ</label>
                  <Input type="date" value={form.date_of_conversion} onChange={e => set('date_of_conversion', e.target.value)} className="h-10" />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">How did you come to Christ? <span className="text-gray-400 font-normal">(optional)</span></label>
                  <Textarea
                    placeholder="Share a little about how you came to faith…"
                    value={form.how_came_to_christ}
                    onChange={e => set('how_came_to_christ', e.target.value)}
                    className="min-h-[80px] resize-none text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Prayer needs <span className="text-gray-400 font-normal">(optional)</span></label>
                  <Textarea
                    placeholder="What would you like prayer for?"
                    value={form.prayer_needs}
                    onChange={e => set('prayer_needs', e.target.value)}
                    className="min-h-[70px] resize-none text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Preferred language</label>
                  <select value={form.language} onChange={e => set('language', e.target.value)} className="w-full h-10 border border-gray-200 rounded-md text-sm bg-white px-3 focus:outline-none focus:border-[#1F5E4A]">
                    {['English','Yoruba','Igbo','Hausa','French','Swahili','Portuguese'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>

                {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-11 rounded-xl">Back</Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 h-11 bg-[#1F5E4A] hover:bg-[#174d3c] text-white font-semibold rounded-xl"
                  >
                    {saving
                      ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</span>
                      : 'Complete Profile 🙏'
                    }
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
