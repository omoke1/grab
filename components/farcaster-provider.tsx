"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import { sdk } from "@farcaster/miniapp-sdk"

type FarcasterContextValue = {
  isMiniAppEnvironment: boolean
  isReadyCalled: boolean
}

const FarcasterContext = createContext<FarcasterContextValue | null>(null)

export function FarcasterProvider({ children }: { children: React.ReactNode }) {
  const [isReadyCalled, setIsReadyCalled] = useState(false)
  const hasCalledReadyRef = useRef(false)

  // Detect if we are in Farcaster Mini App environment
  const isMiniAppEnvironment = useMemo(() => {
    try {
      // If the SDK is available, we consider it a potential mini-app environment
      return typeof window !== "undefined" && !!sdk
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    // Call ready() once after initial paint to hide splash per docs
    // https://miniapps.farcaster.xyz/docs/getting-started
    if (!isMiniAppEnvironment) return
    if (hasCalledReadyRef.current) return

    // Defer to next tick to ensure fonts/styles applied
    const id = window.setTimeout(async () => {
      try {
        await sdk.actions.ready()
        hasCalledReadyRef.current = true
        setIsReadyCalled(true)
      } catch (err) {
        // Swallow to avoid crashing UI; can surface to telemetry later
        console.error("Farcaster ready() failed", err)
      }
    }, 0)

    return () => window.clearTimeout(id)
  }, [isMiniAppEnvironment])

  const value: FarcasterContextValue = useMemo(
    () => ({ isMiniAppEnvironment, isReadyCalled }),
    [isMiniAppEnvironment, isReadyCalled],
  )

  return <FarcasterContext.Provider value={value}>{children}</FarcasterContext.Provider>
}

export function useFarcasterContext(): FarcasterContextValue {
  const ctx = useContext(FarcasterContext)
  if (!ctx) {
    return { isMiniAppEnvironment: false, isReadyCalled: false }
  }
  return ctx
}


