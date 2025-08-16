import { type NextRequest, NextResponse } from "next/server"
import { SlackService } from "@/lib/slack-service"
import { AzureSentimentService } from "@/lib/azure-sentiment-service"

export async function GET(request: NextRequest, { params }: { params: { channelId: string } }) {
  try {
    const { channelId } = params
    console.log("[v0] Fetching channel detail for:", channelId)

    const slackService = new SlackService()
    const sentimentService = new AzureSentimentService()

    // Get channel info
    const channels = await slackService.getChannels()
    const channel = channels.find((c) => c.id === channelId)

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 })
    }

    // Get date range (last 7 days)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)

    console.log("[v0] Fetching messages for channel:", channel.name)

    // Get messages for the channel
    const messages = await slackService.getWeeklyMessages(channelId, startDate, endDate)
    console.log("[v0] Found", messages.length, "messages for channel:", channel.name)

    // Analyze sentiment for each message
    const analyzedMessages = []
    let totalSentiment = 0
    const dailySentiment = [0, 0, 0, 0, 0, 0, 0] // Mon-Sun
    const keywords = new Set<string>()

    for (const message of messages) {
      try {
        const sentiment = await sentimentService.analyzeSentiment(message.text)
        totalSentiment += sentiment

        // Add to daily sentiment (0 = Monday, 6 = Sunday)
        const messageDate = new Date(message.timestamp)
        const dayOfWeek = (messageDate.getDay() + 6) % 7 // Convert Sunday=0 to Monday=0
        dailySentiment[dayOfWeek] = Math.max(dailySentiment[dayOfWeek], sentiment)

        // Extract keywords (simple word extraction)
        const words = message.text.toLowerCase().split(/\s+/)
        words.forEach((word) => {
          if (word.length > 3 && !["this", "that", "with", "have", "will", "been", "from"].includes(word)) {
            keywords.add(word)
          }
        })

        analyzedMessages.push({
          id: message.id,
          text: message.text.length > 200 ? message.text.substring(0, 200) + "..." : message.text,
          user: message.user || "Unknown User",
          timestamp: message.timestamp,
          sentiment: sentiment,
          sentimentLabel: sentiment >= 0.7 ? "Positive" : sentiment >= 0.4 ? "Neutral" : "Negative",
        })
      } catch (error) {
        console.error("[v0] Error analyzing message sentiment:", error)
        // Add message with neutral sentiment as fallback
        analyzedMessages.push({
          id: message.id,
          text: message.text.length > 200 ? message.text.substring(0, 200) + "..." : message.text,
          user: message.user || "Unknown User",
          timestamp: message.timestamp,
          sentiment: 0.5,
          sentimentLabel: "Neutral",
        })
      }
    }

    const averageSentiment = messages.length > 0 ? totalSentiment / messages.length : 0.5
    const topKeywords = Array.from(keywords).slice(0, 10)

    const channelDetail = {
      channelId: channelId,
      channelName: channel.name,
      messageCount: messages.length,
      averageSentiment: Math.max(0, Math.min(1, averageSentiment)), // Ensure 0-1 range
      sentimentTrend: dailySentiment.map((s) => Math.max(0, Math.min(1, s))), // Ensure 0-1 range
      topKeywords: topKeywords,
      participationRate: messages.length > 0 ? 1 : 0, // Simplified calculation
      messages: analyzedMessages.slice(0, 20), // Limit to 20 most recent
      weeklyStats: {
        totalMessages: messages.length,
        activeUsers: new Set(messages.map((m) => m.user)).size,
        avgMessagesPerDay: Math.round((messages.length / 7) * 10) / 10,
      },
    }

    console.log("[v0] Channel detail response:", {
      channelName: channelDetail.channelName,
      messageCount: channelDetail.messageCount,
      averageSentiment: channelDetail.averageSentiment,
      keywordCount: channelDetail.topKeywords.length,
    })

    return NextResponse.json(channelDetail)
  } catch (error) {
    console.error("[v0] Error fetching channel detail:", error)
    return NextResponse.json({ error: "Failed to fetch channel detail" }, { status: 500 })
  }
}
