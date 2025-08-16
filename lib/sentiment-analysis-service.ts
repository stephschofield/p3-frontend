import { slackClient } from "./slack-client"
import { azureOpenAIClient } from "./azure-openai-client"

interface ProcessedMessage {
  id: string
  channelId: string
  channelName: string
  userId: string
  userName: string
  text: string
  timestamp: string
  sentiment: {
    sentiment: "positive" | "negative" | "neutral"
    confidence: number
    score: number
    emotions: {
      joy: number
      sadness: number
      anger: number
      fear: number
      surprise: number
    }
    burnoutIndicators: {
      workload: number
      stress: number
      engagement: number
      satisfaction: number
    }
    keyPhrases: string[]
  }
  processedAt: string
}

interface TeamSentimentSummary {
  overall: {
    sentiment: "positive" | "negative" | "neutral"
    averageScore: number
    confidence: number
    messageCount: number
  }
  trends: {
    daily: Array<{
      date: string
      score: number
      messageCount: number
    }>
    weekly: Array<{
      week: string
      score: number
      messageCount: number
    }>
  }
  channels: Array<{
    id: string
    name: string
    sentiment: "positive" | "negative" | "neutral"
    averageScore: number
    messageCount: number
  }>
  users: Array<{
    id: string
    name: string
    sentiment: "positive" | "negative" | "neutral"
    averageScore: number
    messageCount: number
    burnoutRisk: "low" | "medium" | "high" | "critical"
  }>
}

export class SentimentAnalysisService {
  private processedMessages: Map<string, ProcessedMessage> = new Map()
  private userCache: Map<string, any> = new Map()

  async processChannelMessages(channelId: string, limit = 50): Promise<ProcessedMessage[]> {
    try {
      console.log("[v0] Processing messages for channel:", channelId)

      // Fetch messages from Slack
      const messages = await slackClient.getChannelMessages(channelId, limit)
      const channels = await slackClient.getChannels()
      const channel = channels.find((c) => c.id === channelId)

      const processedMessages: ProcessedMessage[] = []

      for (const message of messages) {
        if (!message.text || message.text.length < 10) continue // Skip very short messages

        try {
          // Get user info (with caching)
          let user = this.userCache.get(message.user)
          if (!user) {
            user = await slackClient.getUserInfo(message.user)
            if (user) {
              this.userCache.set(message.user, user)
            }
          }

          // Analyze sentiment
          const sentimentAnalysis = await azureOpenAIClient.analyzeSentiment(message.text)

          const processedMessage: ProcessedMessage = {
            id: message.ts,
            channelId,
            channelName: channel?.name || "unknown",
            userId: message.user,
            userName: user?.real_name || user?.name || "Unknown User",
            text: message.text,
            timestamp: new Date(Number.parseFloat(message.ts) * 1000).toISOString(),
            sentiment: sentimentAnalysis,
            processedAt: new Date().toISOString(),
          }

          processedMessages.push(processedMessage)
          this.processedMessages.set(processedMessage.id, processedMessage)

          console.log("[v0] Processed message:", processedMessage.sentiment.sentiment, processedMessage.sentiment.score)
        } catch (error) {
          console.error("[v0] Error processing message:", message.ts, error)
        }
      }

      console.log("[v0] Successfully processed", processedMessages.length, "messages")
      return processedMessages
    } catch (error) {
      console.error("[v0] Error processing channel messages:", error)
      return []
    }
  }

  async processAllMonitoredChannels(): Promise<ProcessedMessage[]> {
    try {
      console.log("[v0] Processing all monitored channels")

      const channels = await slackClient.getChannels()
      const monitoredChannels = channels.filter((channel) => channel.is_member)

      const allProcessedMessages: ProcessedMessage[] = []

      for (const channel of monitoredChannels.slice(0, 5)) {
        // Limit to 5 channels for demo
        const messages = await this.processChannelMessages(channel.id, 20) // 20 messages per channel
        allProcessedMessages.push(...messages)
      }

      console.log("[v0] Processed total messages:", allProcessedMessages.length)
      return allProcessedMessages
    } catch (error) {
      console.error("[v0] Error processing all channels:", error)
      return []
    }
  }

  generateTeamSummary(messages: ProcessedMessage[]): TeamSentimentSummary {
    if (messages.length === 0) {
      return this.getEmptySummary()
    }

    console.log("[v0] Generating team summary from", messages.length, "messages")

    // Calculate overall sentiment
    const totalScore = messages.reduce((sum, msg) => sum + msg.sentiment.score, 0)
    const averageScore = totalScore / messages.length
    const overallSentiment = averageScore > 0.1 ? "positive" : averageScore < -0.1 ? "negative" : "neutral"
    const averageConfidence = messages.reduce((sum, msg) => sum + msg.sentiment.confidence, 0) / messages.length

    // Generate daily trends (last 7 days)
    const dailyTrends = this.generateDailyTrends(messages)
    const weeklyTrends = this.generateWeeklyTrends(messages)

    // Channel analysis
    const channelGroups = this.groupBy(messages, "channelId")
    const channels = Object.entries(channelGroups).map(([channelId, msgs]) => {
      const channelScore = msgs.reduce((sum, msg) => sum + msg.sentiment.score, 0) / msgs.length
      return {
        id: channelId,
        name: msgs[0].channelName,
        sentiment:
          channelScore > 0.1
            ? ("positive" as const)
            : channelScore < -0.1
              ? ("negative" as const)
              : ("neutral" as const),
        averageScore: channelScore,
        messageCount: msgs.length,
      }
    })

    // User analysis with burnout risk
    const userGroups = this.groupBy(messages, "userId")
    const users = Object.entries(userGroups).map(([userId, msgs]) => {
      const userScore = msgs.reduce((sum, msg) => sum + msg.sentiment.score, 0) / msgs.length
      const burnoutScore = this.calculateBurnoutRisk(msgs)

      return {
        id: userId,
        name: msgs[0].userName,
        sentiment:
          userScore > 0.1 ? ("positive" as const) : userScore < -0.1 ? ("negative" as const) : ("neutral" as const),
        averageScore: userScore,
        messageCount: msgs.length,
        burnoutRisk:
          burnoutScore > 75
            ? ("critical" as const)
            : burnoutScore > 50
              ? ("high" as const)
              : burnoutScore > 25
                ? ("medium" as const)
                : ("low" as const),
      }
    })

    return {
      overall: {
        sentiment: overallSentiment,
        averageScore,
        confidence: averageConfidence,
        messageCount: messages.length,
      },
      trends: {
        daily: dailyTrends,
        weekly: weeklyTrends,
      },
      channels,
      users,
    }
  }

  private generateDailyTrends(messages: ProcessedMessage[]) {
    const dailyGroups = this.groupBy(messages, (msg) => new Date(msg.timestamp).toISOString().split("T")[0])

    const trends = Object.entries(dailyGroups).map(([date, msgs]) => ({
      date,
      score: msgs.reduce((sum, msg) => sum + msg.sentiment.score, 0) / msgs.length,
      messageCount: msgs.length,
    }))

    return trends.sort((a, b) => a.date.localeCompare(b.date)).slice(-7) // Last 7 days
  }

  private generateWeeklyTrends(messages: ProcessedMessage[]) {
    const weeklyGroups = this.groupBy(messages, (msg) => {
      const date = new Date(msg.timestamp)
      const week = this.getWeekString(date)
      return week
    })

    const trends = Object.entries(weeklyGroups).map(([week, msgs]) => ({
      week,
      score: msgs.reduce((sum, msg) => sum + msg.sentiment.score, 0) / msgs.length,
      messageCount: msgs.length,
    }))

    return trends.sort((a, b) => a.week.localeCompare(b.week)).slice(-4) // Last 4 weeks
  }

  private calculateBurnoutRisk(messages: ProcessedMessage[]): number {
    const indicators = messages.map((msg) => msg.sentiment.burnoutIndicators)
    const avgWorkload = indicators.reduce((sum, ind) => sum + ind.workload, 0) / indicators.length
    const avgStress = indicators.reduce((sum, ind) => sum + ind.stress, 0) / indicators.length
    const avgEngagement = indicators.reduce((sum, ind) => sum + ind.engagement, 0) / indicators.length
    const avgSatisfaction = indicators.reduce((sum, ind) => sum + ind.satisfaction, 0) / indicators.length

    // Higher workload and stress increase risk, higher engagement and satisfaction decrease risk
    const riskScore = (avgWorkload + avgStress) * 50 - (avgEngagement + avgSatisfaction) * 25
    return Math.max(0, Math.min(100, riskScore))
  }

  private groupBy<T>(array: T[], keyFn: string | ((item: T) => string)): Record<string, T[]> {
    return array.reduce(
      (groups, item) => {
        const key = typeof keyFn === "string" ? (item as any)[keyFn] : keyFn(item)
        if (!groups[key]) {
          groups[key] = []
        }
        groups[key].push(item)
        return groups
      },
      {} as Record<string, T[]>,
    )
  }

  private getWeekString(date: Date): string {
    const year = date.getFullYear()
    const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))
    return `${year}-W${week.toString().padStart(2, "0")}`
  }

  private getEmptySummary(): TeamSentimentSummary {
    return {
      overall: {
        sentiment: "neutral",
        averageScore: 0,
        confidence: 0,
        messageCount: 0,
      },
      trends: {
        daily: [],
        weekly: [],
      },
      channels: [],
      users: [],
    }
  }

  // Get cached processed messages
  getProcessedMessages(): ProcessedMessage[] {
    return Array.from(this.processedMessages.values())
  }

  // Clear cache
  clearCache(): void {
    this.processedMessages.clear()
    this.userCache.clear()
  }
}

export const sentimentAnalysisService = new SentimentAnalysisService()
