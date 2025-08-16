"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Play, BarChart3, Users, MessageSquare } from "lucide-react"

interface ProcessingResult {
  processedMessages: number
  summary: {
    overall: {
      sentiment: "positive" | "negative" | "neutral"
      averageScore: number
      messageCount: number
    }
    channels: Array<{
      name: string
      sentiment: string
      messageCount: number
    }>
    users: Array<{
      name: string
      burnoutRisk: string
      messageCount: number
    }>
  }
}

export function SentimentProcessor() {
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startProcessing = async () => {
    try {
      setProcessing(true)
      setError(null)

      console.log("[v0] Starting sentiment analysis processing")

      const response = await fetch("/api/sentiment/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          processAll: true,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult({
          processedMessages: data.processedMessages,
          summary: data.summary,
        })
        console.log("[v0] Processing completed successfully")
      } else {
        setError(data.error || "Processing failed")
      }
    } catch (err) {
      console.error("[v0] Processing error:", err)
      setError("Network error occurred")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Sentiment Analysis
        </CardTitle>
        <CardDescription>Process team communications for sentiment insights</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={startProcessing} disabled={processing} className="w-full">
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Messages...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Analysis
            </>
          )}
        </Button>

        {processing && (
          <div className="space-y-2">
            <Progress value={undefined} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">Analyzing team communications...</p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Analysis Complete</h4>
              <Badge variant="outline">
                <MessageSquare className="mr-1 h-3 w-3" />
                {result.processedMessages} messages
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-muted-foreground">Overall Sentiment</h5>
                <Badge
                  variant={
                    result.summary.overall.sentiment === "positive"
                      ? "default"
                      : result.summary.overall.sentiment === "negative"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {result.summary.overall.sentiment}
                </Badge>
                <p className="text-xs text-muted-foreground">Score: {result.summary.overall.averageScore.toFixed(2)}</p>
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-medium text-muted-foreground">Team Health</h5>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span className="text-sm">{result.summary.users.length} members</span>
                </div>
                <p className="text-xs text-muted-foreground">{result.summary.channels.length} channels monitored</p>
              </div>
            </div>

            {result.summary.users.some((user) => user.burnoutRisk === "high" || user.burnoutRisk === "critical") && (
              <div className="p-2 bg-orange-50 border border-orange-200 rounded">
                <p className="text-xs text-orange-800">⚠️ High burnout risk detected in team members</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
