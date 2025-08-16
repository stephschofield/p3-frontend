import { type NextRequest, NextResponse } from "next/server"
import { azureOpenAIClient } from "@/lib/azure-openai-client"

export async function POST(request: NextRequest) {
  try {
    const { messages, userId, userContext } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        {
          success: false,
          error: "Messages array is required",
        },
        { status: 400 },
      )
    }

    console.log("[v0] Assessing burnout risk for user:", userId)

    // Extract text from messages
    const messageTexts = messages
      .map((msg) => (typeof msg === "string" ? msg : msg.text || ""))
      .filter((text) => text.length > 0)

    if (messageTexts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid messages found",
        },
        { status: 400 },
      )
    }

    const assessment = await azureOpenAIClient.assessBurnoutRisk(messageTexts, userContext)

    return NextResponse.json({
      success: true,
      assessment,
    })
  } catch (error) {
    console.error("[v0] Burnout assessment error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to assess burnout risk",
      },
      { status: 500 },
    )
  }
}
