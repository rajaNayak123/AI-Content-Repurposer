"use client"
import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import { Analytics } from "@vercel/analytics/next"
// import Navbar from "@/components/navbar"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <SessionProvider>
          {/* <Navbar /> */}
          {children}
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}
