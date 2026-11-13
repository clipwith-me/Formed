"use client"

import { useEffect, useState } from "react"
import { WifiOff } from "lucide-react"

export function OfflineSupport() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/OneSignalSDKWorker.js").catch(() => {})
    }
    const update = () => setOffline(!navigator.onLine)
    update()
    window.addEventListener("online", update)
    window.addEventListener("offline", update)
    return () => {
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
    }
  }, [])

  if (!offline) return null

  return (
    <div role="status" className="fixed inset-x-0 top-0 z-[90] flex items-center justify-center gap-2 bg-[#123A2E] px-4 py-2 text-sm font-medium text-white" style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}>
      <WifiOff size={15} /> You&rsquo;re offline. Pages you&rsquo;ve opened before still work, and your Journey progress will sync when you&rsquo;re back online.
    </div>
  )
}
