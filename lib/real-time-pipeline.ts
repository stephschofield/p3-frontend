import { azureOpenAIClient } from "./azure-openai-client"
import { slackClient } from "./slack-client"

interface RealtimeMessage {
  id: string
  channelId: string
  channelName: string
  userId: string
  userName: string
  text: string
  timestamp: string
  sentiment?: {
    sentiment: "positive" | "negative" | "neutral"
    score: number
    confidence: number
  }
  processed: boolean
}

interface PipelineStats {
  messagesProcessed: number
  averageProcessingTime: number
  lastProcessedAt: string
  queueSize: number
  errors: number
}

export class RealtimePipeline {
  private messageQueue: RealtimeMessage[] = []
  private processing = false
  private stats: PipelineStats = {
    messagesProcessed: 0,
    averageProcessingTime: 0,
    lastProcessedAt: "",
    queueSize: 0,
    errors: 0,
  }
  private subscribers: Set<(data: any) => void> = new Set()
  private recentMessages: RealtimeMessage[] = []
  private maxRecentMessages = 100

  // Add message to processing queue
  async queueMessage(slackEvent: any): Promise<void> {
    try {
      console.log("[v0] Queueing message for real-time processing:", slackEvent.channel)

      // Get user info
      const user = await slackClient.getUserInfo(slackEvent.user)

      // Get channel info
      const channels = await slackClient.getChannels()
      const channel = channels.find((c) => c.id === slackEvent.channel)

      const message: RealtimeMessage = {
        id: slackEvent.ts,
        channelId: slackEvent.channel,
        channelName: channel?.name || "unknown",
        userId: slackEvent.user,
        userName: user?.real_name || user?.name || "Unknown User",
        text: slackEvent.text,
        timestamp: new Date(Number.parseFloat(slackEvent.ts) * 1000).toISOString(),
        processed: false,
      }

      this.messageQueue.push(message)
      this.stats.queueSize = this.messageQueue.length

      console.log("[v0] Message queued, queue size:", this.stats.queueSize)

      // Start processing if not already running
      if (!this.processing) {
        this.startProcessing()
      }
    } catch (error) {
      console.error("[v0] Error queueing message:", error)
      this.stats.errors++
    }
  }

  // Start processing messages from queue
  private async startProcessing(): Promise<void> {
    if (this.processing) return

    this.processing = true
    console.log("[v0] Starting real-time message processing")

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      if (!message) continue

      const startTime = Date.now()

      try {
        // Skip very short messages
        if (message.text.length < 10) {
          console.log("[v0] Skipping short message")
          continue
        }

        console.log("[v0] Processing message:", message.id)

        // Analyze sentiment
        const sentimentAnalysis = await azureOpenAIClient.analyzeSentiment(message.text)

        message.sentiment = {
          sentiment: sentimentAnalysis.sentiment,
          score: sentimentAnalysis.score,
          confidence: sentimentAnalysis.confidence,
        }
        message.processed = true

        // Add to recent messages
        this.recentMessages.unshift(message)
        if (this.recentMessages.length > this.maxRecentMessages) {
          this.recentMessages = this.recentMessages.slice(0, this.maxRecentMessages)
        }

        // Update stats
        const processingTime = Date.now() - startTime
        this.stats.messagesProcessed++
        this.stats.averageProcessingTime =
          (this.stats.averageProcessingTime * (this.stats.messagesProcessed - 1) + processingTime) /
          this.stats.messagesProcessed
        this.stats.lastProcessedAt = new Date().toISOString()
        this.stats.queueSize = this.messageQueue.length

        console.log("[v0] Message processed:", message.sentiment?.sentiment, message.sentiment?.score)

        // Notify subscribers
        this.notifySubscribers({
          type: "message_processed",
          message,
          stats: this.stats,
        })

        // Check for burnout alerts
        if (message.sentiment.score < -0.5 || message.sentiment.confidence > 0.8) {
          this.notifySubscribers({
            type: "alert",
            alert: {
              type: "negative_sentiment",
              message: `Negative sentiment detected from ${message.userName}`,
              severity: message.sentiment.score < -0.7 ? "high" : "medium",
              data: message,
            },
          })
        }
      } catch (error) {
        console.error("[v0] Error processing message:", message.id, error)
        this.stats.errors++
      }
    }

    this.processing = false
    console.log("[v0] Real-time processing completed")
  }

  // Subscribe to real-time updates
  subscribe(callback: (data: any) => void): () => void {
    this.subscribers.add(callback)
    console.log("[v0] New subscriber added, total:", this.subscribers.size)

    // Send current stats to new subscriber
    callback({
      type: "stats_update",
      stats: this.stats,
      recentMessages: this.recentMessages.slice(0, 10),
    })

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback)
      console.log("[v0] Subscriber removed, total:", this.subscribers.size)
    }
  }

  // Notify all subscribers
  private notifySubscribers(data: any): void {
    this.subscribers.forEach((callback) => {
      try {
        callback(data)
      } catch (error) {
        console.error("[v0] Error notifying subscriber:", error)
      }
    })
  }

  // Get current stats
  getStats(): PipelineStats {
    return { ...this.stats }
  }

  // Get recent messages
  getRecentMessages(limit = 20): RealtimeMessage[] {
    return this.recentMessages.slice(0, limit)
  }

  // Generate real-time summary
  generateRealtimeSummary(): any {
    const recentMessages = this.recentMessages.filter((msg) => msg.processed)

    if (recentMessages.length === 0) {
      return {
        totalMessages: 0,
        averageSentiment: 0,
        sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
        topChannels: [],
        alerts: [],
      }
    }

    const totalScore = recentMessages.reduce((sum, msg) => sum + (msg.sentiment?.score || 0), 0)
    const averageSentiment = totalScore / recentMessages.length

    const sentimentCounts = recentMessages.reduce(
      (counts, msg) => {
        if (msg.sentiment) {
          counts[msg.sentiment.sentiment]++
        }
        return counts
      },
      { positive: 0, negative: 0, neutral: 0 },
    )

    // Top channels by activity
    const channelCounts = recentMessages.reduce(
      (counts, msg) => {
        counts[msg.channelName] = (counts[msg.channelName] || 0) + 1
        return counts
      },
      {} as Record<string, number>,
    )

    const topChannels = Object.entries(channelCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    // Generate alerts for concerning patterns
    const alerts = []
    const negativeMessages = recentMessages.filter((msg) => msg.sentiment?.sentiment === "negative")
    if (negativeMessages.length > recentMessages.length * 0.3) {
      alerts.push({
        type: "high_negative_sentiment",
        message: `${negativeMessages.length} negative messages in recent activity`,
        severity: "medium",
      })
    }

    return {
      totalMessages: recentMessages.length,
      averageSentiment,
      sentimentDistribution: sentimentCounts,
      topChannels,
      alerts,
    }
  }

  // Clear old data
  clearOldData(): void {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
    this.recentMessages = this.recentMessages.filter((msg) => new Date(msg.timestamp) > cutoff)
    console.log("[v0] Cleared old data, remaining messages:", this.recentMessages.length)
  }
}

export const realtimePipeline = new RealtimePipeline()
