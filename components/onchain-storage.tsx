"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  ExternalLink,
  Receipt,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  BarChart3,
  Eye,
} from "lucide-react"
import { useOnchainStorage } from "@/hooks/use-onchain-storage"
import { useAnalytics } from "@/hooks/use-analytics"

export function OnchainStorage() {
  const {
    records,
    isStoring,
    storeSessionSummary,
    storePaymentReceipt,
    getRecordsByType,
    getTotalGasSpent,
    isConnected,
  } = useOnchainStorage()

  const { analytics, endSession } = useAnalytics()
  const [isExporting, setIsExporting] = useState(false)

  const handleStoreSessionSummary = async () => {
    if (!analytics.currentSession) return

    try {
      const sessionSummary = endSession()
      if (sessionSummary) {
        await storeSessionSummary({
          sessionId: analytics.currentSession.sessionId,
          sessionDuration: sessionSummary.sessionDuration,
          castsViewed: sessionSummary.castsViewed,
          downloadsPaid: sessionSummary.downloadsCount,
          timestamp: sessionSummary.timestamp,
          userAddress: "0x1234...5678", // Would be actual user address
        })
      }
    } catch (error) {
      console.error("Failed to store session summary:", error)
    }
  }

  const handleStorePaymentReceipt = async () => {
    // This would typically be called automatically after a successful payment
    try {
      await storePaymentReceipt({
        receiptId: `receipt-${Date.now()}`,
        downloadUrl: "https://warpcast.com/example/0x123",
        amount: "0.0005",
        currency: "ETH",
        creatorHandle: "example",
        timestamp: new Date(),
        userAddress: "0x1234...5678",
      })
    } catch (error) {
      console.error("Failed to store payment receipt:", error)
    }
  }

  const handleExportAnalytics = async () => {
    setIsExporting(true)

    // Simulate fetching analytics from IPFS/Arweave
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const analyticsData = {
      userAddress: "0x1234...5678",
      exportDate: new Date().toISOString(),
      sessions: analytics.sessions,
      totalDownloads: analytics.totalDownloads,
      totalSpent: analytics.totalSpent,
      favoriteCreators: analytics.favoriteCreators,
      usagePatterns: {
        peakHours: "2-4 PM",
        averageSessionDuration: "12 minutes",
        mostActiveDay: "Tuesday",
      },
    }

    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `grab-analytics-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setIsExporting(false)
  }

  const handleViewStoredAnalytics = () => {
    // This would fetch and display stored analytics from the blockchain
    alert("Fetching stored analytics from decentralized storage...")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "session":
        return <Clock className="w-4 h-4" />
      case "payment":
        return <Receipt className="w-4 h-4" />
      case "analytics":
        return <BarChart3 className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const sessionRecords = getRecordsByType("session")
  const paymentRecords = getRecordsByType("payment")
  const analyticsRecords = getRecordsByType("analytics")
  const totalGasSpent = getTotalGasSpent()

  if (!isConnected) {
    return (
      <Card className="neo-border neo-shadow-lg bg-card p-8">
        <h2 className="text-2xl font-black mb-6">PERSONAL VAULT</h2>
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4 font-medium">Connect your wallet to access your personal vault</p>
          <Button className="neo-border neo-shadow bg-primary text-primary-foreground font-bold">CONNECT WALLET</Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="neo-border neo-shadow-lg bg-cyan p-6">
          <h3 className="text-lg font-bold text-black mb-4">SESSION SUMMARY</h3>
          <p className="text-sm text-black mb-4">Store your current session data onchain</p>
          <Button
            onClick={handleStoreSessionSummary}
            disabled={!analytics.currentSession || isStoring}
            className="neo-border neo-shadow bg-green text-black font-bold hover:bg-yellow w-full"
          >
            <Clock className="w-4 h-4 mr-2" />
            STORE SESSION
          </Button>
        </Card>

        <Card className="neo-border neo-shadow-lg bg-coral p-6">
          <h3 className="text-lg font-bold text-black mb-4">PAYMENT RECEIPT</h3>
          <p className="text-sm text-black mb-4">Create and store payment receipts onchain</p>
          <Button
            onClick={handleStorePaymentReceipt}
            disabled={isStoring}
            className="neo-border neo-shadow bg-yellow text-black font-bold hover:bg-green w-full"
          >
            <Receipt className="w-4 h-4 mr-2" />
            STORE RECEIPT
          </Button>
        </Card>
      </div>

      <Card className="neo-border neo-shadow-lg bg-yellow p-6">
        <h3 className="text-xl font-bold text-black mb-4">Session Vault</h3>
        <p className="text-sm text-black mb-6">Manage your analytics data stored in decentralized storage</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handleExportAnalytics}
            disabled={isExporting}
            className="neo-border neo-shadow bg-green text-black font-bold hover:bg-cyan"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Exporting..." : "Export My Analytics"}
          </Button>

          <Button
            onClick={handleViewStoredAnalytics}
            className="neo-border neo-shadow bg-primary text-white font-bold hover:bg-primary/90"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Stored Analytics
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neo-border bg-coral p-4">
          <h4 className="font-bold text-black mb-2">Session Records</h4>
          <p className="text-2xl font-bold text-black">{sessionRecords.length}</p>
        </Card>
        <Card className="neo-border bg-cyan p-4">
          <h4 className="font-bold text-black mb-2">Payment Receipts</h4>
          <p className="text-2xl font-bold text-black">{paymentRecords.length}</p>
        </Card>
        <Card className="neo-border bg-yellow p-4">
          <h4 className="font-bold text-black mb-2">Analytics Stored</h4>
          <p className="text-2xl font-bold text-black">{analyticsRecords.length}</p>
        </Card>
        <Card className="neo-border bg-green p-4">
          <h4 className="font-bold text-black mb-2">Gas Spent</h4>
          <p className="text-2xl font-bold text-black">{totalGasSpent.toFixed(4)} ETH</p>
        </Card>
      </div>

      {/* Onchain Records */}
      <Card className="neo-border neo-shadow-lg bg-white p-6">
        <h3 className="text-xl font-bold text-black mb-4">Onchain Records</h3>

        {records.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 font-medium">No onchain records yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Store your first session or create a payment receipt to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div
                key={record.id}
                className="bg-gray-50 border-2 border-black rounded p-4 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(record.type)}
                    <span className="font-medium text-black capitalize">{record.type} Record</span>
                    <Badge
                      className={`neo-border text-xs font-bold ${
                        record.status === "confirmed"
                          ? "bg-green text-black"
                          : record.status === "failed"
                            ? "bg-red-500 text-white"
                            : "bg-yellow text-black"
                      }`}
                    >
                      {record.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Created: {record.timestamp.toLocaleString()}</div>

                    {record.type === "session" && (
                      <div>
                        Duration: {record.data.sessionDuration}min • Casts: {record.data.castsViewed} • Downloads:{" "}
                        {record.data.downloadsPaid}
                      </div>
                    )}

                    {record.type === "payment" && (
                      <div>
                        Amount: {record.data.amount} {record.data.currency} • Creator: @{record.data.creatorHandle}
                      </div>
                    )}

                    {record.type === "analytics" && (
                      <div>
                        Analytics: {record.data.name} • Size: {record.data.size || "N/A"}
                      </div>
                    )}

                    {record.transactionHash && (
                      <div className="font-mono text-xs">
                        TX: {record.transactionHash.slice(0, 10)}...{record.transactionHash.slice(-8)}
                      </div>
                    )}

                    {record.gasUsed && (
                      <div className="text-xs">
                        Gas: {record.gasUsed} ETH • Block: #{record.blockNumber}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusIcon(record.status)}

                  {record.transactionHash && record.status === "confirmed" && (
                    <Button
                      size="sm"
                      className="bg-cyan border-2 border-black rounded font-bold text-black hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
                      onClick={() => {
                        // In a real app, this would open the transaction on a block explorer
                        window.open(`https://basescan.org/tx/${record.transactionHash}`, "_blank")
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}

                  {(record.type === "analytics" || record.type === "session") && record.status === "confirmed" && (
                    <Button
                      size="sm"
                      className="bg-yellow border-2 border-black rounded font-bold text-black hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
