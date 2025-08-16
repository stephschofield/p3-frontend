import { NextResponse } from "next/server"
import { AzureSentimentService } from "@/lib/azure-sentiment-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teamData, sentimentData, timeRange } = body

    console.log("[v0] Generating insights for team data:", { teamData, timeRange })

    const sentimentService = new AzureSentimentService()

    // Generate insights based on the provided data
    const insights = await sentimentService.generateWeeklyInsights(sentimentData, teamData)

    // Mock additional insight types for demo
    const enhancedInsights = [
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
        generatedAt: new Date().toISOString(),
        recommendations: insights.slice(0, 2),
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
        generatedAt: new Date().toISOString(),
        recommendations: insights.slice(2, 3),
      },
    ]

    console.log("[v0] Generated", enhancedInsights.length, "insights")

    return NextResponse.json({
      insights: enhancedInsights,
      summary: {
        totalInsights: enhancedInsights.length,
        highImpact: enhancedInsights.filter((i) => i.impact === "high").length,
        averageConfidence: enhancedInsights.reduce((sum, i) => sum + i.confidence, 0) / enhancedInsights.length,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[v0] Error generating insights:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Return mock insights for demo
    const insights = [
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
        generatedAt: new Date().toISOString(),
        recommendations: [
          "Maintain current project completion cycles",
          "Consider replicating Friday success patterns on other days",
        ],
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
        generatedAt: new Date().toISOString(),
        recommendations: [
          "Schedule maintenance during off-hours",
          "Improve communication about planned maintenance",
          "Implement better system monitoring",
        ],
      },
    ]

    console.log("[v0] Retrieved", insights.length, "insights")

    return NextResponse.json({
      insights,
      summary: {
        totalInsights: insights.length,
        highImpact: insights.filter((i) => i.impact === "high").length,
        averageConfidence: insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching insights:", error)
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 })
  }
}
