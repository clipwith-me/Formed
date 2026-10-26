const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID!
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY!

export async function sendPushToAll(title: string, message: string) {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) return { ok: false, error: 'OneSignal not configured' }

  const res = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      included_segments: ['Total Subscriptions'],
      headings: { en: title },
      contents: { en: message },
      web_url: 'https://getformed.vercel.app/home',
    }),
  })

  const json = await res.json()
  return { ok: res.ok, recipients: json.recipients, error: json.errors?.[0] }
}

export async function sendPushToUser(externalUserId: string, title: string, message: string) {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) return { ok: false }

  await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      include_aliases: { external_id: [externalUserId] },
      target_channel: 'push',
      headings: { en: title },
      contents: { en: message },
      web_url: 'https://getformed.vercel.app/home',
    }),
  })
}
