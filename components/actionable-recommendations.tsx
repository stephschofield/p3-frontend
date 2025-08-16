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
    // Simulate loading recommendations
    setTimeout(() => {
      setRecommendations([
        {
          id: "1",
          priority: "high",
          title: "Schedule Team Building Activity",
          description:
            "Team sentiment analysis shows decreased collaboration patterns and reduced cross-team interactions. A structured team building session could improve cohesion.",
          impact: "High",
          effort: "Medium",
          timeline: "1-2 weeks",
          category: "Team Engagement",
          confidence: 87,
          dataPoints: [
            "25% decrease in cross-channel interactions",
            "Sentiment score dropped from 7.8 to 7.2",
            "3 team members showing isolation patterns",
          ],
          implementationSteps: [
            "Survey team for preferred activity types",
            "Schedule 2-hour virtual or in-person session",
            "Follow up with team feedback survey",
          ],
          successMetrics: ["Increased cross-team messaging", "Improved sentiment scores", "Higher participation rates"],
          status: "pending",
        },
        {
          id: "2",
          priority: "medium",
          title: "Address System Performance Issues",
          description:
            "Tuesday's sentiment dip correlates with system maintenance complaints. Infrastructure improvements could prevent future frustration.",
          impact: "Medium",
          effort: "High",
          timeline: "2-4 weeks",
          category: "Technical",
          confidence: 72,
          dataPoints: [
            "15 negative mentions of system issues",
            "Productivity complaints increased 40%",
            "Support tickets spiked during maintenance",
          ],
          implementationSteps: [
            "Audit current system performance",
            "Implement monitoring and alerting",
            "Schedule maintenance during off-hours",
            "Communicate maintenance schedules proactively",
          ],
          successMetrics: ["Reduced system-related complaints", "Improved uptime metrics", "Faster issue resolution"],
          status: "in-progress",
        },
        {
          id: "3",
          priority: "low",
          title: "Celebrate Recent Project Success",
          description:
            "Friday's positive sentiment spike suggests successful project completion. Public recognition could maintain momentum and boost morale.",
          impact: "Medium",
          effort: "Low",
          timeline: "This week",
          category: "Recognition",
          confidence: 94,
          dataPoints: [
            "Sentiment increased 18% on Friday",
            "Project completion mentioned 12 times",
            "Team satisfaction keywords detected",
          ],
          implementationSteps: [
            "Draft team achievement announcement",
            "Share success story in company channels",
            "Consider individual recognition for key contributors",
          ],
          successMetrics: ["Sustained positive sentiment", "Increased team pride", "Higher engagement scores"],
          status: "completed",
          implementedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          successScore: 8.5,
        },
      ])
      setLoading(false)
    }, 1000)
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
