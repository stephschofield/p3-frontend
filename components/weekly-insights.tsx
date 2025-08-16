"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useEffect, useState } from "react"

export function WeeklyInsights() {
  const [sentimentData, setSentimentData] = useState([{ day: "Loading...", sentiment: 0, messages: 0 }])
  const [overallTrend, setOverallTrend] = useState("stable")
  const [insights, setInsights] = useState([
    "Loading sentiment analysis...",
    "Analyzing team communication patterns...",
    "Generating AI-powered insights...",
  ])

  useEffect(() => {
    const fetchInsightsData = async () => {
      try {
        console.log("[v0] Fetching weekly insights data...")
        const response = await fetch("/api/analysis/weekly")
        const data = await response.json()

        console.log("[v0] Weekly insights response:", data)

        if (data.error) {
          console.error("[v0] API error:", data.error)
          return
        }

        if (data.dailyBreakdown && Array.isArray(data.dailyBreakdown)) {
          setSentimentData(
            data.dailyBreakdown.map((day: any) => ({
              day: day.day || "N/A",
              sentiment: day.sentiment || 0,
              messages: day.messages || 0,
            })),
          )
        }

        if (data.sentimentTrend) {
          if (data.sentimentTrend.includes("+")) {
            setOverallTrend("up")
          } else if (data.sentimentTrend.includes("-")) {
            setOverallTrend("down")
          } else {
            setOverallTrend("stable")
          }
        }

        if (data.insights && Array.isArray(data.insights)) {
          setInsights(data.insights.slice(0, 3)) // Show top 3 insights
        }
      } catch (error) {
        console.error("[v0] Error fetching insights data:", error)
        setInsights([
          "Unable to connect to Slack workspace",
          "Please check your API configuration in settings",
          "Contact support if the issue persists",
        ])
      }
    }

    fetchInsightsData()
  }, [])

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 7.5) return "bg-primary"
    if (sentiment >= 6.5) return "bg-accent"
    return "bg-destructive"
  }

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment >= 7.5) return "Positive"
    if (sentiment >= 6.5) return "Neutral"
    return "Negative"
  }

  const getTrendIcon = () => {
    switch (overallTrend) {
      case "up":
        return <TrendingUp className="h-3 w-3 mr-1" />
      case "down":
        return <TrendingDown className="h-3 w-3 mr-1" />
      default:
        return <Minus className="h-3 w-3 mr-1" />
    }
  }

  const getTrendLabel = () => {
    switch (overallTrend) {
      case "up":
        return "Improving"
      case "down":
        return "Declining"
      default:
        return "Stable"
    }
  }

  const getTrendColor = () => {
    switch (overallTrend) {
      case "up":
        return "text-primary border-primary"
      case "down":
        return "text-destructive border-destructive"
      default:
        return "text-muted-foreground border-muted-foreground"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Weekly Sentiment Trends
          </CardTitle>
          <Badge variant="outline" className={getTrendColor()}>
            {getTrendIcon()}
            {getTrendLabel()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sentimentData.map((day, index) => (
            <div key={`${day.day}-${index}`} className="flex items-center gap-4">
              <div className="w-12 text-sm font-medium text-muted-foreground">{day.day}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getSentimentColor(day.sentiment)}`}
                      style={{ width: `${Math.max((day.sentiment / 10) * 100, 5)}%` }}
                    />
                  </div>
                  <div className="text-sm font-medium text-foreground w-8">
                    {day.sentiment > 0 ? day.sentiment.toFixed(1) : "N/A"}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {getSentimentLabel(day.sentiment)}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {day.messages > 0 ? `${day.messages} messages analyzed` : "No data"}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium text-foreground mb-2">AI-Generated Insights</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {insights.map((insight, index) => (
              <li key={index}>• {insight}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
