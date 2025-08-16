import { NextResponse } from "next/server"

export async function GET() {
  try {
    const botToken = process.env.SLACK_BOT_TOKEN

    if (!botToken) {
      return NextResponse.json({ error: "Slack bot token not configured" }, { status: 400 })
    }

    // Test Slack API connection
    const response = await fetch("https://slack.com/api/auth.test", {
      headers: {
        Authorization: `Bearer ${botToken}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (data.ok) {
      return NextResponse.json({
        success: true,
        team: data.team,
        user: data.user,
        message: "Slack connection successful",
      })
    } else {
      return NextResponse.json(
        {
          error: data.error || "Slack connection failed",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Slack test error:", error)
    return NextResponse.json({ error: "Failed to test Slack connection" }, { status: 500 })
  }
}
