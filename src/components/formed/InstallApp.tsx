"use client"

import { useEffect, useState } from "react"
import { Download, Share, SquarePlus, X, MoreVertical } from "lucide-react"

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

let deferred: InstallEvent | null = null
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault()
    deferred = e as InstallEvent
  })
}

export function InstallAppButton({ className, label = "Get the app" }: { className?: string; label?: string }) {
  const [installed, setInstalled] = useState(false)
  const [help, setHelp] = useState<"ios" | "android" | null>(null)

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as Navigator & { standalone?: boolean }).standalone === true
    setInstalled(standalone)
    const done = () => setInstalled(true)
    window.addEventListener("appinstalled", done)
    return () => window.removeEventListener("appinstalled", done)
  }, [])

  if (installed) return null

  const install = async () => {
    if (deferred) {
      await deferred.prompt()
      await deferred.userChoice
      deferred = null
      return
    }
    setHelp(/iphone|ipad|ipod/i.test(navigator.userAgent) ? "ios" : "android")
  }

  return (
    <>
      <button type="button" onClick={install} className={className}>
        <Download size={16} /> {label}
      </button>
      {help && (
        <div role="dialog" aria-modal="true" aria-label="Install FORMED" className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={() => setHelp(null)}>
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-[#1C2B25]" style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src="/icons/icon-192.png" alt="" className="h-12 w-12 rounded-xl" />
                <div>
                  <p className="font-bold text-[#123A2E]">Install FORMED</p>
                  <p className="text-sm text-[#59665F]">Free. Opens like an app.</p>
                </div>
              </div>
              <button type="button" onClick={() => setHelp(null)} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100"><X size={16} /></button>
            </div>
            {help === "ios" ? (
              <ol className="mt-5 space-y-3 text-sm">
                <li className="flex items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF4F0] text-[#1F5E4A]"><Share size={16} /></span>Open this page in <b>Safari</b> and tap the <b>Share</b> button.</li>
                <li className="flex items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF4F0] text-[#1F5E4A]"><SquarePlus size={16} /></span>Scroll down and tap <b>Add to Home Screen</b>.</li>
                <li className="flex items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF4F0] font-bold text-[#1F5E4A]">3</span>Tap <b>Add</b>. FORMED appears on your home screen.</li>
              </ol>
            ) : (
              <ol className="mt-5 space-y-3 text-sm">
                <li className="flex items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF4F0] text-[#1F5E4A]"><MoreVertical size={16} /></span>Open this page in <b>Chrome</b> and tap the <b>⋮</b> menu.</li>
                <li className="flex items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF4F0] text-[#1F5E4A]"><SquarePlus size={16} /></span>Tap <b>Install app</b> or <b>Add to Home screen</b>.</li>
                <li className="flex items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF4F0] font-bold text-[#1F5E4A]">3</span>Tap <b>Install</b>. FORMED appears with your apps.</li>
              </ol>
            )}
          </div>
        </div>
      )}
    </>
  )
}
