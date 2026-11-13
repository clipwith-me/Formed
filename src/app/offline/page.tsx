import type { Metadata } from "next"
import { WifiOff } from "lucide-react"

export const metadata: Metadata = { title: "You're offline" }

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-[#F7F3EA] px-6 text-center text-[#1C2B25]">
      <img src="/icons/icon-192.png" alt="FORMED" className="h-20 w-20 rounded-2xl" />
      <span className="mt-8 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#1F5E4A]"><WifiOff size={22} /></span>
      <h1 className="mt-5 font-[family-name:var(--font-cormorant)] text-4xl font-medium text-[#123A2E]">You&rsquo;re offline.</h1>
      <p className="mt-3 max-w-sm leading-relaxed text-[#59665F]">
        This page hasn&rsquo;t been saved on your phone yet. Pages you&rsquo;ve opened before, like your Journey, still work without internet.
      </p>
      <p className="mt-6 font-[family-name:var(--font-cormorant)] text-xl italic text-[#1F5E4A]">&ldquo;Your word is a lamp to my feet and a light to my path.&rdquo;</p>
      <p className="mt-1 text-xs font-semibold tracking-wider text-[#9A7518]">PSALM 119:105</p>
    </main>
  )
}
