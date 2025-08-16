import { type NextRequest, NextResponse } from "next/server"
import { slackClient } from "@/lib/slack-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get("channel")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const oldest = searchParams.get("oldest") || undefined

    if (!channelId) {
      return NextResponse.json(
        {
          success: false,
          error: "Channel ID is required",
        },
        { status: 400 },
      )
    }

    console.log("[v0] Fetching messages for channel:", channelId)

    const messages = await slackClient.getChannelMessages(channelId, limit, oldest)

    // Filter out bot messages and system messages
    const userMessages = messages.filter(
      (msg) =>
        msg.user &&
        !msg.user.startsWith("B") && // Bot users start with 'B'
        msg.text &&
        !msg.text.startsWith("<@"), // Avoid mention-only messages
    )

    console.log("[v0] Found user messages:", userMessages.length)

    return NextResponse.json({
      success: true,
      messages: userMessages,
    })
  } catch (error) {
    console.error("[v0] Error fetching messages:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch messages",
      },
      { status: 500 },
    )
  }
}
