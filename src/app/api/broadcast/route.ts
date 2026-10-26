import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendPushToAll } from '@/lib/onesignal'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only ADMIN role can broadcast
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((profile as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, message } = await req.json()
  if (!title?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })
  }

  // Get all user IDs except the sender
  const { data: profiles } = await supabase.from('profiles').select('id').neq('id', user.id)
  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const notifications = profiles.map((p: { id: string }) => ({
    user_id: p.id,
    title: title.trim(),
    message: message.trim(),
    type: 'BROADCAST',
    is_read: false,
  }))

  const { error } = await supabase.from('notifications').insert(notifications)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Also send real push notification via OneSignal
  await sendPushToAll(title.trim(), message.trim())

  return NextResponse.json({ sent: notifications.length })
}
