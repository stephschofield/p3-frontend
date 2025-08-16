import { type NextRequest, NextResponse } from "next/server"
import { slackClient } from "@/lib/slack-client"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Fetching Slack channels")

    if (!process.env.SLACK_BOT_TOKEN) {
      return NextResponse.json({
        success: false,
        error: "Slack API not configured. Please add SLACK_BOT_TOKEN in Project Settings.",
        configurationRequired: true,
      })
    }

    const channels = await slackClient.getChannels()

    // Filter to only show channels the bot is a member of
    const accessibleChannels = channels.filter((channel) => channel.is_member)

    console.log("[v0] Found channels:", accessibleChannels.length)

    return NextResponse.json({
      success: true,
      channels: accessibleChannels,
    })
  } catch (error) {
    console.error("[v0] Error fetching channels:", error)

    const errorMessage =
      error instanceof Error && error.message.includes("invalid_auth")
        ? "Invalid Slack credentials. Please check your SLACK_BOT_TOKEN in Project Settings."
        : "Failed to fetch channels. Please verify your Slack configuration."

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}
