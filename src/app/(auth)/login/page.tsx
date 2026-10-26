'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { AuthShell } from '@/components/formed/AuthShell'

function safeRedirect(path: string | null) {
  return path && path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\') ? path : '/home'
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const justRegistered = searchParams.get('confirm') === '1'
  const callbackFailed = searchParams.get('error') === 'auth_callback_failed'
  const redirectTo = safeRedirect(searchParams.get('redirect'))
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState(callbackFailed ? 'That sign-in link has expired or was already used. Please sign in again.' : '')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })

    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'That email and password don’t match. Check them and try again.'
          : signInError.message === 'Email not confirmed'
            ? 'Please confirm your email first — check your inbox for the link we sent.'
            : signInError.message
      )
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    setError('')
    const supabase = createClient()
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}` },
    })
    if (oauthError) {
      setError('Google sign-in isn’t available right now. Please use your email and password.')
      setGoogleLoading(false)
    }
  }

  return (
    <AuthShell>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-medium text-[#123A2E]">Welcome back.</h1>
        <p className="mt-2 text-[#5E6B65]">Sign in to continue your journey.</p>

        <div className="mt-8 space-y-4">
          {justRegistered && (
            <div className="flex items-start gap-2 rounded-xl border border-[#1F5E4A]/20 bg-[#EEF4F0] p-3 text-sm text-[#1F5E4A]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Account created. Check your email to confirm, then sign in.</span>
            </div>
          )}
          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSignIn} className="mt-4 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#1C2B25]">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A948F]" />
              <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="h-12 rounded-xl border-[#E4DDCC] bg-white pl-10" required />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-[#1C2B25]">Password</label>
              <Link href="/forgot-password" className="text-sm font-medium text-[#1F5E4A] hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A948F]" />
              <Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} className="h-12 rounded-xl border-[#E4DDCC] bg-white pl-10 pr-11" required />
              <button type="button" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#8A948F] hover:text-[#1C2B25]">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1F5E4A] font-semibold text-white transition hover:brightness-110 disabled:opacity-70">
            {loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Signing in…</> : 'Sign in'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#8A948F]">
          <span className="h-px flex-1 bg-[#E4DDCC]" />or<span className="h-px flex-1 bg-[#E4DDCC]" />
        </div>

        <button type="button" onClick={handleGoogle} disabled={googleLoading} className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[#E4DDCC] bg-white font-medium text-[#1C2B25] transition hover:border-[#1F5E4A]/40 disabled:opacity-70">
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {googleLoading ? 'Opening Google…' : 'Continue with Google'}
        </button>

        <p className="mt-8 text-center text-sm text-[#5E6B65]">
          New to FORMED?{' '}
          <Link href="/register" className="font-semibold text-[#1F5E4A] hover:underline">Create a free account</Link>
        </p>
      </motion.div>
    </AuthShell>
  )
}
