import { type NextRequest, NextResponse } from "next/server"
import { azureOpenAIClient } from "@/lib/azure-openai-client"

export async function POST(request: NextRequest) {
  try {
    const { sentimentData, teamMetrics } = await request.json()

    if (!sentimentData) {
      return NextResponse.json(
        {
          success: false,
          error: "Sentiment data is required",
        },
        { status: 400 },
      )
    }

    console.log("[v0] Generating AI insights from team data")

    const insights = await azureOpenAIClient.generateInsights(sentimentData, teamMetrics)

    return NextResponse.json({
      success: true,
      insights,
    })
  } catch (error) {
    console.error("[v0] Insights generation error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate insights",
      },
      { status: 500 },
    )
  }
}
