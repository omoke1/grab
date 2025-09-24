"use client"

import { useState } from "react"
import { VideoDownloader } from "./video-downloader"
import { AnalyticsDashboard } from "./analytics-dashboard"
import { OnchainStorage } from "./onchain-storage"
import { HistoryDashboard } from "./history-dashboard"
import { PostTracker } from "./post-tracker"

const tabs = [
  { id: "download", label: "Download", color: "bg-coral" },
  { id: "stats", label: "My Stats", color: "bg-cyan" },
  { id: "history", label: "History", color: "bg-yellow" },
  { id: "storage", label: "Storage", color: "bg-green" },
  { id: "tracker", label: "Post Tracker", color: "bg-primary" },
]

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("download")

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-6 py-3 font-bold text-black border-4 border-black rounded-lg
              transition-all duration-200 hover:translate-x-1 hover:translate-y-1
              hover:shadow-none active:translate-x-2 active:translate-y-2
              ${
                activeTab === tab.id
                  ? `${tab.color} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
                  : "bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white border-4 border-black rounded-lg p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {activeTab === "download" && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-black">Video Downloader</h2>
            <VideoDownloader />
          </div>
        )}

        {activeTab === "stats" && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-black">My Stats</h2>
            <AnalyticsDashboard isConnected={true} onConnect={() => {}} />
          </div>
        )}

        {activeTab === "history" && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-black">History</h2>
            <HistoryDashboard />
          </div>
        )}

        {activeTab === "storage" && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-black">Onchain Storage</h2>
            <OnchainStorage />
          </div>
        )}

        {activeTab === "tracker" && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-black">Post Tracker</h2>
            <PostTracker />
          </div>
        )}
      </div>
    </div>
  )
}
