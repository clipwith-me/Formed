-- FORMED Video Discipleship Library Schema
-- Run this in Supabase SQL editor

-- ─── Ministries ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ministries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  website_url   text,
  logo_url      text,
  description   text,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE ministries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read ministries" ON ministries FOR SELECT USING (true);
CREATE POLICY "Admins manage ministries" ON ministries FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN','CHURCH_ADMIN')));

-- ─── Speakers ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS speakers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  bio           text,
  photo_url     text,
  ministry_id   uuid REFERENCES ministries(id) ON DELETE SET NULL,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read speakers" ON speakers FOR SELECT USING (true);
CREATE POLICY "Admins manage speakers" ON speakers FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN','CHURCH_ADMIN')));

-- ─── Teaching Resources ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teaching_resources (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text NOT NULL,
  description         text,
  speaker_id          uuid REFERENCES speakers(id) ON DELETE SET NULL,
  ministry_id         uuid REFERENCES ministries(id) ON DELETE SET NULL,
  source_url          text,          -- ministry homepage or YouTube channel (never fabricated video URL)
  embed_url           text,          -- only set after APPROVED_EMBED or higher
  thumbnail_url       text,
  duration_seconds    integer,       -- null until verified
  review_status       text NOT NULL DEFAULT 'RESEARCH_CANDIDATE'
                      CHECK (review_status IN (
                        'RESEARCH_CANDIDATE',
                        'UNDER_DOCTRINAL_REVIEW',
                        'UNDER_COPYRIGHT_REVIEW',
                        'AWAITING_PERMISSION',
                        'APPROVED_EXTERNAL_LINK',
                        'APPROVED_EMBED',
                        'LICENSED_HOSTED',
                        'REJECTED',
                        'UNAVAILABLE'
                      )),
  tags                text[],
  language            text DEFAULT 'en',
  published_year      integer,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

ALTER TABLE teaching_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read approved resources" ON teaching_resources FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND review_status IN ('APPROVED_EXTERNAL_LINK','APPROVED_EMBED','LICENSED_HOSTED')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN','CHURCH_ADMIN'))
  );
CREATE POLICY "Admins manage resources" ON teaching_resources FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN','CHURCH_ADMIN')));

-- ─── Scripture References ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resource_scripture_refs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL REFERENCES teaching_resources(id) ON DELETE CASCADE,
  book        text NOT NULL,
  chapter     integer,
  verse_start integer,
  verse_end   integer,
  display_ref text NOT NULL  -- e.g. "John 3:16-17"
);

ALTER TABLE resource_scripture_refs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read scripture refs" ON resource_scripture_refs FOR SELECT USING (true);
CREATE POLICY "Admins manage scripture refs" ON resource_scripture_refs FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN','CHURCH_ADMIN')));

-- ─── Reflection Questions ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resource_reflection_questions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL REFERENCES teaching_resources(id) ON DELETE CASCADE,
  sort_order  integer NOT NULL DEFAULT 0,
  question    text NOT NULL
);

ALTER TABLE resource_reflection_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read questions" ON resource_reflection_questions FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage questions" ON resource_reflection_questions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN','CHURCH_ADMIN')));

-- ─── Curriculum Paths ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS curriculum_paths (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text NOT NULL UNIQUE,  -- 'A','B','C','D'
  title       text NOT NULL,
  description text,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE curriculum_paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read paths" ON curriculum_paths FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage paths" ON curriculum_paths FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN','CHURCH_ADMIN')));

-- ─── Curriculum Path Lessons ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS curriculum_path_lessons (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id     uuid NOT NULL REFERENCES curriculum_paths(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES teaching_resources(id) ON DELETE CASCADE,
  lesson_number integer NOT NULL,
  lesson_title  text,
  UNIQUE (path_id, lesson_number)
);

ALTER TABLE curriculum_path_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read path lessons" ON curriculum_path_lessons FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage path lessons" ON curriculum_path_lessons FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN','CHURCH_ADMIN')));

-- ─── Video Lesson Progress ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS video_lesson_progress (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id   uuid NOT NULL REFERENCES teaching_resources(id) ON DELETE CASCADE,
  completed     boolean DEFAULT false,
  completed_at  timestamptz,
  watch_seconds integer DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  UNIQUE (user_id, resource_id)
);

ALTER TABLE video_lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own progress" ON video_lesson_progress FOR ALL
  USING (user_id = auth.uid());

-- ─── Video Lesson Notes ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS video_lesson_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES teaching_resources(id) ON DELETE CASCADE,
  content     text DEFAULT '',
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, resource_id)
);

ALTER TABLE video_lesson_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own notes" ON video_lesson_notes FOR ALL
  USING (user_id = auth.uid());

-- ─── Video Lesson Reflections ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS video_lesson_reflections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES resource_reflection_questions(id) ON DELETE CASCADE,
  answer      text DEFAULT '',
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, question_id)
);

ALTER TABLE video_lesson_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own reflections" ON video_lesson_reflections FOR ALL
  USING (user_id = auth.uid());

-- ─── Resource Review Records ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resource_review_records (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL REFERENCES teaching_resources(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  from_status text,
  to_status   text NOT NULL,
  note        text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE resource_review_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read review records" ON resource_review_records FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN','CHURCH_ADMIN')));
CREATE POLICY "Admins manage review records" ON resource_review_records FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN','CHURCH_ADMIN')));

-- ─── Updated_at trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_teaching_resources_updated
  BEFORE UPDATE ON teaching_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_video_lesson_progress_updated
  BEFORE UPDATE ON video_lesson_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ══════════════════════════════════════════════════════════════════════════════
-- SEED DATA
-- All resources MUST have review_status = 'RESEARCH_CANDIDATE'
-- embed_url is NULL; source_url points only to real ministry homepages
-- ══════════════════════════════════════════════════════════════════════════════

-- Ministries
INSERT INTO ministries (id, name, website_url, description) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Andrew Wommack Ministries', 'https://www.awmi.net', 'Bible teaching ministry focused on grace and faith'),
  ('11111111-0000-0000-0000-000000000002', 'Koinonia Global', 'https://www.koinoniaglobal.org', 'Discipleship ministry led by Apostle Joshua Selman'),
  ('11111111-0000-0000-0000-000000000003', 'Bethel Church', 'https://www.bethel.com', 'Revival ministry based in Redding, CA'),
  ('11111111-0000-0000-0000-000000000004', 'Hillsong Church', 'https://hillsong.com', 'Global church and worship ministry'),
  ('11111111-0000-0000-0000-000000000005', 'Christ Embassy', 'https://www.christembassy.org', 'International Christian community led by Pastor Chris Oyakhilome')
ON CONFLICT DO NOTHING;

-- Speakers
INSERT INTO speakers (id, name, ministry_id, bio) VALUES
  ('22222222-0000-0000-0000-000000000001', 'Andrew Wommack', '11111111-0000-0000-0000-000000000001', 'Bible teacher and founder of Andrew Wommack Ministries and Charis Bible College'),
  ('22222222-0000-0000-0000-000000000002', 'Apostle Joshua Selman', '11111111-0000-0000-0000-000000000002', 'Apostle, teacher, and founder of Koinonia Global'),
  ('22222222-0000-0000-0000-000000000003', 'Bill Johnson', '11111111-0000-0000-0000-000000000003', 'Senior leader of Bethel Church and author on revival and the Kingdom of God'),
  ('22222222-0000-0000-0000-000000000004', 'Brian Houston', '11111111-0000-0000-0000-000000000004', 'Founder of Hillsong Church'),
  ('22222222-0000-0000-0000-000000000005', 'Pastor Chris Oyakhilome', '11111111-0000-0000-0000-000000000005', 'Senior Pastor, Christ Embassy International')
ON CONFLICT DO NOTHING;

-- Curriculum Paths
INSERT INTO curriculum_paths (id, code, title, description, sort_order) VALUES
  ('33333333-0000-0000-0000-000000000001', 'A', 'New Believer Foundations', 'Essential truths for those who have recently given their lives to Christ', 1),
  ('33333333-0000-0000-0000-000000000002', 'B', 'Spiritual Growth', 'Deepening your walk with God through prayer, the Word, and community', 2),
  ('33333333-0000-0000-0000-000000000003', 'C', 'Evangelism & Great Commission', 'Learning to share the gospel and reach others for Christ', 3),
  ('33333333-0000-0000-0000-000000000004', 'D', 'Becoming a Disciple-Maker', 'Investing in others and multiplying disciples', 4)
ON CONFLICT DO NOTHING;

-- Teaching Resources (all RESEARCH_CANDIDATE, no embed_url, no fabricated video IDs)
INSERT INTO teaching_resources (id, title, description, speaker_id, ministry_id, source_url, review_status, tags, published_year) VALUES
  -- Path A: New Believer Foundations
  ('44444444-0000-0000-0000-000000000001',
   'Who You Are in Christ',
   'An introduction to the believer''s identity and inheritance in Jesus Christ.',
   '22222222-0000-0000-0000-000000000001',
   '11111111-0000-0000-0000-000000000001',
   'https://www.awmi.net/resources/audio-teaching/',
   'RESEARCH_CANDIDATE',
   ARRAY['identity','new believer','grace'],
   NULL),

  ('44444444-0000-0000-0000-000000000002',
   'The New Creation Reality',
   'Understanding what it means to be born again and a new creation in Christ.',
   '22222222-0000-0000-0000-000000000001',
   '11111111-0000-0000-0000-000000000001',
   'https://www.awmi.net/resources/audio-teaching/',
   'RESEARCH_CANDIDATE',
   ARRAY['new creation','salvation','born again'],
   NULL),

  ('44444444-0000-0000-0000-000000000003',
   'Grace: The Foundation of Our Relationship with God',
   'Exploring how God''s grace is the basis of our standing before Him.',
   '22222222-0000-0000-0000-000000000001',
   '11111111-0000-0000-0000-000000000001',
   'https://www.awmi.net/resources/audio-teaching/',
   'RESEARCH_CANDIDATE',
   ARRAY['grace','foundation','relationship'],
   NULL),

  ('44444444-0000-0000-0000-000000000004',
   'The Holy Spirit: Your Guide and Helper',
   'Introduction to the person and ministry of the Holy Spirit for new believers.',
   '22222222-0000-0000-0000-000000000002',
   '11111111-0000-0000-0000-000000000002',
   'https://www.koinoniaglobal.org/resources/',
   'RESEARCH_CANDIDATE',
   ARRAY['holy spirit','new believer','guide'],
   NULL),

  ('44444444-0000-0000-0000-000000000005',
   'Prayer: Talking with Your Father',
   'Practical teaching on how to build a prayer life as a new believer.',
   '22222222-0000-0000-0000-000000000002',
   '11111111-0000-0000-0000-000000000002',
   'https://www.koinoniaglobal.org/resources/',
   'RESEARCH_CANDIDATE',
   ARRAY['prayer','new believer','communication'],
   NULL),

  -- Path B: Spiritual Growth
  ('44444444-0000-0000-0000-000000000006',
   'Developing a Consistent Prayer Life',
   'Deepening your prayer discipline and intimacy with God.',
   '22222222-0000-0000-0000-000000000002',
   '11111111-0000-0000-0000-000000000002',
   'https://www.koinoniaglobal.org/resources/',
   'RESEARCH_CANDIDATE',
   ARRAY['prayer','spiritual growth','intimacy'],
   NULL),

  ('44444444-0000-0000-0000-000000000007',
   'How to Study the Bible',
   'Methods and principles for fruitful personal Bible study.',
   '22222222-0000-0000-0000-000000000001',
   '11111111-0000-0000-0000-000000000001',
   'https://www.awmi.net/resources/audio-teaching/',
   'RESEARCH_CANDIDATE',
   ARRAY['bible study','spiritual growth','word'],
   NULL),

  ('44444444-0000-0000-0000-000000000008',
   'Worship and Intimacy with God',
   'Understanding worship as a lifestyle and key to spiritual growth.',
   '22222222-0000-0000-0000-000000000003',
   '11111111-0000-0000-0000-000000000003',
   'https://www.bethel.com/media/',
   'RESEARCH_CANDIDATE',
   ARRAY['worship','intimacy','spiritual growth'],
   NULL),

  ('44444444-0000-0000-0000-000000000009',
   'The Kingdom of God',
   'Teaching on what the Kingdom of God is and how to live as a Kingdom citizen.',
   '22222222-0000-0000-0000-000000000003',
   '11111111-0000-0000-0000-000000000003',
   'https://www.bethel.com/media/',
   'RESEARCH_CANDIDATE',
   ARRAY['kingdom','spiritual growth','authority'],
   NULL),

  ('44444444-0000-0000-0000-000000000010',
   'Fasting and Spiritual Disciplines',
   'The role of fasting and spiritual disciplines in deepening your walk with God.',
   '22222222-0000-0000-0000-000000000002',
   '11111111-0000-0000-0000-000000000002',
   'https://www.koinoniaglobal.org/resources/',
   'RESEARCH_CANDIDATE',
   ARRAY['fasting','discipline','spiritual growth'],
   NULL),

  -- Path C: Evangelism & Great Commission
  ('44444444-0000-0000-0000-000000000011',
   'Sharing Your Testimony',
   'How to craft and share your personal testimony effectively.',
   '22222222-0000-0000-0000-000000000005',
   '11111111-0000-0000-0000-000000000005',
   'https://www.christembassy.org/resources/',
   'RESEARCH_CANDIDATE',
   ARRAY['testimony','evangelism','great commission'],
   NULL),

  ('44444444-0000-0000-0000-000000000012',
   'The Gospel Message: What We Believe',
   'A clear presentation of the core gospel message to equip believers to share it.',
   '22222222-0000-0000-0000-000000000001',
   '11111111-0000-0000-0000-000000000001',
   'https://www.awmi.net/resources/audio-teaching/',
   'RESEARCH_CANDIDATE',
   ARRAY['gospel','evangelism','apologetics'],
   NULL),

  ('44444444-0000-0000-0000-000000000013',
   'Reaching Your Oikos (Your World)',
   'How to intentionally reach the people God has placed in your natural sphere.',
   '22222222-0000-0000-0000-000000000003',
   '11111111-0000-0000-0000-000000000003',
   'https://www.bethel.com/media/',
   'RESEARCH_CANDIDATE',
   ARRAY['evangelism','oikos','relationships','outreach'],
   NULL),

  ('44444444-0000-0000-0000-000000000014',
   'Power Evangelism',
   'Moving in signs, wonders, and the power of the Holy Spirit in evangelism.',
   '22222222-0000-0000-0000-000000000003',
   '11111111-0000-0000-0000-000000000003',
   'https://www.bethel.com/media/',
   'RESEARCH_CANDIDATE',
   ARRAY['power','signs','evangelism','holy spirit'],
   NULL),

  ('44444444-0000-0000-0000-000000000015',
   'Overcoming Fear in Sharing Faith',
   'Practical biblical help for overcoming fear when sharing the gospel.',
   '22222222-0000-0000-0000-000000000005',
   '11111111-0000-0000-0000-000000000005',
   'https://www.christembassy.org/resources/',
   'RESEARCH_CANDIDATE',
   ARRAY['fear','evangelism','boldness','faith'],
   NULL),

  -- Path D: Becoming a Disciple-Maker
  ('44444444-0000-0000-0000-000000000016',
   'The Call to Make Disciples',
   'Understanding the Great Commission as every believer''s mandate.',
   '22222222-0000-0000-0000-000000000002',
   '11111111-0000-0000-0000-000000000002',
   'https://www.koinoniaglobal.org/resources/',
   'RESEARCH_CANDIDATE',
   ARRAY['discipleship','great commission','mandate'],
   NULL),

  ('44444444-0000-0000-0000-000000000017',
   'How to Invest in a New Believer',
   'Practical steps for mentoring and nurturing a new believer in their first steps.',
   '22222222-0000-0000-0000-000000000002',
   '11111111-0000-0000-0000-000000000002',
   'https://www.koinoniaglobal.org/resources/',
   'RESEARCH_CANDIDATE',
   ARRAY['mentoring','discipleship','new believer'],
   NULL),

  ('44444444-0000-0000-0000-000000000018',
   'Building a Disciple-Making Culture in Your Church',
   'How to cultivate an environment where discipleship multiplies.',
   '22222222-0000-0000-0000-000000000003',
   '11111111-0000-0000-0000-000000000003',
   'https://www.bethel.com/media/',
   'RESEARCH_CANDIDATE',
   ARRAY['church','culture','discipleship','multiplication'],
   NULL),

  ('44444444-0000-0000-0000-000000000019',
   'Multiplication: From One to Many',
   'The vision of exponential discipleship multiplication.',
   '22222222-0000-0000-0000-000000000005',
   '11111111-0000-0000-0000-000000000005',
   'https://www.christembassy.org/resources/',
   'RESEARCH_CANDIDATE',
   ARRAY['multiplication','vision','discipleship'],
   NULL),

  ('44444444-0000-0000-0000-000000000020',
   'Spiritual Parenting',
   'Understanding your role as a spiritual parent in the body of Christ.',
   '22222222-0000-0000-0000-000000000001',
   '11111111-0000-0000-0000-000000000001',
   'https://www.awmi.net/resources/audio-teaching/',
   'RESEARCH_CANDIDATE',
   ARRAY['spiritual parenting','mentoring','disciple-maker'],
   NULL)
ON CONFLICT DO NOTHING;

-- Scripture References
INSERT INTO resource_scripture_refs (resource_id, book, chapter, verse_start, verse_end, display_ref) VALUES
  ('44444444-0000-0000-0000-000000000001', '2 Corinthians', 5, 17, 17, '2 Corinthians 5:17'),
  ('44444444-0000-0000-0000-000000000001', 'Ephesians', 1, 3, 14, 'Ephesians 1:3-14'),
  ('44444444-0000-0000-0000-000000000002', '2 Corinthians', 5, 17, 21, '2 Corinthians 5:17-21'),
  ('44444444-0000-0000-0000-000000000003', 'Ephesians', 2, 8, 9, 'Ephesians 2:8-9'),
  ('44444444-0000-0000-0000-000000000003', 'Romans', 5, 1, 2, 'Romans 5:1-2'),
  ('44444444-0000-0000-0000-000000000004', 'John', 14, 16, 17, 'John 14:16-17'),
  ('44444444-0000-0000-0000-000000000005', 'Matthew', 6, 9, 13, 'Matthew 6:9-13'),
  ('44444444-0000-0000-0000-000000000006', '1 Thessalonians', 5, 17, 17, '1 Thessalonians 5:17'),
  ('44444444-0000-0000-0000-000000000007', '2 Timothy', 2, 15, 15, '2 Timothy 2:15'),
  ('44444444-0000-0000-0000-000000000008', 'John', 4, 23, 24, 'John 4:23-24'),
  ('44444444-0000-0000-0000-000000000009', 'Matthew', 6, 33, 33, 'Matthew 6:33'),
  ('44444444-0000-0000-0000-000000000010', 'Matthew', 6, 16, 18, 'Matthew 6:16-18'),
  ('44444444-0000-0000-0000-000000000011', 'Revelation', 12, 11, 11, 'Revelation 12:11'),
  ('44444444-0000-0000-0000-000000000012', 'Romans', 1, 16, 16, 'Romans 1:16'),
  ('44444444-0000-0000-0000-000000000012', '1 Corinthians', 15, 3, 4, '1 Corinthians 15:3-4'),
  ('44444444-0000-0000-0000-000000000013', 'Acts', 1, 8, 8, 'Acts 1:8'),
  ('44444444-0000-0000-0000-000000000014', 'Mark', 16, 17, 18, 'Mark 16:17-18'),
  ('44444444-0000-0000-0000-000000000015', '2 Timothy', 1, 7, 7, '2 Timothy 1:7'),
  ('44444444-0000-0000-0000-000000000016', 'Matthew', 28, 19, 20, 'Matthew 28:19-20'),
  ('44444444-0000-0000-0000-000000000017', '2 Timothy', 2, 2, 2, '2 Timothy 2:2'),
  ('44444444-0000-0000-0000-000000000018', 'Acts', 2, 42, 47, 'Acts 2:42-47'),
  ('44444444-0000-0000-0000-000000000019', 'John', 15, 16, 16, 'John 15:16'),
  ('44444444-0000-0000-0000-000000000020', '1 Corinthians', 4, 15, 16, '1 Corinthians 4:15-16');

-- Reflection Questions
INSERT INTO resource_reflection_questions (resource_id, sort_order, question) VALUES
  ('44444444-0000-0000-0000-000000000001', 1, 'How does knowing your identity in Christ change the way you see yourself?'),
  ('44444444-0000-0000-0000-000000000001', 2, 'What lie about yourself does this teaching challenge?'),
  ('44444444-0000-0000-0000-000000000001', 3, 'How can you remind yourself daily of who you are in Christ?'),

  ('44444444-0000-0000-0000-000000000002', 1, 'What does being a "new creation" mean practically for your daily life?'),
  ('44444444-0000-0000-0000-000000000002', 2, 'In what area of your life do you find it hardest to live as a new creation?'),

  ('44444444-0000-0000-0000-000000000003', 1, 'How does understanding grace change your relationship with God?'),
  ('44444444-0000-0000-0000-000000000003', 2, 'Have you been trying to earn God''s approval? How does this teaching speak to that?'),

  ('44444444-0000-0000-0000-000000000004', 1, 'How have you experienced the Holy Spirit''s guidance in your life?'),
  ('44444444-0000-0000-0000-000000000004', 2, 'What does it mean to you that the Holy Spirit lives inside you?'),

  ('44444444-0000-0000-0000-000000000005', 1, 'What is your current prayer rhythm? How could it grow?'),
  ('44444444-0000-0000-0000-000000000005', 2, 'What makes prayer feel difficult for you? Bring that to God in prayer right now.'),

  ('44444444-0000-0000-0000-000000000006', 1, 'What one discipline could you add to strengthen your prayer life this week?'),
  ('44444444-0000-0000-0000-000000000007', 1, 'What method of Bible study resonated with you most? Why?'),
  ('44444444-0000-0000-0000-000000000007', 2, 'What passage of Scripture do you want to study more deeply after this teaching?'),
  ('44444444-0000-0000-0000-000000000008', 1, 'How does this teaching expand your understanding of what worship is?'),
  ('44444444-0000-0000-0000-000000000009', 1, 'What does "seeking the Kingdom first" look like in your specific season of life?'),
  ('44444444-0000-0000-0000-000000000010', 1, 'Have you ever fasted? What was your experience?'),
  ('44444444-0000-0000-0000-000000000010', 2, 'What spiritual discipline do you feel God is calling you to develop next?'),

  ('44444444-0000-0000-0000-000000000011', 1, 'Write out your testimony in 2-3 sentences. Practice sharing it.'),
  ('44444444-0000-0000-0000-000000000011', 2, 'Who in your life needs to hear your story?'),
  ('44444444-0000-0000-0000-000000000012', 1, 'Can you clearly explain the gospel in your own words?'),
  ('44444444-0000-0000-0000-000000000012', 2, 'What questions do people in your life ask about faith that you struggle to answer?'),
  ('44444444-0000-0000-0000-000000000013', 1, 'Who are the 5-10 people in your natural sphere (oikos) who do not yet know Jesus?'),
  ('44444444-0000-0000-0000-000000000013', 2, 'What is one practical step you can take this week to build relationship with one of them?'),
  ('44444444-0000-0000-0000-000000000014', 1, 'Have you seen God do a miracle through you or around you? What happened?'),
  ('44444444-0000-0000-0000-000000000015', 1, 'What specific fear holds you back from sharing your faith?'),
  ('44444444-0000-0000-0000-000000000015', 2, 'How does 2 Timothy 1:7 speak to that fear?'),

  ('44444444-0000-0000-0000-000000000016', 1, 'Do you see yourself as a disciple-maker? Why or why not?'),
  ('44444444-0000-0000-0000-000000000016', 2, 'Who discipled you? How did their investment shape your faith?'),
  ('44444444-0000-0000-0000-000000000017', 1, 'Is there a new believer in your life right now you could intentionally invest in?'),
  ('44444444-0000-0000-0000-000000000017', 2, 'What would a first conversation with them look like?'),
  ('44444444-0000-0000-0000-000000000018', 1, 'What does a disciple-making culture look like in your local church context?'),
  ('44444444-0000-0000-0000-000000000019', 1, 'What would it look like for your discipleship to multiply to a third or fourth generation?'),
  ('44444444-0000-0000-0000-000000000020', 1, 'How are you currently investing in the next generation spiritually?'),
  ('44444444-0000-0000-0000-000000000020', 2, 'What would you want to pass on to a spiritual son or daughter?');

-- Curriculum Path Lesson Assignments
INSERT INTO curriculum_path_lessons (path_id, resource_id, lesson_number, lesson_title) VALUES
  -- Path A
  ('33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', 1, 'Who You Are in Christ'),
  ('33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000002', 2, 'The New Creation Reality'),
  ('33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000003', 3, 'Grace: The Foundation'),
  ('33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000004', 4, 'The Holy Spirit: Your Guide'),
  ('33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000005', 5, 'Prayer: Talking with Your Father'),
  -- Path B
  ('33333333-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000006', 1, 'Developing a Consistent Prayer Life'),
  ('33333333-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000007', 2, 'How to Study the Bible'),
  ('33333333-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000008', 3, 'Worship and Intimacy with God'),
  ('33333333-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000009', 4, 'The Kingdom of God'),
  ('33333333-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000010', 5, 'Fasting and Spiritual Disciplines'),
  -- Path C
  ('33333333-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000011', 1, 'Sharing Your Testimony'),
  ('33333333-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000012', 2, 'The Gospel Message'),
  ('33333333-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000013', 3, 'Reaching Your Oikos'),
  ('33333333-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000014', 4, 'Power Evangelism'),
  ('33333333-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000015', 5, 'Overcoming Fear in Sharing Faith'),
  -- Path D
  ('33333333-0000-0000-0000-000000000004', '44444444-0000-0000-0000-000000000016', 1, 'The Call to Make Disciples'),
  ('33333333-0000-0000-0000-000000000004', '44444444-0000-0000-0000-000000000017', 2, 'How to Invest in a New Believer'),
  ('33333333-0000-0000-0000-000000000004', '44444444-0000-0000-0000-000000000018', 3, 'Building a Disciple-Making Culture'),
  ('33333333-0000-0000-0000-000000000004', '44444444-0000-0000-0000-000000000019', 4, 'Multiplication: From One to Many'),
  ('33333333-0000-0000-0000-000000000004', '44444444-0000-0000-0000-000000000020', 5, 'Spiritual Parenting')
ON CONFLICT DO NOTHING;
