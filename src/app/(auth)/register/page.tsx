'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Church, MapPin, Globe, AlertCircle, Sprout, HandHeart, Compass, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { AuthShell } from '@/components/formed/AuthShell'
import type { UserRole } from '@/lib/types'

const ROLES: { key: UserRole; label: string; description: string; icon: typeof Sprout }[] = [
  { key: 'BELIEVER', label: 'Believer', description: 'I want to grow in my faith', icon: Sprout },
  { key: 'VOLUNTEER', label: 'Volunteer', description: 'I want to help follow up new believers', icon: HandHeart },
  { key: 'MENTOR', label: 'Mentor', description: 'I disciple and coach others', icon: Compass },
]

const COUNTRIES = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United States', 'United Kingdom', 'Canada', 'Other']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const field = 'h-12 rounded-xl border-[#E4DDCC] bg-white pl-10'
const label = 'mb-1.5 block text-sm font-medium text-[#1C2B25]'
const primary = 'flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#1F5E4A] font-semibold text-white transition hover:brightness-110 disabled:opacity-60'
const secondary = 'h-12 flex-1 rounded-full border border-[#E4DDCC] bg-white font-medium text-[#1C2B25] transition hover:border-[#1F5E4A]/40'

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

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const nextFromAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.full_name.trim().length < 2) return setError('Please enter your full name.')
    if (!EMAIL_RE.test(form.email.trim())) return setError('Please enter a valid email address.')
    if (form.password.length < 8) return setError('Your password needs at least 8 characters.')
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/home`,
        data: {
          full_name: form.full_name.trim(),
          role: form.role,
          church_name: form.church_name.trim() || null,
          country: form.country || null,
          city: form.city.trim() || null,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Supabase hides existing accounts by returning a user with no identities.
    if (!data.user || data.user.identities?.length === 0) {
      setError('An account with this email already exists. Try signing in instead.')
      setLoading(false)
      setStep(1)
      return
    }

    setLoading(false)
    router.push(data.session ? '/home' : '/login?confirm=1')
  }

  const errorBox =
    error ? (
      <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{error}</span>
      </div>
    ) : null

  return (
    <AuthShell>
      <div className="mb-8 flex items-center gap-2" aria-label={`Step ${step} of 3`}>
        {[1, 2, 3].map(s => (
          <span key={s} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${s <= step ? 'bg-[#1F5E4A]' : 'bg-[#E4DDCC]'}`} />
        ))}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#C9A13B]">Step {step} of 3</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          {step === 1 && (
            <form onSubmit={nextFromAccount} noValidate>
              <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl font-medium text-[#123A2E]">Begin your journey.</h1>
              <p className="mt-2 text-[#5E6B65]">Free for every believer. Takes a minute.</p>
              <div className="mt-8 space-y-4">
                {errorBox}
                <div>
                  <label htmlFor="name" className={label}>Full name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A948F]" />
                    <Input id="name" autoComplete="name" placeholder="Your full name" value={form.full_name} onChange={e => set('full_name', e.target.value)} className={field} />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className={label}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A948F]" />
                    <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} className={field} />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className={label}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A948F]" />
                    <Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={e => set('password', e.target.value)} className={`${field} pr-11`} />
                    <button type="button" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#8A948F] hover:text-[#1C2B25]">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex pt-2"><button type="submit" className={primary}>Continue</button></div>
              </div>
            </form>
          )}

          {step === 2 && (
            <div>
              <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl font-medium text-[#123A2E]">How will you take part?</h1>
              <p className="mt-2 text-[#5E6B65]">You can change this later.</p>
              <div className="mt-8 space-y-3" role="radiogroup">
                {ROLES.map(role => {
                  const active = form.role === role.key
                  return (
                    <button
                      key={role.key}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => set('role', role.key)}
                      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${active ? 'border-[#1F5E4A] bg-[#EEF4F0]' : 'border-[#E4DDCC] bg-white hover:border-[#1F5E4A]/40'}`}
                    >
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-[#1F5E4A] text-white' : 'bg-[#F5F1E8] text-[#1F5E4A]'}`}>
                        <role.icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-[#123A2E]">{role.label}</span>
                        <span className="block text-sm text-[#5E6B65]">{role.description}</span>
                      </span>
                      {active && <Check className="h-5 w-5 text-[#1F5E4A]" />}
                    </button>
                  )
                })}
              </div>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setStep(1)} className={secondary}>Back</button>
                <button type="button" onClick={() => setStep(3)} className={primary}>Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl font-medium text-[#123A2E]">Where are you?</h1>
              <p className="mt-2 text-[#5E6B65]">Helps us connect you with believers near you. All optional.</p>
              <div className="mt-8 space-y-4">
                <div>
                  <label htmlFor="church" className={label}>Church</label>
                  <div className="relative">
                    <Church className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A948F]" />
                    <Input id="church" placeholder="Your church name" value={form.church_name} onChange={e => set('church_name', e.target.value)} className={field} />
                  </div>
                </div>
                <div>
                  <label htmlFor="country" className={label}>Country</label>
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#8A948F]" />
                    <select id="country" value={form.country} onChange={e => set('country', e.target.value)} className="h-12 w-full appearance-none rounded-xl border border-[#E4DDCC] bg-white pl-10 pr-4 text-sm focus:border-[#1F5E4A] focus:outline-none">
                      <option value="">Select country</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="city" className={label}>City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A948F]" />
                    <Input id="city" autoComplete="address-level2" placeholder="Your city" value={form.city} onChange={e => set('city', e.target.value)} className={field} />
                  </div>
                </div>
                {errorBox}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(2)} className={secondary}>Back</button>
                  <button type="submit" disabled={loading} className={primary}>
                    {loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Creating…</> : 'Create account'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </motion.div>
      </AnimatePresence>

      <p className="mt-8 text-center text-sm text-[#5E6B65]">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-[#1F5E4A] hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  )
}
