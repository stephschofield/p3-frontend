import { type NextRequest, NextResponse } from "next/server"
import { slackClient } from "@/lib/slack-client"
import { realtimePipeline } from "@/lib/real-time-pipeline"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-slack-signature") || ""
    const timestamp = request.headers.get("x-slack-request-timestamp") || ""

    // Verify the request is from Slack
    if (!slackClient.verifySignature(signature, timestamp, body)) {
      console.log("[v0] Invalid Slack signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const data = JSON.parse(body)

    // Handle URL verification challenge
    if (data.type === "url_verification") {
      console.log("[v0] Slack URL verification challenge")
      return NextResponse.json({ challenge: data.challenge })
    }

    // Handle message events
    if (data.type === "event_callback" && data.event) {
      const event = data.event

      if (event.type === "message" && !event.bot_id && event.text) {
        console.log("[v0] New message received for real-time processing:", event.channel)

        await realtimePipeline.queueMessage(event)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
