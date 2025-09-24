"use client"

import { useState, useCallback } from "react"
import { useWallet } from "./use-wallet"

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

  const { address, isConnected } = useWallet()

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

        // TODO: Implement real onchain storage
        // For now, just mark as confirmed without actual transaction
        setRecords((prev) =>
          prev.map((r) =>
            r.id === record.id
              ? {
                  ...r,
                  status: "confirmed" as const,
                }
              : r,
          ),
        )

        return "onchain-storage-disabled"
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

        // TODO: Implement real onchain storage
        // For now, just mark as confirmed without actual transaction
        setRecords((prev) =>
          prev.map((r) =>
            r.id === record.id
              ? {
                  ...r,
                  status: "confirmed" as const,
                }
              : r,
          ),
        )

        return "onchain-storage-disabled"
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

        // TODO: Implement real onchain storage
        // For now, just mark as confirmed without actual transaction
        setRecords((prev) =>
          prev.map((r) =>
            r.id === record.id
              ? {
                  ...r,
                  status: "confirmed" as const,
                }
              : r,
          ),
        )

        return "onchain-storage-disabled"
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
