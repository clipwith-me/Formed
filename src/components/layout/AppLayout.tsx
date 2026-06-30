"use client"

import React from "react"
import { ThemeProvider } from "next-themes"
import { Sidebar } from "./Sidebar"
import { BottomNav } from "./BottomNav"
import { TopBar } from "./TopBar"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
      <div className="min-h-screen bg-[#FAFAF8]">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="lg:pl-[240px] flex flex-col min-h-screen">
          {/* Mobile top bar */}
          <TopBar />

          {/* Page content */}
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 pb-24 lg:pb-8 max-w-4xl mx-auto w-full">
            {children}
          </main>
        </div>

        {/* Mobile bottom nav */}
        <BottomNav />
      </div>
    </ThemeProvider>
  )
}
