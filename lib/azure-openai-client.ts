interface AzureOpenAIConfig {
  endpoint: string
  apiKey: string
  deploymentName: string
  apiVersion: string
}

interface SentimentAnalysisResult {
  sentiment: "positive" | "negative" | "neutral"
  confidence: number
  score: number // -1 to 1 scale
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

interface BurnoutRiskAssessment {
  riskLevel: "low" | "medium" | "high" | "critical"
  score: number // 0-100 scale
  factors: string[]
  recommendations: string[]
}

export class AzureOpenAIClient {
  private config: AzureOpenAIConfig

  constructor() {
    this.config = {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT || "",
      apiKey: process.env.AZURE_OPENAI_API_KEY || "",
      deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4",
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
    }
  }

  private validateConfig(): boolean {
    const missing = []
    if (!this.config.endpoint) missing.push("AZURE_OPENAI_ENDPOINT")
    if (!this.config.apiKey) missing.push("AZURE_OPENAI_API_KEY")
    if (!this.config.deploymentName) missing.push("AZURE_OPENAI_DEPLOYMENT_NAME")

    if (missing.length > 0) {
      console.error("[v0] Missing Azure OpenAI configuration:", missing.join(", "))
      return false
    }
    return true
  }

  private async makeRequest(messages: Array<{ role: string; content: string }>, temperature = 0.3) {
    if (!this.validateConfig()) {
      throw new Error("Azure OpenAI configuration is incomplete")
    }

    // Clean endpoint URL - remove trailing slash and /openai if present
    let cleanEndpoint = this.config.endpoint.replace(/\/$/, "")
    if (!cleanEndpoint.includes("/openai/deployments/")) {
      cleanEndpoint = `${cleanEndpoint}/openai/deployments/${this.config.deploymentName}/chat/completions`
    } else {
      cleanEndpoint = `${cleanEndpoint}/${this.config.deploymentName}/chat/completions`
    }

    const url = `${cleanEndpoint}?api-version=${this.config.apiVersion}`

    console.log("[v0] Making Azure OpenAI request to:", url.replace(this.config.apiKey, "***"))

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": this.config.apiKey,
        },
        body: JSON.stringify({
          messages,
          temperature,
          max_tokens: 1000,
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0,
        }),
      })

      console.log("[v0] Azure OpenAI response status:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Azure OpenAI error response:", errorText)
        throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      console.log("[v0] Azure OpenAI response received successfully")
      return data
    } catch (error) {
      console.error("[v0] Azure OpenAI request failed:", error)
      throw error
    }
  }

  async analyzeSentiment(text: string): Promise<SentimentAnalysisResult> {
    if (!this.validateConfig()) {
      console.warn("[v0] Azure OpenAI not configured, returning neutral sentiment")
      return {
        sentiment: "neutral",
        confidence: 0.5,
        score: 0,
        emotions: {
          joy: 0.1,
          sadness: 0.1,
          anger: 0.1,
          fear: 0.1,
          surprise: 0.1,
        },
        burnoutIndicators: {
          workload: 0.5,
          stress: 0.5,
          engagement: 0.5,
          satisfaction: 0.5,
        },
        keyPhrases: [],
      }
    }

    const systemPrompt = `You are an expert in workplace sentiment analysis and employee wellbeing. Analyze the given text for:

1. Overall sentiment (positive, negative, neutral)
2. Confidence level (0-1)
3. Sentiment score (-1 to 1, where -1 is very negative, 0 is neutral, 1 is very positive)
4. Emotional indicators (joy, sadness, anger, fear, surprise) on 0-1 scale
5. Burnout indicators (workload stress, stress levels, engagement, job satisfaction) on 0-1 scale
6. Key phrases that indicate mood or sentiment

Respond ONLY with valid JSON in this exact format:
{
  "sentiment": "positive|negative|neutral",
  "confidence": 0.85,
  "score": 0.3,
  "emotions": {
    "joy": 0.2,
    "sadness": 0.1,
    "anger": 0.0,
    "fear": 0.1,
    "surprise": 0.0
  },
  "burnoutIndicators": {
    "workload": 0.3,
    "stress": 0.2,
    "engagement": 0.7,
    "satisfaction": 0.6
  },
  "keyPhrases": ["excited about project", "feeling overwhelmed"]
}`

    try {
      console.log("[v0] Analyzing sentiment for text:", text.substring(0, 100))

      const response = await this.makeRequest([
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this workplace communication: "${text}"` },
      ])

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error("No response content from Azure OpenAI")
      }

      let result
      try {
        result = JSON.parse(content)
      } catch (parseError) {
        console.error("[v0] Failed to parse Azure OpenAI response:", content)
        throw new Error("Invalid JSON response from Azure OpenAI")
      }

      console.log("[v0] Sentiment analysis result:", result.sentiment, result.score)
      return result
    } catch (error) {
      console.error("[v0] Error analyzing sentiment:", error)

      // Return neutral fallback
      return {
        sentiment: "neutral",
        confidence: 0.5,
        score: 0,
        emotions: {
          joy: 0.1,
          sadness: 0.1,
          anger: 0.1,
          fear: 0.1,
          surprise: 0.1,
        },
        burnoutIndicators: {
          workload: 0.5,
          stress: 0.5,
          engagement: 0.5,
          satisfaction: 0.5,
        },
        keyPhrases: [],
      }
    }
  }

  async assessBurnoutRisk(messages: string[], userContext?: string): Promise<BurnoutRiskAssessment> {
    const systemPrompt = `You are an expert in workplace psychology and burnout detection. Analyze the collection of workplace messages to assess burnout risk.

Consider patterns like:
- Increased negativity over time
- Mentions of workload, stress, overtime
- Decreased engagement or enthusiasm
- Signs of exhaustion, frustration, or cynicism
- Changes in communication patterns

Respond ONLY with valid JSON in this exact format:
{
  "riskLevel": "low|medium|high|critical",
  "score": 45,
  "factors": ["Increased workload mentions", "Declining engagement"],
  "recommendations": ["Schedule 1:1 check-in", "Consider workload redistribution"]
}`

    try {
      const messagesText = messages.join("\n---\n")
      const contextText = userContext ? `\nUser context: ${userContext}` : ""

      console.log("[v0] Assessing burnout risk for", messages.length, "messages")

      const response = await this.makeRequest([
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Analyze these workplace messages for burnout risk:${contextText}\n\nMessages:\n${messagesText}`,
        },
      ])

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error("No response content from Azure OpenAI")
      }

      const result = JSON.parse(content)
      console.log("[v0] Burnout assessment result:", result.riskLevel, result.score)

      return result
    } catch (error) {
      console.error("[v0] Error assessing burnout risk:", error)

      // Return low risk fallback
      return {
        riskLevel: "low",
        score: 25,
        factors: ["Insufficient data for analysis"],
        recommendations: ["Continue monitoring communication patterns"],
      }
    }
  }

  async generateInsights(sentimentData: any[], teamMetrics: any): Promise<string[]> {
    if (!this.validateConfig()) {
      console.warn("[v0] Azure OpenAI not configured, returning default insights")
      return [
        "Configure Azure OpenAI integration to get AI-powered insights about your team.",
        "Monitor team communication patterns for early signs of stress or disengagement.",
        "Schedule regular check-ins with team members to maintain good communication.",
      ]
    }

    const systemPrompt = `You are an expert workplace analyst. Based on sentiment data and team metrics, generate 3-5 actionable insights for managers.

Focus on:
- Trends and patterns in team sentiment
- Specific recommendations for improving team morale
- Early warning signs that need attention
- Positive patterns to reinforce

Keep insights concise, specific, and actionable. Each insight should be 1-2 sentences.`

    try {
      const dataText = JSON.stringify({ sentimentData, teamMetrics }, null, 2)

      console.log("[v0] Generating insights from sentiment data")

      const response = await this.makeRequest([
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate actionable insights from this team data:\n${dataText}` },
      ])

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error("No response content from Azure OpenAI")
      }

      // Parse insights from response (assuming they're in a list format)
      const insights = content
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .map((line) =>
          line
            .replace(/^\d+\.\s*/, "")
            .replace(/^[-*]\s*/, "")
            .trim(),
        )
        .filter((insight) => insight.length > 10)

      console.log("[v0] Generated", insights.length, "insights")

      return insights.slice(0, 5) // Limit to 5 insights
    } catch (error) {
      console.error("[v0] Error generating insights:", error)

      return [
        "Monitor team communication patterns for early signs of stress or disengagement.",
        "Schedule regular check-ins with team members showing declining sentiment scores.",
        "Celebrate positive team interactions and acknowledge good work publicly.",
      ]
    }
  }
}

export const azureOpenAIClient = new AzureOpenAIClient()
