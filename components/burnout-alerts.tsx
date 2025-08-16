"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, MessageSquare, Loader2 } from "lucide-react"

interface BurnoutAlert {
  id: string
  severity: "high" | "medium" | "low" | "critical"
  type: "burnout" | "engagement" | "sentiment"
  message: string
  timestamp: string
  actionable: boolean
  userId?: string
  userName?: string
}

export function BurnoutAlerts() {
  const [alerts, setAlerts] = useState<BurnoutAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBurnoutAlerts = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("[v0] Fetching burnout alerts from sentiment data")

      const response = await fetch("/api/sentiment/summary")
      const result = await response.json()

      if (result.success && result.summary) {
        const generatedAlerts = generateAlertsFromData(result.summary)
        setAlerts(generatedAlerts)
        console.log("[v0] Generated", generatedAlerts.length, "burnout alerts")
      } else {
        setError("No sentiment data available")
        setAlerts([])
      }
    } catch (err) {
      console.error("[v0] Error fetching burnout alerts:", err)
      setError("Failed to load alerts")
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  const generateAlertsFromData = (summary: any): BurnoutAlert[] => {
    const alerts: BurnoutAlert[] = []

    // Check overall sentiment
    if (summary.overall.averageScore < -0.3) {
      alerts.push({
        id: "overall-negative",
        severity: summary.overall.averageScore < -0.6 ? "high" : "medium",
        type: "sentiment",
        message: `Team sentiment is ${summary.overall.sentiment} (${summary.overall.averageScore.toFixed(2)})`,
        timestamp: "Real-time",
        actionable: true,
      })
    }

    // Check individual users for burnout risk
    if (summary.users) {
      const highRiskUsers = summary.users.filter(
        (user: any) => user.burnoutRisk === "high" || user.burnoutRisk === "critical",
      )

      if (highRiskUsers.length > 0) {
        alerts.push({
          id: "high-burnout-risk",
          severity: highRiskUsers.some((u: any) => u.burnoutRisk === "critical") ? "critical" : "high",
          type: "burnout",
          message: `${highRiskUsers.length} team member${highRiskUsers.length > 1 ? "s" : ""} showing high burnout risk`,
          timestamp: "Real-time",
          actionable: true,
        })
      }

      // Check for users with very negative sentiment
      const negativeUsers = summary.users.filter((user: any) => user.averageScore < -0.5)
      if (negativeUsers.length > 0) {
        alerts.push({
          id: "negative-sentiment-users",
          severity: "medium",
          type: "sentiment",
          message: `${negativeUsers.length} team member${negativeUsers.length > 1 ? "s" : ""} showing negative sentiment patterns`,
          timestamp: "Real-time",
          actionable: true,
        })
      }
    }

    // Check channel engagement
    if (summary.channels) {
      const lowEngagementChannels = summary.channels.filter(
        (channel: any) => channel.messageCount < 5 && channel.sentiment === "negative",
      )

      if (lowEngagementChannels.length > 0) {
        alerts.push({
          id: "low-engagement",
          severity: "low",
          type: "engagement",
          message: `Decreased activity in ${lowEngagementChannels.length} channel${lowEngagementChannels.length > 1 ? "s" : ""}`,
          timestamp: "Real-time",
          actionable: false,
        })
      }
    }

    return alerts.slice(0, 5) // Limit to 5 alerts
  }

  useEffect(() => {
    fetchBurnoutAlerts()

    // Refresh alerts every 2 minutes
    const interval = setInterval(fetchBurnoutAlerts, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600 text-white"
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "medium":
        return "bg-chart-4 text-white"
      case "low":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "burnout":
        return <AlertTriangle className="h-4 w-4" />
      case "engagement":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-xl">Burnout Alerts</CardTitle>
          <CardDescription>Loading alerts...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-xl">Burnout Alerts</CardTitle>
        <CardDescription>Real-time monitoring and early warning signals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchBurnoutAlerts} className="mt-2 bg-transparent">
              Retry
            </Button>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No alerts at this time</p>
            <p className="text-xs text-muted-foreground mt-1">Team sentiment appears healthy</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-card">
              <div className={`p-1 rounded-full ${getSeverityColor(alert.severity)}`}>{getIcon(alert.type)}</div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {alert.severity.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                </div>
                <p className="text-sm font-medium">{alert.message}</p>
                {alert.actionable && (
                  <Button size="sm" variant="outline" className="text-xs bg-transparent">
                    Take Action
                  </Button>
                )}
              </div>
            </div>
          ))
        )}

        <Button variant="ghost" className="w-full text-sm" onClick={fetchBurnoutAlerts}>
          Refresh Alerts
        </Button>
      </CardContent>
    </Card>
  )
}
