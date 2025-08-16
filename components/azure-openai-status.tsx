"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, AlertCircle, Brain, RefreshCw } from "lucide-react"

export function AzureOpenAIStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking")
  const [error, setError] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<any>(null)

  const testConnection = async () => {
    try {
      setStatus("checking")
      setError(null)

      console.log("[v0] Testing Azure OpenAI connection")

      const response = await fetch("/api/sentiment/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "This is a test message to verify the Azure OpenAI integration is working properly.",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus("connected")
        setTestResult(data.analysis)
        console.log("[v0] Azure OpenAI connection successful")
      } else {
        setStatus("error")
        setError(data.error || "Connection test failed")
      }
    } catch (err) {
      console.error("[v0] Azure OpenAI connection error:", err)
      setStatus("error")
      setError("Network error occurred")
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Azure OpenAI
          </CardTitle>
          <CardDescription>GPT-4.1 sentiment analysis engine</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={testConnection} disabled={status === "checking"}>
          {status === "checking" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        {status === "checking" ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Testing connection...</span>
          </div>
        ) : status === "error" ? (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Connected and operational</span>
            </div>

            {testResult && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Test Analysis Result:</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      testResult.sentiment === "positive"
                        ? "default"
                        : testResult.sentiment === "negative"
                          ? "destructive"
                          : "secondary"
                    }
                    className="text-xs"
                  >
                    {testResult.sentiment} ({(testResult.confidence * 100).toFixed(0)}%)
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Score: {testResult.score.toFixed(2)}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
