import { NextResponse } from "next/server"

export async function GET() {
  try {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT
    const apiKey = process.env.AZURE_OPENAI_API_KEY
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4"
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview"

    if (!endpoint || !apiKey) {
      return NextResponse.json({ error: "Azure OpenAI credentials not configured" }, { status: 400 })
    }

    // Test Azure OpenAI connection with a simple completion
    const response = await fetch(
      `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`,
      {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Test connection" }],
          max_tokens: 10,
          temperature: 0,
        }),
      },
    )

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        success: true,
        model: data.model,
        message: "Azure OpenAI connection successful",
      })
    } else {
      const errorData = await response.json()
      return NextResponse.json(
        {
          error: errorData.error?.message || "Azure OpenAI connection failed",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Azure OpenAI test error:", error)
    return NextResponse.json({ error: "Failed to test Azure OpenAI connection" }, { status: 500 })
  }
}
