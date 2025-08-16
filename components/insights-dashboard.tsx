"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, MessageSquare, AlertCircle, CheckCircle } from "lucide-react"

interface Insight {
  id: string
  type: "trend" | "anomaly" | "opportunity" | "risk"
  title: string
  description: string
  confidence: number
  impact: "high" | "medium" | "low"
  category: string
  dataSource: string
  generatedAt: Date
}

export function InsightsDashboard() {
  const insights: Insight[] = [
    {
      id: "1",
      type: "trend",
      title: "Positive Friday Pattern Detected",
      description:
        "Team sentiment consistently peaks on Fridays, suggesting effective week-end closure and project completion cycles.",
      confidence: 92,
      impact: "medium",
      category: "Weekly Patterns",
      dataSource: "4 weeks of sentiment data",
      generatedAt: new Date(),
    },
    {
      id: "2",
      type: "anomaly",
      title: "Tuesday Sentiment Dip",
      description:
        "Unusual 15% sentiment decrease on Tuesdays correlates with system maintenance windows and increased support tickets.",
      confidence: 87,
      impact: "high",
      category: "Technical Issues",
      dataSource: "System logs + sentiment analysis",
      generatedAt: new Date(),
    },
    {
      id: "3",
      type: "opportunity",
      title: "Cross-Team Collaboration Gap",
      description:
        "Limited interaction between engineering and marketing teams presents opportunity for improved project alignment.",
      confidence: 78,
      impact: "medium",
      category: "Team Dynamics",
      dataSource: "Channel interaction patterns",
      generatedAt: new Date(),
    },
    {
      id: "4",
      type: "risk",
      title: "Burnout Risk Indicators Rising",
      description:
        "Two team members showing early burnout signals: increased negative sentiment and reduced participation.",
      confidence: 94,
      impact: "high",
      category: "Team Health",
      dataSource: "Individual sentiment tracking",
      generatedAt: new Date(),
    },
  ]

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "trend":
        return <TrendingUp className="h-4 w-4 text-primary" />
      case "anomaly":
        return <AlertCircle className="h-4 w-4 text-chart-4" />
      case "opportunity":
        return <CheckCircle className="h-4 w-4 text-accent" />
      case "risk":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      default:
        return <Brain className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "trend":
        return "bg-primary/10 text-primary border-primary/20"
      case "anomaly":
        return "bg-chart-4/10 text-chart-4 border-chart-4/20"
      case "opportunity":
        return "bg-accent/10 text-accent border-accent/20"
      case "risk":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-muted text-muted-foreground border-muted"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
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

  const insightsByType = {
    trend: insights.filter((i) => i.type === "trend").length,
    anomaly: insights.filter((i) => i.type === "anomaly").length,
    opportunity: insights.filter((i) => i.type === "opportunity").length,
    risk: insights.filter((i) => i.type === "risk").length,
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI-Generated Insights
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Advanced pattern recognition and anomaly detection from your team's communication data
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Insight Type Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">{insightsByType.trend}</div>
              <div className="text-xs text-muted-foreground">Trends</div>
            </div>
            <div className="text-center p-3 bg-chart-4/5 rounded-lg">
              <AlertCircle className="h-6 w-6 text-chart-4 mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">{insightsByType.anomaly}</div>
              <div className="text-xs text-muted-foreground">Anomalies</div>
            </div>
            <div className="text-center p-3 bg-accent/5 rounded-lg">
              <CheckCircle className="h-6 w-6 text-accent mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">{insightsByType.opportunity}</div>
              <div className="text-xs text-muted-foreground">Opportunities</div>
            </div>
            <div className="text-center p-3 bg-destructive/5 rounded-lg">
              <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">{insightsByType.risk}</div>
              <div className="text-xs text-muted-foreground">Risks</div>
            </div>
          </div>

          {/* Insights List */}
          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className={`border rounded-lg p-4 ${getInsightColor(insight.type)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getInsightIcon(insight.type)}
                    <div>
                      <h3 className="font-medium">{insight.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)} Impact
                        </Badge>
                        <span className="text-xs opacity-75">{insight.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">{insight.confidence}%</div>
                    <div className="text-xs opacity-75">Confidence</div>
                  </div>
                </div>

                <p className="text-sm mb-3 opacity-90">{insight.description}</p>

                <div className="flex items-center justify-between text-xs opacity-75">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>Source: {insight.dataSource}</span>
                  </div>
                  <span>Generated {insight.generatedAt.toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* AI Analysis Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">AI Analysis Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Messages Analyzed:</span>
                <div className="font-medium text-foreground">2,847 this week</div>
              </div>
              <div>
                <span className="text-muted-foreground">Patterns Detected:</span>
                <div className="font-medium text-foreground">12 unique patterns</div>
              </div>
              <div>
                <span className="text-muted-foreground">Accuracy Rate:</span>
                <div className="font-medium text-foreground">94.2%</div>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <div className="font-medium text-foreground">15 minutes ago</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
