"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Download,
  Receipt,
  ExternalLink,
  Search,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  Flame,
  TrendingUp,
} from "lucide-react"
import { useAnalytics } from "@/hooks/use-analytics"

interface DownloadRecord {
  id: string
  url: string
  title: string
  timestamp: Date
  status: "completed" | "error" | "pending"
  paymentAmount?: string
  transactionHash?: string
  receipt?: string
  creatorName?: string
  creatorHandle?: string
}

export function HistoryDashboard() {
  const { analytics } = useAnalytics()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "error">("all")
  const [downloadHistory, setDownloadHistory] = useState<DownloadRecord[]>([])

  // Load download history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("grab-download-history")
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory)
      const history = parsed.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }))
      setDownloadHistory(history)
    } else {
      // Generate some mock data for demonstration
      const mockHistory: DownloadRecord[] = [
        {
          id: "1",
          url: "https://warpcast.com/dwr/0x12345",
          title: "Amazing Base Chain Demo",
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          status: "completed",
          paymentAmount: "0.0005 ETH",
          transactionHash: "0xabcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234",
          receipt: "receipt-001",
          creatorName: "Dan Romero",
          creatorHandle: "dwr",
        },
        {
          id: "2",
          url: "https://base.app/jessepollak/0x67890",
          title: "Onchain Summer Highlights",
          timestamp: new Date(Date.now() - 172800000), // 2 days ago
          status: "completed",
          paymentAmount: "0.50 USDC",
          transactionHash: "0xefgh5678901234efgh5678901234efgh5678901234efgh5678901234efgh5678",
          receipt: "receipt-002",
          creatorName: "Jesse Pollak",
          creatorHandle: "jessepollak",
        },
        {
          id: "3",
          url: "https://warpcast.com/vitalik/0xabcdef",
          title: "Ethereum Roadmap Update",
          timestamp: new Date(Date.now() - 259200000), // 3 days ago
          status: "error",
          paymentAmount: "0.0005 ETH",
          creatorName: "Vitalik Buterin",
          creatorHandle: "vitalik",
        },
      ]
      setDownloadHistory(mockHistory)
      localStorage.setItem("grab-download-history", JSON.stringify(mockHistory))
    }
  }, [])

  const filteredHistory = downloadHistory.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.creatorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.creatorHandle?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || item.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const getStatusIcon = (status: DownloadRecord["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-blue-600" />
    }
  }

  const totalSpent = downloadHistory
    .filter((item) => item.status === "completed" && item.paymentAmount)
    .reduce((sum, item) => {
      const amount = Number.parseFloat(item.paymentAmount?.split(" ")[0] || "0")
      return sum + amount
    }, 0)

  const successRate =
    downloadHistory.length > 0
      ? Math.round(
          (downloadHistory.filter((item) => item.status === "completed").length / downloadHistory.length) * 100,
        )
      : 0

  return (
    <Card className="neo-border neo-shadow-lg bg-card p-4 md:p-8">
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
          <div className="neo-border neo-shadow bg-coral p-4">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-black" />
              <span className="text-sm font-bold text-black">TOTAL DOWNLOADS</span>
            </div>
            <p className="text-2xl font-black text-black">{downloadHistory.length}</p>
          </div>

          <div className="neo-border neo-shadow bg-cyan p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-black" />
              <span className="text-sm font-bold text-black">SUCCESS RATE</span>
            </div>
            <p className="text-2xl font-black text-black">{successRate}%</p>
          </div>

          <div className="neo-border neo-shadow bg-yellow p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-black" />
              <span className="text-sm font-bold text-black">TOTAL SPENT</span>
            </div>
            <p className="text-2xl font-black text-black">${totalSpent.toFixed(2)}</p>
          </div>

          <div className="neo-border neo-shadow bg-green p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-black" />
              <span className="text-sm font-bold text-black">STREAK</span>
            </div>
            <p className="text-2xl font-black text-black">{analytics.currentStreak} DAYS</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search downloads, creators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="neo-border bg-white text-black font-medium pl-10 h-11"
            />
          </div>

          <div className="grid grid-cols-3 md:flex gap-2 w-full md:w-auto">
            <Button
              onClick={() => setFilterStatus("all")}
              variant={filterStatus === "all" ? "default" : "outline"}
              className={`w-full md:w-auto neo-border font-bold ${
                filterStatus === "all" ? "bg-coral text-black hover:bg-yellow" : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              ALL
            </Button>
            <Button
              onClick={() => setFilterStatus("completed")}
              variant={filterStatus === "completed" ? "default" : "outline"}
              className={`w-full md:w-auto neo-border font-bold ${
                filterStatus === "completed"
                  ? "bg-green text-black hover:bg-yellow"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              COMPLETED
            </Button>
            <Button
              onClick={() => setFilterStatus("error")}
              variant={filterStatus === "error" ? "default" : "outline"}
              className={`w-full md:w-auto neo-border font-bold ${
                filterStatus === "error"
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              FAILED
            </Button>
          </div>
        </div>

        {/* Download History */}
        <div className="space-y-4">
          <h3 className="text-base md:text-lg font-bold">DOWNLOAD HISTORY</h3>

          {filteredHistory.length > 0 ? (
            <div className="space-y-3">
              {filteredHistory.map((download) => (
                <div key={download.id} className="neo-border bg-secondary p-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0 md:mr-4 w-full">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(download.status)}
                        <h4 className="font-bold text-sm truncate max-w-[75vw] md:max-w-none">{download.title}</h4>
                        {download.paymentAmount && (
                          <Badge className="neo-border bg-green text-black font-bold text-xs">
                            {download.paymentAmount}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground truncate max-w-[80vw] md:max-w-none">{download.url}</p>

                        {download.creatorName && (
                          <p className="text-xs font-medium">
                            by {download.creatorName} (@{download.creatorHandle})
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {download.timestamp.toLocaleDateString()}
                          </span>
                          <span>{download.timestamp.toLocaleTimeString()}</span>
                        </div>

                        {download.transactionHash && (
                          <p className="text-xs text-muted-foreground font-mono">
                            TX: {download.transactionHash.slice(0, 10)}...{download.transactionHash.slice(-8)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col gap-2 md:items-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="neo-border bg-white text-black font-bold hover:bg-gray-100"
                        onClick={() => window.open(download.url, "_blank")}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>

                      {download.status === "completed" && download.receipt && (
                        <Button
                          size="sm"
                          className="neo-border bg-cyan text-black font-bold hover:bg-yellow"
                          onClick={() => {
                            // In a real app, this would show the actual receipt
                            alert(
                              `Receipt ID: ${download.receipt}\nTransaction: ${download.transactionHash}\nAmount: ${download.paymentAmount}`,
                            )
                          }}
                        >
                          <Receipt className="w-3 h-3" />
                        </Button>
                      )}

                      {download.status === "error" && (
                        <Button
                          size="sm"
                          className="neo-border bg-coral text-black font-bold hover:bg-yellow"
                          onClick={() => {
                            // In a real app, this would retry the download
                            alert("Retry functionality would be implemented here")
                          }}
                        >
                          RETRY
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground font-medium">
                {searchTerm || filterStatus !== "all" ? "No downloads match your filters" : "No download history yet"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start downloading videos to see your history here"}
              </p>
            </div>
          )}
        </div>

        {/* Streak History */}
        {analytics.sessions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">ACTIVITY STREAK HISTORY</h3>
            <div className="neo-border bg-secondary p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="font-bold">Current Streak</span>
                  </div>
                  <p className="text-2xl font-black">{analytics.currentStreak} days</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-red-500" />
                    <span className="font-bold">Best Streak</span>
                  </div>
                  <p className="text-2xl font-black">{analytics.longestStreak} days</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span className="font-bold">Total Days</span>
                  </div>
                  <p className="text-2xl font-black">
                    {new Set(analytics.sessions.map((s) => s.startTime.toDateString())).size}
                  </p>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                {analytics.lastActiveDate && <p>Last active: {analytics.lastActiveDate.toLocaleDateString()}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
