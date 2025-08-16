import { type NextRequest, NextResponse } from "next/server"
import { WeeklyAnalysisService } from "@/lib/weekly-analysis-service"
import { SlackService } from "@/lib/slack-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channelIds, weekStart, weekEnd } = body

    if (!channelIds || !Array.isArray(channelIds)) {
      return NextResponse.json({ error: "Channel IDs are required" }, { status: 400 })
    }

    const analysisService = new WeeklyAnalysisService()

    const startDate = weekStart ? new Date(weekStart) : undefined
    const endDate = weekEnd ? new Date(weekEnd) : undefined

    let dateRange
    if (startDate && endDate) {
      dateRange = { start: startDate, end: endDate }
    } else {
      dateRange = await analysisService.getLastWeekDateRange()
    }

    console.log("[v0] Starting weekly analysis for date range:", dateRange)

    const result = await analysisService.generateWeeklyReport(channelIds, dateRange.start, dateRange.end)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error in weekly analysis API:", error)
    return NextResponse.json({ error: "Failed to generate weekly analysis" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const analysisService = new WeeklyAnalysisService()
    const slackService = new SlackService()
    const dateRange = await analysisService.getLastWeekDateRange()

    const channels = await slackService.getChannels()
    console.log(
      "[v0] Found",
      channels.length,
      "channels:",
      channels.map((c) => c.name),
    )

    if (channels.length === 0) {
      console.log("[v0] No channels found - check Slack bot permissions")
      return NextResponse.json({
        error: "No accessible channels found. Please check your Slack bot permissions.",
        weekStart: dateRange.start,
        weekEnd: dateRange.end,
        totalMessages: 0,
        overallSentiment: 0,
        channelAnalysis: [],
        burnoutAlerts: [],
        insights: ["No channels accessible - please check Slack bot permissions"],
        teamMetrics: {
          activeUsers: 0,
          responseRate: 0,
          engagementScore: 0,
          moodDistribution: { positive: 0.33, neutral: 0.33, negative: 0.34 },
        },
      })
    }

    // Use the first few available channels for analysis
    const channelIds = channels.slice(0, 5).map((c) => c.id)
    console.log("[v0] Analyzing channels:", channelIds)

    const result = await analysisService.generateWeeklyReport(channelIds, dateRange.start, dateRange.end)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error in weekly analysis API:", error)
    return NextResponse.json({ error: "Failed to generate weekly analysis" }, { status: 500 })
  }
}
