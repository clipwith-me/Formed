'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Phone, Mail, ShieldCheck, CheckCircle2, Copy, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

type ContactType = 'email' | 'phone'

export default function RegisterBelieverPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)

  const [name, setName] = useState('')
  const [contactType, setContactType] = useState<ContactType>('phone')
  const [contact, setContact] = useState('')
  const [consent, setConsent] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Please enter a name.'); return }
    if (!contact.trim()) { setError(`Please enter a ${contactType}.`); return }
    if (!consent) { setError('Please confirm the person has given consent.'); return }

    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('You must be signed in.'); setLoading(false); return }

    const { data, error: err } = await supabase
      .from('believers')
      .insert({
        registered_by: user.id,
        full_name: name.trim(),
        email: contactType === 'email' ? contact.trim() : null,
        phone: contactType === 'phone' ? contact.trim() : null,
        consent: true,
        status: 'NEW',
      })
      .select('invite_token')
      .single()

    if (err) { setError(err.message); setLoading(false); return }

    const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    setInviteLink(`${base}/welcome/${data?.invite_token}`)
    setDone(true)
    setLoading(false)
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const whatsappShare = () => {
    const msg = encodeURIComponent(
      `Hi ${name}! 🎉 Welcome to FORMED — a discipleship platform built to help you grow in your faith.\n\nTap the link below to set up your profile:\n${inviteLink}`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f0f7f4] to-white px-4 py-10">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm text-center"
        >
          <div className="w-16 h-16 bg-[#1F5E4A] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-[#1F5E4A]">{name} has been added!</h2>
          <p className="text-gray-500 text-sm mt-2 mb-6">
            Share this link so they can complete their profile at their own pace.
          </p>

          {/* Link box */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 text-left shadow-sm">
            <p className="text-xs text-gray-400 mb-1 font-medium">Personal invite link</p>
            <p className="text-sm text-[#1F5E4A] font-medium break-all">{inviteLink}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={copyLink}
              variant="outline"
              className="w-full h-11 rounded-xl border-[#1F5E4A] text-[#1F5E4A] font-semibold flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>

            <Button
              onClick={whatsappShare}
              className="w-full h-11 rounded-xl bg-[#25D366] hover:bg-[#1fb958] text-white font-semibold flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Send via WhatsApp
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.push('/followup')}
              className="w-full h-11 rounded-xl text-gray-500 font-medium"
            >
              Done — back to Follow-up
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7f4] to-white px-4 py-8">
      <div className="max-w-sm mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1F5E4A]">Add New Believer</h1>
          <p className="text-gray-500 text-sm mt-1">Just the basics — they&apos;ll complete the rest themselves.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="John Okafor"
                value={name}
                onChange={e => setName(e.target.value)}
                className="pl-9 h-11"
              />
            </div>
          </div>

          {/* Contact type toggle */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Contact *</label>
            <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-2">
              {(['phone', 'email'] as ContactType[]).map(t => (
                <button
                  key={t}
                  onClick={() => { setContactType(t); setContact('') }}
                  className={`flex-1 h-9 text-sm font-medium transition-all ${
                    contactType === t
                      ? 'bg-[#1F5E4A] text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {t === 'phone' ? 'Phone' : 'Email'}
                </button>
              ))}
            </div>
            <div className="relative">
              {contactType === 'phone'
                ? <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                : <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              }
              <Input
                type={contactType === 'email' ? 'email' : 'tel'}
                placeholder={contactType === 'phone' ? '+234 800 000 0000' : 'john@example.com'}
                value={contact}
                onChange={e => setContact(e.target.value)}
                className="pl-9 h-11"
              />
            </div>
          </div>

          {/* Consent */}
          <div
            onClick={() => setConsent(c => !c)}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              consent ? 'border-[#1F5E4A] bg-[#f0f7f4]' : 'border-gray-200'
            }`}
          >
            <div className={`w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
              consent ? 'border-[#1F5E4A] bg-[#1F5E4A]' : 'border-gray-300'
            }`}>
              {consent && <span className="text-white text-xs">✓</span>}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#1F5E4A]" /> Consent given
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                This person has agreed to be contacted for discipleship follow-up.
              </p>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading || !name || !contact || !consent}
            className="w-full h-12 bg-[#1F5E4A] hover:bg-[#174d3c] text-white font-semibold rounded-xl text-base"
          >
            {loading
              ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</span>
              : 'Add & Get Invite Link'
            }
          </Button>
        </div>
      </div>
    </div>
  )
}
