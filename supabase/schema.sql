-- Enable UUID and RLS
create extension if not exists "uuid-ossp";

-- PROFILES table (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  username text unique,
  bio text,
  avatar_url text,
  cover_url text,
  role text default 'BELIEVER' check (role in ('GUEST','BELIEVER','VOLUNTEER','MENTOR','CHURCH_ADMIN','ADMIN')),
  church_name text,
  country text,
  city text,
  date_of_conversion timestamptz,
  discipleship_day int default 1,
  prayer_streak int default 0,
  reading_streak int default 0,
  is_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- POSTS table
create table posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references profiles(id) on delete cascade,
  type text check (type in ('TESTIMONY','ARTICLE','PRAYER','QUESTION','PRAISE','MISSION_UPDATE')),
  title text,
  content text not null,
  image_url text,
  is_published boolean default true,
  like_count int default 0,
  comment_count int default 0,
  prayer_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- BELIEVERS (evangelism registrations)
create table believers (
  id uuid default uuid_generate_v4() primary key,
  registered_by uuid references profiles(id),
  assigned_to uuid references profiles(id),
  full_name text not null,
  phone text,
  email text,
  gender text,
  age int,
  country text,
  city text,
  language text default 'English',
  church text,
  date_of_conversion date,
  how_came_to_christ text,
  prayer_needs text,
  status text default 'NEW' check (status in ('NEW','ASSIGNED','IN_PROGRESS','COMPLETED','MENTORED','DISCIPLE_MAKER')),
  consent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- FOLLOWUP_SESSIONS
create table followup_sessions (
  id uuid default uuid_generate_v4() primary key,
  believer_id uuid references believers(id) on delete cascade,
  volunteer_id uuid references profiles(id),
  session_date timestamptz,
  type text check (type in ('CALL','CHAT','IN_PERSON','VIDEO')),
  notes text,
  duration_minutes int,
  created_at timestamptz default now()
);

-- DISCIPLESHIP_LESSONS
create table discipleship_lessons (
  id uuid default uuid_generate_v4() primary key,
  day_number int unique,
  title text not null,
  description text,
  content text,
  scripture text,
  scripture_ref text,
  reflection_question text,
  action_step text,
  created_at timestamptz default now()
);

-- LESSON_PROGRESS
create table lesson_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references discipleship_lessons(id),
  completed boolean default false,
  completed_at timestamptz,
  notes text,
  unique(user_id, lesson_id)
);

-- PRAYER_REQUESTS
create table prayer_requests (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references profiles(id) on delete cascade,
  title text,
  content text not null,
  is_answered boolean default false,
  is_public boolean default true,
  prayer_count int default 0,
  created_at timestamptz default now()
);

-- MENTORSHIP
create table mentorships (
  id uuid default uuid_generate_v4() primary key,
  mentor_id uuid references profiles(id),
  mentee_id uuid references profiles(id),
  status text default 'PENDING' check (status in ('PENDING','ACTIVE','PAUSED','COMPLETED')),
  started_at timestamptz,
  created_at timestamptz default now()
);

-- NOTIFICATIONS
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  type text,
  title text,
  body text,
  link text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- BADGES_EARNED
create table badges_earned (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  badge_key text,
  earned_at timestamptz default now(),
  unique(user_id, badge_key)
);

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table posts enable row level security;
alter table believers enable row level security;
alter table prayer_requests enable row level security;
alter table mentorships enable row level security;
alter table notifications enable row level security;
alter table lesson_progress enable row level security;
alter table badges_earned enable row level security;

-- Basic RLS policies
create policy "Public profiles" on profiles for select using (true);
create policy "Own profile" on profiles for all using (auth.uid() = id);
create policy "Public posts" on posts for select using (is_published = true);
create policy "Own posts" on posts for all using (auth.uid() = author_id);
create policy "Public prayer requests" on prayer_requests for select using (is_public = true);
create policy "Own prayer requests" on prayer_requests for all using (auth.uid() = author_id);
create policy "Own notifications" on notifications for all using (auth.uid() = user_id);
create policy "Own lesson progress" on lesson_progress for all using (auth.uid() = user_id);
create policy "Own badges" on badges_earned for select using (true);

-- Seed discipleship lessons
insert into discipleship_lessons (day_number, title, scripture, scripture_ref, description, reflection_question, action_step) values
(1, 'Welcome to the Family', 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.', 'John 3:16', 'You have made the most important decision of your life. Today we celebrate your new birth and help you understand what just happened.', 'What does it mean to you personally that God loves you enough to send His Son?', 'Write a short prayer thanking God for your salvation today.'),
(2, 'Assurance of Salvation', 'I write these things to you who believe in the name of the Son of God so that you may know that you have eternal life.', '1 John 5:13', 'One of the enemy''s greatest tactics is doubt. Today we ground you in the certainty of your salvation.', 'Have you ever doubted your salvation? What does 1 John 5:13 say to that doubt?', 'Memorize 1 John 5:13 today.'),
(3, 'The Power of Prayer', 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.', 'Philippians 4:6', 'Prayer is simply talking with God. It is the most natural thing a child does with their Father.', 'What areas of your life do you need to surrender to God in prayer?', 'Set a daily alarm for prayer — morning, noon, and night.'),
(4, 'Reading the Bible', 'Your word is a lamp for my feet, a light on my path.', 'Psalm 119:105', 'The Bible is God''s love letter to you. Learn how to read it and let it transform your mind.', 'Which part of the Bible are you most curious to explore?', 'Download a Bible app and read one chapter of John today.'),
(5, 'The Holy Spirit', 'But the Advocate, the Holy Spirit, whom the Father will send in my name, will teach you all things.', 'John 14:26', 'You are not alone. The Holy Spirit lives inside you, guiding, comforting, and empowering you.', 'In what ways have you already felt the Holy Spirit''s guidance in your life?', 'Ask the Holy Spirit to guide you through one decision today.'),
(6, 'The Church Family', 'And let us consider how we may spur one another on toward love and good deeds, not giving up meeting together.', 'Hebrews 10:24-25', 'God designed us for community. The church is not a building — it''s a family.', 'What has kept you from committing to a local church?', 'Visit or contact a local church this week.'),
(7, 'Sharing Your Faith', 'Go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit.', 'Matthew 28:19', 'Your story is the most powerful evangelism tool you have. Learn to share it naturally.', 'Who in your life needs to hear the Gospel?', 'Write your testimony in 3 sentences: Before, How, After.');
