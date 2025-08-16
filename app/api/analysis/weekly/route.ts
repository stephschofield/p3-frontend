import { type NextRequest, NextResponse } from "next/server"
import { WeeklyAnalysisService } from "@/lib/weekly-analysis-service"

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
    const dateRange = await analysisService.getLastWeekDateRange()

    // Mock channel IDs for demo - in real app, these would come from user configuration
    const mockChannelIds = ["general", "engineering"]

    const result = await analysisService.generateWeeklyReport(mockChannelIds, dateRange.start, dateRange.end)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error in weekly analysis API:", error)
    return NextResponse.json({ error: "Failed to generate weekly analysis" }, { status: 500 })
  }
}
