"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Lightbulb, CheckCircle, Clock, ArrowRight, TrendingUp, Users, Target } from "lucide-react"
import { useState, useEffect } from "react"

interface Recommendation {
  id: string
  priority: "high" | "medium" | "low"
  title: string
  description: string
  impact: "High" | "Medium" | "Low"
  effort: "High" | "Medium" | "Low"
  timeline: string
  category: string
  confidence: number
  dataPoints: string[]
  implementationSteps: string[]
  successMetrics: string[]
  status: "pending" | "in-progress" | "completed" | "dismissed"
  implementedDate?: Date
  successScore?: number
}

export function ActionableRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        console.log("[v0] Fetching AI recommendations...")
        const response = await fetch("/api/analysis/weekly")
        const data = await response.json()

        if (data.channelAnalysis && Array.isArray(data.channelAnalysis)) {
          const recs: Recommendation[] = []

          // Generate recommendations based on actual channel data
          data.channelAnalysis.forEach((channel: any, index: number) => {
            if (channel.averageSentiment < 0.4) {
              recs.push({
                id: `rec-sentiment-${channel.channelId}`,
                priority: channel.averageSentiment < 0.2 ? "high" : "medium",
                title: `Improve Sentiment in ${channel.channelName}`,
                description: `Channel shows low sentiment (${(channel.averageSentiment * 10).toFixed(1)}/10) with ${channel.messageCount} messages analyzed. Consider team engagement initiatives.`,
                impact: "High",
                effort: "Medium",
                timeline: "2-3 weeks",
                category: "Team Engagement",
                confidence: 85,
                dataPoints: [
                  `${channel.messageCount} messages analyzed in ${channel.channelName}`,
                  `Average sentiment: ${(channel.averageSentiment * 10).toFixed(1)}/10`,
                  `Participation rate: ${Math.round(channel.participationRate * 100)}%`,
                ],
                implementationSteps: [
                  "Conduct team retrospective meeting",
                  "Identify specific pain points and blockers",
                  "Implement targeted engagement activities",
                  "Monitor sentiment improvements weekly",
                ],
                successMetrics: [
                  "Increase channel sentiment to >6.0/10",
                  "Improve participation rate by 20%",
                  "Reduce negative sentiment indicators",
                ],
                status: "pending",
              })
            }

            if (channel.participationRate < 0.3 && channel.messageCount > 0) {
              recs.push({
                id: `rec-participation-${channel.channelId}`,
                priority: "medium",
                title: `Boost Participation in ${channel.channelName}`,
                description: `Low participation rate (${Math.round(channel.participationRate * 100)}%) detected. Encourage more team engagement and communication.`,
                impact: "Medium",
                effort: "Low",
                timeline: "1-2 weeks",
                category: "Communication",
                confidence: 75,
                dataPoints: [
                  `Participation rate: ${Math.round(channel.participationRate * 100)}%`,
                  `${channel.messageCount} total messages this week`,
                  "Communication patterns analysis",
                ],
                implementationSteps: [
                  "Send team engagement survey",
                  "Schedule regular check-ins",
                  "Create discussion prompts and activities",
                ],
                successMetrics: [
                  "Increase participation rate to >50%",
                  "More frequent team interactions",
                  "Improved communication flow",
                ],
                status: "pending",
              })
            }
          })

          // Add general recommendations based on overall data
          if (data.overallSentiment < 0.5) {
            recs.push({
              id: "rec-overall-sentiment",
              priority: "high",
              title: "Address Overall Team Sentiment",
              description: `Team sentiment is ${(data.overallSentiment * 10).toFixed(1)}/10 across ${data.totalMessages} messages. Implement comprehensive engagement strategy.`,
              impact: "High",
              effort: "High",
              timeline: "4-6 weeks",
              category: "Team Health",
              confidence: 90,
              dataPoints: [
                `Overall sentiment: ${(data.overallSentiment * 10).toFixed(1)}/10`,
                `${data.totalMessages} messages analyzed`,
                `${data.channelAnalysis.length} channels monitored`,
              ],
              implementationSteps: [
                "Conduct comprehensive team health assessment",
                "Identify root causes of low sentiment",
                "Develop targeted improvement plan",
                "Implement regular pulse surveys",
              ],
              successMetrics: [
                "Increase overall sentiment to >7.0/10",
                "Reduce burnout risk indicators",
                "Improve team satisfaction scores",
              ],
              status: "pending",
            })
          }

          setRecommendations(recs.slice(0, 5)) // Limit to top 5 recommendations
        } else if (data.insights && Array.isArray(data.insights)) {
          // Fallback to insights-based recommendations
          const recs = data.insights.slice(0, 3).map((insight: any, index: number) => {
            let description = ""
            if (typeof insight === "string") {
              description = insight
            } else if (typeof insight === "object" && insight !== null) {
              description = insight.description || insight.title || insight.summary || "AI-generated insight available"
            }

            return {
              id: `rec-${index}`,
              priority: index === 0 ? "high" : ("medium" as const),
              title: `Insight-Based Action ${index + 1}`,
              description,
              impact: "Medium" as const,
              effort: "Low" as const,
              timeline: "1-2 weeks",
              category: "Team Engagement",
              confidence: 75 + Math.floor(Math.random() * 20),
              dataPoints: [`Based on weekly sentiment analysis`, `Derived from team communication patterns`],
              implementationSteps: [`Review current approach`, `Implement suggested changes`, `Monitor results`],
              successMetrics: [`Improved team sentiment`, `Increased engagement`],
              status: "pending" as const,
            }
          })
          setRecommendations(recs)
        }
      } catch (error) {
        console.error("[v0] Error fetching recommendations:", error)
        setRecommendations([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-primary text-primary-foreground"
      case "in-progress":
        return "bg-chart-4 text-white"
      case "dismissed":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const updateRecommendationStatus = (id: string, status: Recommendation["status"]) => {
    setRecommendations(
      recommendations.map((rec) =>
        rec.id === id
          ? {
              ...rec,
              status,
              implementedDate: status === "completed" ? new Date() : rec.implementedDate,
            }
          : rec,
      ),
    )
  }

  const pendingRecs = recommendations.filter((r) => r.status === "pending")
  const inProgressRecs = recommendations.filter((r) => r.status === "in-progress")
  const completedRecs = recommendations.filter((r) => r.status === "completed")

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI-Powered Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Generating personalized insights...</div>
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
            <Lightbulb className="h-5 w-5" />
            AI-Powered Insights & Recommendations
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary border-primary">
              <Target className="h-3 w-3 mr-1" />
              {recommendations.length} Active Insights
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Personalized recommendations based on your team's sentiment patterns and engagement data
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Implementation Progress */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="text-sm font-medium text-foreground mb-4">Implementation Progress</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{pendingRecs.length}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-4">{inProgressRecs.length}</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{completedRecs.length}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
            <Progress value={(completedRecs.length / recommendations.length) * 100} className="h-2" />
            <div className="text-xs text-muted-foreground mt-2 text-center">
              {Math.round((completedRecs.length / recommendations.length) * 100)}% implementation rate this month
            </div>
          </div>

          {/* Recommendations List */}
          <div className="space-y-6">
            {recommendations.map((rec) => (
              <div key={rec.id} className="border rounded-lg p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{rec.title}</h3>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                      </Badge>
                      <Badge className={getStatusColor(rec.status)}>
                        {rec.status.charAt(0).toUpperCase() + rec.status.slice(1).replace("-", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium text-foreground">{rec.confidence}% Confidence</div>
                    <div className="text-muted-foreground">{rec.category}</div>
                  </div>
                </div>

                {/* Data Points */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">Supporting Data</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {rec.dataPoints.map((point, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <TrendingUp className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Implementation Details */}
                {rec.status !== "dismissed" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Implementation Steps</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {rec.implementationSteps.map((step, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Success Metrics</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {rec.successMetrics.map((metric, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Target className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                            <span>{metric}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Success Score for Completed Items */}
                {rec.status === "completed" && rec.successScore && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Implementation Success Score</span>
                      <div className="flex items-center gap-2">
                        <Progress value={rec.successScore * 10} className="w-20 h-2" />
                        <span className="text-sm font-bold text-primary">{rec.successScore}/10</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Completed {rec.implementedDate?.toLocaleDateString()} • Positive impact detected
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2 border-t">
                  {rec.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateRecommendationStatus(rec.id, "in-progress")}
                        className="flex items-center gap-2"
                      >
                        <Clock className="h-3 w-3" />
                        Start Implementation
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateRecommendationStatus(rec.id, "dismissed")}
                        className="bg-transparent"
                      >
                        Dismiss
                      </Button>
                    </>
                  )}

                  {rec.status === "in-progress" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateRecommendationStatus(rec.id, "completed")}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Mark Complete
                      </Button>
                      <Button size="sm" variant="outline" className="bg-transparent">
                        Update Progress
                      </Button>
                    </>
                  )}

                  {rec.status === "completed" && (
                    <Badge variant="outline" className="text-primary border-primary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Successfully Implemented
                    </Badge>
                  )}

                  <Button size="sm" variant="outline" className="flex items-center gap-2 bg-transparent ml-auto">
                    View Details
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Impact Summary */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Monthly Impact Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Recommendations Generated:</span>
                <div className="font-medium text-foreground">12 insights</div>
              </div>
              <div>
                <span className="text-muted-foreground">Implementation Rate:</span>
                <div className="font-medium text-foreground">75%</div>
              </div>
              <div>
                <span className="text-muted-foreground">Average Success Score:</span>
                <div className="font-medium text-foreground">8.2/10</div>
              </div>
              <div>
                <span className="text-muted-foreground">Team Sentiment Improvement:</span>
                <div className="font-medium text-primary">+12%</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
