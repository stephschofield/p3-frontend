"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus, Users, MessageSquare, AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"
import { SlackPermissionsGuide } from "./slack-permissions-guide"

export function WeeklyOverview() {
  const [hasPermissionError, setHasPermissionError] = useState(false)
  const [metrics, setMetrics] = useState([
    {
      title: "Overall Team Sentiment",
      value: "Loading...",
      change: "",
      trend: "stable",
      description: "out of 10",
      icon: Users,
    },
    {
      title: "Messages Analyzed",
      value: "Loading...",
      change: "",
      trend: "stable",
      description: "this week",
      icon: MessageSquare,
    },
    {
      title: "Burnout Risk Level",
      value: "Loading...",
      change: "",
      trend: "stable",
      description: "analyzing...",
      icon: AlertTriangle,
    },
  ])

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        console.log("[v0] Fetching weekly analysis data...")
        const response = await fetch("/api/analysis/weekly")
        const data = await response.json()

        console.log("[v0] Weekly analysis response:", data)

        if (data.error && (data.error.includes("missing_scope") || data.error.includes("Bot needs"))) {
          setHasPermissionError(true)
          return
        }

        if (data.channelAnalysis || data.totalMessages >= 0 || data.overallSentiment !== undefined) {
          setHasPermissionError(false)
        }

        setMetrics([
          {
            title: "Overall Team Sentiment",
            value: data.overallSentiment !== undefined ? data.overallSentiment.toFixed(1) : "Analyzing...",
            change: data.sentimentTrend || "Processing data",
            trend: data.sentimentTrend?.includes("+") ? "up" : data.sentimentTrend?.includes("-") ? "down" : "stable",
            description: "out of 10",
            icon: Users,
          },
          {
            title: "Messages Analyzed",
            value: data.totalMessages !== undefined ? data.totalMessages.toLocaleString() : "Processing...",
            change: data.messagesTrend || `From ${data.channelAnalysis?.length || 0} channels`,
            trend: "stable",
            description: "this week",
            icon: MessageSquare,
          },
          {
            title: "Burnout Risk Level",
            value: data.burnoutAlerts?.length > 0 ? "Medium" : "Low",
            change: data.burnoutAlerts?.length > 0 ? `${data.burnoutAlerts.length} alerts` : "No alerts",
            trend: data.burnoutAlerts?.length > 0 ? "down" : "stable",
            description: `${data.burnoutAlerts?.length || 0} team members flagged`,
            icon: AlertTriangle,
          },
        ])
      } catch (error) {
        console.error("[v0] Error fetching weekly data:", error)
      }
    }

    fetchWeeklyData()
  }, [])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-primary" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-destructive" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-primary"
      case "down":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  if (hasPermissionError) {
    return <SlackPermissionsGuide />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                <div className={`flex items-center gap-1 text-sm ${getTrendColor(metric.trend)}`}>
                  {getTrendIcon(metric.trend)}
                  <span>{metric.change}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
