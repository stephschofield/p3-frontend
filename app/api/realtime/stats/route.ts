import { type NextRequest, NextResponse } from "next/server"
import { realtimePipeline } from "@/lib/real-time-pipeline"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Fetching real-time pipeline stats")

    const stats = realtimePipeline.getStats()
    const recentMessages = realtimePipeline.getRecentMessages(10)
    const summary = realtimePipeline.generateRealtimeSummary()

    return NextResponse.json({
      success: true,
      stats,
      recentMessages,
      summary,
    })
  } catch (error) {
    console.error("[v0] Error fetching real-time stats:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch real-time stats",
      },
      { status: 500 },
    )
  }
}
