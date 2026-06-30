'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Church, MapPin, Globe, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/lib/types'

const ROLES: { key: UserRole; label: string; description: string; emoji: string }[] = [
  { key: 'BELIEVER', label: 'New Believer', description: 'I recently gave my life to Christ', emoji: '🌱' },
  { key: 'VOLUNTEER', label: 'Volunteer', description: 'I want to help disciple new believers', emoji: '🤝' },
  { key: 'MENTOR', label: 'Mentor', description: 'I mentor and coach others in their faith', emoji: '✨' },
]

const COUNTRIES = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United States', 'United Kingdom', 'Canada', 'Other']

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'BELIEVER' as UserRole,
    church_name: '',
    country: '',
    city: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          role: form.role,
          church_name: form.church_name || null,
          country: form.country || null,
          city: form.city || null,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Could not create your account. Please try again.')
      setLoading(false)
      return
    }

    // The profiles row is created server-side by a trigger on auth.users
    // (see supabase/schema.sql), since RLS blocks a client-side insert
    // before the user's email is confirmed.
    setLoading(false)

    if (!data.session) {
      // Email confirmation required before a session exists
      router.push('/login?confirm=1')
      return
    }

    router.push('/home')
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir * 60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: -dir * 60, opacity: 0 }),
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f7f4] via-white to-[#fdf8ec] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <span className="text-3xl font-extrabold text-[#1F5E4A]">FORMED</span>
          <span className="text-3xl font-extrabold text-[#D4A72C]">.</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  s < step
                    ? 'bg-[#1F5E4A] text-white'
                    : s === step
                    ? 'bg-[#1F5E4A] text-white ring-4 ring-[#1F5E4A]/20'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              {s < 3 && (
                <div className={`w-8 h-0.5 transition-all duration-300 ${s < step ? 'bg-[#1F5E4A]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#1F5E4A] via-[#2d7a61] to-[#D4A72C]" />
          <CardContent className="p-8">
            <AnimatePresence mode="wait" custom={1}>
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Create your account</h2>
                  <p className="text-gray-500 text-sm mb-6">Your journey starts here</p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="John Doe"
                          value={form.full_name}
                          onChange={e => set('full_name', e.target.value)}
                          className="pl-10 h-11 border-gray-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={e => set('email', e.target.value)}
                          className="pl-10 h-11 border-gray-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={form.password}
                          onChange={e => set('password', e.target.value)}
                          className="pl-10 pr-10 h-11 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!form.full_name || !form.email || !form.password}
                      className="w-full h-11 bg-[#1F5E4A] hover:bg-[#174d3c] text-white font-semibold rounded-xl"
                    >
                      Continue
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Who are you?</h2>
                  <p className="text-gray-500 text-sm mb-6">Choose the role that best describes you</p>

                  <div className="space-y-3 mb-6">
                    {ROLES.map(role => (
                      <button
                        key={role.key}
                        onClick={() => set('role', role.key)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                          form.role === role.key
                            ? 'border-[#1F5E4A] bg-[#f0f7f4]'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{role.emoji}</span>
                          <div>
                            <p className={`font-semibold text-sm ${form.role === role.key ? 'text-[#1F5E4A]' : 'text-gray-900'}`}>
                              {role.label}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
                          </div>
                          {form.role === role.key && (
                            <div className="ml-auto w-5 h-5 rounded-full bg-[#1F5E4A] flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-11 rounded-xl">Back</Button>
                    <Button
                      onClick={() => setStep(3)}
                      className="flex-1 h-11 bg-[#1F5E4A] hover:bg-[#174d3c] text-white font-semibold rounded-xl"
                    >
                      Continue
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Your location</h2>
                  <p className="text-gray-500 text-sm mb-6">Help us connect you with your local community</p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Church (optional)</label>
                      <div className="relative">
                        <Church className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Your church name"
                          value={form.church_name}
                          onChange={e => set('church_name', e.target.value)}
                          className="pl-10 h-11 border-gray-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Country</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                        <select
                          value={form.country}
                          onChange={e => set('country', e.target.value)}
                          className="w-full pl-10 h-11 border border-gray-200 rounded-md text-sm bg-white appearance-none focus:outline-none focus:border-[#1F5E4A]"
                        >
                          <option value="">Select country</option>
                          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">City</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Your city"
                          value={form.city}
                          onChange={e => set('city', e.target.value)}
                          className="pl-10 h-11 border-gray-200"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-11 rounded-xl">Back</Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 h-11 bg-[#1F5E4A] hover:bg-[#174d3c] text-white font-semibold rounded-xl"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Creating...
                          </span>
                        ) : 'Create my account'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-[#1F5E4A] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
