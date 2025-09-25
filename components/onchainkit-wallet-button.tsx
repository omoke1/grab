"use client"

import { ClientOnly } from "./client-only"
import { useWallet } from "@/hooks/use-wallet"

export function OnchainKitWalletButton() {
  const { isConnected, connect } = useWallet()

  const handleClick = async () => {
    if (!isConnected) await connect()
  }

  return (
    <ClientOnly fallback={<div className="neo-border neo-shadow font-bold bg-gray-200 text-gray-500 p-2 rounded">Loading...</div>}>
      <button
        onClick={handleClick}
        className={`neo-border neo-shadow font-bold ${
          isConnected ? "bg-green text-black" : "bg-primary text-primary-foreground"
        }`}
      >
        {isConnected ? "CONNECTED" : "CONNECT WALLET"}
      </button>
    </ClientOnly>
  )
}
