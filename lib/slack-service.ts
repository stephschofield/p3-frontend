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
}

export class SlackService {
  private botToken: string

  constructor() {
    this.botToken = process.env.SLACK_BOT_TOKEN || ""
  }

  async getChannels(): Promise<SlackChannel[]> {
    if (!this.botToken) {
      console.log("[v0] Missing Slack bot token")
      return []
    }

    try {
      const response = await fetch("https://slack.com/api/conversations.list", {
        headers: {
          Authorization: `Bearer ${this.botToken}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!data.ok) {
        console.log("[v0] Slack API error:", data.error)
        return []
      }

      return data.channels.filter((channel: any) => channel.is_member && !channel.is_private)
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

      const response = await fetch(
        `https://slack.com/api/conversations.history?channel=${channelId}&oldest=${oldest}&latest=${latest}&limit=1000`,
        {
          headers: {
            Authorization: `Bearer ${this.botToken}`,
            "Content-Type": "application/json",
          },
        },
      )

      const data = await response.json()

      if (!data.ok) {
        console.log("[v0] Slack API error for channel", channelId, ":", data.error)
        return []
      }

      // Filter out bot messages and system messages
      return data.messages.filter((msg: any) => msg.text && !msg.bot_id && msg.subtype !== "bot_message" && msg.user)
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
