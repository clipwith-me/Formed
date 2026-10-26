"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    OneSignalDeferred?: ((OneSignal: any) => Promise<void>)[]
  }
}

export function OneSignalInit() {
  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
    if (!appId || appId === 'YOUR_APP_ID') return
    // The OneSignal app is registered to the production origin only; elsewhere init throws.
    if (window.location.hostname !== 'getformed.vercel.app') return

    // Dynamically load the OneSignal SDK to avoid SSR hydration mismatch
    const script = document.createElement('script')
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
    script.defer = true
    script.onload = () => initOneSignal(appId)
    document.head.appendChild(script)
  }, [])

  return null
}

function initOneSignal(appId: string) {
    // Initialize OneSignal
    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push(async function (OneSignal) {
      try {
        await OneSignal.init({
          appId,
          notifyButton: { enable: false },
        })

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Set external user ID so we can target this user from the server
        await OneSignal.login(user.id)
        // Prompt for permission if not already granted
        const permission = await OneSignal.Notifications.permissionNative
        if (permission === 'default') {
          await OneSignal.Notifications.requestPermission()
        }
      } catch {
        // User declined or browser doesn't support push — silent fail
      }
    })
}
