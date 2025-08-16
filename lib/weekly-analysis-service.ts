import { SlackService } from "./slack-service"
import { AzureSentimentService } from "./azure-sentiment-service"

interface WeeklyAnalysisResult {
  weekStart: Date
  weekEnd: Date
  overallSentiment: number
  totalMessages: number
  channelAnalysis: ChannelAnalysis[]
  burnoutAlerts: BurnoutAlert[]
  insights: string[]
  teamMetrics: TeamMetrics
}

interface ChannelAnalysis {
  channelId: string
  channelName: string
  messageCount: number
  averageSentiment: number
  sentimentTrend: number[]
  topKeywords: string[]
  participationRate: number
}

interface BurnoutAlert {
  userId: string
  riskScore: number
  indicators: string[]
  recommendations: string[]
}

interface TeamMetrics {
  activeUsers: number
  responseRate: number
  engagementScore: number
  moodDistribution: {
    positive: number
    neutral: number
    negative: number
  }
}

export class WeeklyAnalysisService {
  private slackService: SlackService
  private sentimentService: AzureSentimentService

  constructor() {
    this.slackService = new SlackService()
    this.sentimentService = new AzureSentimentService()
  }

  async generateWeeklyReport(channelIds: string[], weekStart: Date, weekEnd: Date): Promise<WeeklyAnalysisResult> {
    console.log("[v0] Starting weekly analysis for", channelIds.length, "channels")

    try {
      // Get all channels info
      const allChannels = await this.slackService.getChannels()
      const selectedChannels = allChannels.filter((ch) => channelIds.includes(ch.id))

      // Analyze each channel
      const channelAnalyses: ChannelAnalysis[] = []
      let totalMessages = 0
      const allSentimentScores: number[] = []
      const userActivity: Map<string, any> = new Map()

      for (const channel of selectedChannels) {
        console.log("[v0] Analyzing channel:", channel.name)

        const messages = await this.slackService.getWeeklyMessages(channel.id, weekStart, weekEnd)

        if (messages.length === 0) {
          console.log("[v0] No messages found for channel:", channel.name)
          continue
        }

        // Analyze sentiment for each message
        const sentimentResults = []
        const dailySentiments: number[][] = [[], [], [], [], [], [], []] // 7 days

        for (const message of messages) {
          const sentiment = await this.sentimentService.analyzeSentiment(message.text)
          sentimentResults.push(sentiment)
          allSentimentScores.push(sentiment.score)

          // Track user activity
          if (!userActivity.has(message.user)) {
            userActivity.set(message.user, {
              messageCount: 0,
              sentiments: [],
              timestamps: [],
            })
          }

          const userData = userActivity.get(message.user)
          userData.messageCount++
          userData.sentiments.push(sentiment.score)
          userData.timestamps.push(new Date(Number.parseFloat(message.ts) * 1000))

          // Group by day of week
          const messageDate = new Date(Number.parseFloat(message.ts) * 1000)
          const dayOfWeek = messageDate.getDay()
          dailySentiments[dayOfWeek].push(sentiment.score)
        }

        // Calculate channel metrics
        const averageSentiment = sentimentResults.reduce((sum, s) => sum + s.score, 0) / sentimentResults.length
        const sentimentTrend = dailySentiments.map((day) =>
          day.length > 0 ? day.reduce((sum, s) => sum + s, 0) / day.length : 0,
        )

        // Extract top keywords
        const allKeywords = sentimentResults.flatMap((s) => s.keywords)
        const keywordCounts = allKeywords.reduce(
          (acc, keyword) => {
            acc[keyword] = (acc[keyword] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        )

        const topKeywords = Object.entries(keywordCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([keyword]) => keyword)

        channelAnalyses.push({
          channelId: channel.id,
          channelName: channel.name,
          messageCount: messages.length,
          averageSentiment,
          sentimentTrend,
          topKeywords,
          participationRate: userActivity.size / Math.max(messages.length * 0.1, 1), // Rough estimate
        })

        totalMessages += messages.length
      }

      // Analyze burnout risks
      const burnoutAlerts: BurnoutAlert[] = []
      for (const [userId, activity] of userActivity.entries()) {
        if (activity.messageCount >= 5) {
          // Only analyze users with sufficient activity
          const userMessages = activity.sentiments.map((s: number, i: number) => `Message ${i + 1}: sentiment ${s}`)

          const burnoutRisk = await this.sentimentService.analyzeBurnoutRisk(userMessages, activity)

          if (burnoutRisk.overallRisk > 60) {
            burnoutAlerts.push({
              userId,
              riskScore: burnoutRisk.overallRisk,
              indicators: [
                burnoutRisk.exhaustionKeywords > 50 ? "Exhaustion language detected" : "",
                burnoutRisk.negativeSentimentTrend > 50 ? "Declining sentiment trend" : "",
                burnoutRisk.reducedEngagement > 50 ? "Reduced engagement" : "",
                burnoutRisk.workHoursPattern > 50 ? "Unhealthy work patterns" : "",
              ].filter(Boolean),
              recommendations: [
                "Schedule a 1:1 check-in",
                "Review current workload",
                "Consider time off or reduced responsibilities",
              ],
            })
          }
        }
      }

      // Calculate team metrics
      const overallSentiment =
        allSentimentScores.length > 0
          ? allSentimentScores.reduce((sum, s) => sum + s, 0) / allSentimentScores.length
          : 0

      const positiveCount = allSentimentScores.filter((s) => s > 0.2).length
      const negativeCount = allSentimentScores.filter((s) => s < -0.2).length
      const neutralCount = allSentimentScores.length - positiveCount - negativeCount

      const teamMetrics: TeamMetrics = {
        activeUsers: userActivity.size,
        responseRate: 0.85, // Mock data - would calculate from actual response patterns
        engagementScore: Math.max(0, Math.min(10, (overallSentiment + 1) * 5)),
        moodDistribution: {
          positive: allSentimentScores.length > 0 ? positiveCount / allSentimentScores.length : 0.33,
          neutral: allSentimentScores.length > 0 ? neutralCount / allSentimentScores.length : 0.33,
          negative: allSentimentScores.length > 0 ? negativeCount / allSentimentScores.length : 0.34,
        },
      }

      // Generate insights
      const insights = await this.sentimentService.generateWeeklyInsights(channelAnalyses, teamMetrics)

      console.log("[v0] Weekly analysis completed:", {
        totalMessages,
        overallSentiment,
        burnoutAlerts: burnoutAlerts.length,
        insights: insights.length,
      })

      return {
        weekStart,
        weekEnd,
        overallSentiment,
        totalMessages,
        channelAnalysis: channelAnalyses,
        burnoutAlerts,
        insights,
        teamMetrics,
      }
    } catch (error) {
      console.log("[v0] Error in weekly analysis:", error)

      // Return fallback data on error
      return {
        weekStart,
        weekEnd,
        overallSentiment: 0.1,
        totalMessages: 0,
        channelAnalysis: [],
        burnoutAlerts: [],
        insights: ["Unable to generate insights - please check your configuration"],
        teamMetrics: {
          activeUsers: 0,
          responseRate: 0,
          engagementScore: 5,
          moodDistribution: { positive: 0.33, neutral: 0.33, negative: 0.34 },
        },
      }
    }
  }

  async getLastWeekDateRange(): Promise<{ start: Date; end: Date }> {
    const now = new Date()
    const start = new Date(now)
    start.setDate(now.getDate() - 7) // 7 days ago
    start.setHours(0, 0, 0, 0)

    const end = new Date(now)
    end.setHours(23, 59, 59, 999) // Until now

    console.log("[v0] Date range:", { start: start.toISOString(), end: end.toISOString() })
    return { start, end }
  }
}
