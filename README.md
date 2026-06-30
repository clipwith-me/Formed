# FORMED — The Operating System for Global Discipleship

> *Discipleship. Simplified.*

FORMED is a production-grade, mobile-first Christian discipleship platform designed to ensure every new believer is followed up, discipled, encouraged, and eventually becomes a disciple-maker.

---

## Vision

To build the operating system for global discipleship — making disciple-making simple, accessible, personal, and beautiful for individuals, churches, and ministries worldwide.

**Mission:** Every new believer has someone walking with them until they become mature disciples who make disciples.

---

## Features

### Core Modules
- **Home Feed** — Daily verse, devotionals, prayer prompts, testimonies, mentor suggestions
- **Discipleship Journey** — 365-day structured journey with lessons, scripture, reflection, and action steps
- **Follow-up System** — Register, assign, and track new believers through their discipleship journey
- **Prayer Wall** — Community prayer requests, answered prayers, prayer partners
- **Community Feed** — Testimonies, articles, encouragement, praise reports
- **Mentorship** — Request and manage mentoring relationships
- **Messaging** — Real-time chat between mentors and disciples

### User Roles
| Role | Access |
|------|--------|
| Believer | Content, community, mentorship requests |
| Follow-up Volunteer | Accept & track believer assignments |
| Mentor | Manage disciples, group sessions |
| Church Admin | Member management, reports, events |
| Admin | Platform-wide moderation & analytics |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI + shadcn-style |
| Animations | Framer Motion |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| State | TanStack Query |
| Forms | React Hook Form + Zod |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/your-org/formed
cd formed
npm install
```

### 2. Set Up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in your Supabase SQL editor
3. Copy your project URL and anon key

### 3. Configure Environment
```bash
cp .env.example .env.local
```

Fill in:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Dev Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database Schema

Full schema in `supabase/schema.sql`:

- `profiles` — Extended user profiles with role, streak tracking
- `posts` — Community feed posts (testimonies, articles, prayer, etc.)
- `believers` — New believer registrations for follow-up
- `followup_sessions` — Logged follow-up sessions
- `discipleship_lessons` — 365-day journey content (7 days seeded)
- `lesson_progress` — Per-user lesson completion tracking
- `prayer_requests` — Public/private prayer requests
- `mentorships` — Mentor-mentee relationships
- `notifications` — In-app notification system
- `badges_earned` — Gamification badges

Row Level Security (RLS) enabled on all tables.

---

## Brand

| Color | Hex | Usage |
|-------|-----|-------|
| Forest Green | `#1F5E4A` | Primary, CTAs, active states |
| Warm Gold | `#D4A72C` | Accents, scripture, achievements |
| Charcoal | `#222222` | Body text |
| Cream | `#FAFAF8` | Light mode background |
| Deep Dark | `#0F1A16` | Dark mode background |

---

## Deployment

```bash
vercel --prod
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel Dashboard.

---

## Scripture Foundation

> *"Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you."*
> — Matthew 28:19-20

---

Built for the Kingdom. MIT License.
