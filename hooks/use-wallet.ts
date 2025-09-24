"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { sdk } from "@farcaster/miniapp-sdk"
import { APP_CONFIG } from "@/lib/config"

type Hex = `0x${string}`

export type SendTransactionParams = {
  to: Hex
  value?: Hex
  data?: Hex
}

type WalletApi = {
  connect: () => Promise<string | null>
  address: string | null
  isConnected: boolean
  sendTransaction: (tx: SendTransactionParams) => Promise<Hex>
  sendUsdcTransfer: (token: Hex, to: Hex, amountUnits: bigint) => Promise<Hex>
  hasEthereum: boolean
  ensureBaseChain: () => Promise<void>
}

export function useWallet(): WalletApi {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const hasEthereum = useMemo(() => {
    return typeof window !== "undefined" && (Boolean((window as any).ethereum) || Boolean((sdk as any)?.wallet))
  }, [])

  const connect = useCallback(async () => {
    try {
      // Prefer Farcaster Mini App wallet if available
      const miniWallet = (sdk as any)?.wallet?.ethereum
      if (miniWallet && typeof miniWallet.request === "function") {
        const accounts: string[] = await miniWallet.request({ method: "eth_requestAccounts" })
        const addr = accounts?.[0] ?? null
        setAddress(addr)
        setIsConnected(Boolean(addr))
        return addr
      }

      const ethereum = (window as any).ethereum
      if (ethereum?.request) {
        const accounts: string[] = await ethereum.request({ method: "eth_requestAccounts" })
        const addr = accounts?.[0] ?? null
        setAddress(addr)
        setIsConnected(Boolean(addr))
        return addr
      }
    } catch (err) {
      console.error("Wallet connect failed", err)
    }
    return null
  }, [])

  const sendTransaction = useCallback(async (tx: SendTransactionParams): Promise<Hex> => {
    // Prefer mini app wallet
    const miniWallet = (sdk as any)?.wallet?.ethereum
    if (miniWallet && typeof miniWallet.request === "function") {
      const hash: Hex = await miniWallet.request({ method: "eth_sendTransaction", params: [tx] })
      return hash
    }

    const ethereum = (window as any).ethereum
    if (ethereum?.request) {
      const hash: Hex = await ethereum.request({ method: "eth_sendTransaction", params: [tx] })
      return hash
    }

    throw new Error("No wallet available to send transaction")
  }, [])

  const sendUsdcTransfer = useCallback(async (token: Hex, to: Hex, amountUnits: bigint): Promise<Hex> => {
    // ERC20 transfer(address,uint256)
    const selector = "a9059cbb"
    const addr = to.replace("0x", "").padStart(64, "0")
    const amt = amountUnits.toString(16).padStart(64, "0")
    const data = ("0x" + selector + addr + amt) as Hex
    return sendTransaction({ to: token, data })
  }, [sendTransaction])

  const ensureBaseChain = useCallback(async (): Promise<void> => {
    const target = "0x" + APP_CONFIG.baseChainId.toString(16)
    const miniWallet = (sdk as any)?.wallet?.ethereum
    if (miniWallet?.request) {
      try {
        await miniWallet.request({ method: "wallet_switchEthereumChain", params: [{ chainId: target }] })
        return
      } catch {
        // ignore and try window.ethereum
      }
    }
    const ethereum = (window as any).ethereum
    if (ethereum?.request) {
      try {
        await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: target }] })
      } catch (err) {
        console.error("Failed to switch to Base chain", err)
        throw err
      }
    }
  }, [])

  useEffect(() => {
    // Attempt eager account detection
    ;(async () => {
      try {
        const miniWallet = (sdk as any)?.wallet?.ethereum
        if (miniWallet?.request) {
          const accounts: string[] = await miniWallet.request({ method: "eth_accounts" })
          const addr = accounts?.[0] ?? null
          if (addr) {
            setAddress(addr)
            setIsConnected(true)
            return
          }
        }
        const ethereum = (window as any).ethereum
        if (ethereum?.request) {
          const accounts: string[] = await ethereum.request({ method: "eth_accounts" })
          const addr = accounts?.[0] ?? null
          if (addr) {
            setAddress(addr)
            setIsConnected(true)
          }
        }
      } catch {
        // ignore
      }
    })()
  }, [])

  return { connect, address, isConnected, sendTransaction, sendUsdcTransfer, hasEthereum, ensureBaseChain }
}


