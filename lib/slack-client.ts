interface SlackConfig {
  clientId: string
  clientSecret: string
  signingSecret: string
  botToken?: string
}

interface SlackChannel {
  id: string
  name: string
  is_private: boolean
  is_member: boolean
}

interface SlackMessage {
  ts: string
  user: string
  text: string
  reactions?: Array<{
    name: string
    count: number
    users: string[]
  }>
  thread_ts?: string
}

interface SlackUser {
  id: string
  name: string
  real_name: string
  profile: {
    display_name: string
    email?: string
  }
}

export class SlackClient {
  private config: SlackConfig
  private baseUrl = "https://slack.com/api"

  constructor() {
    this.config = {
      clientId: process.env.SLACK_CLIENT_ID || "",
      clientSecret: process.env.SLACK_CLIENT_SECRET || "",
      signingSecret: process.env.SLACK_SIGNING_SECRET || "",
      botToken: process.env.SLACK_BOT_TOKEN || "",
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/${endpoint}`
    const headers = {
      Authorization: `Bearer ${this.config.botToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getChannels(): Promise<SlackChannel[]> {
    const response = await this.makeRequest("conversations.list?types=public_channel,private_channel")
    return response.channels || []
  }

  async getChannelMessages(channelId: string, limit = 100, oldest?: string): Promise<SlackMessage[]> {
    const params = new URLSearchParams({
      channel: channelId,
      limit: limit.toString(),
    })

    if (oldest) {
      params.append("oldest", oldest)
    }

    const response = await this.makeRequest(`conversations.history?${params}`)
    return response.messages || []
  }

  async getUsers(): Promise<SlackUser[]> {
    const response = await this.makeRequest("users.list")
    return response.members || []
  }

  async getUserInfo(userId: string): Promise<SlackUser | null> {
    try {
      const response = await this.makeRequest(`users.info?user=${userId}`)
      return response.user || null
    } catch (error) {
      console.error("Error fetching user info:", error)
      return null
    }
  }

  // Verify webhook signatures for security
  verifySignature(signature: string, timestamp: string, body: string): boolean {
    const crypto = require("crypto")
    const hmac = crypto.createHmac("sha256", this.config.signingSecret)
    const [version, hash] = signature.split("=")

    hmac.update(`${version}:${timestamp}:${body}`)
    const expectedHash = hmac.digest("hex")

    return hash === expectedHash
  }
}

export const slackClient = new SlackClient()
