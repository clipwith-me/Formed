import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ShieldCheck } from "lucide-react"
import { CopyDetail } from "@/components/formed/CopyDetail"

export const metadata: Metadata = {
  title: "Give",
  description: "Help every new believer have someone to walk with them. Support the work of FORMED.",
  openGraph: { images: [{ url: "/film/give-table.jpg" }] },
}

const serif = "font-[family-name:var(--font-cormorant)]"
const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.28em]"

const USES = [
  { title: "Keeping it free", body: "Hosting and tools that keep FORMED free for every believer, on any phone." },
  { title: "Equipping churches", body: "Training follow-up teams so no new believer is forgotten after the altar call." },
  { title: "Sound teaching", body: "Reviewing lessons carefully and securing permission to share trusted teaching." },
]

const ACCOUNTS = [
  {
    currency: "Naira",
    code: "NGN",
    note: "For gifts from within Nigeria.",
    details: [
      ["Bank", "FCMB"],
      ["Account number", "6700430799"],
    ],
  },
  {
    currency: "US Dollars",
    code: "USD",
    note: "For ACH or wire transfers from within the United States.",
    details: [
      ["Bank", "Lead"],
      ["Account number", "210367365692"],
      ["ACH routing", "101019644"],
      ["Wire routing", "101019644"],
      ["Account type", "Checking"],
      ["Bank address", "1801 Main St., Kansas City, MO 64108"],
    ],
  },
]

export default function GivePage() {
  const raw = process.env.NEXT_PUBLIC_GIVE_URL?.trim()
  const giveUrl = raw?.startsWith("https://") ? raw : null

  return (
    <div className="min-h-screen w-full bg-[#FBF9F4] text-[#1C2B25]">
      <section className="relative overflow-hidden bg-[#1A120B] text-[#FBF4E6]">
        <img src="/film/give-table.jpg" alt="An open Bible and two cups of tea on a wooden table in morning light" className="absolute inset-0 h-full w-full object-cover object-right" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A120B]/90 via-[#1A120B]/75 to-[#1A120B]/40 md:bg-gradient-to-r md:from-[#1A120B]/95 md:via-[#1A120B]/70 md:to-transparent" />
        <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8 lg:pb-36">
          <Link href="/" className="text-lg font-bold tracking-[0.18em]">FORMED</Link>
          <div className="mt-20 max-w-xl lg:mt-28">
            <p className={eyebrow} style={{ color: "#E8C777" }}>Give</p>
            <h1 className={`${serif} mt-4 text-5xl font-medium leading-[1.02] sm:text-7xl`} style={{ textWrap: "balance" }}>
              Discipleship happens <em className="text-[#E8C777]">at a table for two.</em>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-[#FBF4E6]/85">
              Your gift helps churches make sure every new believer has someone to sit with them, open the Word, and walk with them.
            </p>
            <a href={giveUrl ?? "#ways-to-give"} {...(giveUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="mt-9 inline-flex h-14 items-center gap-2 rounded-full bg-[#E8C777] px-9 font-semibold text-[#2A1C0E] transition hover:brightness-105">
              Give now <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <p className={eyebrow} style={{ color: "#9A7518" }}>What your gift makes possible</p>
        <div className="mt-8 grid gap-10 md:grid-cols-3">
          {USES.map(u => (
            <div key={u.title} className="border-t border-[#E2DBCA] pt-5">
              <h2 className={`${serif} text-3xl font-medium text-[#123A2E]`}>{u.title}</h2>
              <p className="mt-3 leading-relaxed text-[#59665F]">{u.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="ways-to-give" className="scroll-mt-4 bg-[#F5F1E8] px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div>
            <h2 className={`${serif} text-4xl font-medium leading-tight text-[#123A2E] sm:text-5xl`}>Ways to give</h2>
            <p className="mt-4 max-w-sm leading-relaxed text-[#59665F]">Tap any detail to copy it.</p>
            <blockquote className={`${serif} mt-8 text-2xl italic text-[#1F5E4A]`}>
              &ldquo;God loves a cheerful giver.&rdquo;
              <cite className="mt-2 block text-sm font-semibold not-italic tracking-wider text-[#9A7518]">2 Corinthians 9:7</cite>
            </blockquote>
          </div>
          <div className="min-w-0 space-y-4">
            {ACCOUNTS.map(a => (
              <div key={a.code} className="rounded-2xl bg-white p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-semibold text-[#123A2E]">{a.currency}</h3>
                  <span className="text-xs font-bold tracking-widest text-[#9A7518]">{a.code}</span>
                </div>
                <p className="mb-2 mt-1 text-sm text-[#59665F]">{a.note}</p>
                {a.details.map(([label, value]) => <CopyDetail key={label} label={label} value={value} />)}
              </div>
            ))}
            <p className="text-sm font-medium text-[#123A2E]">Account held by John Kolawole, founder of FORMED.</p>
            <p className="flex items-start gap-2 text-sm leading-relaxed text-[#59665F]">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#9A7518]" />
              FORMED will never ask for your PIN, OTP or card details. Questions? Call John Kolawole on 0812 198 7372.
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-[#123A2E] px-5 py-8 text-center text-sm text-white/60">
        <Link href="/" className="underline">Back to FORMED</Link>
      </footer>
    </div>
  )
}
