import { type NextRequest, NextResponse } from "next/server"
import { sentimentAnalysisService } from "@/lib/sentiment-analysis-service"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Fetching sentiment summary")

    // Get cached processed messages
    const processedMessages = sentimentAnalysisService.getProcessedMessages()

    if (processedMessages.length === 0) {
      return NextResponse.json({
        success: true,
        summary: sentimentAnalysisService.generateTeamSummary([]),
        message: "No processed messages found. Run sentiment analysis first.",
      })
    }

    // Generate fresh summary from cached data
    const summary = sentimentAnalysisService.generateTeamSummary(processedMessages)

    console.log("[v0] Summary generated from", processedMessages.length, "cached messages")

    return NextResponse.json({
      success: true,
      summary,
    })
  } catch (error) {
    console.error("[v0] Error fetching sentiment summary:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch sentiment summary",
      },
      { status: 500 },
    )
  }
}
