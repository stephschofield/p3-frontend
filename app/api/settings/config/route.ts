import { type NextRequest, NextResponse } from "next/server"

// In a real application, you would store these securely in a database
// For demo purposes, we'll use environment variables as fallback
let configStore: any = {}

export async function GET() {
  try {
    // Return current configuration (without exposing full secrets)
    const config = {
      slackClientId: configStore.slackClientId || process.env.SLACK_CLIENT_ID || "",
      slackClientSecret: configStore.slackClientSecret ? "••••••••" : "",
      slackSigningSecret: configStore.slackSigningSecret ? "••••••••" : "",
      slackBotToken: configStore.slackBotToken ? "••••••••" : "",
      azureOpenaiEndpoint: configStore.azureOpenaiEndpoint || process.env.AZURE_OPENAI_ENDPOINT || "",
      azureOpenaiApiKey: configStore.azureOpenaiApiKey ? "••••••••" : "",
      azureOpenaiDeploymentName:
        configStore.azureOpenaiDeploymentName || process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4",
      azureOpenaiApiVersion:
        configStore.azureOpenaiApiVersion || process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error("Error loading configuration:", error)
    return NextResponse.json({ error: "Failed to load configuration" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = await request.json()

    // Validate required fields
    const requiredFields = [
      "slackClientId",
      "slackClientSecret",
      "slackSigningSecret",
      "slackBotToken",
      "azureOpenaiEndpoint",
      "azureOpenaiApiKey",
      "azureOpenaiDeploymentName",
      "azureOpenaiApiVersion",
    ]

    for (const field of requiredFields) {
      if (!config[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Store configuration securely
    // In production, encrypt sensitive data and store in a secure database
    configStore = {
      ...config,
      updatedAt: new Date().toISOString(),
    }

    // Update environment variables for immediate use
    process.env.SLACK_CLIENT_ID = config.slackClientId
    process.env.SLACK_CLIENT_SECRET = config.slackClientSecret
    process.env.SLACK_SIGNING_SECRET = config.slackSigningSecret
    process.env.SLACK_BOT_TOKEN = config.slackBotToken
    process.env.AZURE_OPENAI_ENDPOINT = config.azureOpenaiEndpoint
    process.env.AZURE_OPENAI_API_KEY = config.azureOpenaiApiKey
    process.env.AZURE_OPENAI_DEPLOYMENT_NAME = config.azureOpenaiDeploymentName
    process.env.AZURE_OPENAI_API_VERSION = config.azureOpenaiApiVersion

    return NextResponse.json({ success: true, message: "Configuration saved successfully" })
  } catch (error) {
    console.error("Error saving configuration:", error)
    return NextResponse.json({ error: "Failed to save configuration" }, { status: 500 })
  }
}
