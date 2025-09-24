"use client"

import { useState, useCallback } from "react"
// Mock wagmi hooks for preview environment
const useAccount = () => ({
  address: "0x1234567890123456789012345678901234567890",
  isConnected: true,
})

const useWriteContract = () => ({
  writeContract: () => {},
  data: null,
  isPending: false,
})

const useWaitForTransactionReceipt = () => ({
  isLoading: false,
  isSuccess: false,
})

interface OnchainRecord {
  id: string
  type: "session" | "payment" | "file"
  data: any
  timestamp: Date
  transactionHash?: string
  blockNumber?: number
  gasUsed?: string
  status: "pending" | "confirmed" | "failed"
}

interface SessionSummary {
  sessionId: string
  sessionDuration: number
  castsViewed: number
  downloadsPaid: number
  timestamp: Date
  userAddress: string
}

interface PaymentReceipt {
  receiptId: string
  downloadUrl: string
  amount: string
  currency: "ETH" | "USDC"
  creatorHandle?: string
  timestamp: Date
  userAddress: string
}

export function useOnchainStorage() {
  const [records, setRecords] = useState<OnchainRecord[]>([])
  const [isStoring, setIsStoring] = useState(false)

  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Store session summary onchain
  const storeSessionSummary = useCallback(
    async (sessionData: SessionSummary) => {
      if (!isConnected || !address) {
        throw new Error("Wallet not connected")
      }

      setIsStoring(true)

      try {
        // Create record
        const record: OnchainRecord = {
          id: `session-${Date.now()}`,
          type: "session",
          data: sessionData,
          timestamp: new Date(),
          status: "pending",
        }

        setRecords((prev) => [record, ...prev])

        // Simulate onchain transaction for session summary
        // In a real implementation, this would call a smart contract
        const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 3000))

        // Update record with transaction details
        setRecords((prev) =>
          prev.map((r) =>
            r.id === record.id
              ? {
                  ...r,
                  transactionHash: mockTxHash,
                  blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
                  gasUsed: (Math.random() * 0.001 + 0.0005).toFixed(6),
                  status: "confirmed" as const,
                }
              : r,
          ),
        )

        return mockTxHash
      } catch (error) {
        console.error("Failed to store session summary:", error)
        setRecords((prev) =>
          prev.map((r) =>
            r.id.startsWith("session-") && r.status === "pending" ? { ...r, status: "failed" as const } : r,
          ),
        )
        throw error
      } finally {
        setIsStoring(false)
      }
    },
    [isConnected, address],
  )

  // Store payment receipt onchain
  const storePaymentReceipt = useCallback(
    async (paymentData: PaymentReceipt) => {
      if (!isConnected || !address) {
        throw new Error("Wallet not connected")
      }

      setIsStoring(true)

      try {
        // Create record
        const record: OnchainRecord = {
          id: `payment-${Date.now()}`,
          type: "payment",
          data: paymentData,
          timestamp: new Date(),
          status: "pending",
        }

        setRecords((prev) => [record, ...prev])

        // Simulate onchain transaction for payment receipt
        const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Update record with transaction details
        setRecords((prev) =>
          prev.map((r) =>
            r.id === record.id
              ? {
                  ...r,
                  transactionHash: mockTxHash,
                  blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
                  gasUsed: (Math.random() * 0.002 + 0.001).toFixed(6),
                  status: "confirmed" as const,
                }
              : r,
          ),
        )

        return mockTxHash
      } catch (error) {
        console.error("Failed to store payment receipt:", error)
        setRecords((prev) =>
          prev.map((r) =>
            r.id.startsWith("payment-") && r.status === "pending" ? { ...r, status: "failed" as const } : r,
          ),
        )
        throw error
      } finally {
        setIsStoring(false)
      }
    },
    [isConnected, address],
  )

  // Store arbitrary file onchain
  const storeFile = useCallback(
    async (file: File) => {
      if (!isConnected || !address) {
        throw new Error("Wallet not connected")
      }

      setIsStoring(true)

      try {
        // Create record
        const record: OnchainRecord = {
          id: `file-${Date.now()}`,
          type: "file",
          data: {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
          },
          timestamp: new Date(),
          status: "pending",
        }

        setRecords((prev) => [record, ...prev])

        // Simulate file upload and onchain storage
        const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`

        // Simulate upload progress and network delay
        await new Promise((resolve) => setTimeout(resolve, 4000))

        // Update record with transaction details
        setRecords((prev) =>
          prev.map((r) =>
            r.id === record.id
              ? {
                  ...r,
                  transactionHash: mockTxHash,
                  blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
                  gasUsed: (Math.random() * 0.005 + 0.002).toFixed(6),
                  status: "confirmed" as const,
                }
              : r,
          ),
        )

        return mockTxHash
      } catch (error) {
        console.error("Failed to store file:", error)
        setRecords((prev) =>
          prev.map((r) =>
            r.id.startsWith("file-") && r.status === "pending" ? { ...r, status: "failed" as const } : r,
          ),
        )
        throw error
      } finally {
        setIsStoring(false)
      }
    },
    [isConnected, address],
  )

  // Get records by type
  const getRecordsByType = useCallback(
    (type: OnchainRecord["type"]) => {
      return records.filter((record) => record.type === type)
    },
    [records],
  )

  // Get total gas spent
  const getTotalGasSpent = useCallback(() => {
    return records
      .filter((record) => record.status === "confirmed" && record.gasUsed)
      .reduce((total, record) => total + Number.parseFloat(record.gasUsed || "0"), 0)
  }, [records])

  return {
    records,
    isStoring,
    storeSessionSummary,
    storePaymentReceipt,
    storeFile,
    getRecordsByType,
    getTotalGasSpent,
    isConnected,
  }
}
