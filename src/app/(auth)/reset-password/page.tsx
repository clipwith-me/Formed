"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthShell } from "@/components/formed/AuthShell"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) setSessionReady(true)
    })

    const code = new URLSearchParams(window.location.search).get("code")
    const init = async () => {
      if (code) {
        const { error: exErr } = await supabase.auth.exchangeCodeForSession(code)
        if (exErr) {
          setError("This reset link has expired or was already used. Request a new one.")
          return
        }
        window.history.replaceState(null, "", "/reset-password")
      }
      const { data } = await supabase.auth.getSession()
      if (data.session) setSessionReady(true)
    }
    init()

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password.length < 8) { setError("Password must be at least 8 characters."); return }
    if (password !== confirm) { setError("Passwords do not match."); return }
    setLoading(true)

    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) { setError(err.message); setLoading(false); return }

    setDone(true)
    setTimeout(() => router.push("/home"), 2500)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f7f4] to-white px-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-sm">
          <div className="w-20 h-20 bg-[#1F5E4A] rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-black text-[#1F5E4A] mb-2">Password updated!</h2>
          <p className="text-gray-500 text-sm">Taking you back to your home feed…</p>
        </motion.div>
      </div>
    )
  }

  return (
    <AuthShell>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-medium text-[#123A2E]">Set a new password.</h1>
          <p className="mt-2 text-[#5E6B65]">Choose a strong password for your account.</p>
        </div>

        {!sessionReady && !error && (
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Verifying your reset link… If this persists, request a new one.
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">New password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type={showPw ? "text" : "password"}
                placeholder="Min 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-10 pr-10 h-11"
                required
              />
              <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Confirm password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type={showPw ? "text" : "password"}
                placeholder="Repeat your password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="pl-10 h-11"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !password || !confirm || !sessionReady}
            className="w-full h-12 bg-[#1F5E4A] hover:bg-[#174d3c] text-white font-semibold rounded-full"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating…
              </span>
            ) : "Update Password"}
          </Button>

          <p className="text-center text-sm text-gray-400">
            Remembered it?{" "}
            <Link href="/login" className="text-[#1F5E4A] font-semibold hover:underline">Sign in</Link>
          </p>
        </form>
      </motion.div>
    </AuthShell>
  )
}
