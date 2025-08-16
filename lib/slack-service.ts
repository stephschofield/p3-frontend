interface SlackMessage {
  text: string
  user: string
  ts: string
  thread_ts?: string
  reactions?: Array<{
    name: string
    count: number
    users: string[]
  }>
}

interface SlackChannel {
  id: string
  name: string
  is_member: boolean
  is_archived: boolean
  is_public: boolean
}

export class SlackService {
  private botToken: string
  private lastRequestTime = 0
  private requestCount = 0
  private readonly RATE_LIMIT_DELAY = 1000 // 1 second between requests
  private readonly MAX_RETRIES = 3

  constructor() {
    this.botToken = process.env.SLACK_BOT_TOKEN || ""
  }

  private async rateLimitedRequest(url: string, options: RequestInit): Promise<Response> {
    // Wait if we need to respect rate limits
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      await new Promise((resolve) => setTimeout(resolve, this.RATE_LIMIT_DELAY - timeSinceLastRequest))
    }

    this.lastRequestTime = Date.now()
    return fetch(url, options)
  }

  private async makeSlackRequest(url: string, retryCount = 0): Promise<any> {
    try {
      const response = await this.rateLimitedRequest(url, {
        headers: {
          Authorization: `Bearer ${this.botToken}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      // Handle rate limiting with retry
      if (data.error === "rate_limited" && retryCount < this.MAX_RETRIES) {
        const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff
        console.log(`[v0] Rate limited, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.MAX_RETRIES})`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        return this.makeSlackRequest(url, retryCount + 1)
      }

      return data
    } catch (error) {
      if (retryCount < this.MAX_RETRIES) {
        const delay = Math.pow(2, retryCount) * 1000
        console.log(`[v0] Request failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.MAX_RETRIES})`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        return this.makeSlackRequest(url, retryCount + 1)
      }
      throw error
    }
  }

  async getChannels(): Promise<SlackChannel[]> {
    if (!this.botToken) {
      console.log("[v0] Missing Slack bot token")
      return []
    }

    try {
      const data = await this.makeSlackRequest(
        "https://slack.com/api/conversations.list?types=public_channel,private_channel&exclude_archived=true&limit=200",
      )

      if (!data.ok) {
        console.log("[v0] Slack API error:", data.error)
        if (data.error === "missing_scope") {
          console.log("[v0] Bot needs 'channels:read' and 'groups:read' scopes")
        } else if (data.error === "invalid_auth") {
          console.log("[v0] Invalid bot token - check SLACK_BOT_TOKEN environment variable")
        }
        return []
      }

      const accessibleChannels = data.channels.filter(
        (channel: any) => !channel.is_archived && (channel.is_member || channel.is_public),
      )

      console.log(`[v0] Found ${accessibleChannels.length} accessible channels out of ${data.channels.length} total`)
      return accessibleChannels
    } catch (error) {
      console.log("[v0] Error fetching Slack channels:", error)
      return []
    }
  }

  async getWeeklyMessages(channelId: string, startDate: Date, endDate: Date): Promise<SlackMessage[]> {
    if (!this.botToken) {
      console.log("[v0] Missing Slack bot token")
      return []
    }

    try {
      const oldest = Math.floor(startDate.getTime() / 1000).toString()
      const latest = Math.floor(endDate.getTime() / 1000).toString()

      console.log(
        "[v0] Fetching messages for channel",
        channelId,
        "from",
        startDate.toISOString(),
        "to",
        endDate.toISOString(),
      )

      const data = await this.makeSlackRequest(
        `https://slack.com/api/conversations.history?channel=${channelId}&oldest=${oldest}&latest=${latest}&limit=1000`,
      )

      if (!data.ok) {
        console.log("[v0] Slack API error for channel", channelId, ":", data.error)
        if (data.error === "channel_not_found") {
          console.log("[v0] Channel not found - bot may not have access")
        } else if (data.error === "not_in_channel") {
          console.log("[v0] Bot not in channel - add bot to channel or use public channels")
        }
        return []
      }

      const allMessages = data.messages || []
      const filteredMessages = allMessages.filter(
        (msg: any) => msg.text && !msg.bot_id && msg.subtype !== "bot_message" && msg.user,
      )

      console.log(
        "[v0] Channel",
        channelId,
        "- Total messages:",
        allMessages.length,
        "Filtered messages:",
        filteredMessages.length,
      )

      return filteredMessages
    } catch (error) {
      console.log("[v0] Error fetching messages for channel", channelId, ":", error)
      return []
    }
  }

  async getThreadReplies(channelId: string, threadTs: string): Promise<SlackMessage[]> {
    if (!this.botToken) return []

    try {
      const response = await fetch(`https://slack.com/api/conversations.replies?channel=${channelId}&ts=${threadTs}`, {
        headers: {
          Authorization: `Bearer ${this.botToken}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!data.ok) {
        console.log("[v0] Error fetching thread replies:", data.error)
        return []
      }

      return data.messages.filter(
        (msg: any) => msg.text && !msg.bot_id && msg.user && msg.ts !== threadTs, // Exclude the parent message
      )
    } catch (error) {
      console.log("[v0] Error fetching thread replies:", error)
      return []
    }
  }
}
