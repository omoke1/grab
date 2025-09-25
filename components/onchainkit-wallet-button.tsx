"use client"

import { ClientOnly } from "./client-only"
import { useWallet } from "@/hooks/use-wallet"

export function OnchainKitWalletButton() {
  const { isConnected, connect, profile } = useWallet()

  const handleClick = async () => {
    if (!isConnected) await connect()
  }

  return (
    <ClientOnly fallback={<div className="neo-border neo-shadow font-bold bg-gray-200 text-gray-500 p-2 rounded">Loading...</div>}>
      <button
        onClick={handleClick}
        className={`neo-border neo-shadow font-bold flex items-center gap-2 ${
          isConnected ? "bg-green text-black" : "bg-primary text-primary-foreground"
        }`}
      >
        {isConnected ? (
          <>
            {profile.pfpUrl ? (
              <img src={profile.pfpUrl} alt="pfp" className="w-6 h-6 rounded-full" />
            ) : null}
            <span className="truncate max-w-[10rem]">
              {profile.username || (profile.address ? `${profile.address.slice(0, 6)}…${profile.address.slice(-4)}` : "")}
            </span>
          </>
        ) : (
          "CONNECT WALLET"
        )}
      </button>
    </ClientOnly>
  )
}
