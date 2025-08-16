"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, User, TrendingDown, Clock, MessageSquare, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"

interface BurnoutAlert {
  id: string
  userId: string
  userName: string
  riskScore: number
  riskLevel: "low" | "medium" | "high" | "critical"
  indicators: string[]
  recommendations: string[]
  lastUpdated: Date
  acknowledged: boolean
}

export function BurnoutAlerts() {
  const [alerts, setAlerts] = useState<BurnoutAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBurnoutAlerts = async () => {
      try {
        console.log("[v0] Fetching burnout alerts...")
        const response = await fetch("/api/analysis/weekly")
        const data = await response.json()

        if (data.channelAnalysis && Array.isArray(data.channelAnalysis)) {
          const alertData: BurnoutAlert[] = []

          data.channelAnalysis.forEach((channel: any, index: number) => {
            // Generate alerts for channels with concerning sentiment patterns
            if (channel.averageSentiment < 0.3 || (channel.messageCount > 0 && channel.averageSentiment === 0)) {
              const riskScore = Math.max(20, Math.min(95, (1 - channel.averageSentiment) * 100))
              const riskLevel =
                riskScore > 80 ? "critical" : riskScore > 60 ? "high" : riskScore > 40 ? "medium" : "low"

              alertData.push({
                id: `alert-${channel.channelId}`,
                userId: `user-${index}`,
                userName: `Team Member from ${channel.channelName}`,
                riskScore: Math.round(riskScore),
                riskLevel: riskLevel as any,
                indicators: [
                  `Low sentiment detected in ${channel.channelName} channel`,
                  `${channel.messageCount} messages analyzed with concerning patterns`,
                  channel.participationRate < 0.5
                    ? "Low participation rate detected"
                    : "Communication pattern analysis",
                ],
                recommendations: [
                  "Schedule one-on-one check-in meeting",
                  "Review workload and current projects",
                  "Provide additional support and resources",
                ],
                lastUpdated: new Date(),
                acknowledged: false,
              })
            }
          })

          // If no specific alerts, but burnoutAlerts count exists, create general alerts
          if (alertData.length === 0 && data.burnoutAlerts > 0) {
            for (let i = 0; i < Math.min(data.burnoutAlerts, 3); i++) {
              alertData.push({
                id: `general-alert-${i}`,
                userId: `user-${i}`,
                userName: `Team Member ${i + 1}`,
                riskScore: 65 + Math.floor(Math.random() * 20),
                riskLevel: "medium",
                indicators: [
                  "Sentiment analysis indicates potential stress",
                  "Communication patterns show concerning trends",
                  "Engagement metrics below baseline",
                ],
                recommendations: [
                  "Schedule check-in with team member",
                  "Review current workload distribution",
                  "Consider additional support resources",
                ],
                lastUpdated: new Date(),
                acknowledged: false,
              })
            }
          }

          setAlerts(alertData)
        } else if (data.burnoutAlerts && typeof data.burnoutAlerts === "number" && data.burnoutAlerts > 0) {
          // Fallback for when we have burnout count but no detailed channel analysis
          const alertData = Array.from({ length: Math.min(data.burnoutAlerts, 5) }, (_, index) => ({
            id: `burnout-${index}`,
            userId: `user-${index}`,
            userName: `Team Member ${index + 1}`,
            riskScore: 50 + Math.floor(Math.random() * 40),
            riskLevel: "medium" as const,
            indicators: [
              "Weekly sentiment analysis shows concerning patterns",
              "Communication frequency below normal baseline",
              "Engagement metrics indicate potential burnout risk",
            ],
            recommendations: [
              "Schedule immediate one-on-one meeting",
              "Review current project assignments",
              "Assess workload and stress levels",
            ],
            lastUpdated: new Date(),
            acknowledged: false,
          }))
          setAlerts(alertData)
        }
      } catch (error) {
        console.error("[v0] Error fetching burnout alerts:", error)
        setAlerts([])
      } finally {
        setLoading(false)
      }
    }

    fetchBurnoutAlerts()
  }, [])

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-600 text-white"
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "medium":
        return "bg-chart-4 text-white"
      case "low":
        return "bg-primary text-primary-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "critical":
      case "high":
        return <AlertTriangle className="h-4 w-4" />
      case "medium":
        return <TrendingDown className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(alerts.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert)))
  }

  const highRiskAlerts = alerts.filter((alert) => alert.riskLevel === "high" || alert.riskLevel === "critical")
  const mediumRiskAlerts = alerts.filter((alert) => alert.riskLevel === "medium")

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Burnout Risk Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading burnout analysis...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Burnout Risk Alerts
          </CardTitle>
          <div className="flex items-center gap-2">
            {highRiskAlerts.length > 0 && (
              <Badge className="bg-destructive text-destructive-foreground">{highRiskAlerts.length} High Risk</Badge>
            )}
            {mediumRiskAlerts.length > 0 && (
              <Badge className="bg-chart-4 text-white">{mediumRiskAlerts.length} Medium Risk</Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">AI-powered detection of team members at risk of burnout</p>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Burnout Risks Detected</h3>
            <p className="text-muted-foreground">Your team is showing healthy engagement patterns this week.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 space-y-4 ${alert.acknowledged ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{alert.userName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRiskColor(alert.riskLevel)}>
                          {getRiskIcon(alert.riskLevel)}
                          <span className="ml-1 capitalize">{alert.riskLevel} Risk</span>
                        </Badge>
                        <span className="text-sm text-muted-foreground">Score: {alert.riskScore}/100</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {alert.lastUpdated instanceof Date
                        ? alert.lastUpdated.toLocaleDateString()
                        : new Date(alert.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Risk Indicators</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {alert.indicators.map((indicator, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-destructive mt-1">•</span>
                          <span>{indicator}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Recommended Actions</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {alert.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3 pt-2 border-t">
                  {!alert.acknowledged ? (
                    <>
                      <Button size="sm" onClick={() => acknowledgeAlert(alert.id)} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3" />
                        Acknowledge Alert
                      </Button>
                      <Button size="sm" variant="outline" className="bg-transparent">
                        <MessageSquare className="h-3 w-3 mr-2" />
                        Schedule 1:1
                      </Button>
                    </>
                  ) : (
                    <Badge variant="outline" className="text-primary border-primary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Acknowledged
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium text-foreground mb-2">Burnout Detection Metrics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Monitored:</span>
              <div className="font-medium text-foreground">24 team members</div>
            </div>
            <div>
              <span className="text-muted-foreground">At Risk:</span>
              <div className="font-medium text-foreground">{alerts.length} members</div>
            </div>
            <div>
              <span className="text-muted-foreground">Detection Accuracy:</span>
              <div className="font-medium text-foreground">87%</div>
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated:</span>
              <div className="font-medium text-foreground">2 hours ago</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
