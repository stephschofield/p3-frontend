import { type NextRequest, NextResponse } from "next/server"
import { azureOpenAIClient } from "@/lib/azure-openai-client"

export async function POST(request: NextRequest) {
  try {
    const { text, messages } = await request.json()

    if (!text && !messages) {
      return NextResponse.json(
        {
          success: false,
          error: "Text or messages array is required",
        },
        { status: 400 },
      )
    }

    console.log("[v0] Processing sentiment analysis request")

    if (text) {
      // Single text analysis
      const result = await azureOpenAIClient.analyzeSentiment(text)

      return NextResponse.json({
        success: true,
        analysis: result,
      })
    } else if (messages && Array.isArray(messages)) {
      // Batch analysis
      const results = []

      for (const message of messages.slice(0, 10)) {
        // Limit to 10 messages
        try {
          const analysis = await azureOpenAIClient.analyzeSentiment(message.text || message)
          results.push({
            id: message.id || message.ts,
            text: message.text || message,
            analysis,
          })
        } catch (error) {
          console.error("[v0] Error analyzing message:", error)
        }
      }

      return NextResponse.json({
        success: true,
        results,
      })
    }
  } catch (error) {
    console.error("[v0] Sentiment analysis error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze sentiment",
      },
      { status: 500 },
    )
  }
}
