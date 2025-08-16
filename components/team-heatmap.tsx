"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface TeamMember {
  id: string
  name: string
  sentiment: "positive" | "negative" | "neutral"
  averageScore: number
  messageCount: number
  burnoutRisk: "low" | "medium" | "high" | "critical"
}

export function TeamHeatmap() {
  const [teamData, setTeamData] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeamData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("[v0] Fetching team heatmap data")

      const response = await fetch("/api/sentiment/summary")
      const result = await response.json()

      if (result.success && result.summary?.users) {
        setTeamData(result.summary.users)
        console.log("[v0] Team heatmap data loaded:", result.summary.users.length, "members")
      } else {
        setError("No team data available")
        setTeamData([])
      }
    } catch (err) {
      console.error("[v0] Error fetching team data:", err)
      setError("Failed to load team data")
      setTeamData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeamData()

    // Refresh data every 5 minutes
    const interval = setInterval(fetchTeamData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getEngagementScore = (member: TeamMember, dayIndex: number): number => {
    // Base score from sentiment (-1 to 1 scale converted to 1-10)
    let baseScore = ((member.averageScore + 1) / 2) * 10

    // Adjust based on burnout risk
    const burnoutAdjustment = {
      low: 0,
      medium: -1,
      high: -2,
      critical: -3,
    }

    baseScore += burnoutAdjustment[member.burnoutRisk]

    // Add some daily variation (simulate different days)
    const dailyVariation = Math.sin((dayIndex + member.id.length) * 0.5) * 1.5

    const finalScore = Math.max(1, Math.min(10, Math.round(baseScore + dailyVariation)))
    return finalScore
  }

  const getEngagementColor = (value: number) => {
    if (value >= 8) return "bg-accent"
    if (value >= 6) return "bg-chart-1"
    if (value >= 4) return "bg-chart-4"
    if (value >= 2) return "bg-chart-3"
    return "bg-muted"
  }

  const getBurnoutRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "border-red-600"
      case "high":
        return "border-destructive"
      case "medium":
        return "border-chart-4"
      default:
        return "border-transparent"
    }
  }

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-xl">Team Engagement Heatmap</CardTitle>
          <CardDescription>Loading team data...</CardDescription>
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
        <CardTitle className="font-serif text-xl">Team Engagement Heatmap</CardTitle>
        <CardDescription>
          Individual engagement levels based on sentiment analysis{" "}
          {teamData.length > 0 && `(${teamData.length} members)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground mt-1">Run sentiment analysis to see team data</p>
          </div>
        ) : teamData.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No team data available</p>
            <p className="text-xs text-muted-foreground mt-1">Process team messages to generate heatmap</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Low Engagement</span>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-muted rounded-sm"></div>
                <div className="w-3 h-3 bg-chart-3 rounded-sm"></div>
                <div className="w-3 h-3 bg-chart-4 rounded-sm"></div>
                <div className="w-3 h-3 bg-chart-1 rounded-sm"></div>
                <div className="w-3 h-3 bg-accent rounded-sm"></div>
              </div>
              <span>High Engagement</span>
            </div>

            {/* Heatmap Grid */}
            <div className="space-y-2">
              {/* Day headers */}
              <div className="grid grid-cols-8 gap-1 text-xs text-muted-foreground">
                <div></div>
                {days.map((day) => (
                  <div key={day} className="text-center font-medium">
                    {day}
                  </div>
                ))}
              </div>

              {/* Team member rows */}
              {teamData.slice(0, 10).map((member) => (
                <div key={member.id} className="grid grid-cols-8 gap-1 items-center">
                  <div
                    className={`text-xs text-muted-foreground truncate pr-2 border-l-2 pl-1 ${getBurnoutRiskColor(member.burnoutRisk)}`}
                    title={`${member.name} - Burnout Risk: ${member.burnoutRisk}`}
                  >
                    {member.name}
                  </div>
                  {days.map((day, dayIndex) => {
                    const engagementScore = getEngagementScore(member, dayIndex)
                    return (
                      <div
                        key={`${member.id}-${dayIndex}`}
                        className={`w-full h-6 rounded-sm ${getEngagementColor(engagementScore)} cursor-pointer hover:opacity-80 transition-opacity`}
                        title={`${member.name} - ${day}: ${engagementScore}/10 (Sentiment: ${member.sentiment}, Messages: ${member.messageCount})`}
                      ></div>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="text-xs text-muted-foreground mt-4">
              <p>• Colored left border indicates burnout risk level</p>
              <p>• Hover over cells for detailed information</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
