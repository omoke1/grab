"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Heart, MessageCircle, Repeat2, TrendingUp, Download, ExternalLink, User } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { APP_CONFIG } from "@/lib/config"

interface PostAnalytics {
  likes: number
  comments: number
  recasts: number
  engagementRate: number
  mutualInteractions: {
    username: string
    wallet: string
    interactions: string[]
  }[]
}

export function PostTracker() {
  const [postUrl, setPostUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analytics, setAnalytics] = useState<PostAnalytics | null>(null)
  const { isConnected, connect, sendTransaction, sendUsdcTransfer, ensureBaseChain } = useWallet()
  const [paymentMethod, setPaymentMethod] = useState<"eth" | "usdc">("eth")

  const handleAnalyzePost = async () => {
    if (!postUrl.trim()) return

    setIsAnalyzing(true)

    // Require small payment before analysis
    try {
      if (!isConnected) {
        const addr = await connect()
        if (!addr) {
          setIsAnalyzing(false)
          return
        }
      }

      // Ensure Base chain and charge analysis fee
      await ensureBaseChain()
      if (paymentMethod === "eth") {
        await sendTransaction({
          to: APP_CONFIG.recipient,
          value: ("0x" + APP_CONFIG.prices.analysisEthWei.toString(16)) as `0x${string}`,
        })
      } else {
        await sendUsdcTransfer(APP_CONFIG.usdcAddress, APP_CONFIG.recipient, APP_CONFIG.prices.usdcUnits)
      }

      // Simulate API call to analyze post
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (err) {
      console.error("Analysis payment failed", err)
      setIsAnalyzing(false)
      return
    }

    // Mock analytics data
    const mockAnalytics: PostAnalytics = {
      likes: 42,
      comments: 18,
      recasts: 23,
      engagementRate: 12.5,
      mutualInteractions: [
        { username: "alice.eth", wallet: "0x1234...5678", interactions: ["like", "recast"] },
        { username: "bob.base", wallet: "0x9876...4321", interactions: ["comment"] },
        { username: "charlie.fc", wallet: "0x5555...7777", interactions: ["like"] },
        { username: "diana.warpcast", wallet: "0x3333...9999", interactions: ["like", "comment", "recast"] },
        { username: "eve.farcaster", wallet: "0x7777...1111", interactions: ["recast"] },
      ],
    }

    setAnalytics(mockAnalytics)
    setIsAnalyzing(false)
  }

  const handleExportAnalytics = () => {
    if (!analytics) return

    const exportData = {
      postUrl,
      timestamp: new Date().toISOString(),
      analytics,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `post-analytics-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getInteractionIcon = (interaction: string) => {
    switch (interaction) {
      case "like":
        return <Heart className="w-3 h-3 text-red-500" />
      case "comment":
        return <MessageCircle className="w-3 h-3 text-blue-500" />
      case "recast":
        return <Repeat2 className="w-3 h-3 text-green-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Post URL Input */}
      <Card className="neo-border neo-shadow-lg bg-cyan p-6">
        <h3 className="text-xl font-bold text-black mb-4">Analyze Farcaster Post</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Paste BaseApp/Farcaster post link here..."
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
              className="neo-border bg-white text-black placeholder:text-gray-500 font-medium"
            />
            <div className="flex gap-2">
              <Button
                variant={paymentMethod === "eth" ? "default" : "outline"}
                onClick={() => setPaymentMethod("eth")}
                className={`neo-border font-bold ${
                  paymentMethod === "eth" ? "bg-cyan text-black hover:bg-yellow" : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                ~$0.70 ETH
              </Button>
              <Button
                variant={paymentMethod === "usdc" ? "default" : "outline"}
                onClick={() => setPaymentMethod("usdc")}
                className={`neo-border font-bold ${
                  paymentMethod === "usdc" ? "bg-green text-black hover:bg-yellow" : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                0.70 USDC
              </Button>
            </div>
            <Button
              onClick={handleAnalyzePost}
              disabled={!postUrl.trim() || isAnalyzing}
              className="neo-border neo-shadow bg-primary text-white font-bold hover:bg-primary/90 px-6"
            >
              <Search className="w-4 h-4 mr-2" />
              {isAnalyzing ? "Analyzing..." : "Analyze Post"}
            </Button>
          </div>
          <p className="text-sm text-black/70">
            Enter a Farcaster post URL to analyze interactions from mutual followers
          </p>
        </div>
      </Card>

      {/* Loading State */}
      {isAnalyzing && (
        <Card className="neo-border bg-yellow p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-black border-t-transparent mr-4"></div>
            <span className="text-black font-bold">Fetching mutual follower interactions...</span>
          </div>
        </Card>
      )}

      {/* Analytics Results */}
      {analytics && !isAnalyzing && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="neo-border bg-coral p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-black" />
                <h4 className="font-bold text-black">Likes</h4>
              </div>
              <p className="text-2xl font-bold text-black">{analytics.likes}</p>
              <p className="text-xs text-black/70">from mutuals</p>
            </Card>

            <Card className="neo-border bg-cyan p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-5 h-5 text-black" />
                <h4 className="font-bold text-black">Comments</h4>
              </div>
              <p className="text-2xl font-bold text-black">{analytics.comments}</p>
              <p className="text-xs text-black/70">from mutuals</p>
            </Card>

            <Card className="neo-border bg-yellow p-4">
              <div className="flex items-center gap-2 mb-2">
                <Repeat2 className="w-5 h-5 text-black" />
                <h4 className="font-bold text-black">Recasts</h4>
              </div>
              <p className="text-2xl font-bold text-black">{analytics.recasts}</p>
              <p className="text-xs text-black/70">from mutuals</p>
            </Card>

            <Card className="neo-border bg-green p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-black" />
                <h4 className="font-bold text-black">Engagement</h4>
              </div>
              <p className="text-2xl font-bold text-black">{analytics.engagementRate}%</p>
              <p className="text-xs text-black/70">mutual rate</p>
            </Card>
          </div>

          {/* Mutual Interactions List */}
          <Card className="neo-border neo-shadow-lg bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-black">Mutual Follower Interactions</h3>
              <Button
                onClick={handleExportAnalytics}
                className="neo-border neo-shadow bg-primary text-white font-bold hover:bg-primary/90"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Analytics
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {analytics.mutualInteractions.map((user, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border-2 border-black rounded p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-black">@{user.username}</div>
                      <div className="text-xs text-gray-600 font-mono">{user.wallet}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {user.interactions.map((interaction, i) => (
                        <div key={i} className="flex items-center">
                          {getInteractionIcon(interaction)}
                        </div>
                      ))}
                    </div>
                    <Badge className="neo-border bg-yellow text-black font-bold text-xs">
                      {user.interactions.length} interaction{user.interactions.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t-2 border-black">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Total mutual followers who interacted: {analytics.mutualInteractions.length}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="neo-border bg-cyan text-black font-bold hover:bg-cyan/80"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Original Post
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!analytics && !isAnalyzing && (
        <Card className="neo-border bg-white p-8">
          <div className="text-center py-8">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-bold text-black mb-2">No Post Analyzed Yet</h3>
            <p className="text-gray-600 font-medium">
              Paste a Farcaster post URL above to analyze mutual follower interactions
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
