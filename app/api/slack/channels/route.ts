import { NextResponse } from "next/server"
import { SlackService } from "@/lib/slack-service"

export async function GET() {
  try {
    const slackService = new SlackService()
    const channels = await slackService.getChannels()

    console.log("[v0] Retrieved", channels.length, "Slack channels")

    return NextResponse.json({ channels })
  } catch (error) {
    console.error("[v0] Error fetching Slack channels:", error)
    return NextResponse.json({ error: "Failed to fetch channels" }, { status: 500 })
  }
}
