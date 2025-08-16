interface SentimentResult {
  score: number // 0 to 1 (normalized from -1 to 1)
  confidence: number // 0 to 1
  emotions: {
    joy: number
    anger: number
    fear: number
    sadness: number
    surprise: number
  }
  keywords: string[]
}

interface BurnoutIndicators {
  exhaustionKeywords: number
  negativeSentimentTrend: number
  reducedEngagement: number
  workHoursPattern: number
  overallRisk: number // 0 to 100
}

export class AzureSentimentService {
  private endpoint: string
  private apiKey: string
  private deploymentName: string
  private apiVersion: string

  constructor() {
    this.endpoint = process.env.AZURE_OPENAI_ENDPOINT || ""
    this.apiKey = process.env.AZURE_OPENAI_API_KEY || ""
    this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || ""
    this.apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview"
  }

  private isConfigured(): boolean {
    return !!(this.endpoint && this.apiKey && this.deploymentName)
  }

  private normalizeSentiment(score: number): number {
    // Convert from -1 to 1 range to 0 to 1 range
    const normalized = (score + 1) / 2
    // Ensure bounds are respected
    return Math.max(0, Math.min(1, normalized))
  }

  private safeParseJSON(content: string): any {
    try {
      // Remove any markdown formatting that might be present
      const cleanContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
      return JSON.parse(cleanContent)
    } catch (error) {
      console.log("[v0] JSON parsing error:", error, "Content:", content)
      return null
    }
  }

  async analyzeSentiment(text: string): Promise<SentimentResult> {
    if (!this.isConfigured()) {
      console.log("[v0] Azure OpenAI not configured, returning neutral sentiment")
      return {
        score: 0.5, // Changed from 0 to 0.5 for true neutral in 0-1 range
        confidence: 0.5,
        emotions: { joy: 0.2, anger: 0.2, fear: 0.2, sadness: 0.2, surprise: 0.2 },
        keywords: [],
      }
    }

    try {
      const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": this.apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are a sentiment analysis expert. Analyze the following text and return a JSON response with:
              - score: sentiment score from -1 (very negative) to 1 (very positive)
              - confidence: confidence level from 0 to 1
              - emotions: object with joy, anger, fear, sadness, surprise (0-1 each)
              - keywords: array of key emotional words found
              
              Return only valid JSON, no other text.`,
            },
            {
              role: "user",
              content: text,
            },
          ],
          max_tokens: 500,
          temperature: 0.1,
        }),
      })

      if (!response.ok) {
        console.log("[v0] Azure OpenAI API error:", response.status, response.statusText)
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content // Added optional chaining

      if (!content) {
        throw new Error("No content in response")
      }

      const parsed = this.safeParseJSON(content)
      if (!parsed) {
        throw new Error("Failed to parse JSON response")
      }

      return {
        score: this.normalizeSentiment(parsed.score || 0), // Normalize -1,1 to 0,1 range
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.3)),
        emotions: {
          joy: Math.max(0, Math.min(1, parsed.emotions?.joy || 0.2)),
          anger: Math.max(0, Math.min(1, parsed.emotions?.anger || 0.2)),
          fear: Math.max(0, Math.min(1, parsed.emotions?.fear || 0.2)),
          sadness: Math.max(0, Math.min(1, parsed.emotions?.sadness || 0.2)),
          surprise: Math.max(0, Math.min(1, parsed.emotions?.surprise || 0.2)),
        },
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      }
    } catch (error) {
      console.log("[v0] Error analyzing sentiment:", error)
      return {
        score: 0.5,
        confidence: 0.3,
        emotions: { joy: 0.2, anger: 0.2, fear: 0.2, sadness: 0.2, surprise: 0.2 },
        keywords: [],
      }
    }
  }

  async analyzeBurnoutRisk(messages: string[], userActivity: any): Promise<BurnoutIndicators> {
    if (!this.isConfigured()) {
      console.log("[v0] Azure OpenAI not configured, returning low burnout risk")
      return {
        exhaustionKeywords: 10,
        negativeSentimentTrend: 15,
        reducedEngagement: 20,
        workHoursPattern: 5,
        overallRisk: 25,
      }
    }

    try {
      const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`

      const analysisText = messages.join("\n---\n")

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": this.apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are a burnout detection expert. Analyze the following messages for burnout indicators and return JSON with:
              - exhaustionKeywords: score 0-100 for exhaustion-related language
              - negativeSentimentTrend: score 0-100 for negative sentiment patterns
              - reducedEngagement: score 0-100 for reduced participation
              - workHoursPattern: score 0-100 for unhealthy work patterns
              - overallRisk: overall burnout risk score 0-100
              
              Return only valid JSON, no other text.`,
            },
            {
              role: "user",
              content: analysisText,
            },
          ],
          max_tokens: 300,
          temperature: 0.1,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content // Added optional chaining

      if (!content) {
        throw new Error("No content in response")
      }

      const parsed = this.safeParseJSON(content)
      if (!parsed) {
        throw new Error("Failed to parse JSON response")
      }

      return {
        exhaustionKeywords: Math.max(0, Math.min(100, parsed.exhaustionKeywords || 10)),
        negativeSentimentTrend: Math.max(0, Math.min(100, parsed.negativeSentimentTrend || 15)),
        reducedEngagement: Math.max(0, Math.min(100, parsed.reducedEngagement || 20)),
        workHoursPattern: Math.max(0, Math.min(100, parsed.workHoursPattern || 5)),
        overallRisk: Math.max(0, Math.min(100, parsed.overallRisk || 25)),
      }
    } catch (error) {
      console.log("[v0] Error analyzing burnout risk:", error)
      // Return low risk on error
      return {
        exhaustionKeywords: 10,
        negativeSentimentTrend: 15,
        reducedEngagement: 20,
        workHoursPattern: 5,
        overallRisk: 25,
      }
    }
  }

  async generateWeeklyInsights(sentimentData: any[], teamMetrics: any): Promise<string[]> {
    if (!this.isConfigured()) {
      console.log("[v0] Azure OpenAI not configured, returning default insights")
      return [
        "Team sentiment shows positive trends with increased collaboration",
        "Consider scheduling team building activities to maintain engagement",
        "Monitor workload distribution to prevent burnout risks",
      ]
    }

    try {
      const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`

      const dataContext = JSON.stringify({ sentimentData, teamMetrics })

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": this.apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are a team management expert. Based on the sentiment data and team metrics, generate 3-5 actionable insights for managers. Return as a JSON array of strings. Each insight should be specific, actionable, and based on the data provided.`,
            },
            {
              role: "user",
              content: dataContext,
            },
          ],
          max_tokens: 800,
          temperature: 0.3,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content // Added optional chaining

      if (!content) {
        throw new Error("No content in response")
      }

      const parsed = this.safeParseJSON(content)
      if (!parsed || !Array.isArray(parsed)) {
        throw new Error("Invalid insights format")
      }

      return parsed
    } catch (error) {
      console.log("[v0] Error generating insights:", error)
      // Return default insights on error
      return [
        "Team sentiment shows positive trends with increased collaboration",
        "Consider scheduling team building activities to maintain engagement",
        "Monitor workload distribution to prevent burnout risks",
      ]
    }
  }
}
