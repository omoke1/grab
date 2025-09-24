"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Eye, Download, Calendar, TrendingUp, Users, Flame, Target, BarChart3 } from "lucide-react"
import { useAnalytics } from "@/hooks/use-analytics"

interface AnalyticsDashboardProps {
  isConnected: boolean
  onConnect: () => void
}

export function AnalyticsDashboard({ isConnected, onConnect }: AnalyticsDashboardProps) {
  const {
    analytics,
    isTracking,
    currentSession,
    startSession,
    endSession,
    getDailyStats,
    getWeeklyStats,
    getEngagementHeatmap,
    getEngagementRate,
  } = useAnalytics()

  const dailyStats = getDailyStats()
  const weeklyStats = getWeeklyStats()
  const heatmapData = getEngagementHeatmap()
  const engagementRate = getEngagementRate()

  if (!isConnected) {
    return (
      <Card className="neo-border neo-shadow-lg bg-card p-4 md:p-8">
        <h2 className="text-xl md:text-2xl font-black mb-4 md:mb-6">USAGE ANALYTICS</h2>
        <div className="text-center py-8 md:py-12">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4 font-medium">Connect your wallet to track usage analytics</p>
          <Button onClick={onConnect} className="neo-border neo-shadow bg-primary text-primary-foreground font-bold">
            CONNECT WALLET
          </Button>
        </div>
      </Card>
    )
  }

  const maxActivity = Math.max(...heatmapData.map((h) => h.activity))
  const getHeatmapIntensity = (activity: number) => {
    if (activity === 0) return "bg-gray-100"
    const intensity = activity / maxActivity
    if (intensity > 0.75) return "bg-coral"
    if (intensity > 0.5) return "bg-yellow"
    if (intensity > 0.25) return "bg-cyan"
    return "bg-green"
  }

  return (
    <Card className="neo-border neo-shadow-lg bg-card p-4 md:p-8 overflow-hidden">
      <div className="flex items-start md:items-center justify-between mb-4 md:mb-6 gap-3 flex-col md:flex-row">
        <h2 className="text-xl md:text-2xl font-black">USAGE ANALYTICS</h2>
        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
          {isTracking && (
            <Badge className="neo-border bg-green text-black font-bold">
              <div className="w-2 h-2 bg-black rounded-full mr-2 animate-pulse" />
              TRACKING
            </Badge>
          )}
          <Button
            onClick={isTracking ? endSession : startSession}
            className={`w-full md:w-auto neo-border neo-shadow font-bold ${
              isTracking ? "bg-coral text-black hover:bg-yellow" : "bg-cyan text-black hover:bg-yellow"
            }`}
          >
            {isTracking ? "END SESSION" : "START SESSION"}
          </Button>
        </div>
      </div>

      {/* Current Session */}
      {currentSession && (
        <div className="mb-6 md:mb-8">
          <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">CURRENT SESSION</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4">
            <div className="neo-border neo-shadow bg-cyan p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-black" />
                <span className="text-sm font-bold text-black">DURATION</span>
              </div>
              <p className="text-2xl font-black text-black">{currentSession.duration} MIN</p>
            </div>

            <div className="neo-border neo-shadow bg-coral p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-black" />
                <span className="text-sm font-bold text-black">CASTS VIEWED</span>
              </div>
              <p className="text-2xl font-black text-black">{currentSession.castsViewed}</p>
            </div>

            <div className="neo-border neo-shadow bg-yellow p-4">
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-4 h-4 text-black" />
                <span className="text-sm font-bold text-black">DOWNLOADS</span>
              </div>
              <p className="text-2xl font-black text-black">{currentSession.downloadsCount}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 md:mb-8">
        <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">CREATOR INSIGHTS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Top Interactions */}
          <div className="neo-border neo-shadow bg-secondary p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5" />
              <h4 className="font-bold">TOP INTERACTIONS</h4>
            </div>
            {analytics.topCreators.length > 0 ? (
              <div className="space-y-3">
                {analytics.topCreators.slice(0, 3).map((creator, index) => (
                  <div key={creator.creatorHandle} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-black ${
                          index === 0 ? "bg-coral" : index === 1 ? "bg-cyan" : "bg-yellow"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{creator.creatorName}</p>
                        <p className="text-xs text-muted-foreground">@{creator.creatorHandle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{creator.interactions}</p>
                      <p className="text-xs text-muted-foreground">interactions</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No creator interactions yet</p>
            )}
          </div>

          {/* Engagement Stats */}
          <div className="neo-border neo-shadow bg-secondary p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5" />
              <h4 className="font-bold">ENGAGEMENT STATS</h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Engagement Rate</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(engagementRate, 100)}%` }}
                    />
                  </div>
                  <span className="font-bold text-sm">{engagementRate}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Current Streak</p>
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="font-bold">{analytics.currentStreak} days</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Best Streak</p>
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-red-500" />
                    <span className="font-bold">{analytics.longestStreak} days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 md:mb-8">
        <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">ACTIVITY HEATMAP</h3>
        <div className="neo-border neo-shadow bg-secondary p-4 md:p-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5" />
            <h4 className="font-bold">MOST ACTIVE HOURS</h4>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1 mb-4">
            {heatmapData.map((hour) => (
              <div key={hour.hour} className="text-center">
                <div
                  className={`w-full h-6 md:h-8 rounded border-2 border-black ${getHeatmapIntensity(hour.activity)} mb-1`}
                  title={`${hour.label}: ${hour.activity} minutes`}
                />
                <span className="text-[10px] md:text-xs font-bold">{hour.hour}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Less active</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-gray-100 border border-black rounded" />
              <div className="w-3 h-3 bg-green border border-black rounded" />
              <div className="w-3 h-3 bg-cyan border border-black rounded" />
              <div className="w-3 h-3 bg-yellow border border-black rounded" />
              <div className="w-3 h-3 bg-coral border border-black rounded" />
            </div>
            <span>More active</span>
          </div>
        </div>
      </div>

      {/* Daily Stats */}
      <div className="mb-6 md:mb-8">
        <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">TODAY</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <div className="neo-border neo-shadow bg-secondary p-4">
            <p className="text-sm font-bold text-muted-foreground mb-1">SESSIONS</p>
            <p className="text-xl font-black">{dailyStats.sessions}</p>
          </div>
          <div className="neo-border neo-shadow bg-secondary p-4">
            <p className="text-sm font-bold text-muted-foreground mb-1">MINUTES</p>
            <p className="text-xl font-black">{dailyStats.minutes}</p>
          </div>
          <div className="neo-border neo-shadow bg-secondary p-4">
            <p className="text-sm font-bold text-muted-foreground mb-1">CASTS</p>
            <p className="text-xl font-black">{dailyStats.casts}</p>
          </div>
          <div className="neo-border neo-shadow bg-secondary p-4">
            <p className="text-sm font-bold text-muted-foreground mb-1">DOWNLOADS</p>
            <p className="text-xl font-black">{dailyStats.downloads}</p>
          </div>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="mb-6 md:mb-8">
        <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">THIS WEEK</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <div className="neo-border neo-shadow bg-green p-4">
            <p className="text-sm font-bold text-black mb-1">SESSIONS</p>
            <p className="text-xl font-black text-black">{weeklyStats.sessions}</p>
          </div>
          <div className="neo-border neo-shadow bg-cyan p-4">
            <p className="text-sm font-bold text-black mb-1">MINUTES</p>
            <p className="text-xl font-black text-black">{weeklyStats.minutes}</p>
          </div>
          <div className="neo-border neo-shadow bg-coral p-4">
            <p className="text-sm font-bold text-black mb-1">CASTS</p>
            <p className="text-xl font-black text-black">{weeklyStats.casts}</p>
          </div>
          <div className="neo-border neo-shadow bg-yellow p-4">
            <p className="text-sm font-bold text-black mb-1">DOWNLOADS</p>
            <p className="text-xl font-black text-black">{weeklyStats.downloads}</p>
          </div>
        </div>
      </div>

      {/* All Time Stats */}
      <div>
        <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">ALL TIME</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <div className="neo-border neo-shadow bg-secondary p-4">
            <p className="text-sm font-bold text-muted-foreground mb-1">TOTAL SESSIONS</p>
            <p className="text-xl font-black">{analytics.totalSessions}</p>
          </div>
          <div className="neo-border neo-shadow bg-secondary p-4">
            <p className="text-sm font-bold text-muted-foreground mb-1">TOTAL MINUTES</p>
            <p className="text-xl font-black">{analytics.totalMinutes}</p>
          </div>
          <div className="neo-border neo-shadow bg-secondary p-4">
            <p className="text-sm font-bold text-muted-foreground mb-1">TOTAL CASTS</p>
            <p className="text-xl font-black">{analytics.totalCasts}</p>
          </div>
          <div className="neo-border neo-shadow bg-secondary p-4">
            <p className="text-sm font-bold text-muted-foreground mb-1">TOTAL DOWNLOADS</p>
            <p className="text-xl font-black">{analytics.totalDownloads}</p>
          </div>
        </div>
      </div>

      {analytics.sessions.length > 0 && (
        <div className="mt-6 md:mt-8">
          <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">RECENT SESSIONS</h3>
          <div className="space-y-3">
            {analytics.sessions.slice(0, 5).map((session) => (
              <div key={session.sessionId} className="neo-border bg-secondary p-4 flex items-start md:items-center justify-between gap-2 md:gap-4 flex-col md:flex-row">
                <div className="w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{session.startTime.toLocaleDateString()}</span>
                    <span className="text-sm text-muted-foreground">
                      {session.startTime.toLocaleTimeString()} - {session.endTime?.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{session.duration} min</span>
                    <span>{session.castsViewed} casts</span>
                    <span>{session.downloadsCount} downloads</span>
                    <span>{session.engagementActions || 0} engagements</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
