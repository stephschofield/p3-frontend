"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Activity, Wifi, WifiOff, MessageSquare, AlertTriangle } from "lucide-react"

interface RealtimeStats {
  messagesProcessed: number
  averageProcessingTime: number
  lastProcessedAt: string
  queueSize: number
  errors: number
}

interface RealtimeSummary {
  totalMessages: number
  averageSentiment: number
  sentimentDistribution: {
    positive: number
    negative: number
    neutral: number
  }
  topChannels: Array<{
    name: string
    count: number
  }>
  alerts: Array<{
    type: string
    message: string
    severity: string
  }>
}

export function RealtimeMonitor() {
  const [connected, setConnected] = useState(false)
  const [stats, setStats] = useState<RealtimeStats | null>(null)
  const [summary, setSummary] = useState<RealtimeSummary | null>(null)
  const [recentMessages, setRecentMessages] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const connectToStream = () => {
    try {
      console.log("[v0] Connecting to real-time stream")

      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      const eventSource = new EventSource("/api/realtime/stream")
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log("[v0] Real-time stream connected")
        setConnected(true)
        setError(null)
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log("[v0] Received real-time update:", data.type)

          switch (data.type) {
            case "connected":
              setConnected(true)
              break
            case "message_processed":
              setStats(data.stats)
              setRecentMessages((prev) => [data.message, ...prev.slice(0, 9)])
              break
            case "stats_update":
              setStats(data.stats)
              if (data.recentMessages) {
                setRecentMessages(data.recentMessages)
              }
              break
            case "periodic_update":
              setStats(data.stats)
              setSummary(data.summary)
              break
            case "alert":
              console.log("[v0] Real-time alert:", data.alert)
              break
            case "error":
              console.error("[v0] Stream error message:", data.message)
              setError(data.message)
              break
          }
        } catch (err) {
          console.error("[v0] Error parsing real-time data:", err)
          setError("Failed to parse stream data")
        }
      }

      eventSource.onerror = (err) => {
        console.error("[v0] Real-time stream error:", err)
        setConnected(false)
        if (eventSource.readyState === EventSource.CLOSED) {
          setError("Connection closed")
        } else if (eventSource.readyState === EventSource.CONNECTING) {
          setError("Reconnecting...")
          setTimeout(() => {
            if (!connected) {
              connectToStream()
            }
          }, 5000)
        } else {
          setError("Connection error")
        }
      }
    } catch (err) {
      console.error("[v0] Error connecting to stream:", err)
      setError("Failed to connect")
    }
  }

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setConnected(false)
  }

  useEffect(() => {
    connectToStream()

    return () => {
      disconnect()
    }
  }, [])

  return (
    <Card>
      <CardHeader className="space-y-3 pb-2">
        <div>
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Monitor
          </CardTitle>
          <CardDescription>Live sentiment analysis pipeline</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <Badge variant="default" className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Disconnected
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={connected ? disconnect : connectToStream}>
            {connected ? "Disconnect" : "Connect"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Messages Processed</p>
              <p className="text-2xl font-bold">{stats.messagesProcessed}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Queue Size</p>
              <p className="text-2xl font-bold">{stats.queueSize}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Avg Processing</p>
              <p className="text-sm text-muted-foreground">{stats.averageProcessingTime.toFixed(0)}ms</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Errors</p>
              <p className="text-sm text-muted-foreground">{stats.errors}</p>
            </div>
          </div>
        )}

        {summary && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Live Summary</h4>
              <Badge variant="outline">
                <MessageSquare className="mr-1 h-3 w-3" />
                {summary.totalMessages}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sentiment Score</span>
                <span
                  className={
                    summary.averageSentiment > 0
                      ? "text-green-600"
                      : summary.averageSentiment < 0
                        ? "text-red-600"
                        : "text-gray-600"
                  }
                >
                  {summary.averageSentiment.toFixed(2)}
                </span>
              </div>
              <Progress value={((summary.averageSentiment + 1) / 2) * 100} className="h-2" />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>😊 {summary.sentimentDistribution.positive}</span>
              <span>😐 {summary.sentimentDistribution.neutral}</span>
              <span>😞 {summary.sentimentDistribution.negative}</span>
            </div>

            {summary.alerts.length > 0 && (
              <div className="space-y-1">
                {summary.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs"
                  >
                    <AlertTriangle className="h-3 w-3 text-orange-600" />
                    <span className="text-orange-800">{alert.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {recentMessages.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Activity</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {recentMessages.slice(0, 5).map((message, index) => (
                <div key={index} className="flex items-center justify-between text-xs p-2 bg-muted/50 rounded">
                  <span className="truncate flex-1">
                    {message.userName}: {message.text.substring(0, 30)}...
                  </span>
                  <Badge
                    variant={
                      message.sentiment?.sentiment === "positive"
                        ? "default"
                        : message.sentiment?.sentiment === "negative"
                          ? "destructive"
                          : "secondary"
                    }
                    className="text-xs ml-2"
                  >
                    {message.sentiment?.sentiment}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
