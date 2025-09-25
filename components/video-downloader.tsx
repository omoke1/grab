"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Download, ExternalLink, CheckCircle, AlertCircle, DollarSign, Receipt } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { OnchainKitWalletButton } from "@/components/onchainkit-wallet-button"
import { APP_CONFIG } from "@/lib/config"

interface DownloadItem {
  id: string
  url: string
  title: string
  timestamp: Date
  status: "pending" | "completed" | "error" | "payment-required" | "payment-processing"
  paymentAmount?: string
  transactionHash?: string
  receipt?: string
}

interface VideoDownloaderProps {
  onDownload?: (url: string, paymentHash?: string) => void
  downloads?: DownloadItem[]
}

export function VideoDownloader({ onDownload, downloads = [] }: VideoDownloaderProps) {
  const [castUrl, setCastUrl] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)
  const [localDownloads, setLocalDownloads] = useState<DownloadItem[]>([])
  const [paymentStep, setPaymentStep] = useState<"input" | "payment" | "processing">("input")
  const [selectedPayment, setSelectedPayment] = useState<"eth" | "usdc">("eth")

  const { address, isConnected, connect, sendTransaction, sendUsdcTransfer, ensureBaseChain } = useWallet()

  const handleDownload = async () => {
    if (!castUrl.trim()) return
    if (!isConnected) await connect()
    if (!isConnected) return

    // Validate URL format
    if (!isValidCastUrl(castUrl)) {
      alert("Invalid cast URL format")
      return
    }

    setPaymentStep("payment")
  }

  const processPayment = async () => {
    if (!isConnected || !address) {
      const addr = await connect()
      if (!addr) return
    }

    setIsDownloading(true)
    setPaymentStep("processing")

    try {
      const paymentAmount = selectedPayment === "eth" ? "~$0.70" : "0.70 USDC"

      // Create new download item with payment status
      const newDownload: DownloadItem = {
        id: Date.now().toString(),
        url: castUrl,
        title: `Video from ${new URL(castUrl).hostname}`,
        timestamp: new Date(),
        status: "payment-processing",
        paymentAmount: `${paymentAmount} ${selectedPayment.toUpperCase()}`,
      }

      setLocalDownloads((prev) => [newDownload, ...prev])

      // Ensure Base chain
      await ensureBaseChain()

      // Send onchain payment
      if (selectedPayment === "eth") {
        const txHash = await sendTransaction({
          to: APP_CONFIG.recipient,
          value: ("0x" + APP_CONFIG.prices.downloadEthWei.toString(16)) as `0x${string}`,
        })

        setLocalDownloads((prev) =>
          prev.map((item) =>
            item.id === newDownload.id ? { ...item, status: "pending", transactionHash: txHash } : item,
          ),
        )

        // Simulate video extraction after payment confirmation
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setLocalDownloads((prev) =>
          prev.map((item) =>
            item.id === newDownload.id ? { ...item, status: "completed", receipt: `receipt-${Date.now()}` } : item,
          ),
        )

        if (onDownload) {
          onDownload(castUrl, txHash)
        }
      } else {
        const txHash = await sendUsdcTransfer(APP_CONFIG.usdcAddress, APP_CONFIG.recipient, APP_CONFIG.prices.usdcUnits)

        setLocalDownloads((prev) =>
          prev.map((item) =>
            item.id === newDownload.id ? { ...item, status: "pending", transactionHash: txHash } : item,
          ),
        )

        await new Promise((resolve) => setTimeout(resolve, 2000))

        setLocalDownloads((prev) =>
          prev.map((item) =>
            item.id === newDownload.id ? { ...item, status: "completed", receipt: `receipt-${Date.now()}` } : item,
          ),
        )

        if (onDownload) {
          onDownload(castUrl, txHash)
        }
      }

      setCastUrl("")
      setPaymentStep("input")
    } catch (error) {
      console.error("Payment failed:", error)
      setLocalDownloads((prev) => prev.map((item) => (item.url === castUrl ? { ...item, status: "error" } : item)))
      setPaymentStep("input")
    } finally {
      setIsDownloading(false)
    }
  }

  const cancelPayment = () => {
    setPaymentStep("input")
    setIsDownloading(false)
  }

  const isValidCastUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      const validHosts = [
        'warpcast.com',
        'supercast.xyz', 
        'base.app',
        'farcaster.xyz',
        'farcaster.com'
      ]
      
      // Check if it's a valid Farcaster-related URL
      const isValidHost = validHosts.some(host => 
        urlObj.hostname === host || urlObj.hostname.endsWith(`.${host}`)
      )
      
      // Also accept any URL that contains common Farcaster patterns
      const hasFarcasterPattern = /(cast|farcaster|warpcast|supercast)/i.test(url)
      
      return isValidHost || hasFarcasterPattern
    } catch {
      return false
    }
  }

  const getStatusIcon = (status: DownloadItem["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case "payment-required":
        return <DollarSign className="w-4 h-4 text-yellow-600" />
      case "payment-processing":
        return <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
      default:
        return <Download className="w-4 h-4 text-blue-600" />
    }
  }

  const allDownloads = downloads && downloads.length > 0 ? downloads : localDownloads
  const recentDownloads = allDownloads ? allDownloads.slice(-5).reverse() : []

  return (
    <Card className="neo-border neo-shadow-lg bg-card p-4 md:p-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl md:text-2xl font-black mb-3 md:mb-4 text-balance">DOWNLOAD VIDEO</h2>
          <p className="text-muted-foreground mb-4 md:mb-6 text-pretty text-sm md:text-base">
            Pay a small fee ($0.50) to extract and download videos from Farcaster casts as MP4
          </p>
        </div>

        <div className="space-y-4">
          {paymentStep === "input" && (
            <>
              <div className="flex gap-2 md:gap-4 flex-col sm:flex-row">
                <Input
                  placeholder="https://warpcast.com/username/0x..."
                  value={castUrl}
                  onChange={(e) => setCastUrl(e.target.value)}
                  className="neo-border flex-1 bg-white text-black font-medium h-12"
                  disabled={isDownloading}
                />
                <Button
                  onClick={handleDownload}
                  disabled={!castUrl.trim() || isDownloading || !isConnected}
                  className="neo-border neo-shadow bg-coral text-black font-bold hover:bg-yellow h-12 px-6"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  PAY & DOWNLOAD
                </Button>
              </div>

              {!isConnected && (
                <div className="neo-border bg-yellow text-black p-3 md:p-4 rounded-lg text-center space-y-3">
                  <p className="font-bold text-sm md:text-base">⚠️ Connect your wallet to download videos</p>
                  <OnchainKitWalletButton />
                </div>
              )}
            </>
          )}

          {paymentStep === "payment" && (
            <div className="neo-border bg-white p-4 md:p-6 rounded-lg space-y-4">
              <h3 className="text-lg font-bold text-black">Choose Payment Method</h3>
              <p className="text-sm text-gray-600 mb-4">Select how you'd like to pay for this download:</p>

              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <button
                  onClick={() => setSelectedPayment("eth")}
                  className={`neo-border p-4 rounded-lg font-bold transition-all ${
                    selectedPayment === "eth"
                      ? "bg-cyan text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-gray-100 text-black hover:bg-gray-200"
                  }`}
                >
                  <div className="text-lg">~$0.70 ETH</div>
                  <div className="text-sm opacity-70">Approximate</div>
                </button>

                <button
                  onClick={() => setSelectedPayment("usdc")}
                  className={`neo-border p-4 rounded-lg font-bold transition-all ${
                    selectedPayment === "usdc"
                      ? "bg-cyan text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-gray-100 text-black hover:bg-gray-200"
                  }`}
                >
                  <div className="text-lg">0.70 USDC</div>
                  <div className="text-sm opacity-70">Stablecoin</div>
                </button>
              </div>

              <div className="flex gap-2 md:gap-4 pt-4 flex-col sm:flex-row">
                <Button
                  onClick={cancelPayment}
                  variant="outline"
                  className="neo-border bg-white text-black font-bold hover:bg-gray-100 flex-1"
                >
                  CANCEL
                </Button>
                <Button
                  onClick={processPayment}
                  className="neo-border neo-shadow bg-green text-black font-bold hover:bg-yellow flex-1"
                  disabled={isDownloading}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  PAY {selectedPayment.toUpperCase()}
                </Button>
              </div>
            </div>
          )}

          {paymentStep === "processing" && (
            <div className="neo-border bg-yellow text-black p-6 rounded-lg text-center">
              <div className="w-8 h-8 mx-auto mb-4 border-4 border-black border-t-transparent rounded-full animate-spin" />
              <h3 className="text-lg font-bold mb-2">Processing Payment...</h3>
              <p className="text-sm">Please wait while we process your payment and extract the video.</p>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Supported platforms:</p>
            <div className="flex flex-wrap gap-2">
              <span className="neo-border bg-cyan text-black px-2 py-1 text-xs font-bold">WARPCAST</span>
              <span className="neo-border bg-yellow text-black px-2 py-1 text-xs font-bold">SUPERCAST</span>
              <span className="neo-border bg-green text-black px-2 py-1 text-xs font-bold">BASE.APP</span>
            </div>
          </div>
        </div>

        {recentDownloads.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">RECENT DOWNLOADS</h3>
            <div className="space-y-3">
              {recentDownloads.map((download) => (
                <div key={download.id} className="neo-border bg-secondary p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(download.status)}
                      <span className="font-mono text-sm truncate">{download.title || "Video"}</span>
                      {download.paymentAmount && (
                        <span className="neo-border bg-green text-black px-2 py-1 text-xs font-bold">
                          {download.paymentAmount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{download.url}</p>
                    <p className="text-xs text-muted-foreground">{download.timestamp.toLocaleString()}</p>
                    {download.transactionHash && (
                      <p className="text-xs text-muted-foreground font-mono">
                        TX: {download.transactionHash.slice(0, 10)}...{download.transactionHash.slice(-8)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
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
                        onClick={() => alert(`Receipt: ${download.receipt}`)}
                      >
                        <Receipt className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {allDownloads.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
            <Download className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground font-medium">No downloads yet</p>
            <p className="text-sm text-muted-foreground mt-1">Paste a cast URL above to get started</p>
          </div>
        )}
      </div>
    </Card>
  )
}
