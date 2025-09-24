"use client"

import { useState, useEffect, useCallback } from "react"

interface CreatorInteraction {
  creatorName: string
  creatorHandle: string
  interactions: number
  lastInteraction: Date
}

interface SessionData {
  sessionId: string
  startTime: Date
  endTime?: Date
  duration: number // in minutes
  castsViewed: number
  downloadsCount: number
  isActive: boolean
  creatorInteractions: CreatorInteraction[]
  activityHours: number[] // Array of hours (0-23) when user was active
  engagementActions: number // clicks, likes, shares, etc.
}

interface AnalyticsData {
  totalSessions: number
  totalMinutes: number
  totalCasts: number
  totalDownloads: number
  sessions: SessionData[]
  currentSession?: SessionData
  topCreators: CreatorInteraction[]
  currentStreak: number
  longestStreak: number
  lastActiveDate?: Date
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSessions: 0,
    totalMinutes: 0,
    totalCasts: 0,
    totalDownloads: 0,
    sessions: [],
    topCreators: [],
    currentStreak: 0,
    longestStreak: 0,
  })

  const [isTracking, setIsTracking] = useState(false)

  // Load analytics data from localStorage on mount
  useEffect(() => {
    const savedAnalytics = localStorage.getItem("grab-analytics")
    if (savedAnalytics) {
      const parsed = JSON.parse(savedAnalytics)
      // Convert date strings back to Date objects
      const sessions = parsed.sessions.map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined,
        creatorInteractions: session.creatorInteractions || [],
        activityHours: session.activityHours || [],
        engagementActions: session.engagementActions || 0,
      }))
      setAnalytics({
        ...parsed,
        sessions,
        lastActiveDate: parsed.lastActiveDate ? new Date(parsed.lastActiveDate) : undefined,
      })
    }
  }, [])

  // Save analytics data to localStorage whenever it changes
  useEffect(() => {
    if (analytics.sessions.length > 0) {
      localStorage.setItem("grab-analytics", JSON.stringify(analytics))
    }
  }, [analytics])

  const calculateStreaks = useCallback((sessions: SessionData[]) => {
    if (sessions.length === 0) return { currentStreak: 0, longestStreak: 0 }

    const activeDates = [...new Set(sessions.map((s) => s.startTime.toDateString()))].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime(),
    )

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    // Calculate current streak
    if (activeDates.includes(today) || activeDates.includes(yesterday)) {
      let checkDate = new Date()
      if (!activeDates.includes(today)) {
        checkDate = new Date(Date.now() - 86400000)
      }

      while (activeDates.includes(checkDate.toDateString())) {
        currentStreak++
        checkDate = new Date(checkDate.getTime() - 86400000)
      }
    }

    // Calculate longest streak
    for (let i = 0; i < activeDates.length; i++) {
      if (i === 0) {
        tempStreak = 1
      } else {
        const prevDate = new Date(activeDates[i - 1])
        const currDate = new Date(activeDates[i])
        const dayDiff = (prevDate.getTime() - currDate.getTime()) / 86400000

        if (dayDiff === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    return { currentStreak, longestStreak }
  }, [])

  // Start tracking session
  const startSession = useCallback(() => {
    if (isTracking) return

    const sessionId = `session-${Date.now()}`
    const currentHour = new Date().getHours()
    const newSession: SessionData = {
      sessionId,
      startTime: new Date(),
      duration: 0,
      castsViewed: 0,
      downloadsCount: 0,
      isActive: true,
      creatorInteractions: [],
      activityHours: [currentHour],
      engagementActions: 0,
    }

    setAnalytics((prev) => {
      const { currentStreak, longestStreak } = calculateStreaks([...prev.sessions, newSession])
      return {
        ...prev,
        currentSession: newSession,
        totalSessions: prev.totalSessions + 1,
        currentStreak,
        longestStreak,
        lastActiveDate: new Date(),
      }
    })

    setIsTracking(true)

    // Start timer to update session duration
    const timer = setInterval(() => {
      setAnalytics((prev) => {
        if (!prev.currentSession?.isActive) {
          clearInterval(timer)
          return prev
        }

        const duration = Math.floor((Date.now() - prev.currentSession.startTime.getTime()) / 60000)
        const currentHour = new Date().getHours()

        return {
          ...prev,
          currentSession: {
            ...prev.currentSession,
            duration,
            activityHours: prev.currentSession.activityHours.includes(currentHour)
              ? prev.currentSession.activityHours
              : [...prev.currentSession.activityHours, currentHour],
          },
          totalMinutes: prev.totalMinutes - (prev.currentSession.duration || 0) + duration,
        }
      })
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [isTracking, calculateStreaks])

  // End tracking session
  const endSession = useCallback(() => {
    if (!isTracking || !analytics.currentSession) return

    const endTime = new Date()
    const finalDuration = Math.floor((endTime.getTime() - analytics.currentSession.startTime.getTime()) / 60000)

    const completedSession: SessionData = {
      ...analytics.currentSession,
      endTime,
      duration: finalDuration,
      isActive: false,
    }

    setAnalytics((prev) => {
      // Update top creators
      const allCreatorInteractions = [...prev.sessions, completedSession]
        .flatMap((s) => s.creatorInteractions)
        .reduce((acc, interaction) => {
          const existing = acc.find((c) => c.creatorHandle === interaction.creatorHandle)
          if (existing) {
            existing.interactions += interaction.interactions
            existing.lastInteraction =
              interaction.lastInteraction > existing.lastInteraction
                ? interaction.lastInteraction
                : existing.lastInteraction
          } else {
            acc.push({ ...interaction })
          }
          return acc
        }, [] as CreatorInteraction[])
        .sort((a, b) => b.interactions - a.interactions)
        .slice(0, 10)

      return {
        ...prev,
        sessions: [completedSession, ...prev.sessions],
        currentSession: undefined,
        totalMinutes: prev.totalMinutes - (prev.currentSession?.duration || 0) + finalDuration,
        topCreators: allCreatorInteractions,
      }
    })

    setIsTracking(false)

    return {
      sessionDuration: finalDuration,
      castsViewed: completedSession.castsViewed,
      downloadsCount: completedSession.downloadsCount,
      timestamp: endTime,
    }
  }, [isTracking, analytics.currentSession])

  // Track cast view
  const trackCastView = useCallback(
    (creatorHandle?: string, creatorName?: string) => {
      if (!isTracking || !analytics.currentSession) return

      setAnalytics((prev) => {
        const updatedSession = prev.currentSession
          ? {
              ...prev.currentSession,
              castsViewed: prev.currentSession.castsViewed + 1,
            }
          : undefined

        // Track creator interaction if provided
        if (creatorHandle && creatorName && updatedSession) {
          const existingCreator = updatedSession.creatorInteractions.find((c) => c.creatorHandle === creatorHandle)
          if (existingCreator) {
            existingCreator.interactions++
            existingCreator.lastInteraction = new Date()
          } else {
            updatedSession.creatorInteractions.push({
              creatorName,
              creatorHandle,
              interactions: 1,
              lastInteraction: new Date(),
            })
          }
        }

        return {
          ...prev,
          currentSession: updatedSession,
          totalCasts: prev.totalCasts + 1,
        }
      })
    },
    [isTracking, analytics.currentSession],
  )

  const trackDownload = useCallback(
    (creatorHandle?: string, creatorName?: string) => {
      if (!isTracking || !analytics.currentSession) return

      setAnalytics((prev) => {
        const updatedSession = prev.currentSession
          ? {
              ...prev.currentSession,
              downloadsCount: prev.currentSession.downloadsCount + 1,
            }
          : undefined

        // Track creator interaction for downloads
        if (creatorHandle && creatorName && updatedSession) {
          const existingCreator = updatedSession.creatorInteractions.find((c) => c.creatorHandle === creatorHandle)
          if (existingCreator) {
            existingCreator.interactions += 2 // Downloads count as 2 interactions
            existingCreator.lastInteraction = new Date()
          } else {
            updatedSession.creatorInteractions.push({
              creatorName,
              creatorHandle,
              interactions: 2,
              lastInteraction: new Date(),
            })
          }
        }

        return {
          ...prev,
          currentSession: updatedSession,
          totalDownloads: prev.totalDownloads + 1,
        }
      })
    },
    [isTracking, analytics.currentSession],
  )

  const trackEngagement = useCallback(() => {
    if (!isTracking || !analytics.currentSession) return

    setAnalytics((prev) => ({
      ...prev,
      currentSession: prev.currentSession
        ? {
            ...prev.currentSession,
            engagementActions: prev.currentSession.engagementActions + 1,
          }
        : undefined,
    }))
  }, [isTracking, analytics.currentSession])

  // Get daily stats
  const getDailyStats = useCallback(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todaySessions = analytics.sessions.filter((session) => {
      const sessionDate = new Date(session.startTime)
      sessionDate.setHours(0, 0, 0, 0)
      return sessionDate.getTime() === today.getTime()
    })

    return {
      sessions: todaySessions.length,
      minutes: todaySessions.reduce((sum, session) => sum + session.duration, 0),
      casts: todaySessions.reduce((sum, session) => sum + session.castsViewed, 0),
      downloads: todaySessions.reduce((sum, session) => sum + session.downloadsCount, 0),
    }
  }, [analytics.sessions])

  // Get weekly stats
  const getWeeklyStats = useCallback(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const weekSessions = analytics.sessions.filter((session) => session.startTime >= weekAgo)

    return {
      sessions: weekSessions.length,
      minutes: weekSessions.reduce((sum, session) => sum + session.duration, 0),
      casts: weekSessions.reduce((sum, session) => sum + session.castsViewed, 0),
      downloads: weekSessions.reduce((sum, session) => sum + session.downloadsCount, 0),
    }
  }, [analytics.sessions])

  const getEngagementHeatmap = useCallback(() => {
    const hourlyActivity = new Array(24).fill(0)

    analytics.sessions.forEach((session) => {
      session.activityHours.forEach((hour) => {
        hourlyActivity[hour] += session.duration
      })
    })

    return hourlyActivity.map((minutes, hour) => ({
      hour,
      activity: minutes,
      label: `${hour}:00`,
    }))
  }, [analytics.sessions])

  const getEngagementRate = useCallback(() => {
    const totalCasts = analytics.totalCasts
    const totalEngagements = analytics.sessions.reduce((sum, session) => sum + session.engagementActions, 0)

    return totalCasts > 0 ? Math.round((totalEngagements / totalCasts) * 100) : 0
  }, [analytics.totalCasts, analytics.sessions])

  return {
    analytics,
    isTracking,
    currentSession: analytics.currentSession,
    startSession,
    endSession,
    trackCastView,
    trackDownload,
    trackEngagement,
    getDailyStats,
    getWeeklyStats,
    getEngagementHeatmap,
    getEngagementRate,
  }
}
