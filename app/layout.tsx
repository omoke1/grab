import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"
import { FarcasterProvider } from "@/components/farcaster-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Grab - Onchain Video Downloader",
  description: "Download videos from Farcaster casts and track your usage onchain",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <FarcasterProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </FarcasterProvider>
      </body>
    </html>
  )
}
