"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react"

interface SentimentData {
  overall: {
    sentiment: "positive" | "negative" | "neutral"
    averageScore: number
    confidence: number
    messageCount: number
  }
  trends: {
    daily: Array<{
      date: string
      score: number
      messageCount: number
    }>
  }
}

export function SentimentOverview() {
  const [data, setData] = useState<SentimentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSentimentData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("[v0] Fetching sentiment summary data")

      const response = await fetch("/api/sentiment/summary")
      const result = await response.json()

      if (result.success && result.summary) {
        setData(result.summary)
        console.log("[v0] Sentiment data loaded:", result.summary.overall.sentiment)
      } else {
        setError(result.message || "No sentiment data available")
      }
    } catch (err) {
      console.error("[v0] Error fetching sentiment data:", err)
      setError("Failed to load sentiment data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSentimentData()

    // Refresh data every 5 minutes
    const interval = setInterval(fetchSentimentData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getTrendData = () => {
    if (!data?.trends.daily || data.trends.daily.length < 2) {
      return { trend: "stable", trendValue: 0, previousScore: 0 }
    }

    const recent = data.trends.daily.slice(-2)
    const currentScore = recent[1]?.score || 0
    const previousScore = recent[0]?.score || 0
    const trend = currentScore > previousScore ? "up" : currentScore < previousScore ? "down" : "stable"
    const trendValue = Math.abs(currentScore - previousScore)

    return { trend, trendValue, previousScore }
  }

  const getSentimentDistribution = () => {
    if (!data) {
      return { positive: 0, neutral: 0, negative: 0 }
    }

    // Convert score (-1 to 1) to distribution percentages
    const score = data.overall.averageScore
    const confidence = data.overall.confidence

    if (score > 0.1) {
      return {
        positive: Math.round(60 + score * 30),
        neutral: Math.round(30 - score * 15),
        negative: Math.round(10 - score * 5),
      }
    } else if (score < -0.1) {
      return {
        positive: Math.round(20 + score * 10),
        neutral: Math.round(40 + score * 20),
        negative: Math.round(40 - score * 30),
      }
    } else {
      return { positive: 40, neutral: 50, negative: 10 }
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-5 w-5 text-accent" />
      case "down":
        return <TrendingDown className="h-5 w-5 text-destructive" />
      default:
        return <Minus className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-accent"
      case "down":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-2xl">Team Sentiment Overview</CardTitle>
          <CardDescription>Loading sentiment data...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-2xl">Team Sentiment Overview</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <p className="text-sm text-muted-foreground text-center">Run sentiment analysis to see live data</p>
        </CardContent>
      </Card>
    )
  }

  const { trend, trendValue } = getTrendData()
  const currentScore = data ? ((data.overall.averageScore + 1) / 2) * 10 : 5 // Convert -1,1 scale to 0-10
  const distribution = getSentimentDistribution()
  const lastUpdated =
    data?.trends.daily.length > 0
      ? new Date(data.trends.daily[data.trends.daily.length - 1].date).toLocaleDateString()
      : "No data"

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-2xl">Team Sentiment Overview</CardTitle>
        <CardDescription>
          Current mood score • {data?.overall.messageCount || 0} messages analyzed • Last updated {lastUpdated}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-baseline space-x-3">
              <span className="text-5xl font-bold text-primary font-serif">{currentScore.toFixed(1)}</span>
              <span className="text-lg text-muted-foreground">/10</span>
            </div>
            <div className="flex items-center space-x-2">
              {getTrendIcon(trend)}
              <span className={`text-sm font-medium ${getTrendColor(trend)}`}>
                {trend === "up" ? "+" : trend === "down" ? "-" : ""}
                {trendValue.toFixed(2)} from previous period
              </span>
            </div>
          </div>

          <div className="text-right space-y-2">
            <div className="text-sm text-muted-foreground">Sentiment Distribution</div>
            <div className="space-y-1">
              <div className="flex items-center justify-end space-x-2">
                <span className="text-xs text-muted-foreground">Positive</span>
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${distribution.positive}%` }}></div>
                </div>
                <span className="text-xs font-medium">{distribution.positive}%</span>
              </div>
              <div className="flex items-center justify-end space-x-2">
                <span className="text-xs text-muted-foreground">Neutral</span>
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-chart-4 rounded-full" style={{ width: `${distribution.neutral}%` }}></div>
                </div>
                <span className="text-xs font-medium">{distribution.neutral}%</span>
              </div>
              <div className="flex items-center justify-end space-x-2">
                <span className="text-xs text-muted-foreground">Negative</span>
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-destructive rounded-full"
                    style={{ width: `${distribution.negative}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium">{distribution.negative}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
