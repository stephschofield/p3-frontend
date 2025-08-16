import { type NextRequest, NextResponse } from "next/server"
import { sentimentAnalysisService } from "@/lib/sentiment-analysis-service"

export async function POST(request: NextRequest) {
  try {
    const { channelId, processAll } = await request.json()

    console.log("[v0] Starting sentiment processing request")

    let processedMessages

    if (processAll) {
      // Process all monitored channels
      processedMessages = await sentimentAnalysisService.processAllMonitoredChannels()
    } else if (channelId) {
      // Process specific channel
      processedMessages = await sentimentAnalysisService.processChannelMessages(channelId)
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Either channelId or processAll flag is required",
        },
        { status: 400 },
      )
    }

    // Generate team summary
    const summary = sentimentAnalysisService.generateTeamSummary(processedMessages)

    console.log("[v0] Processing complete:", processedMessages.length, "messages processed")

    return NextResponse.json({
      success: true,
      processedMessages: processedMessages.length,
      summary,
    })
  } catch (error) {
    console.error("[v0] Sentiment processing error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process sentiment analysis",
      },
      { status: 500 },
    )
  }
}
