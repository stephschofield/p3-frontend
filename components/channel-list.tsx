"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Hash, MessageSquare, TrendingUp, ChevronRight } from "lucide-react"

interface ChannelSummary {
  channelId: string
  channelName: string
  messageCount: number
  averageSentiment: number
  sentimentTrend: string
  topKeywords: string[]
}

export function ChannelList() {
  const [channels, setChannels] = useState<ChannelSummary[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchChannelSummaries()
  }, [])

  const fetchChannelSummaries = async () => {
    try {
      console.log("[v0] Fetching channel summaries...")
      const response = await fetch("/api/analysis/weekly")
      if (!response.ok) throw new Error("Failed to fetch channel data")

      const data = await response.json()
      console.log("[v0] Channel summaries response:", data)

      if (data.channelAnalysis) {
        const channelSummaries = data.channelAnalysis.map((channel: any) => ({
          channelId: channel.channelId,
          channelName: channel.channelName,
          messageCount: channel.messageCount,
          averageSentiment: Math.max(0, Math.min(1, channel.averageSentiment || 0.5)),
          sentimentTrend: getSentimentTrend(channel.sentimentTrend || []),
          topKeywords: channel.topKeywords || [],
        }))
        setChannels(channelSummaries)
      }
    } catch (error) {
      console.error("[v0] Error fetching channel summaries:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSentimentTrend = (trend: number[]) => {
    const validValues = trend.filter((v) => v > 0)
    if (validValues.length < 2) return "Stable"

    const recent = validValues.slice(-3).reduce((a, b) => a + b, 0) / validValues.slice(-3).length
    const earlier = validValues.slice(0, -3).reduce((a, b) => a + b, 0) / validValues.slice(0, -3).length

    if (recent > earlier + 0.1) return "Improving"
    if (recent < earlier - 0.1) return "Declining"
    return "Stable"
  }

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.7) return "text-green-600"
    if (sentiment >= 0.4) return "text-yellow-600"
    return "text-red-600"
  }

  const getTrendColor = (trend: string) => {
    if (trend === "Improving") return "text-green-600"
    if (trend === "Declining") return "text-red-600"
    return "text-gray-600"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Channel Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Analysis</CardTitle>
        <p className="text-sm text-gray-600">Click on any channel to see detailed analysis</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {channels.map((channel) => (
            <Button
              key={channel.channelId}
              variant="ghost"
              className="w-full h-auto p-4 justify-start hover:bg-gray-50"
              onClick={() => router.push(`/channel/${channel.channelId}`)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <div className="text-left">
                    <div className="font-medium">{channel.channelName}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {channel.messageCount} messages
                      </span>
                      <span className={`flex items-center gap-1 ${getSentimentColor(channel.averageSentiment)}`}>
                        <TrendingUp className="h-3 w-3" />
                        {channel.averageSentiment.toFixed(3)}
                      </span>
                      <span className={getTrendColor(channel.sentimentTrend)}>{channel.sentimentTrend}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {channel.topKeywords.slice(0, 2).map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
