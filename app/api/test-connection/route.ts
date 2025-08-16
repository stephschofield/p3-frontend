import { NextResponse } from "next/server"
import { SlackService } from "@/lib/slack-service"
import { AzureSentimentService } from "@/lib/azure-sentiment-service"

export async function GET() {
  try {
    const results = {
      slack: { connected: false, error: null as string | null },
      azureOpenAI: { connected: false, error: null as string | null },
    }

    // Test Slack connection
    try {
      const slackService = new SlackService()
      const channels = await slackService.getChannels()
      results.slack.connected = channels.length > 0
      if (!results.slack.connected) {
        results.slack.error = "No channels found - check bot permissions"
      }
    } catch (error) {
      results.slack.error = error instanceof Error ? error.message : "Unknown error"
    }

    // Test Azure OpenAI connection
    try {
      const sentimentService = new AzureSentimentService()
      const testResult = await sentimentService.analyzeSentiment("This is a test message")
      results.azureOpenAI.connected = testResult.confidence > 0
      if (!results.azureOpenAI.connected) {
        results.azureOpenAI.error = "Low confidence response - check configuration"
      }
    } catch (error) {
      results.azureOpenAI.error = error instanceof Error ? error.message : "Unknown error"
    }

    console.log("[v0] Connection test results:", results)

    return NextResponse.json(results)
  } catch (error) {
    console.error("[v0] Error testing connections:", error)
    return NextResponse.json({ error: "Failed to test connections" }, { status: 500 })
  }
}
