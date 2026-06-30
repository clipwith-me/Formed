import type { Metadata, Viewport } from "next"
import { Inter, Merriweather } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-merriweather",
  weight: ["300", "400", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "FORMED — Discipleship Simplified",
  description:
    "The operating system for global discipleship. Follow up with new believers, walk them through a proven journey, and multiply disciples across generations.",
  keywords: ["discipleship", "church", "Christian", "follow-up", "believers", "mentor"],
  openGraph: {
    title: "FORMED — Discipleship Simplified",
    description: "The operating system for global discipleship.",
    type: "website",
    locale: "en_US",
    siteName: "FORMED",
  },
  twitter: {
    card: "summary_large_image",
    title: "FORMED — Discipleship Simplified",
    description: "The operating system for global discipleship.",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1F5E4A",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${merriweather.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-[#FAFAF8]">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
