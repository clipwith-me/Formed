"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, Check, Heart, Share2, ShieldCheck } from "lucide-react"
import { CopyDetail } from "@/components/formed/CopyDetail"

const CURRENCIES = {
  NGN: {
    symbol: "₦",
    label: "Naira",
    amounts: [2000, 5000, 10000, 25000, 50000, 100000],
    note: "Transfer from any Nigerian bank.",
    details: [["Bank", "FCMB"], ["Account number", "6700430799"]],
  },
  USD: {
    symbol: "$",
    label: "US Dollars",
    amounts: [10, 25, 50, 100, 250, 500],
    note: "ACH or wire from within the United States.",
    details: [
      ["Bank", "Lead"],
      ["Account number", "210367365692"],
      ["ACH routing", "101019644"],
      ["Wire routing", "101019644"],
      ["Account type", "Checking"],
      ["Bank address", "1801 Main St., Kansas City, MO 64108"],
    ],
  },
} as const

type Currency = keyof typeof CURRENCIES

const SHARE_URL = "https://getformed.vercel.app/give"

export function GiveFlow({ cardUrl }: { cardUrl: string | null }) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [currency, setCurrency] = useState<Currency>("NGN")
  const [preset, setPreset] = useState<number | null>(5000)
  const [custom, setCustom] = useState("")

  const c = CURRENCIES[currency]
  const customValue = Number(custom.replace(/[^\d]/g, ""))
  const amount = custom ? customValue : preset ?? 0
  const display = `${c.symbol}${amount.toLocaleString("en-NG")}`

  const switchCurrency = (next: Currency) => {
    setCurrency(next)
    setPreset(next === "NGN" ? 5000 : 25)
    setCustom("")
  }

  const share = async () => {
    const text = "Help every new believer have someone to walk with them."
    try {
      if (navigator.share) await navigator.share({ text, url: SHARE_URL })
      else await navigator.clipboard.writeText(`${text} ${SHARE_URL}`)
    } catch {}
  }

  return (
    <div className="w-full rounded-3xl bg-white p-6 text-[#1C2B25] shadow-[0_30px_70px_-30px_rgba(0,0,0,0.65)] sm:p-7">
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold text-[#123A2E]">Make a gift</h2>
          <div className="mt-4 grid grid-cols-2 rounded-full bg-[#F1ECDF] p-1" role="radiogroup" aria-label="Currency">
            {(Object.keys(CURRENCIES) as Currency[]).map(k => (
              <button key={k} type="button" role="radio" aria-checked={currency === k} onClick={() => switchCurrency(k)} className={`h-10 rounded-full text-sm font-semibold transition ${currency === k ? "bg-[#1F5E4A] text-white" : "text-[#59665F]"}`}>
                {CURRENCIES[k].label}
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {c.amounts.map(a => {
              const active = !custom && preset === a
              return (
                <button key={a} type="button" aria-pressed={active} onClick={() => { setPreset(a); setCustom("") }} className={`h-14 rounded-xl border text-base font-bold tabular-nums transition ${active ? "border-[#1F5E4A] bg-[#EEF4F0] text-[#1F5E4A]" : "border-[#E2DBCA] text-[#123A2E] hover:border-[#1F5E4A]/40"}`}>
                  {c.symbol}{a.toLocaleString("en-NG")}
                </button>
              )
            })}
          </div>
          <label htmlFor="give-custom" className="mt-4 block text-sm font-medium text-[#59665F]">Or enter your own amount</label>
          <div className="relative mt-1.5">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#59665F]">{c.symbol}</span>
            <input id="give-custom" inputMode="numeric" value={custom} onChange={e => setCustom(e.target.value.replace(/[^\d]/g, ""))} placeholder="Amount" className="h-12 w-full rounded-xl border border-[#E2DBCA] pl-9 pr-4 font-semibold tabular-nums focus:border-[#1F5E4A] focus:outline-none" />
          </div>
          <button type="button" disabled={amount <= 0} onClick={() => setStep(2)} className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#1F5E4A] font-semibold text-white transition hover:brightness-110 disabled:opacity-50">
            Give {amount > 0 ? display : ""} <ArrowRight size={18} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm font-semibold text-[#1F5E4A]"><ArrowLeft size={15} /> Change amount</button>
          <p className="mt-4 text-sm text-[#59665F]">Your gift</p>
          <p className="text-4xl font-bold tabular-nums text-[#123A2E]">{display}</p>

          {cardUrl && (
            <a href={cardUrl} target="_blank" rel="noopener noreferrer" className="mt-4 flex h-12 items-center justify-center gap-2 rounded-full bg-[#1F5E4A] text-sm font-semibold text-white">
              Pay by card <ArrowRight size={15} />
            </a>
          )}

          <div className="mt-4 rounded-2xl bg-[#FBF9F4] px-4 py-2">
            <p className="py-2 text-sm font-semibold text-[#123A2E]">Send by bank transfer</p>
            <p className="pb-1 text-xs text-[#59665F]">{c.note} Tap a detail to copy it.</p>
            <CopyDetail label="Amount" value={String(amount)} />
            {c.details.map(([label, value]) => <CopyDetail key={label} label={label} value={value} />)}
          </div>
          <p className="mt-3 text-xs font-medium text-[#123A2E]">Account held by John Kolawole, founder of FORMED.</p>
          <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-[#59665F]">
            <ShieldCheck size={14} className="mt-px shrink-0 text-[#9A7518]" />
            FORMED will never ask for your PIN, OTP or card details. Questions? Call 0812 198 7372.
          </p>
          <button type="button" onClick={() => setStep(3)} className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#1F5E4A] font-semibold text-white transition hover:brightness-110">
            <Check size={18} /> I&rsquo;ve sent my gift
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="py-6 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF4F0] text-[#1F5E4A]"><Heart size={28} /></span>
          <h2 className="mt-5 font-[family-name:var(--font-cormorant)] text-4xl font-medium text-[#123A2E]">Thank you.</h2>
          <p className="mx-auto mt-3 max-w-xs leading-relaxed text-[#59665F]">Because of you, a new believer is closer to having someone walk with them. To let us know about your gift, message John on 0812 198 7372.</p>
          <p className="mt-5 font-[family-name:var(--font-cormorant)] text-xl italic text-[#1F5E4A]">&ldquo;God loves a cheerful giver.&rdquo;</p>
          <p className="text-xs font-semibold tracking-wider text-[#9A7518]">2 CORINTHIANS 9:7</p>
          <button type="button" onClick={share} className="mx-auto mt-6 flex h-12 items-center gap-2 rounded-full border border-[#E2DBCA] px-6 text-sm font-semibold text-[#123A2E]"><Share2 size={15} /> Invite a friend to give</button>
          <button type="button" onClick={() => { setStep(1); setCustom("") }} className="mt-3 text-sm font-semibold text-[#1F5E4A] underline">Give again</button>
        </div>
      )}
    </div>
  )
}
