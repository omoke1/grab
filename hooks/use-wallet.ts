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
    if (typeof window === "undefined") return false
    
    // Check for Farcaster Mini App wallet first
    const miniWallet = (sdk as any)?.wallet?.ethereum
    if (miniWallet && typeof miniWallet.request === "function") {
      return true
    }
    
    // Fallback to window.ethereum
    return Boolean((window as any).ethereum)
  }, [])

  const connect = useCallback(async () => {
    try {
      // Prefer Farcaster Mini App wallet if available
      const miniWallet = (sdk as any)?.wallet?.ethereum
      if (miniWallet && typeof miniWallet.request === "function") {
        console.log("Using Farcaster Mini App wallet")
        const accounts: string[] = await miniWallet.request({ method: "eth_requestAccounts" })
        const addr = accounts?.[0] ?? null
        setAddress(addr)
        setIsConnected(Boolean(addr))
        return addr
      }

      // Fallback to window.ethereum
      const ethereum = (window as any).ethereum
      if (ethereum?.request) {
        console.log("Using window.ethereum")
        const accounts: string[] = await ethereum.request({ method: "eth_requestAccounts" })
        const addr = accounts?.[0] ?? null
        setAddress(addr)
        setIsConnected(Boolean(addr))
        return addr
      }
      
      console.warn("No wallet provider found")
    } catch (err) {
      console.error("Wallet connect failed", err)
      // Show user-friendly error
      alert("Failed to connect wallet. Please ensure you have a wallet installed and try again.")
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
        // Check Farcaster Mini App wallet first
        const miniWallet = (sdk as any)?.wallet?.ethereum
        if (miniWallet?.request) {
          console.log("Checking Farcaster Mini App wallet for existing accounts")
          const accounts: string[] = await miniWallet.request({ method: "eth_accounts" })
          const addr = accounts?.[0] ?? null
          if (addr) {
            console.log("Found existing account in Mini App wallet:", addr)
            setAddress(addr)
            setIsConnected(true)
            return
          }
        }
        
        // Fallback to window.ethereum
        const ethereum = (window as any).ethereum
        if (ethereum?.request) {
          console.log("Checking window.ethereum for existing accounts")
          const accounts: string[] = await ethereum.request({ method: "eth_accounts" })
          const addr = accounts?.[0] ?? null
          if (addr) {
            console.log("Found existing account in window.ethereum:", addr)
            setAddress(addr)
            setIsConnected(true)
          }
        }
      } catch (err) {
        console.log("No existing wallet connection found:", err)
        // This is normal for new users
      }
    })()
  }, [])

  return { connect, address, isConnected, sendTransaction, sendUsdcTransfer, hasEthereum, ensureBaseChain }
}


