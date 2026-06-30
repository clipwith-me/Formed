export const FORMED_BRAND = {
  name: "FORMED",
  tagline: "Discipleship. Simplified.",
  colors: {
    primary: "#1F5E4A",
    accent: "#D4A72C",
    charcoal: "#222222",
    background: "#FAFAF8",
    dark: "#0F1A16",
  },
}

export const NAV_ITEMS = [
  { label: "Home", path: "/home", icon: "Home" },
  { label: "Discover", path: "/discover", icon: "Compass" },
  { label: "Follow-up", path: "/followup", icon: "Heart" },
  { label: "Community", path: "/community", icon: "Users" },
  { label: "Profile", path: "/profile", icon: "User" },
]

export const DISCIPLESHIP_JOURNEY = [
  {
    day: 1,
    title: "Identity in Christ",
    scripture: "Therefore, if anyone is in Christ, the new creation has come.",
    reference: "2 Corinthians 5:17",
    description: "Discover who you are in light of God's love and redemption.",
  },
  {
    day: 2,
    title: "The Word as Foundation",
    scripture: "Your word is a lamp for my feet, a light on my path.",
    reference: "Psalm 119:105",
    description: "Learn to anchor your life in the truth of Scripture.",
  },
  {
    day: 3,
    title: "Prayer Without Ceasing",
    scripture: "Pray continually, give thanks in all circumstances.",
    reference: "1 Thessalonians 5:17-18",
    description: "Build a rhythm of conversation with your heavenly Father.",
  },
  {
    day: 4,
    title: "Community & Fellowship",
    scripture: "And let us consider how we may spur one another on toward love and good deeds.",
    reference: "Hebrews 10:24",
    description: "Understand why we grow faster together than alone.",
  },
  {
    day: 5,
    title: "Serving Others",
    scripture: "For even the Son of Man did not come to be served, but to serve.",
    reference: "Mark 10:45",
    description: "Discover your unique gifts and how to use them for God's kingdom.",
  },
  {
    day: 6,
    title: "Sharing Your Faith",
    scripture: "Always be prepared to give an answer to everyone who asks you.",
    reference: "1 Peter 3:15",
    description: "Learn to share your testimony and the gospel with confidence.",
  },
  {
    day: 7,
    title: "Making Disciples",
    scripture: "Therefore go and make disciples of all nations.",
    reference: "Matthew 28:19",
    description: "You are now called to invest in others as others have invested in you.",
  },
]

export const BADGES = [
  {
    id: "first_prayer",
    label: "First Prayer",
    description: "Submitted your first prayer request",
    icon: "🙏",
    color: "#1F5E4A",
  },
  {
    id: "first_followup",
    label: "First Follow-up",
    description: "Completed your first believer follow-up",
    icon: "❤️",
    color: "#D4A72C",
  },
  {
    id: "first_disciple",
    label: "First Disciple",
    description: "Registered your first new believer",
    icon: "✝️",
    color: "#1F5E4A",
  },
  {
    id: "bible_100",
    label: "100 Bible Days",
    description: "Read the Bible for 100 consecutive days",
    icon: "📖",
    color: "#D4A72C",
  },
  {
    id: "prayers_100",
    label: "100 Prayers",
    description: "Prayed for 100 requests in the community",
    icon: "🤲",
    color: "#1F5E4A",
  },
  {
    id: "faithful_mentor",
    label: "Faithful Mentor",
    description: "Mentored a believer for 90+ days",
    icon: "⭐",
    color: "#D4A72C",
  },
  {
    id: "disciple_maker",
    label: "Disciple Maker",
    description: "Your disciple has made their own disciple",
    icon: "🌱",
    color: "#1F5E4A",
  },
]

export const USER_ROLES = {
  GUEST: "GUEST",
  BELIEVER: "BELIEVER",
  VOLUNTEER: "VOLUNTEER",
  MENTOR: "MENTOR",
  CHURCH_ADMIN: "CHURCH_ADMIN",
  ADMIN: "ADMIN",
} as const

export type UserRole = keyof typeof USER_ROLES
