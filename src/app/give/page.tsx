import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"

export const metadata: Metadata = {
  title: "Give",
  description: "Help every new believer have someone to walk with them. Support the work of FORMED.",
  openGraph: { images: [{ url: "/film/give.jpg" }] },
}

const serif = "font-[family-name:var(--font-cormorant)]"
const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.28em]"

const USES = [
  { title: "Keeping it free", body: "Hosting and tools that keep FORMED free for every believer, on any phone." },
  { title: "Equipping churches", body: "Training follow-up teams so no new believer is forgotten after the altar call." },
  { title: "Sound teaching", body: "Reviewing lessons carefully and securing permission to share trusted teaching." },
]

export default function GivePage() {
  const raw = process.env.NEXT_PUBLIC_GIVE_URL?.trim()
  const giveUrl = raw?.startsWith("https://") ? raw : null
  const bank = process.env.NEXT_PUBLIC_GIVE_BANK_NAME?.trim()
  const accountName = process.env.NEXT_PUBLIC_GIVE_ACCOUNT_NAME?.trim()
  const accountNumber = process.env.NEXT_PUBLIC_GIVE_ACCOUNT_NUMBER?.trim()
  const hasBank = bank && accountName && accountNumber
  const open = giveUrl || hasBank

  return (
    <div className="min-h-screen w-full bg-[#FBF9F4] text-[#1C2B25]">
      <section className="relative overflow-hidden bg-[#0E2A22] text-[#F7F2E7]">
        <img src="/film/give.jpg" alt="An empty chair with a Bible on it in a quiet church hall" className="absolute inset-0 h-full w-full object-cover object-[70%_70%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E2A22] via-[#0E2A22]/85 to-[#0E2A22]/10" />
        <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8 lg:pb-36">
          <Link href="/" className="text-lg font-bold tracking-[0.18em]">FORMED</Link>
          <div className="mt-20 max-w-xl lg:mt-28">
            <p className={eyebrow} style={{ color: "#E2BE5C" }}>Give</p>
            <h1 className={`${serif} mt-4 text-5xl font-medium leading-[1.02] sm:text-7xl`} style={{ textWrap: "balance" }}>
              Someone will sit here for the first time. <em className="text-[#E2BE5C]">Help them stay.</em>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-[#F7F2E7]/85">
              Your gift helps churches walk with every new believer until they become disciples who make disciples.
            </p>
            {giveUrl && (
              <a href={giveUrl} target="_blank" rel="noopener noreferrer" className="mt-9 inline-flex h-14 items-center gap-2 rounded-full bg-[#E2BE5C] px-9 font-semibold text-[#123A2E] transition hover:brightness-105">
                Give now <ArrowRight size={18} />
              </a>
            )}
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

      <section className="bg-[#F5F1E8] px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className={`${serif} text-4xl font-medium leading-tight text-[#123A2E] sm:text-5xl`}>
              {open ? "Ways to give" : "Giving opens soon"}
            </h2>
            <blockquote className={`${serif} mt-6 text-2xl italic text-[#1F5E4A]`}>
              &ldquo;God loves a cheerful giver.&rdquo;
              <cite className="mt-2 block text-sm font-semibold not-italic tracking-wider text-[#9A7518]">2 Corinthians 9:7</cite>
            </blockquote>
          </div>
          <div className="space-y-4">
            {giveUrl && (
              <div className="rounded-2xl bg-white p-6">
                <h3 className="font-semibold text-[#123A2E]">Give online</h3>
                <p className="mt-1 text-sm text-[#59665F]">Pay securely by card, bank transfer or USSD.</p>
                <a href={giveUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-[#1F5E4A] px-6 text-sm font-semibold text-white">
                  Continue to secure payment <ArrowRight size={15} />
                </a>
              </div>
            )}
            {hasBank && (
              <div className="rounded-2xl bg-white p-6">
                <h3 className="font-semibold text-[#123A2E]">Bank transfer</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-[#59665F]">Bank</dt><dd className="font-semibold">{bank}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-[#59665F]">Account name</dt><dd className="text-right font-semibold">{accountName}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-[#59665F]">Account number</dt><dd className="font-semibold tabular-nums select-all">{accountNumber}</dd></div>
                </dl>
              </div>
            )}
            {!open && (
              <div className="rounded-2xl bg-white p-6">
                <p className="leading-relaxed text-[#59665F]">We&rsquo;re setting up a secure way to receive gifts. If you&rsquo;d like to support FORMED now, please speak with our founder.</p>
                <p className="mt-3 font-semibold text-[#123A2E]">John Kolawole &middot; 0812 198 7372</p>
              </div>
            )}
            <ul className="space-y-2 pt-2 text-sm text-[#59665F]">
              <li className="flex items-center gap-2"><Check size={15} className="text-[#9A7518]" /> FORMED stays free for every believer.</li>
              <li className="flex items-center gap-2"><Check size={15} className="text-[#9A7518]" /> Giving is always voluntary.</li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="bg-[#123A2E] px-5 py-8 text-center text-sm text-white/60">
        <Link href="/" className="underline">Back to FORMED</Link>
      </footer>
    </div>
  )
}
