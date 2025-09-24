"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DashboardTabs } from "@/components/dashboard-tabs"
import { useAnalytics } from "@/hooks/use-analytics"
import { Wallet } from "lucide-react"

export default function GrabApp() {
  const [isConnected, setIsConnected] = useState(false)
  const { startSession } = useAnalytics()

  const connectWallet = () => {
    setIsConnected(true)
    startSession()
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-black text-foreground">GRAB</h1>
          <Button
            onClick={connectWallet}
            className={`neo-border neo-shadow font-bold ${
              isConnected ? "bg-green text-black" : "bg-primary text-primary-foreground"
            }`}
            disabled={isConnected}
          >
            <Wallet className="w-4 h-4 mr-2" />
            {isConnected ? "CONNECTED" : "CONNECT WALLET"}
          </Button>
        </div>
        <p className="text-muted-foreground mt-2 font-medium">
          Download videos from Farcaster casts • Track usage onchain
        </p>
      </header>

      <DashboardTabs />
    </div>
  )
}
