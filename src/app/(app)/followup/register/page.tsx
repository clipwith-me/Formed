'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Phone, Mail, MapPin, Church, Heart, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

const STEPS = ['Personal Info', 'Faith Journey', 'Prayer & Consent']

export default function RegisterBelieverPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    gender: '',
    age: '',
    country: '',
    city: '',
    church: '',
    date_of_conversion: '',
    how_came_to_christ: '',
    prayer_needs: '',
    language: 'English',
    consent: false,
  })

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('You must be signed in.'); setLoading(false); return }

    const { error: err } = await supabase.from('believers').insert({
      registered_by: user.id,
      full_name: form.full_name,
      phone: form.phone || null,
      email: form.email || null,
      gender: form.gender || null,
      age: form.age ? parseInt(form.age) : null,
      country: form.country || null,
      city: form.city || null,
      church: form.church || null,
      date_of_conversion: form.date_of_conversion || null,
      how_came_to_christ: form.how_came_to_christ || null,
      prayer_needs: form.prayer_needs || null,
      language: form.language,
      consent: form.consent,
      status: 'NEW',
    })

    if (err) { setError(err.message); setLoading(false); return }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push('/followup'), 1500)
  }

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f7f4] to-white px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-20 h-20 bg-[#1F5E4A] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-[#1F5E4A]">Believer Registered!</h2>
          <p className="text-gray-500 text-sm mt-2">Redirecting to your follow-up hub…</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7f4] to-white px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1F5E4A]">Register New Believer</h1>
          <p className="text-gray-500 text-sm mt-1">Record someone who has given their life to Christ</p>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => {
            const s = i + 1
            return (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                    s < step ? 'bg-[#1F5E4A] border-[#1F5E4A] text-white'
                    : s === step ? 'border-[#1F5E4A] text-[#1F5E4A] bg-white'
                    : 'border-gray-300 text-gray-400 bg-white'
                  }`}>
                    {s < step ? '✓' : s}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${s === step ? 'text-[#1F5E4A]' : 'text-gray-400'}`}>{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-5 transition-all duration-300 ${s < step ? 'bg-[#1F5E4A]' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#1F5E4A] to-[#D4A72C]" />
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="s1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#1F5E4A]" /> Personal Information
                  </h2>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name *</label>
                    <Input placeholder="John Okafor" value={form.full_name} onChange={e => set('full_name', e.target.value)} className="h-11" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input placeholder="+234..." value={form.phone} onChange={e => set('phone', e.target.value)} className="pl-9 h-11" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Age</label>
                      <Input type="number" placeholder="25" value={form.age} onChange={e => set('age', e.target.value)} className="h-11" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input type="email" placeholder="john@example.com" value={form.email} onChange={e => set('email', e.target.value)} className="pl-9 h-11" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Gender</label>
                    <div className="flex gap-3">
                      {['Male', 'Female', 'Other'].map(g => (
                        <button key={g} onClick={() => set('gender', g)} className={`flex-1 h-10 rounded-lg border-2 text-sm font-medium transition-all ${form.gender === g ? 'border-[#1F5E4A] bg-[#f0f7f4] text-[#1F5E4A]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{g}</button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={() => setStep(2)} disabled={!form.full_name} className="w-full h-11 bg-[#1F5E4A] hover:bg-[#174d3c] text-white font-semibold rounded-xl mt-2">Continue</Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Church className="w-5 h-5 text-[#1F5E4A]" /> Faith Journey
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Country</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input placeholder="Nigeria" value={form.country} onChange={e => set('country', e.target.value)} className="pl-9 h-11" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">City</label>
                      <Input placeholder="Lagos" value={form.city} onChange={e => set('city', e.target.value)} className="h-11" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Church</label>
                    <Input placeholder="Local church name" value={form.church} onChange={e => set('church', e.target.value)} className="h-11" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Date of Conversion</label>
                    <Input type="date" value={form.date_of_conversion} onChange={e => set('date_of_conversion', e.target.value)} className="h-11" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">How did they come to Christ?</label>
                    <Textarea placeholder="Describe how they gave their life to Christ..." value={form.how_came_to_christ} onChange={e => set('how_came_to_christ', e.target.value)} className="min-h-[80px] resize-none" />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-11 rounded-xl">Back</Button>
                    <Button onClick={() => setStep(3)} className="flex-1 h-11 bg-[#1F5E4A] hover:bg-[#174d3c] text-white font-semibold rounded-xl">Continue</Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-[#1F5E4A]" /> Prayer & Consent
                  </h2>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Prayer Needs</label>
                    <Textarea placeholder="What would they like prayer for?" value={form.prayer_needs} onChange={e => set('prayer_needs', e.target.value)} className="min-h-[100px] resize-none" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Language</label>
                    <select value={form.language} onChange={e => set('language', e.target.value)} className="w-full h-11 border border-gray-200 rounded-md text-sm bg-white px-3 focus:outline-none focus:border-[#1F5E4A]">
                      {['English', 'Yoruba', 'Igbo', 'Hausa', 'French', 'Swahili', 'Portuguese'].map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div onClick={() => set('consent', !form.consent)} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.consent ? 'border-[#1F5E4A] bg-[#f0f7f4]' : 'border-gray-200'}`}>
                    <div className={`w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${form.consent ? 'border-[#1F5E4A] bg-[#1F5E4A]' : 'border-gray-300'}`}>
                      {form.consent && <span className="text-white text-xs">✓</span>}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-[#1F5E4A]" /> Consent given</p>
                      <p className="text-xs text-gray-500 mt-1">This person has consented to being contacted and followed up for discipleship purposes.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-11 rounded-xl">Back</Button>
                    <Button onClick={handleSubmit} disabled={loading || !form.consent} className="flex-1 h-11 bg-[#1F5E4A] hover:bg-[#174d3c] text-white font-semibold rounded-xl">
                      {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span> : 'Register Believer'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
