import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"
import { FarcasterProvider } from "@/components/farcaster-provider"
import { OnchainKitProviderWrapper } from "@/components/onchainkit-provider"

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
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="miniapp" href="/.well-known/miniapp.json" />
        <meta
          name="fc:miniapp"
          content='{"version":"1","imageUrl":"https://grab-rust.vercel.app/placeholder.jpg","button":{"title":"Open Grab","action":{"type":"launch_miniapp","name":"Grab","url":"https://grab-rust.vercel.app/","splashImageUrl":"https://grab-rust.vercel.app/placeholder-logo.png","splashBackgroundColor":"#ffffff"}}}'
        />
        <meta
          name="fc:frame"
          content='{"version":"1","imageUrl":"https://grab-rust.vercel.app/placeholder.jpg","button":{"title":"Open Grab","action":{"type":"launch_frame","name":"Grab","url":"https://grab-rust.vercel.app/","splashImageUrl":"https://grab-rust.vercel.app/placeholder-logo.png","splashBackgroundColor":"#ffffff"}}}'
        />
      </head>
      <body className={`font-sans ${inter.variable}`} suppressHydrationWarning={true}>
        <OnchainKitProviderWrapper>
          <FarcasterProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </FarcasterProvider>
        </OnchainKitProviderWrapper>
      </body>
    </html>
  )
}
