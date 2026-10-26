import type { Metadata, Viewport } from "next"
import { Inter, Merriweather, Cormorant_Garamond } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { OneSignalInit } from "@/components/OneSignalInit"
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

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
})

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://getformed.vercel.app"
const DESCRIPTION =
  "FORMED is a Scripture-grounded discipleship platform. Walk a structured path from Salvation to maturity, learn from curated teaching, and grow in a community built for formation, not distraction."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FORMED — Scripture-grounded discipleship",
    template: "%s · FORMED",
  },
  description: DESCRIPTION,
  keywords: ["discipleship", "church", "Christian", "follow-up", "new believers", "mentorship", "Bible"],
  openGraph: {
    title: "FORMED — Faith is a journey of becoming",
    description: DESCRIPTION,
    type: "website",
    locale: "en_US",
    siteName: "FORMED",
    images: [{ url: "/film/poster.jpg", width: 1600, height: 900, alt: "FORMED welcome film" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FORMED — Faith is a journey of becoming",
    description: DESCRIPTION,
    images: ["/film/poster.jpg"],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
      className={`${inter.variable} ${merriweather.variable} ${cormorant.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-[#FAFAF8]">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          enableSystem={false}
        >
          <OneSignalInit />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
