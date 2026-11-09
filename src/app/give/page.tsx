import type { Metadata } from "next"
import Link from "next/link"
import { GiveFlow } from "@/components/formed/GiveFlow"

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

export default function GivePage() {
  const raw = process.env.NEXT_PUBLIC_GIVE_URL?.trim()
  const cardUrl = raw?.startsWith("https://") ? raw : null

  return (
    <div className="min-h-screen w-full bg-[#FBF9F4] text-[#1C2B25]">
      <section className="relative overflow-hidden bg-[#1A120B] text-[#FBF4E6]">
        <img src="/film/give-table.jpg" alt="An open Bible and two cups of tea on a wooden table in morning light" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-[#1A120B]/75" />
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 lg:pb-24">
          <Link href="/" className="text-lg font-bold tracking-[0.18em]">FORMED</Link>
          <div className="mt-10 grid items-center gap-10 lg:mt-16 lg:grid-cols-[1.1fr_minmax(0,430px)] lg:gap-16">
            <div className="min-w-0">
              <p className={eyebrow} style={{ color: "#E8C777" }}>Give</p>
              <h1 className={`${serif} mt-4 text-5xl font-medium leading-[1.02] sm:text-7xl`} style={{ textWrap: "balance" }}>
                Discipleship happens <em className="text-[#E8C777]">at a table for two.</em>
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-[#FBF4E6]/85">
                Your gift helps churches make sure every new believer has someone to sit with them, open the Word, and walk with them.
              </p>
            </div>
            <div className="min-w-0"><GiveFlow cardUrl={cardUrl} /></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
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

      <footer className="bg-[#123A2E] px-5 py-8 text-center text-sm text-white/60">
        <Link href="/" className="underline">Back to FORMED</Link>
      </footer>
    </div>
  )
}
